"use server";

import { prisma } from "@/lib/db";

export async function getDistribution(id: string) {
  try {
    const distribution = await prisma.stockExit.findUnique({
      where: { id },
      include: {
        product: true,
        batch: true,
        hospital: true,
        deliveryNote: {
          include: {
            items: {
              include: {
                batch: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!distribution) {
      return { success: false, error: "Distribution non trouvée" };
    }

    return { success: true, data: distribution };
  } catch (error) {
    console.error("Get distribution error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la distribution",
    };
  }
}

export async function createDeliveryNote(distributionId: string) {
  try {
    const distribution = await prisma.stockExit.findUnique({
      where: { id: distributionId },
      include: {
        product: true,
        batch: true,
        hospital: true,
      },
    });

    if (!distribution) {
      return { success: false, error: "Distribution non trouvée" };
    }

    if (!distribution.batchId) {
      return { success: false, error: "Cette distribution n'a pas de lot associé" };
    }

    // Generate note number: BL-YYYY-T-NUM
    const year = distribution.year;
    const quarter = distribution.quarter;
    const count = await prisma.deliveryNote.count({
      where: { year, quarter },
    });
    const noteNumber = `BL-${year}-T${quarter}-${String(count + 1).padStart(3, "0")}`;

    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        noteNumber,
        hospitalId: distribution.hospitalId,
        quarter: distribution.quarter,
        year: distribution.year,
        status: "BROUILLON",
        items: {
          create: [
            {
              batchId: distribution.batchId,
              quantity: distribution.quantity,
              unitPrice: distribution.product.price || 0,
              totalPrice: (Number(distribution.product.price) || 0) * distribution.quantity,
            },
          ],
        },
      },
    });

    // Link delivery note to stock exit
    await prisma.stockExit.update({
      where: { id: distributionId },
      data: { deliveryNoteId: deliveryNote.id },
    });

    return { success: true, data: deliveryNote };
  } catch (error) {
    console.error("Create delivery note error:", error);
    return {
      success: false,
      error: "Erreur lors de la création du bon de livraison",
    };
  }
}
