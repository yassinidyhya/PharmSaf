"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Category } from "@prisma/client";
import { logAllocationCreate } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

const createAllocationSchema = z.object({
  category: z.nativeEnum(Category, {
    message: "La catégorie est requise",
  }),
  year: z.coerce.number().min(2020).max(2100),
  budget: z.coerce.number().min(0, "Le budget doit être positif"),
});

const updateAllocationSchema = z.object({
  budget: z.coerce.number().min(0, "Le budget doit être positif"),
});

export async function getHospitalAllocations(hospitalId: string) {
  try {
    const allocations = await prisma.annualAllocation.findMany({
      where: { hospitalId },
      orderBy: [{ year: "desc" }, { category: "asc" }],
    });

    return { success: true, data: allocations };
  } catch (error) {
    console.error("Get allocations error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des allocations",
    };
  }
}

export async function createAllocation(hospitalId: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = createAllocationSchema.parse({
      ...rawData,
      budget: parseFloat(rawData.budget as string),
      year: parseInt(rawData.year as string),
    });

    // Check if allocation already exists for this hospital/category/year
    const existing = await prisma.annualAllocation.findUnique({
      where: {
        hospitalId_category_year: {
          hospitalId,
          category: validatedData.category,
          year: validatedData.year,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Une allocation existe déjà pour cette catégorie et cette année",
      };
    }

    const allocation = await prisma.annualAllocation.create({
      data: {
        hospitalId,
        category: validatedData.category,
        year: validatedData.year,
        budget: validatedData.budget,
      },
    });

    // Log activity
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    });
    const userId = await getCurrentUserId();
    await logAllocationCreate(
      userId || undefined,
      allocation.id,
      hospital?.name || "Hôpital inconnu",
      validatedData.category,
      validatedData.year,
      validatedData.budget
    );

    revalidatePath(`/hopitaux/${hospitalId}/allocations`);
    return { success: true, data: allocation };
  } catch (error) {
    console.error("Create allocation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de l'allocation",
    };
  }
}

export async function updateAllocation(
  allocationId: string,
  hospitalId: string,
  formData: FormData
) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = updateAllocationSchema.parse({
      budget: parseFloat(rawData.budget as string),
    });

    const allocation = await prisma.annualAllocation.update({
      where: { id: allocationId },
      data: {
        budget: validatedData.budget,
      },
    });

    revalidatePath(`/hopitaux/${hospitalId}/allocations`);
    return { success: true, data: allocation };
  } catch (error) {
    console.error("Update allocation error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la mise à jour de l'allocation",
    };
  }
}

export async function deleteAllocation(allocationId: string, hospitalId: string) {
  try {
    await prisma.annualAllocation.delete({
      where: { id: allocationId },
    });

    revalidatePath(`/hopitaux/${hospitalId}/allocations`);
    return { success: true };
  } catch (error) {
    console.error("Delete allocation error:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de l'allocation",
    };
  }
}
