"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logStockEntryCreate } from "@/lib/audit-log";
import { auth } from "@clerk/nextjs/server";

const createStockEntrySchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  batchNumber: z.string().min(1, "Le numéro de lot est requis"),
  expiryDate: z.string().min(1, "La date d'expiration est requise"),
  temperature: z.string().optional(),
  referenceDoc: z.string().optional(),
  notes: z.string().optional(),
});

export async function getStockEntries() {
  try {
    const entries = await prisma.stockEntry.findMany({
      orderBy: { entryDate: "desc" },
      include: {
        product: {
          select: { name: true, code: true, unit: true },
        },
        batch: {
          select: { batchNumber: true, expiryDate: true },
        },
      },
    });

    return { success: true, data: entries };
  } catch (error) {
    console.error("Get stock entries error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des entrées",
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

    // Create or find batch
    const batch = await prisma.batch.upsert({
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

    // Create stock entry
    const entry = await prisma.stockEntry.create({
      data: {
        productId: validatedData.productId,
        batchId: batch.id,
        quantity: validatedData.quantity,
        referenceDoc: validatedData.referenceDoc || null,
        notes: validatedData.notes || null,
      },
    });

    // Log activity
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: { name: true },
    });
    const { userId } = await auth();
    await logStockEntryCreate(
      userId || undefined,
      entry.id,
      product?.name || "Produit inconnu",
      validatedData.quantity,
      validatedData.batchNumber
    );

    revalidatePath("/inventaire");
    revalidatePath("/inventaire/entrees");
    return { success: true, data: entry };
  } catch (error) {
    console.error("Create stock entry error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
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
      select: {
        id: true,
        name: true,
        code: true,
        unit: true,
        category: true,
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Get products error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des produits",
    };
  }
}
