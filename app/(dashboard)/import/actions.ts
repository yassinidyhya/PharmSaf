"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  parseProductsExcel,
  parseStockEntriesExcel,
  parseHospitalsExcel,
  ParsedProduct,
  ParsedStockEntry,
  ParsedHospital,
} from "@/lib/excel/import";
import { logImport } from "@/lib/audit-log";
// Mock-aware auth helper — returns demo user ID in mock mode, real Clerk userId otherwise
const isMockMode = process.env.USE_MOCK_DATA === "true";
async function getUserId(): Promise<string | null> {
  if (isMockMode) return "user-demo";
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId;
}

interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  errors: number;
}

export async function importProducts(fileBuffer: Buffer) {
  try {
    const parseResult = await parseProductsExcel(fileBuffer);

    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    const products = parseResult.data;
    const summary: ImportSummary = {
      total: products.length,
      created: 0,
      updated: 0,
      errors: 0,
    };
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: { code: product.code },
        });

        if (existing) {
          // Update existing
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: product.name,
              category: product.category,
              unit: product.unit,
              packaging: product.packaging,
              price: product.price,
              minStock: product.minStock,
            },
          });
          summary.updated++;
        } else {
          // Create new
          await prisma.product.create({
            data: {
              code: product.code,
              name: product.name,
              category: product.category,
              unit: product.unit,
              packaging: product.packaging,
              price: product.price,
              minStock: product.minStock,
            },
          });
          summary.created++;
        }
      } catch (error) {
        summary.errors++;
        errors.push({
          row: i + 2,
          message: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    revalidatePath("/produits");

    // Log activity
    const userId = await getUserId();
    await logImport(userId || undefined, "products", summary.total, summary.created, summary.updated);

    return {
      success: summary.errors === 0,
      summary,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Import products error:", error);
    return {
      success: false,
      error: "Erreur lors de l'import des produits",
    };
  }
}

export async function importStockEntries(fileBuffer: Buffer, userId: string) {
  try {
    const parseResult = await parseStockEntriesExcel(fileBuffer);

    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    const entries = parseResult.data;
    const summary: ImportSummary = {
      total: entries.length,
      created: 0,
      updated: 0,
      errors: 0,
    };
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      try {
        // Find product by code
        const product = await prisma.product.findUnique({
          where: { code: entry.productCode },
        });

        if (!product) {
          summary.errors++;
          errors.push({
            row: i + 2,
            message: `Produit non trouvé: ${entry.productCode}`,
          });
          continue;
        }

        // Check if batch already exists for this product
        let batch = await prisma.batch.findFirst({
          where: {
            batchNumber: entry.batchNumber,
            productId: product.id,
          },
        });

        if (batch) {
          // Update batch quantity
          await prisma.batch.update({
            where: { id: batch.id },
            data: {
              quantity: { increment: entry.quantity },
              expiryDate: entry.expiryDate,
              temperature: entry.temperature,
            },
          });
        } else {
          // Create new batch
          batch = await prisma.batch.create({
            data: {
              batchNumber: entry.batchNumber,
              productId: product.id,
              quantity: entry.quantity,
              expiryDate: entry.expiryDate,
              temperature: entry.temperature,
            },
          });
        }

        // Create stock entry
        await prisma.stockEntry.create({
          data: {
            productId: product.id,
            batchId: batch.id,
            quantity: entry.quantity,
            referenceDoc: entry.referenceDoc,
            entryDate: new Date(),
          },
        });

        summary.created++;
      } catch (error) {
        summary.errors++;
        errors.push({
          row: i + 2,
          message: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    revalidatePath("/inventaire");
    revalidatePath("/inventaire/entrees");

    // Log activity
    const userId = await getUserId();
    await logImport(userId || undefined, "stock entries", summary.total, summary.created, summary.updated);

    return {
      success: summary.errors === 0,
      summary,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Import stock entries error:", error);
    return {
      success: false,
      error: "Erreur lors de l'import des entrées stock",
    };
  }
}

export async function importHospitals(fileBuffer: Buffer) {
  try {
    const parseResult = await parseHospitalsExcel(fileBuffer);

    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    const hospitals = parseResult.data;
    const summary: ImportSummary = {
      total: hospitals.length,
      created: 0,
      updated: 0,
      errors: 0,
    };
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < hospitals.length; i++) {
      const hospital = hospitals[i];
      try {
        // Check if hospital already exists
        const existing = await prisma.hospital.findUnique({
          where: { code: hospital.code },
        });

        if (existing) {
          // Update existing
          await prisma.hospital.update({
            where: { id: existing.id },
            data: {
              name: hospital.name,
              type: hospital.type,
              address: hospital.address,
              phone: hospital.phone,
              email: hospital.email || undefined,
              bedCapacity: hospital.bedCapacity,
            },
          });
          summary.updated++;
        } else {
          // Create new
          await prisma.hospital.create({
            data: {
              code: hospital.code,
              name: hospital.name,
              type: hospital.type,
              address: hospital.address,
              phone: hospital.phone,
              email: hospital.email,
              bedCapacity: hospital.bedCapacity,
              isActive: true,
            },
          });
          summary.created++;
        }
      } catch (error) {
        summary.errors++;
        errors.push({
          row: i + 2,
          message: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    revalidatePath("/hopitaux");

    // Log activity
    const userId = await getUserId();
    await logImport(userId || undefined, "hospitals", summary.total, summary.created, summary.updated);

    return {
      success: summary.errors === 0,
      summary,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Import hospitals error:", error);
    return {
      success: false,
      error: "Erreur lors de l'import des hôpitaux",
    };
  }
}

export async function previewImport(
  importType: "products" | "stock" | "hospitals",
  fileBuffer: Buffer
) {
  try {
    switch (importType) {
      case "products":
        return parseProductsExcel(fileBuffer, true);
      case "stock":
        return parseStockEntriesExcel(fileBuffer, true);
      case "hospitals":
        return parseHospitalsExcel(fileBuffer, true);
      default:
        return { success: false, error: "Type d'import inconnu" };
    }
  } catch (error) {
    console.error("Preview import error:", error);
    return {
      success: false,
      error: "Erreur lors de la prévisualisation",
    };
  }
}
