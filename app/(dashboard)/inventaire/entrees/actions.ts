"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStockEntryCreate } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

const createStockEntrySchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  batchNumber: z.string().min(1, "Le numéro de lot est requis"),
  expiryDate: z.string().min(1, "La date d'expiration est requise"),
  temperature: z.string().optional(),
  referenceDoc: z.string().optional(),
  notes: z.string().optional(),
  entryDate: z.string().optional(), // Optional explicit date
});

export interface StockEntryFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  productId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export async function getStockEntries(
  filters?: StockEntryFilters,
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
        { referenceDoc: { contains: filters.search, mode: "insensitive" } },
        { batch: { batchNumber: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.entryDate = {};
      if (filters.startDate) {
        where.entryDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.entryDate.lte = filters.endDate;
      }
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    // Get total count for pagination
    const totalCount = await prisma.stockEntry.count({ where });

    // Get entries with pagination
    const entries = await prisma.stockEntry.findMany({
      where,
      orderBy: { entryDate: "desc" },
      skip,
      take: limit,
      include: {
        product: {
          select: { name: true, code: true, unit: true, category: true },
        },
        batch: {
          select: { batchNumber: true, expiryDate: true },
        },
      },
    });

    return { 
      success: true, 
      data: entries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Get stock entries error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des entrées",
    };
  }
}

export async function getStockEntriesStats() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalEntries, recentEntries, totalQuantity] = await Promise.all([
      prisma.stockEntry.count(),
      prisma.stockEntry.count({
        where: {
          entryDate: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.stockEntry.aggregate({
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalEntries,
        recentEntries,
        totalQuantity: totalQuantity._sum.quantity || 0,
      },
    };
  } catch (error) {
    console.error("Get stock entries stats error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
  }
}

export async function createStockEntry(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = createStockEntrySchema.parse({
      ...rawData,
      quantity: parseInt(rawData.quantity as string),
    });

    // Execute batch upsert and stock entry creation in a transaction
    // to ensure atomicity - both succeed or both fail
    const result = await prisma.$transaction(async (tx) => {
      // Create or find batch
      const batch = await tx.batch.upsert({
        where: {
          batchNumber_productId: {
            batchNumber: validatedData.batchNumber,
            productId: validatedData.productId,
          },
        },
        update: {
          quantity: {
            increment: validatedData.quantity,
          },
          expiryDate: new Date(validatedData.expiryDate),
          temperature: validatedData.temperature || null,
        },
        create: {
          batchNumber: validatedData.batchNumber,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          expiryDate: new Date(validatedData.expiryDate),
          temperature: validatedData.temperature || null,
        },
      });

      // Create stock entry with explicit entry date
      const entryDate = validatedData.entryDate 
        ? new Date(validatedData.entryDate) 
        : new Date();

      const entry = await tx.stockEntry.create({
        data: {
          productId: validatedData.productId,
          batchId: batch.id,
          quantity: validatedData.quantity,
          referenceDoc: validatedData.referenceDoc || null,
          notes: validatedData.notes || null,
          entryDate,
        },
      });

      return { batch, entry };
    });

    // Log activity (outside transaction - non-critical)
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: { name: true },
    });
    const userId = await getCurrentUserId();
    if (userId) {
      await logStockEntryCreate(
        userId,
        result.entry.id,
        product?.name || "Produit inconnu",
        validatedData.quantity,
        validatedData.batchNumber
      );
    }

    revalidatePath("/inventaire");
    revalidatePath("/inventaire/entrees");
    return { success: true, data: result.entry };
  } catch (error) {
    console.error("Create stock entry error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de l'entrée",
    };
  }
}

export async function getProductsForEntry() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    // Serialize Decimal to number for client components
    const serializedProducts = products.map(p => ({
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

// Export functions for stock entries
export async function exportStockEntriesToExcel(
  filters?: StockEntryFilters,
  filename?: string
) {
  try {
    const ExcelJS = await import("exceljs");
    
    // Get all matching entries without pagination
    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { product: { name: { contains: filters.search, mode: "insensitive" } } },
        { product: { code: { contains: filters.search, mode: "insensitive" } } },
        { referenceDoc: { contains: filters.search, mode: "insensitive" } },
        { batch: { batchNumber: { contains: filters.search, mode: "insensitive" } } },
      ];
    }
    if (filters?.startDate || filters?.endDate) {
      where.entryDate = {};
      if (filters.startDate) where.entryDate.gte = filters.startDate;
      if (filters.endDate) where.entryDate.lte = filters.endDate;
    }
    if (filters?.productId) where.productId = filters.productId;

    const entries = await prisma.stockEntry.findMany({
      where,
      orderBy: { entryDate: "desc" },
      include: {
        product: { select: { name: true, code: true, unit: true, category: true } },
        batch: { select: { batchNumber: true, expiryDate: true, temperature: true } },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Entrées de Stock");

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
      { header: "Date d'entrée", key: "date", width: 15 },
      { header: "Code produit", key: "code", width: 15 },
      { header: "Produit", key: "product", width: 30 },
      { header: "Catégorie", key: "category", width: 18 },
      { header: "Lot", key: "batch", width: 15 },
      { header: "Date péremption", key: "expiry", width: 15 },
      { header: "Température", key: "temp", width: 15 },
      { header: "Quantité", key: "quantity", width: 12 },
      { header: "Unité", key: "unit", width: 10 },
      { header: "Document réf.", key: "ref", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    entries.forEach((entry) => {
      sheet.addRow({
        date: new Date(entry.entryDate).toLocaleDateString("fr-FR"),
        code: entry.product.code,
        product: entry.product.name,
        category: categoryLabels[entry.product.category] || entry.product.category,
        batch: entry.batch?.batchNumber || "—",
        expiry: entry.batch?.expiryDate 
          ? new Date(entry.batch.expiryDate).toLocaleDateString("fr-FR") 
          : "—",
        temp: entry.batch?.temperature || "—",
        quantity: entry.quantity,
        unit: entry.product.unit,
        ref: entry.referenceDoc || "",
        notes: entry.notes || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      success: true,
      data: buffer,
      filename: filename || `entrees_stock_${new Date().toISOString().split("T")[0]}.xlsx`,
    };
  } catch (error) {
    console.error("Export stock entries error:", error);
    return {
      success: false,
      error: "Erreur lors de l'export Excel",
    };
  }
}

// PDF Export function
export async function exportStockEntriesToPDF(
  filters?: StockEntryFilters,
  filename?: string
) {
  try {
    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { product: { name: { contains: filters.search, mode: "insensitive" } } },
        { product: { code: { contains: filters.search, mode: "insensitive" } } },
        { referenceDoc: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters?.startDate || filters?.endDate) {
      where.entryDate = {};
      if (filters.startDate) where.entryDate.gte = filters.startDate;
      if (filters.endDate) where.entryDate.lte = filters.endDate;
    }

    const entries = await prisma.stockEntry.findMany({
      where,
      orderBy: { entryDate: "desc" },
      include: {
        product: { select: { name: true, code: true, unit: true, category: true } },
        batch: { select: { batchNumber: true, expiryDate: true } },
      },
    });

    // Return data for client-side PDF generation
    return {
      success: true,
      data: entries,
      filename: filename || `entrees_stock_${new Date().toISOString().split("T")[0]}.pdf`,
    };
  } catch (error) {
    console.error("Export stock entries PDF error:", error);
    return {
      success: false,
      error: "Erreur lors de la préparation de l'export PDF",
    };
  }
}
