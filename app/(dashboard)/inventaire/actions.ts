"use server";

import { prisma } from "@/lib/db";

export async function getInventoryStats() {
  try {
    // Get all products with their batches
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        batches: true,
      },
    });

    // Calculate stats by category
    const categoryStats: Record<string, { count: number; stock: number }> = {};
    const lowStockProducts: typeof products = [];

    for (const product of products) {
      const totalStock = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
      
      // Category stats
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = { count: 0, stock: 0 };
      }
      categoryStats[product.category].count++;
      categoryStats[product.category].stock += totalStock;

      // Low stock alert
      if (totalStock <= product.minStock) {
        lowStockProducts.push({ ...product, totalStock } as typeof product & { totalStock: number });
      }
    }

    // Get expiring products (within 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const expiringBatches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: ninetyDaysFromNow,
        },
        quantity: {
          gt: 0,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    // Group expiring by timeframe
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);

    const expiringStats = {
      critical: expiringBatches.filter(b => b.expiryDate <= thirtyDays),
      warning: expiringBatches.filter(b => b.expiryDate > thirtyDays && b.expiryDate <= sixtyDays),
      notice: expiringBatches.filter(b => b.expiryDate > sixtyDays),
    };

    return {
      success: true,
      data: {
        totalProducts: products.length,
        categoryStats,
        lowStockProducts: lowStockProducts.slice(0, 10),
        expiringStats: {
          critical: expiringStats.critical.length,
          warning: expiringStats.warning.length,
          notice: expiringStats.notice.length,
          total: expiringBatches.length,
        },
      },
    };
  } catch (error) {
    console.error("Get inventory stats error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
  }
}

export async function getRecentStockMovements() {
  try {
    const [recentEntries, recentExits] = await Promise.all([
      prisma.stockEntry.findMany({
        take: 5,
        orderBy: { entryDate: "desc" },
        include: {
          product: {
            select: { name: true, unit: true },
          },
        },
      }),
      prisma.stockExit.findMany({
        take: 5,
        orderBy: { exitDate: "desc" },
        include: {
          product: {
            select: { name: true, unit: true },
          },
          hospital: {
            select: { name: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        entries: recentEntries,
        exits: recentExits,
      },
    };
  } catch (error) {
    console.error("Get recent movements error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des mouvements",
    };
  }
}
