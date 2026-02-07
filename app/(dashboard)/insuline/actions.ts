"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z, type ZodIssue } from "zod";
import { ActionType, Category } from "@prisma/client";
import { logActivity } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

// ============================================
// FIXED INSULIN PRODUCTS (from Excel)
// ============================================

const INSULIN_TYPES = [
  {
    id: "insuline-mixte-30-70",
    code: "INS-MIXTE-3070",
    name: "Insuline humaine semi lente mélange 30/70 fl 100UI/ml",
    shortName: "Mixte 30/70",
    unit: "flacon",
    price: 18.75,
  },
  {
    id: "insuline-simple",
    code: "INS-SIMPLE",
    name: "Insuline humaine semi lente simple fl 100UI/ml",
    shortName: "Simple",
    unit: "flacon",
    price: 19.0,
  },
  {
    id: "insuline-rapide",
    code: "INS-RAPIDE",
    name: "Insuline rapide fl 100 ui humaine",
    shortName: "Rapide",
    unit: "flacon",
    price: 19.6,
  },
] as const;

type InsulinTypeId = typeof INSULIN_TYPES[number]["id"];

// ============================================
// TYPES
// ============================================

export interface InsulinBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

export interface InsulinStockSummary {
  totalStock: number;
  batches: InsulinBatch[];
}

export interface InsulinMovement {
  id: string;
  date: Date;
  type: "ENTREE" | "SORTIE";
  productName: string;
  batchNumber: string;
  quantity: number;
  reference?: string | null;
  hospitalName?: string | null;
}

// ============================================
// SCHEMAS
// ============================================

const createEntrySchema = z.object({
  insulinType: z.enum(["insuline-mixte-30-70", "insuline-simple", "insuline-rapide"]),
  batchNumber: z.string().min(1, "Le numéro de lot est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  expiryDate: z.string().min(1, "La date de péremption est requise"),
  referenceDoc: z.string().optional(),
  temperature: z.string().optional(),
});

const createExitSchema = z.object({
  hospitalId: z.string().min(1, "Le centre de santé est requis"),
  items: z.array(
    z.object({
      insulinType: z.enum(["insuline-mixte-30-70", "insuline-simple", "insuline-rapide"]),
      quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
    })
  ).min(1, "Au moins un produit est requis"),
});

// ============================================
// ACTIONS - GET INSULIN STOCK
// ============================================

export async function getInsulinStock(): Promise<{
  success: boolean;
  data?: Record<InsulinTypeId, InsulinStockSummary>;
  error?: string;
}> {
  try {
    const result: Record<InsulinTypeId, InsulinStockSummary> = {
      "insuline-mixte-30-70": { totalStock: 0, batches: [] },
      "insuline-simple": { totalStock: 0, batches: [] },
      "insuline-rapide": { totalStock: 0, batches: [] },
    };

    for (const type of INSULIN_TYPES) {
      // Find product by code (more reliable than name search)
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { code: type.code },
            { name: { contains: type.shortName === "Mixte 30/70" ? "mélange" : type.shortName.toLowerCase() } },
          ],
          category: Category.INSULINE,
          isActive: true,
        },
        include: {
          batches: {
            where: { quantity: { gt: 0 } },
            orderBy: { expiryDate: "asc" },
          },
        },
      });

      if (product) {
        result[type.id] = {
          totalStock: product.batches.reduce((sum, b) => sum + b.quantity, 0),
          batches: product.batches.map((b) => ({
            id: b.id,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            expiryDate: b.expiryDate.toISOString(),
          })),
        };
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching insulin stock:", error);
    return {
      success: false,
      error: "Erreur lors du chargement du stock d'insuline",
    };
  }
}

// ============================================
// ACTIONS - CREATE ENTRY
// ============================================

export async function createInsulinEntry(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const rawData = Object.fromEntries(formData);
    const validated = createEntrySchema.parse(rawData);

    // Find the product
    const typeInfo = INSULIN_TYPES.find((t) => t.id === validated.insulinType);
    if (!typeInfo) {
      return { success: false, error: "Type d'insuline non trouvé" };
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { code: typeInfo.code },
          { name: { contains: typeInfo.shortName === "Mixte 30/70" ? "mélange" : typeInfo.shortName.toLowerCase() } },
        ],
        category: Category.INSULINE,
        isActive: true,
      },
    });

    if (!product) {
      return { success: false, error: `Produit "${typeInfo.shortName}" non trouvé dans le catalogue` };
    }

    // Check if batch exists
    let batch = await prisma.batch.findFirst({
      where: {
        batchNumber: validated.batchNumber,
        productId: product.id,
      },
    });

    // Create or update batch
    if (batch) {
      await prisma.batch.update({
        where: { id: batch.id },
        data: { quantity: { increment: validated.quantity } },
      });
    } else {
      batch = await prisma.batch.create({
        data: {
          batchNumber: validated.batchNumber,
          productId: product.id,
          quantity: validated.quantity,
          expiryDate: new Date(validated.expiryDate),
          temperature: validated.temperature,
        },
      });
    }

    // Create stock entry
    await prisma.stockEntry.create({
      data: {
        productId: product.id,
        batchId: batch.id,
        quantity: validated.quantity,
        referenceDoc: validated.referenceDoc,
        entryDate: new Date(),
      },
    });

    // Log activity
    await logActivity({
      action: ActionType.CREATE,
      entityType: "INSULINE_ENTRY",
      entityId: batch.id,
      description: `Entrée ${typeInfo.shortName}: ${validated.quantity} unités`,
      metadata: {
        insulinType: validated.insulinType,
        batchNumber: validated.batchNumber,
        quantity: validated.quantity,
      },
    });

    revalidatePath("/insuline");
    return { success: true };
  } catch (error) {
    console.error("Error creating insulin entry:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: ZodIssue) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de l'ajout du stock",
    };
  }
}

// ============================================
// ACTIONS - CREATE EXIT (Distribution)
// ============================================

export async function createInsulinExit(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const itemsJson = formData.get("items") as string;
    const items = JSON.parse(itemsJson);

    const rawData = {
      hospitalId: formData.get("hospitalId"),
      items,
    };

    const validated = createExitSchema.parse(rawData);

    // Process each item
    for (const item of validated.items) {
      const typeInfo = INSULIN_TYPES.find((t) => t.id === item.insulinType);
      if (!typeInfo) continue;

      // Find product
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { code: typeInfo.code },
            { name: { contains: typeInfo.shortName === "Mixte 30/70" ? "mélange" : typeInfo.shortName.toLowerCase() } },
          ],
          category: Category.INSULINE,
          isActive: true,
        },
        include: {
          batches: {
            where: { quantity: { gt: 0 } },
            orderBy: { expiryDate: "asc" },
          },
        },
      });

      if (!product) {
        return { success: false, error: `Produit "${typeInfo.shortName}" non trouvé` };
      }

      if (product.batches.length === 0) {
        return { success: false, error: `Stock épuisé pour "${typeInfo.shortName}"` };
      }

      const batch = product.batches[0]; // FEFO - First Expired First Out

      // Check 3-month expiry rule
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      if (batch.expiryDate < threeMonthsFromNow) {
        return {
          success: false,
          error: `Le lot ${batch.batchNumber} de "${typeInfo.shortName}" expire dans moins de 3 mois (${batch.expiryDate.toLocaleDateString("fr-FR")}). Distribution bloquée.`,
        };
      }

      if (batch.quantity < item.quantity) {
        return {
          success: false,
          error: `Stock insuffisant pour "${typeInfo.shortName}". Disponible: ${batch.quantity}`,
        };
      }

      // Create stock exit (on-demand: quarter=0)
      await prisma.stockExit.create({
        data: {
          productId: product.id,
          batchId: batch.id,
          hospitalId: validated.hospitalId,
          quantity: item.quantity,
          quarter: 0, // 0 = on-demand (not quarterly planned)
          year: new Date().getFullYear(),
          exitDate: new Date(),
        },
      });

      // Decrement batch
      await prisma.batch.update({
        where: { id: batch.id },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Log activity
    const hospital = await prisma.hospital.findUnique({
      where: { id: validated.hospitalId },
    });

    await logActivity({
      action: ActionType.CREATE,
      entityType: "INSULINE_EXIT",
      description: `Distribution insuline à ${hospital?.name || "centre de santé"}: ${validated.items.length} produit(s)`,
      metadata: {
        hospitalId: validated.hospitalId,
        items: validated.items,
      },
    });

    revalidatePath("/insuline");
    return { success: true };
  } catch (error) {
    console.error("Error creating insulin exit:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: ZodIssue) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la distribution",
    };
  }
}

// ============================================
// ACTIONS - GET RECENT MOVEMENTS
// ============================================

export async function getRecentInsulinMovements(
  limit: number = 20
): Promise<{
  success: boolean;
  data?: InsulinMovement[];
  error?: string;
}> {
  try {
    // Get insulin product IDs (by category or codes)
    const insulinCodes = INSULIN_TYPES.map(t => t.code);
    const insulinProducts = await prisma.product.findMany({
      where: {
        OR: [
          { category: Category.INSULINE },
          { code: { in: insulinCodes } },
        ],
        isActive: true,
      },
      select: { id: true, name: true },
    });

    const insulinProductIds = insulinProducts.map((p) => p.id);
    const productNameMap = new Map(insulinProducts.map((p) => [p.id, p.name]));

    // Get entries
    const entries = await prisma.stockEntry.findMany({
      where: { productId: { in: insulinProductIds } },
      include: { batch: true },
      orderBy: { entryDate: "desc" },
      take: limit,
    });

    // Get exits
    const exits = await prisma.stockExit.findMany({
      where: { productId: { in: insulinProductIds } },
      include: { batch: true, hospital: true },
      orderBy: { exitDate: "desc" },
      take: limit,
    });

    // Combine
    const movements: InsulinMovement[] = [
      ...entries.map((e) => ({
        id: e.id,
        date: e.entryDate,
        type: "ENTREE" as const,
        productName: productNameMap.get(e.productId) || "Insuline",
        batchNumber: e.batch?.batchNumber || "N/A",
        quantity: e.quantity,
        reference: e.referenceDoc,
        hospitalName: null,
      })),
      ...exits.map((e) => ({
        id: e.id,
        date: e.exitDate,
        type: "SORTIE" as const,
        productName: productNameMap.get(e.productId) || "Insuline",
        batchNumber: e.batch?.batchNumber || "N/A",
        quantity: e.quantity,
        reference: null,
        hospitalName: e.hospital.name,
      })),
    ];

    movements.sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, data: movements.slice(0, limit) };
  } catch (error) {
    console.error("Error fetching insulin movements:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des mouvements",
    };
  }
}

// ============================================
// ACTIONS - GET HOSPITALS
// ============================================

export async function getHospitals(): Promise<{
  success: boolean;
  data?: { id: string; name: string; code: string }[];
  error?: string;
}> {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: hospitals };
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des centres de santé",
    };
  }
}
