"use server";

import { prisma } from "@/lib/db";
import { Category } from "@prisma/client";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

// ==================== TYPES ====================

export interface CategoryStats {
  category: Category;
  count: number;
  stock: number;
  value: number;
  avgPrice: number;
}

export interface StockTrend {
  period: string;
  entries: number;
  exits: number;
}

export interface StockCoverage {
  category: Category;
  label: string;
  monthsOfStock: number;
  optimalRange: { min: number; max: number };
  stockValue: number;
  totalQuantity: number;
}

export interface ExpiringBatchDetail {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  daysUntilExpiry: number;
  product: {
    id: string;
    name: string;
    code: string;
    unit: string;
    category: Category;
  };
}

// ==================== CATEGORY LABELS ====================

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Medicaments",
  VACCIN: "Vaccins",
  REACTIF: "Reactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit materiel",
  MATERIEL_BUREAU: "Materiel bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "#3b82f6",
  VACCIN: "#22c55e",
  REACTIF: "#a855f7",
  CONSOMMABLE: "#f97316",
  PETIT_MATERIEL: "#6b7280",
  MATERIEL_BUREAU: "#64748b",
};

// ==================== MAIN STATS ====================

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
    let totalStockValue = 0;

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

      // Stock value
      if (product.price) {
        totalStockValue += totalStock * product.price.toNumber();
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
        totalStockValue,
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
      error: "Erreur lors de la recuperation des statistiques",
    };
  }
}

// ==================== STOCK TRENDS ====================

export async function getStockTrends(months: number = 6) {
  try {
    const trends: StockTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const periodLabel = format(monthStart, "MMM yyyy");

      // Get entries for this month
      const entries = await prisma.stockEntry.aggregate({
        where: {
          entryDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      // Get exits for this month
      const exits = await prisma.stockExit.aggregate({
        where: {
          exitDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      trends.push({
        period: periodLabel,
        entries: entries._sum.quantity || 0,
        exits: exits._sum.quantity || 0,
      });
    }

    return {
      success: true,
      data: trends,
    };
  } catch (error) {
    console.error("Get stock trends error:", error);
    return {
      success: false,
      error: "Erreur lors de la recuperation des tendances",
      data: [],
    };
  }
}

// ==================== STOCK COVERAGE ====================

export async function getStockCoverage() {
  try {
    // Get all categories
    const categories = Object.values(Category);
    const coverageData: StockCoverage[] = [];

    for (const category of categories) {
      // Get products in this category with their batches
      const products = await prisma.product.findMany({
        where: {
          category,
          isActive: true,
        },
        include: {
          batches: true,
        },
      });

      if (products.length === 0) continue;

      // Calculate total stock and value
      let totalQuantity = 0;
      let stockValue = 0;

      for (const product of products) {
        const productStock = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
        totalQuantity += productStock;
        if (product.price) {
          stockValue += productStock * product.price.toNumber();
        }
      }

      // Calculate average monthly consumption (last 3 months)
      const threeMonthsAgo = subMonths(new Date(), 3);
      const exits = await prisma.stockExit.findMany({
        where: {
          exitDate: {
            gte: threeMonthsAgo,
          },
          product: {
            category,
          },
        },
        select: {
          quantity: true,
        },
      });

      const totalConsumption = exits.reduce((sum, exit) => sum + exit.quantity, 0);
      const avgMonthlyConsumption = totalConsumption / 3;

      // Calculate months of stock
      const monthsOfStock = avgMonthlyConsumption > 0 
        ? totalQuantity / avgMonthlyConsumption 
        : totalQuantity > 0 ? 12 : 0; // If no consumption but has stock, assume 12 months

      // Optimal ranges by category
      const optimalRanges: Record<Category, { min: number; max: number }> = {
        MEDICAMENT: { min: 3, max: 6 },
        VACCIN: { min: 3, max: 6 },
        REACTIF: { min: 2, max: 4 },
        CONSOMMABLE: { min: 2, max: 4 },
        PETIT_MATERIEL: { min: 6, max: 12 },
        MATERIEL_BUREAU: { min: 6, max: 12 },
      };

      coverageData.push({
        category,
        label: categoryLabels[category],
        monthsOfStock: Math.round(monthsOfStock * 10) / 10,
        optimalRange: optimalRanges[category],
        stockValue,
        totalQuantity,
      });
    }

    return {
      success: true,
      data: coverageData,
    };
  } catch (error) {
    console.error("Get stock coverage error:", error);
    return {
      success: false,
      error: "Erreur lors du calcul de la couverture",
      data: [],
    };
  }
}

// ==================== EXPIRING BATCHES DETAIL ====================

export async function getExpiringBatches(days: number = 90) {
  try {
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
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    const today = new Date();
    const formattedBatches: ExpiringBatchDetail[] = batches.map((batch) => {
      const daysUntilExpiry = Math.ceil(
        (batch.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        product: batch.product,
      };
    });

    return {
      success: true,
      data: formattedBatches,
    };
  } catch (error) {
    console.error("Get expiring batches error:", error);
    return {
      success: false,
      error: "Erreur lors de la recuperation des lots",
      data: [],
    };
  }
}

// ==================== CATEGORY STATS FOR CHARTS ====================

export async function getCategoryStatsForCharts() {
  try {
    const categories = Object.values(Category);
    const stats = [];

    for (const category of categories) {
      const products = await prisma.product.findMany({
        where: {
          category,
          isActive: true,
        },
        include: {
          batches: true,
        },
      });

      const stock = products.reduce(
        (sum, p) => sum + p.batches.reduce((batchSum, b) => batchSum + b.quantity, 0),
        0
      );

      if (products.length > 0) {
        stats.push({
          category,
          label: categoryLabels[category],
          stock,
          products: products.length,
          color: categoryColors[category],
        });
      }
    }

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Get category stats error:", error);
    return {
      success: false,
      error: "Erreur lors de la recuperation des statistiques",
      data: [],
    };
  }
}

// ==================== RECENT MOVEMENTS ====================

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
      error: "Erreur lors de la recuperation des mouvements",
    };
  }
}
