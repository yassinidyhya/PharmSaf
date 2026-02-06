"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createProductSchema, updateProductSchema } from "@/lib/validation";
import { z } from "zod";
import { Category } from "@prisma/client";
import { logProductCreate, logProductUpdate, logCreate } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

export interface ProductFilters {
  search?: string;
  category?: Category;
  isActive?: boolean;
}

export async function createProduct(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = createProductSchema.parse({
      ...rawData,
      price: rawData.price ? parseFloat(rawData.price as string) : undefined,
      minStock: parseInt(rawData.minStock as string) || 0,
      initialQuantity: rawData.initialQuantity ? parseInt(rawData.initialQuantity as string) : undefined,
      batchNumber: rawData.batchNumber as string | undefined,
      expiryDate: rawData.expiryDate as string | undefined,
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        code: validatedData.code,
        name: validatedData.name,
        category: validatedData.category,
        unit: validatedData.unit,
        packaging: validatedData.packaging,
        price: validatedData.price,
        minStock: validatedData.minStock,
      },
    });

    // Create initial batch and stock entry if quantity provided
    if (validatedData.initialQuantity && validatedData.initialQuantity > 0) {
      const userId = await getCurrentUserId();
      
      // Create batch
      const batch = await prisma.batch.create({
        data: {
          productId: product.id,
          batchNumber: validatedData.batchNumber || "INIT-001",
          quantity: validatedData.initialQuantity,
          expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      // Create stock entry
      await prisma.stockEntry.create({
        data: {
          productId: product.id,
          batchId: batch.id,
          quantity: validatedData.initialQuantity,
          entryDate: new Date(),
          notes: "Stock initial",
        },
      });

      // Log stock entry creation
      await logCreate(userId || undefined, "STOCK_ENTRY", batch.id, `Stock initial: ${validatedData.initialQuantity} ${product.unit}`);
    }

    // Log activity
    const userId = await getCurrentUserId();
    await logProductCreate(userId || undefined, product.id, product.name, product.code);

    revalidatePath("/produits");
    revalidatePath("/inventaire");
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("Create product error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création du produit",
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

export async function getProducts(filters?: ProductFilters) {
  const where = {
    isActive: filters?.isActive ?? true,
    ...(filters?.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { code: { contains: filters.search, mode: "insensitive" as const } },
      ],
    }),
    ...(filters?.category && { category: filters.category as Category }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            batches: true,
            stockEntries: true,
            stockExits: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Serialize Decimal to number
  const serializedProducts = products.map(serializeProduct);

  return { products: serializedProducts, total };
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        batches: {
          orderBy: { expiryDate: "asc" },
        },
        stockEntries: {
          orderBy: { entryDate: "desc" },
          take: 10,
        },
        stockExits: {
          orderBy: { exitDate: "desc" },
          take: 10,
          include: {
            hospital: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            batches: true,
            stockEntries: true,
            stockExits: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Produit non trouvé" };
    }

    // Serialize Decimal to number
    const serializedProduct = serializeProduct(product);

    return { success: true, data: serializedProduct };
  } catch (error) {
    console.error("Get product error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du produit",
    };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = updateProductSchema.parse({
      ...rawData,
      price: rawData.price ? parseFloat(rawData.price as string) : undefined,
      minStock: rawData.minStock ? parseInt(rawData.minStock as string) : undefined,
    });

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    // Log activity
    const userId = await getCurrentUserId();
    await logProductUpdate(userId || undefined, product.id, product.name, validatedData);

    revalidatePath("/produits");
    revalidatePath(`/produits/${id}`);
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("Update product error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la mise à jour du produit",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath("/produits");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du produit",
    };
  }
}
