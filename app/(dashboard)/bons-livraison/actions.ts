"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoteStatus } from "@prisma/client";
import { logDeliveryNotePrint } from "@/lib/audit-log";
import { getCurrentUserId } from "@/lib/auth";

export interface DeliveryNoteFilters {
  year?: number;
  quarter?: number;
  status?: NoteStatus;
  search?: string;
}

export async function getDeliveryNotes(filters?: DeliveryNoteFilters) {
  try {
    const where = {
      ...(filters?.year && { year: filters.year }),
      ...(filters?.quarter && { quarter: filters.quarter }),
      ...(filters?.status && { status: filters.status as NoteStatus }),
      ...(filters?.search && {
        OR: [
          { noteNumber: { contains: filters.search, mode: "insensitive" as const } },
          {
            hospital: {
              name: { contains: filters.search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    };

    const [notes, total] = await Promise.all([
      prisma.deliveryNote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          hospital: {
            select: { name: true, code: true },
          },
          items: {
            include: {
              batch: {
                include: {
                  product: {
                    select: { name: true, unit: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.deliveryNote.count({ where }),
    ]);

    return { success: true, data: notes, total };
  } catch (error) {
    console.error("Get delivery notes error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des bons de livraison",
    };
  }
}

export async function getDeliveryNote(id: string) {
  try {
    const note = await prisma.deliveryNote.findUnique({
      where: { id },
      include: {
        hospital: true,
        items: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
          },
        },
        stockExits: {
          include: {
            product: {
              select: { name: true, unit: true },
            },
          },
        },
      },
    });

    if (!note) {
      return { success: false, error: "Bon de livraison non trouvé" };
    }

    return { success: true, data: note };
  } catch (error) {
    console.error("Get delivery note error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du bon de livraison",
    };
  }
}

export async function validateDeliveryNote(id: string) {
  try {
    const note = await prisma.deliveryNote.update({
      where: { id },
      data: { status: "VALIDE" },
    });

    revalidatePath("/bons-livraison");
    revalidatePath(`/bons-livraison/${id}`);

    return { success: true, data: note };
  } catch (error) {
    console.error("Validate delivery note error:", error);
    return {
      success: false,
      error: "Erreur lors de la validation",
    };
  }
}

export async function markAsDelivered(id: string) {
  try {
    const note = await prisma.deliveryNote.update({
      where: { id },
      data: {
        status: "LIVRE",
        deliveredAt: new Date(),
      },
    });

    revalidatePath("/bons-livraison");
    revalidatePath(`/bons-livraison/${id}`);

    return { success: true, data: note };
  } catch (error) {
    console.error("Mark as delivered error:", error);
    return {
      success: false,
      error: "Erreur lors du marquage comme livré",
    };
  }
}

export async function getFiltersData() {
  try {
    const [years, hospitals] = await Promise.all([
      prisma.deliveryNote.groupBy({
        by: ["year"],
        orderBy: { year: "desc" },
      }),
      prisma.hospital.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return {
      success: true,
      data: {
        years: years.map((y) => y.year),
        hospitals,
      },
    };
  } catch (error) {
    console.error("Get filters data error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des données",
    };
  }
}

export async function logPrintAction(id: string) {
  try {
    const note = await prisma.deliveryNote.findUnique({
      where: { id },
      include: { hospital: { select: { name: true } } },
    });

    if (!note) {
      return { success: false, error: "Bon non trouvé" };
    }

    const userId = await getCurrentUserId();
    await logDeliveryNotePrint(
      userId || undefined,
      note.id,
      note.noteNumber,
      note.hospital.name
    );

    return { success: true };
  } catch (error) {
    console.error("Log print error:", error);
    return { success: false, error: "Erreur lors du logging" };
  }
}
