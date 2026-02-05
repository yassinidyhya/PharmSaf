"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Category } from "@prisma/client";

const createDistributionSchema = z.object({
  hospitalId: z.string().min(1, "L'hôpital est requis"),
  quarter: z.coerce.number().min(1).max(4),
  year: z.coerce.number().min(2020).max(2100),
  items: z.array(
    z.object({
      productId: z.string(),
      batchId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1, "Au moins un produit est requis"),
});

export async function getHospitalsWithBudget(year: number, quarter: number) {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        allocations: {
          where: { year },
          select: {
            category: true,
            budget: true,
            q1Consumed: true,
            q2Consumed: true,
            q3Consumed: true,
            q4Consumed: true,
          },
        },
      },
    });

    // Calculate remaining budget for each hospital by category
    const hospitalsWithBudget = hospitals.map((hospital) => {
      const budgetByCategory: Record<string, { budget: number; consumed: number; remaining: number }> = {};

      hospital.allocations.forEach((alloc) => {
        const consumed =
          Number(alloc.q1Consumed) +
          Number(alloc.q2Consumed) +
          Number(alloc.q3Consumed) +
          Number(alloc.q4Consumed);

        // Calculate consumed up to selected quarter
        let consumedUpToQuarter = 0;
        if (quarter >= 1) consumedUpToQuarter += Number(alloc.q1Consumed);
        if (quarter >= 2) consumedUpToQuarter += Number(alloc.q2Consumed);
        if (quarter >= 3) consumedUpToQuarter += Number(alloc.q3Consumed);
        if (quarter >= 4) consumedUpToQuarter += Number(alloc.q4Consumed);

        budgetByCategory[alloc.category] = {
          budget: Number(alloc.budget),
          consumed: consumedUpToQuarter,
          remaining: Number(alloc.budget) - consumedUpToQuarter,
        };
      });

      return {
        ...hospital,
        budgetByCategory,
        totalRemaining: Object.values(budgetByCategory).reduce(
          (sum, b) => sum + b.remaining,
          0
        ),
      };
    });

    return { success: true, data: hospitalsWithBudget };
  } catch (error) {
    console.error("Get hospitals error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des hôpitaux",
    };
  }
}

export async function getProductsWithStockAndPrice() {
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
        price: true,
        batches: {
          where: {
            quantity: { gt: 0 },
            expiryDate: {
              gte: new Date(),
            },
          },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    // Filter products with available stock
    const productsWithStock = products
      .filter((p) => p.batches.reduce((sum, b) => sum + b.quantity, 0) > 0)
      .map((p) => ({
        ...p,
        totalStock: p.batches.reduce((sum, b) => sum + b.quantity, 0),
      }));

    return { success: true, data: productsWithStock };
  } catch (error) {
    console.error("Get products error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des produits",
    };
  }
}

export async function validateDistribution(
  hospitalId: string,
  year: number,
  quarter: number,
  items: { productId: string; quantity: number; unitPrice: number }[]
) {
  try {
    // Get hospital allocations
    const allocations = await prisma.annualAllocation.findMany({
      where: { hospitalId, year },
    });

    // Calculate cost by category
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, category: true, price: true },
    });

    const costByCategory: Record<string, number> = {};

    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const price = item.unitPrice || Number(product.price) || 0;
        const cost = price * item.quantity;
        costByCategory[product.category] = (costByCategory[product.category] || 0) + cost;
      }
    });

    // Check budget for each category
    const validation: Record<string, { budget: number; consumed: number; remaining: number; requested: number; valid: boolean }> = {};
    let totalValid = true;

    Object.entries(costByCategory).forEach(([category, cost]) => {
      const allocation = allocations.find((a) => a.category === category);

      let consumed = 0;
      if (allocation) {
        if (quarter >= 1) consumed += Number(allocation.q1Consumed);
        if (quarter >= 2) consumed += Number(allocation.q2Consumed);
        if (quarter >= 3) consumed += Number(allocation.q3Consumed);
        if (quarter >= 4) consumed += Number(allocation.q4Consumed);
      }

      const budget = Number(allocation?.budget || 0);
      const remaining = budget - consumed;
      const valid = cost <= remaining;

      if (!valid) totalValid = false;

      validation[category] = {
        budget,
        consumed,
        remaining,
        requested: cost,
        valid,
      };
    });

    return {
      success: true,
      data: {
        valid: totalValid,
        byCategory: validation,
        totalCost: Object.values(costByCategory).reduce((a, b) => a + b, 0),
      },
    };
  } catch (error) {
    console.error("Validate distribution error:", error);
    return {
      success: false,
      error: "Erreur lors de la validation",
    };
  }
}

async function generateNoteNumber(tx: any, year: number): Promise<string> {
  // Get the last delivery note for this year
  const lastNote = await tx.deliveryNote.findFirst({
    where: { year },
    orderBy: { noteNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastNote) {
    // Extract number from format "YYYY-XXX"
    const parts = lastNote.noteNumber.split("-");
    if (parts.length === 2) {
      const lastNum = parseInt(parts[1], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }
  }

  return `${year}-${String(nextNumber).padStart(3, "0")}`;
}

export async function createDistribution(data: {
  hospitalId: string;
  quarter: number;
  year: number;
  items: { productId: string; batchId: string; quantity: number }[];
}) {
  try {
    const validatedData = createDistributionSchema.parse(data);

    // Get products with prices for cost calculation
    const products = await prisma.product.findMany({
      where: { id: { in: validatedData.items.map((i) => i.productId) } },
      select: { id: true, category: true, price: true },
    });

    // Calculate cost by category and total amount
    const costByCategory: Record<string, number> = {};
    let totalAmount = 0;
    validatedData.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const price = Number(product.price) || 0;
        const cost = price * item.quantity;
        costByCategory[product.category] = (costByCategory[product.category] || 0) + cost;
        totalAmount += cost;
      }
    });

    // Create stock exits, delivery note, and update allocations in a transaction
    const results = await prisma.$transaction(async (tx) => {
      // Generate delivery note number
      const noteNumber = await generateNoteNumber(tx, validatedData.year);

      // Create the delivery note
      const deliveryNote = await tx.deliveryNote.create({
        data: {
          noteNumber,
          hospitalId: validatedData.hospitalId,
          quarter: validatedData.quarter,
          year: validatedData.year,
          status: "VALIDE",
          totalAmount,
          deliveredAt: new Date(),
        },
      });

      const stockExits = [];
      const deliveryItems = [];

      // Create stock exits and delivery note items
      for (const item of validatedData.items) {
        const product = products.find((p) => p.id === item.productId);
        const unitPrice = Number(product?.price) || 0;
        const totalPrice = unitPrice * item.quantity;

        // Update batch quantity
        await tx.batch.update({
          where: { id: item.batchId },
          data: { quantity: { decrement: item.quantity } },
        });

        // Create stock exit linked to delivery note
        const stockExit = await tx.stockExit.create({
          data: {
            productId: item.productId,
            batchId: item.batchId,
            hospitalId: validatedData.hospitalId,
            quantity: item.quantity,
            quarter: validatedData.quarter,
            year: validatedData.year,
            deliveryNoteId: deliveryNote.id,
          },
        });

        stockExits.push(stockExit);

        // Create delivery note item
        const deliveryItem = await tx.deliveryNoteItem.create({
          data: {
            deliveryNoteId: deliveryNote.id,
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
          },
        });

        deliveryItems.push(deliveryItem);
      }

      // Update allocations - add consumption to the appropriate quarter
      for (const [category, cost] of Object.entries(costByCategory)) {
        const allocation = await tx.annualAllocation.findUnique({
          where: {
            hospitalId_category_year: {
              hospitalId: validatedData.hospitalId,
              category: category as Category,
              year: validatedData.year,
            },
          },
        });

        if (allocation) {
          // Update the appropriate quarter
          const quarterField = `q${validatedData.quarter}Consumed` as const;
          await tx.annualAllocation.update({
            where: { id: allocation.id },
            data: {
              [quarterField]: {
                increment: cost,
              },
            },
          });
        }
      }

      return { deliveryNote, stockExits, deliveryItems };
    });

    revalidatePath("/distributions");
    revalidatePath("/inventaire");
    revalidatePath("/inventaire/sorties");
    revalidatePath("/hopitaux");
    revalidatePath(`/hopitaux/${validatedData.hospitalId}`);
    revalidatePath(`/hopitaux/${validatedData.hospitalId}/allocations`);
    revalidatePath("/bons-livraison");

    return { success: true, data: results };
  } catch (error) {
    console.error("Create distribution error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de la distribution",
    };
  }
}
