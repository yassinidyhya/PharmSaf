"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createProductSchema, updateProductSchema } from "@/lib/validation";
import { z } from "zod";

export interface ProductFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
}

export async function createProduct(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = createProductSchema.parse({
      ...rawData,
      price: rawData.price ? parseFloat(rawData.price as string) : undefined,
      minStock: parseInt(rawData.minStock as string) || 0,
    });

    const product = await prisma.product.create({
      data: validatedData,
    });

    revalidatePath("/produits");
    return { success: true, data: product };
  } catch (error) {
    console.error("Create product error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création du produit",
    };
  }
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
    ...(filters?.category && { category: filters.category }),
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

  return { products, total };
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

    return { success: true, data: product };
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

    revalidatePath("/produits");
    revalidatePath(`/produits/${id}`);
    return { success: true, data: product };
  } catch (error) {
    console.error("Update product error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
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
