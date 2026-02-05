"use server";

import { prisma } from "@/lib/db";
import { Category } from "@prisma/client";

export interface ExpiryFilters {
  days?: number;
  category?: Category;
}

export async function getExpiringProducts(filters?: ExpiryFilters) {
  try {
    const days = filters?.days || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const batches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: cutoffDate,
        },
        quantity: {
          gt: 0,
        },
        ...(filters?.category && {
          product: {
            category: filters.category,
          },
        }),
      },
      include: {
        product: true,
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    // Calculate days until expiry for each batch
    const today = new Date();
    const batchesWithDays = batches.map((batch) => {
      const expiryDate = new Date(batch.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...batch,
        daysUntilExpiry,
      };
    });

    // Group by urgency
    const critical = batchesWithDays.filter((b) => b.daysUntilExpiry <= 30);
    const warning = batchesWithDays.filter(
      (b) => b.daysUntilExpiry > 30 && b.daysUntilExpiry <= 60
    );
    const notice = batchesWithDays.filter(
      (b) => b.daysUntilExpiry > 60 && b.daysUntilExpiry <= 90
    );

    // Calculate total quantity per urgency level
    const stats = {
      critical: {
        count: critical.length,
        quantity: critical.reduce((sum, b) => sum + b.quantity, 0),
      },
      warning: {
        count: warning.length,
        quantity: warning.reduce((sum, b) => sum + b.quantity, 0),
      },
      notice: {
        count: notice.length,
        quantity: notice.reduce((sum, b) => sum + b.quantity, 0),
      },
      total: {
        count: batchesWithDays.length,
        quantity: batchesWithDays.reduce((sum, b) => sum + b.quantity, 0),
      },
    };

    return {
      success: true,
      data: {
        batches: batchesWithDays,
        stats,
      },
    };
  } catch (error) {
    console.error("Get expiring products error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des produits",
    };
  }
}
