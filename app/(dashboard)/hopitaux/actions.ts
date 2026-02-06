"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { HospitalType } from "@prisma/client";
import { logHospitalCreate } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

const createHospitalSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  type: z.nativeEnum(HospitalType, {
    message: "Le type est requis",
  }),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  bedCapacity: z.coerce.number().min(0).optional(),
});

const updateHospitalSchema = createHospitalSchema.partial();

export interface HospitalFilters {
  search?: string;
  type?: HospitalType;
  isActive?: boolean;
}

export async function getHospitals(filters?: HospitalFilters) {
  try {
    const where = {
      isActive: filters?.isActive ?? true,
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { code: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }),
      ...(filters?.type && { type: filters.type }),
    };

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              stockExits: true,
              allocations: true,
            },
          },
        },
      }),
      prisma.hospital.count({ where }),
    ]);

    return { success: true, data: hospitals, total };
  } catch (error) {
    console.error("Get hospitals error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des hôpitaux",
    };
  }
}

export async function getHospital(id: string) {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        allocations: {
          orderBy: { year: "desc" },
        },
        stockExits: {
          orderBy: { exitDate: "desc" },
          take: 10,
          include: {
            product: {
              select: { name: true, unit: true },
            },
          },
        },
        _count: {
          select: {
            stockExits: true,
            allocations: true,
          },
        },
      },
    });

    if (!hospital) {
      return { success: false, error: "Hôpital non trouvé" };
    }

    return { success: true, data: hospital };
  } catch (error) {
    console.error("Get hospital error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'hôpital",
    };
  }
}

export async function createHospital(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = createHospitalSchema.parse({
      ...rawData,
      bedCapacity: rawData.bedCapacity
        ? parseInt(rawData.bedCapacity as string)
        : undefined,
    });

    const hospital = await prisma.hospital.create({
      data: validatedData,
    });

    // Log activity
    const userId = await getCurrentUserId();
    await logHospitalCreate(userId || undefined, hospital.id, hospital.name, hospital.code);

    revalidatePath("/hopitaux");
    return { success: true, data: hospital };
  } catch (error) {
    console.error("Create hospital error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de l'hôpital",
    };
  }
}

export async function updateHospital(id: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = updateHospitalSchema.parse({
      ...rawData,
      bedCapacity: rawData.bedCapacity
        ? parseInt(rawData.bedCapacity as string)
        : undefined,
    });

    const hospital = await prisma.hospital.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/hopitaux");
    revalidatePath(`/hopitaux/${id}`);
    return { success: true, data: hospital };
  } catch (error) {
    console.error("Update hospital error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la mise à jour de l'hôpital",
    };
  }
}

export async function deleteHospital(id: string) {
  try {
    await prisma.hospital.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath("/hopitaux");
    return { success: true };
  } catch (error) {
    console.error("Delete hospital error:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de l'hôpital",
    };
  }
}
