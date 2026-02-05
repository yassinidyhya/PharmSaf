"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createStockExitSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  batchId: z.string().min(1, "Le lot est requis"),
  hospitalId: z.string().min(1, "L'hôpital est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  quarter: z.coerce.number().min(1).max(4),
  year: z.coerce.number().min(2020).max(2100),
  notes: z.string().optional(),
});

export async function getStockExits() {
  try {
    const exits = await prisma.stockExit.findMany({
      orderBy: { exitDate: "desc" },
      include: {
        product: {
          select: { name: true, code: true, unit: true },
        },
        batch: {
          select: { batchNumber: true },
        },
        hospital: {
          select: { name: true, code: true },
        },
      },
    });

    return { success: true, data: exits };
  } catch (error) {
    console.error("Get stock exits error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des sorties",
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

    // Update batch quantity
    await prisma.batch.update({
      where: { id: validatedData.batchId },
      data: {
        quantity: {
          decrement: validatedData.quantity,
        },
      },
    });

    // Create stock exit
    const exit = await prisma.stockExit.create({
      data: {
        productId: validatedData.productId,
        batchId: validatedData.batchId,
        hospitalId: validatedData.hospitalId,
        quantity: validatedData.quantity,
        quarter: validatedData.quarter,
        year: validatedData.year,
        notes: validatedData.notes || null,
      },
    });

    revalidatePath("/inventaire");
    revalidatePath("/inventaire/sorties");
    return { success: true, data: exit };
  } catch (error) {
    console.error("Create stock exit error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de la sortie",
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
          where: {
            quantity: {
              gt: 0,
            },
          },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    // Filter only products with available stock
    const productsWithStock = products.filter(
      (p) => p.batches.reduce((sum, b) => sum + b.quantity, 0) > 0
    );

    return { success: true, data: productsWithStock };
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
