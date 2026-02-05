"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logCreate, logUpdate } from "@/lib/audit-log";
import { auth } from "@clerk/nextjs/server";

const createKitSchema = z.object({
  kitNumber: z.string().min(1, "Le numéro de kit est requis"),
  kitType: z.enum(["NORMAL", "EPISIOTOMIE"]),
  components: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1, "Au moins un composant est requis"),
});

const distributeKitSchema = z.object({
  hospitalId: z.string().min(1, "L'hôpital est requis"),
});

export async function getKits() {
  try {
    const kits = await prisma.birthKit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        components: {
          include: {
            product: {
              select: { name: true, code: true, unit: true },
            },
          },
        },
        _count: {
          select: { components: true },
        },
      },
    });

    return { success: true, data: kits };
  } catch (error) {
    console.error("Get kits error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des kits",
    };
  }
}

export async function getKit(id: string) {
  try {
    const kit = await prisma.birthKit.findUnique({
      where: { id },
      include: {
        components: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!kit) {
      return { success: false, error: "Kit non trouvé" };
    }

    return { success: true, data: kit };
  } catch (error) {
    console.error("Get kit error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du kit",
    };
  }
}

export async function getAvailableProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        OR: [
          { category: "CONSOMMABLE" },
          { category: "MEDICAMENT" },
        ],
      },
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

export async function createKit(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const components = JSON.parse(rawData.components as string);
    
    const validatedData = createKitSchema.parse({
      kitNumber: rawData.kitNumber,
      kitType: rawData.kitType,
      components,
    });

    // Check if kit number already exists
    const existing = await prisma.birthKit.findUnique({
      where: { kitNumber: validatedData.kitNumber },
    });

    if (existing) {
      return {
        success: false,
        error: "Ce numéro de kit existe déjà",
      };
    }

    // Create kit with components in transaction
    const kit = await prisma.$transaction(async (tx) => {
      // Create the kit
      const newKit = await tx.birthKit.create({
        data: {
          kitNumber: validatedData.kitNumber,
          kitType: validatedData.kitType,
          isComplete: false,
          isDistributed: false,
        },
      });

      // Create components
      for (const comp of validatedData.components) {
        await tx.kitComponent.create({
          data: {
            kitId: newKit.id,
            productId: comp.productId,
            quantity: comp.quantity,
            isPresent: false,
          },
        });
      }

      return newKit;
    });

    // Log activity
    const { userId } = await auth();
    await logCreate(
      userId || undefined,
      "BirthKit",
      kit.id,
      `Création du kit de naissance ${kit.kitNumber} (${kit.kitType})`,
      { kitNumber: kit.kitNumber, kitType: kit.kitType, componentCount: components.length }
    );

    revalidatePath("/kits");
    return { success: true, data: kit };
  } catch (error) {
    console.error("Create kit error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création du kit",
    };
  }
}

export async function verifyComponent(kitId: string, componentId: string, isPresent: boolean) {
  try {
    await prisma.kitComponent.update({
      where: { id: componentId },
      data: { isPresent },
    });

    // Check if all components are present
    const components = await prisma.kitComponent.findMany({
      where: { kitId },
    });

    const allPresent = components.every((c) => c.isPresent);

    await prisma.birthKit.update({
      where: { id: kitId },
      data: { isComplete: allPresent },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${kitId}`);

    return { success: true, isComplete: allPresent };
  } catch (error) {
    console.error("Verify component error:", error);
    return {
      success: false,
      error: "Erreur lors de la vérification",
    };
  }
}

export async function distributeKit(kitId: string, hospitalId: string) {
  try {
    const kit = await prisma.birthKit.findUnique({
      where: { id: kitId },
      include: { components: true },
    });

    if (!kit) {
      return { success: false, error: "Kit non trouvé" };
    }

    if (!kit.isComplete) {
      return { success: false, error: "Le kit n'est pas complet" };
    }

    if (kit.isDistributed) {
      return { success: false, error: "Le kit est déjà distribué" };
    }

    // Check stock availability
    for (const component of kit.components) {
      const batches = await prisma.batch.findMany({
        where: { 
          productId: component.productId,
          quantity: { gt: 0 },
        },
      });

      const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalStock < component.quantity) {
        return {
          success: false,
          error: `Stock insuffisant pour un composant (${component.productId})`,
        };
      }
    }

    // Distribute kit (reduce stock)
    await prisma.$transaction(async (tx) => {
      for (const component of kit.components) {
        // Get batches with stock (FEFO - First Expired First Out)
        const batches = await tx.batch.findMany({
          where: { 
            productId: component.productId,
            quantity: { gt: 0 },
          },
          orderBy: { expiryDate: "asc" },
        });

        let remainingQty = component.quantity;

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const qtyToDeduct = Math.min(remainingQty, batch.quantity);
          
          await tx.batch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: qtyToDeduct } },
          });

          // Create stock exit
          await tx.stockExit.create({
            data: {
              productId: component.productId,
              batchId: batch.id,
              hospitalId,
              quantity: qtyToDeduct,
              quarter: Math.ceil((new Date().getMonth() + 1) / 3),
              year: new Date().getFullYear(),
            },
          });

          remainingQty -= qtyToDeduct;
        }
      }

      // Mark kit as distributed
      await tx.birthKit.update({
        where: { id: kitId },
        data: {
          isDistributed: true,
          distributedAt: new Date(),
          hospitalId,
        },
      });
    });

    // Log activity
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    });
    const { userId } = await auth();
    await logUpdate(
      userId || undefined,
      "BirthKit",
      kitId,
      `Distribution du kit ${kit.kitNumber} à ${hospital?.name || "hôpital inconnu"}`,
      { kitNumber: kit.kitNumber, hospitalId, hospitalName: hospital?.name }
    );

    revalidatePath("/kits");
    revalidatePath(`/kits/${kitId}`);

    return { success: true };
  } catch (error) {
    console.error("Distribute kit error:", error);
    return {
      success: false,
      error: "Erreur lors de la distribution du kit",
    };
  }
}

export async function getHospitalsForDistribution() {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
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

export async function deleteKit(id: string) {
  try {
    const kit = await prisma.birthKit.findUnique({
      where: { id },
    });

    if (!kit) {
      return { success: false, error: "Kit non trouvé" };
    }

    if (kit.isDistributed) {
      return { success: false, error: "Impossible de supprimer un kit distribué" };
    }

    await prisma.birthKit.delete({
      where: { id },
    });

    revalidatePath("/kits");
    return { success: true };
  } catch (error) {
    console.error("Delete kit error:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du kit",
    };
  }
}
