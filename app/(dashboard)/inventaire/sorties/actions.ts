"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStockExitCreate } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

const createStockExitSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  batchId: z.string().min(1, "Le lot est requis"),
  hospitalId: z.string().min(1, "L'hôpital est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  quarter: z.coerce.number().min(1).max(4),
  year: z.coerce.number().min(2020).max(2100),
  notes: z.string().optional(),
  exitDate: z.string().optional(), // Optional explicit date
});

export interface StockExitFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  productId?: string;
  hospitalId?: string;
  quarter?: number;
  year?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export async function getStockExits(
  filters?: StockExitFilters,
  pagination: PaginationParams = { page: 1, limit: 20 }
) {
  try {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (filters?.search) {
      where.OR = [
        { product: { name: { contains: filters.search, mode: "insensitive" } } },
        { product: { code: { contains: filters.search, mode: "insensitive" } } },
        { hospital: { name: { contains: filters.search, mode: "insensitive" } } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.exitDate = {};
      if (filters.startDate) {
        where.exitDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.exitDate.lte = filters.endDate;
      }
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.hospitalId) {
      where.hospitalId = filters.hospitalId;
    }

    if (filters?.quarter) {
      where.quarter = filters.quarter;
    }

    if (filters?.year) {
      where.year = filters.year;
    }

    // Get total count for pagination
    const totalCount = await prisma.stockExit.count({ where });

    // Get exits with pagination
    const exits = await prisma.stockExit.findMany({
      where,
      orderBy: { exitDate: "desc" },
      skip,
      take: limit,
      include: {
        product: {
          select: { name: true, code: true, unit: true, category: true },
        },
        batch: {
          select: { batchNumber: true, expiryDate: true },
        },
        hospital: {
          select: { name: true, code: true },
        },
      },
    });

    return { 
      success: true, 
      data: exits,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Get stock exits error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des sorties",
    };
  }
}

export async function getStockExitsStats() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalExits, recentExits, totalQuantity] = await Promise.all([
      prisma.stockExit.count(),
      prisma.stockExit.count({
        where: {
          exitDate: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.stockExit.aggregate({
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalExits,
        recentExits,
        totalQuantity: totalQuantity._sum.quantity || 0,
      },
    };
  } catch (error) {
    console.error("Get stock exits stats error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
  }
}

export async function createStockExit(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = createStockExitSchema.parse({
      ...rawData,
      quantity: parseInt(rawData.quantity as string),
      quarter: parseInt(rawData.quarter as string),
      year: parseInt(rawData.year as string),
    });

    // Check if batch has enough stock
    const batch = await prisma.batch.findUnique({
      where: { id: validatedData.batchId },
      include: { product: true },
    });

    if (!batch) {
      return {
        success: false,
        error: "Lot non trouvé",
      };
    }

    if (batch.quantity < validatedData.quantity) {
      return {
        success: false,
        error: `Stock insuffisant. Disponible: ${batch.quantity}`,
      };
    }

    // Get hospital info for audit log
    const hospital = await prisma.hospital.findUnique({
      where: { id: validatedData.hospitalId },
      select: { name: true },
    });

    if (!hospital) {
      return {
        success: false,
        error: "Hôpital non trouvé",
      };
    }

    // Update batch quantity
    await prisma.batch.update({
      where: { id: validatedData.batchId },
      data: {
        quantity: {
          decrement: validatedData.quantity,
        },
      },
    });

    // Create stock exit with explicit exit date
    const exitDate = validatedData.exitDate 
      ? new Date(validatedData.exitDate) 
      : new Date();

    const exit = await prisma.stockExit.create({
      data: {
        productId: validatedData.productId,
        batchId: validatedData.batchId,
        hospitalId: validatedData.hospitalId,
        quantity: validatedData.quantity,
        quarter: validatedData.quarter,
        year: validatedData.year,
        notes: validatedData.notes || null,
        exitDate,
      },
    });

    // Log activity
    const userId = await getCurrentUserId();
    if (userId) {
      await logStockExitCreate(
        userId,
        exit.id,
        batch.product.name,
        validatedData.quantity,
        hospital.name
      );
    }

    revalidatePath("/inventaire");
    revalidatePath("/inventaire/sorties");
    return { success: true, data: exit };
  } catch (error) {
    console.error("Create stock exit error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de la sortie",
    };
  }
}

// Helper to serialize Decimal to number
function serializeProduct(product: any) {
  return {
    ...product,
    price: product.price ? Number(product.price) : null,
  };
}

export async function getProductsWithStock() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        batches: {
          where: {
            quantity: {
              gt: 0,
            },
          },
          orderBy: { expiryDate: "asc" }, // FEFO: oldest expiry first
        },
      },
    });

    // Filter only products with available stock
    const productsWithStock = products.filter(
      (p) => p.batches.reduce((sum, b) => sum + b.quantity, 0) > 0
    );

    // Serialize Decimal to number
    const serializedProducts = productsWithStock.map(serializeProduct);

    return { success: true, data: serializedProducts };
  } catch (error) {
    console.error("Get products error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des produits",
    };
  }
}

// Get products with FEFO recommendation
export async function getProductsWithFEFO() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    const productsWithStock = products.filter(
      (p) => p.batches.reduce((sum, b) => sum + b.quantity, 0) > 0
    );

    // Add FEFO recommendation for each product and serialize Decimal
    const productsWithFEFO = productsWithStock.map((product) => {
      const oldestBatch = product.batches[0]; // Already sorted by expiryDate asc
      return {
        ...serializeProduct(product),
        recommendedBatch: oldestBatch,
        isFEFOCompliant: true,
      };
    });

    return { success: true, data: productsWithFEFO };
  } catch (error) {
    console.error("Get products with FEFO error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des produits",
    };
  }
}

export async function getHospitals() {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: hospitals };
  } catch (error) {
    console.error("Get hospitals error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des hôpitaux",
    };
  }
}

// Export functions for stock exits
export async function exportStockExitsToExcel(
  filters?: StockExitFilters,
  filename?: string
) {
  try {
    const ExcelJS = await import("exceljs");
    
    // Get all matching exits without pagination
    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { product: { name: { contains: filters.search, mode: "insensitive" } } },
        { product: { code: { contains: filters.search, mode: "insensitive" } } },
        { hospital: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }
    if (filters?.startDate || filters?.endDate) {
      where.exitDate = {};
      if (filters.startDate) where.exitDate.gte = filters.startDate;
      if (filters.endDate) where.exitDate.lte = filters.endDate;
    }
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.hospitalId) where.hospitalId = filters.hospitalId;
    if (filters?.quarter) where.quarter = filters.quarter;
    if (filters?.year) where.year = filters.year;

    const exits = await prisma.stockExit.findMany({
      where,
      orderBy: { exitDate: "desc" },
      include: {
        product: { select: { name: true, code: true, unit: true, category: true } },
        batch: { select: { batchNumber: true, expiryDate: true } },
        hospital: { select: { name: true, code: true } },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sorties de Stock");

    const categoryLabels: Record<string, string> = {
      MEDICAMENT: "Médicaments",
      VACCIN: "Vaccins",
      REACTIF: "Réactifs",
      CONSOMMABLE: "Consommables",
      PETIT_MATERIEL: "Petit matériel",
      MATERIEL_BUREAU: "Matériel de bureau",
    };

    sheet.columns = [
      { header: "Date de sortie", key: "date", width: 15 },
      { header: "Code produit", key: "code", width: 15 },
      { header: "Produit", key: "product", width: 30 },
      { header: "Catégorie", key: "category", width: 18 },
      { header: "Lot", key: "batch", width: 15 },
      { header: "Date péremption", key: "expiry", width: 15 },
      { header: "Hôpital", key: "hospital", width: 25 },
      { header: "Trimestre", key: "quarter", width: 12 },
      { header: "Année", key: "year", width: 10 },
      { header: "Quantité", key: "quantity", width: 12 },
      { header: "Unité", key: "unit", width: 10 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    exits.forEach((exit) => {
      sheet.addRow({
        date: new Date(exit.exitDate).toLocaleDateString("fr-FR"),
        code: exit.product.code,
        product: exit.product.name,
        category: categoryLabels[exit.product.category] || exit.product.category,
        batch: exit.batch?.batchNumber || "—",
        expiry: exit.batch?.expiryDate 
          ? new Date(exit.batch.expiryDate).toLocaleDateString("fr-FR") 
          : "—",
        hospital: exit.hospital.name,
        quarter: `T${exit.quarter}`,
        year: exit.year,
        quantity: exit.quantity,
        unit: exit.product.unit,
        notes: exit.notes || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      success: true,
      data: buffer,
      filename: filename || `sorties_stock_${new Date().toISOString().split("T")[0]}.xlsx`,
    };
  } catch (error) {
    console.error("Export stock exits error:", error);
    return {
      success: false,
      error: "Erreur lors de l'export Excel",
    };
  }
}
