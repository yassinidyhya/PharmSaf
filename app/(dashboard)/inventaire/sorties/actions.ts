"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStockExitCreate } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

// Schema for single item
const stockExitItemSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  batchId: z.string().min(1, "Le lot est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
});

// Schema for multi-product stock exit
const createMultiStockExitSchema = z.object({
  hospitalId: z.string().min(1, "L'hôpital est requis"),
  items: z.array(stockExitItemSchema).min(1, "Au moins un produit est requis"),
  quarter: z.coerce.number().min(1).max(4),
  year: z.coerce.number().min(2020).max(2100),
  notes: z.string().optional(),
  exitDate: z.string().optional(),
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
      if (filters.startDate) where.exitDate.gte = filters.startDate;
      if (filters.endDate) where.exitDate.lte = filters.endDate;
    }

    if (filters?.productId) where.productId = filters.productId;
    if (filters?.hospitalId) where.hospitalId = filters.hospitalId;
    if (filters?.quarter) where.quarter = filters.quarter;
    if (filters?.year) where.year = filters.year;

    const totalCount = await prisma.stockExit.count({ where });

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
        where: { exitDate: { gte: thirtyDaysAgo } },
      }),
      prisma.stockExit.aggregate({
        _sum: { quantity: true },
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

export async function createMultiStockExit(data: {
  hospitalId: string;
  items: Array<{
    productId: string;
    batchId: string;
    quantity: number;
  }>;
  quarter: number;
  year: number;
  notes?: string;
  exitDate?: string;
}) {
  try {
    const validatedData = createMultiStockExitSchema.parse(data);

    // Get hospital info
    const hospital = await prisma.hospital.findUnique({
      where: { id: validatedData.hospitalId },
      select: { name: true },
    });

    if (!hospital) {
      return { success: false, error: "Hôpital non trouvé" };
    }

    const exitDate = validatedData.exitDate 
      ? new Date(validatedData.exitDate) 
      : new Date();

    // Execute all stock exits in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const createdExits = [];

      for (const item of validatedData.items) {
        // Check batch stock
        const batch = await tx.batch.findUnique({
          where: { id: item.batchId },
          include: { product: true },
        });

        if (!batch) {
          throw new Error(`Lot non trouvé: ${item.batchId}`);
        }

        if (batch.quantity < item.quantity) {
          throw new Error(
            `Stock insuffisant pour ${batch.product.name}. Disponible: ${batch.quantity}, Demandé: ${item.quantity}`
          );
        }

        // Decrement batch quantity
        await tx.batch.update({
          where: { id: item.batchId },
          data: { quantity: { decrement: item.quantity } },
        });

        // Create stock exit
        const exit = await tx.stockExit.create({
          data: {
            productId: item.productId,
            batchId: item.batchId,
            hospitalId: validatedData.hospitalId,
            quantity: item.quantity,
            quarter: validatedData.quarter,
            year: validatedData.year,
            notes: validatedData.notes || null,
            exitDate,
          },
        });

        createdExits.push({ exit, product: batch.product, batch });
      }

      return createdExits;
    });

    // Log activity for each exit
    const userId = await getCurrentUserId();
    if (userId) {
      for (const result of results) {
        await logStockExitCreate(
          userId,
          result.exit.id,
          result.product.name,
          result.exit.quantity,
          hospital.name
        );
      }
    }

    revalidatePath("/inventaire");
    revalidatePath("/inventaire/sorties");

    return { 
      success: true, 
      data: {
        exits: results.map(r => r.exit),
        count: results.length,
      }
    };
  } catch (error) {
    console.error("Create multi stock exit error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Erreur lors de la création des sorties",
    };
  }
}

export async function getProductsWithStock() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" }, // FEFO: oldest expiry first
        },
      },
    });

    const productsWithStock = products.filter(
      (p) => p.batches.reduce((sum, b) => sum + b.quantity, 0) > 0
    );

    const serializedProducts = productsWithStock.map(p => ({
      ...p,
      price: p.price ? Number(p.price) : null,
    }));

    return { success: true, data: serializedProducts };
  } catch (error) {
    console.error("Get products error:", error);
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
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
      },
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

export async function exportStockExitsToExcel(
  filters?: StockExitFilters,
  filename?: string
) {
  try {
    const ExcelJS = await import("exceljs");
    
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
      INSULINE: "Insuline",
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
      { header: "Quantité", key: "quantity", width: 12 },
      { header: "Unité", key: "unit", width: 10 },
      { header: "Trimestre", key: "quarter", width: 12 },
      { header: "Année", key: "year", width: 10 },
      { header: "Notes", key: "notes", width: 30 },
    ];

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
        quantity: exit.quantity,
        unit: exit.product.unit,
        quarter: `T${exit.quarter}`,
        year: exit.year,
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

export async function exportStockExitsToPDF(
  filters?: StockExitFilters,
  filename?: string
) {
  try {
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

    const exits = await prisma.stockExit.findMany({
      where,
      orderBy: { exitDate: "desc" },
      include: {
        product: { select: { name: true, code: true, unit: true, category: true } },
        batch: { select: { batchNumber: true, expiryDate: true } },
        hospital: { select: { name: true, code: true } },
      },
    });

    return {
      success: true,
      data: exits,
      filename: filename || `sorties_stock_${new Date().toISOString().split("T")[0]}.pdf`,
    };
  } catch (error) {
    console.error("Export stock exits PDF error:", error);
    return {
      success: false,
      error: "Erreur lors de la préparation de l'export PDF",
    };
  }
}
