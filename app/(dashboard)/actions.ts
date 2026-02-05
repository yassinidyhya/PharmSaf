"use server";

import { prisma } from "@/lib/db";
import { Category } from "@prisma/client";

// Types for dashboard data
export interface DashboardStats {
  totalProducts: number;
  newProductsThisMonth: number;
  totalStockValue: number;
  lowStockCount: number;
  criticalExpiryCount: number;
  distributionsCompleted: number;
  distributionsTotal: number;
  hospitalsActive: number;
  monthlyStockChange: {
    entries: number;
    exits: number;
  };
}

export interface CategoryDistribution {
  category: Category;
  count: number;
  stock: number;
  value: number;
}

export interface StockMovementTrend {
  date: string;
  entries: number;
  exits: number;
}

export interface HospitalConsumption {
  hospitalId: string;
  hospitalName: string;
  totalQuantity: number;
  totalValue: number;
}

export interface CriticalAlert {
  type: "EXPIRY" | "LOW_STOCK" | "INSULIN_EXPIRY";
  severity: "CRITICAL" | "WARNING" | "NOTICE";
  productId: string;
  productName: string;
  productCode: string;
  message: string;
  date: Date;
  quantity?: number;
}

export interface RecentActivity {
  id: string;
  type: "ENTRY" | "EXIT";
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  date: Date;
  reference?: string;
  hospitalName?: string;
}

export interface DistributionEvent {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCode: string;
  scheduledDate: Date;
  status: "completed" | "in_progress" | "scheduled" | "pending";
  noteNumber?: string;
  quarter: number;
  year: number;
}

export interface CategoryStat {
  category: Category;
  count: number;
  stock: number;
  value: number;
  avgMonthlyConsumption: number;
  minStock: number;
}

/**
 * Get main dashboard KPI stats
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentQuarter = Math.floor((new Date().getMonth() / 3)) + 1;
    const currentYear = new Date().getFullYear();

    const [products, lowStockBatches, criticalExpiry, newProducts, hospitals, deliveryNotes] = await Promise.all([
      // All active products with batches
      prisma.product.findMany({
        where: { isActive: true },
        include: { batches: true },
      }),
      // Low stock count
      prisma.batch.groupBy({
        by: ["productId"],
        where: { quantity: { gt: 0 } },
        _sum: { quantity: true },
      }),
      // Critical expiry count (< 30 days)
      prisma.batch.count({
        where: {
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          quantity: { gt: 0 },
        },
      }),
      // New products this month
      prisma.product.count({
        where: {
          isActive: true,
          createdAt: { gte: startOfMonth },
        },
      }),
      // Active hospitals
      prisma.hospital.count({
        where: { isActive: true },
      }),
      // Delivery notes for current quarter
      prisma.deliveryNote.findMany({
        where: {
          quarter: currentQuarter,
          year: currentYear,
        },
        select: { status: true },
      }),
    ]);

    // Calculate total stock value
    let totalStockValue = 0;
    const lowStockCount = products.filter((product) => {
      const totalStock = product.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      const stockValue = product.batches.reduce(
        (sum, batch) => sum + batch.quantity * (product.price?.toNumber() || 0),
        0
      );
      totalStockValue += stockValue;
      return totalStock <= product.minStock;
    }).length;

    // Count distributions
    const distributionsCompleted = deliveryNotes.filter(n => n.status === "LIVRE").length;
    const distributionsTotal = deliveryNotes.length;

    // Get current month movements
    const [monthlyEntries, monthlyExits] = await Promise.all([
      prisma.stockEntry.count({
        where: { entryDate: { gte: startOfMonth } },
      }),
      prisma.stockExit.count({
        where: { exitDate: { gte: startOfMonth } },
      }),
    ]);

    return {
      success: true,
      data: {
        totalProducts: products.length,
        newProductsThisMonth: newProducts,
        totalStockValue,
        lowStockCount,
        criticalExpiryCount: criticalExpiry,
        distributionsCompleted,
        distributionsTotal,
        hospitalsActive: hospitals,
        monthlyStockChange: {
          entries: monthlyEntries,
          exits: monthlyExits,
        },
      },
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}

/**
 * Get stock distribution by category for donut chart
 */
export async function getStockByCategory(): Promise<{
  success: boolean;
  data?: CategoryDistribution[];
  error?: string;
}> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { batches: true },
    });

    const categoryMap = new Map<
      Category,
      { count: number; stock: number; value: number }
    >();

    for (const product of products) {
      const existing = categoryMap.get(product.category) || {
        count: 0,
        stock: 0,
        value: 0,
      };

      const productStock = product.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      const productValue = product.batches.reduce(
        (sum, batch) =>
          sum + batch.quantity * (product.price?.toNumber() || 0),
        0
      );

      categoryMap.set(product.category, {
        count: existing.count + 1,
        stock: existing.stock + productStock,
        value: existing.value + productValue,
      });
    }

    const data: CategoryDistribution[] = Array.from(categoryMap.entries()).map(
      ([category, stats]) => ({
        category,
        count: stats.count,
        stock: stats.stock,
        value: stats.value,
      })
    );

    return { success: true, data };
  } catch (error) {
    console.error("Stock by category error:", error);
    return { success: false, error: "Erreur lors de la récupération des catégories" };
  }
}

/**
 * Get stock movement trends for area chart
 */
export async function getStockMovementTrends(
  days: number = 90
): Promise<{
  success: boolean;
  data?: StockMovementTrend[];
  error?: string;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [entries, exits] = await Promise.all([
      prisma.stockEntry.findMany({
        where: { entryDate: { gte: startDate } },
        select: { entryDate: true, quantity: true },
      }),
      prisma.stockExit.findMany({
        where: { exitDate: { gte: startDate } },
        select: { exitDate: true, quantity: true },
      }),
    ]);

    // Group by date
    const dateMap = new Map<string, { entries: number; exits: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, { entries: 0, exits: 0 });
    }

    for (const entry of entries) {
      const dateStr = entry.entryDate.toISOString().split("T")[0];
      const existing = dateMap.get(dateStr) || { entries: 0, exits: 0 };
      dateMap.set(dateStr, { ...existing, entries: existing.entries + entry.quantity });
    }

    for (const exit of exits) {
      const dateStr = exit.exitDate.toISOString().split("T")[0];
      const existing = dateMap.get(dateStr) || { entries: 0, exits: 0 };
      dateMap.set(dateStr, { ...existing, exits: existing.exits + exit.quantity });
    }

    const data: StockMovementTrend[] = Array.from(dateMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { success: true, data };
  } catch (error) {
    console.error("Movement trends error:", error);
    return { success: false, error: "Erreur lors de la récupération des tendances" };
  }
}

/**
 * Get top hospitals by consumption
 */
export async function getTopHospitals(
  limit: number = 5
): Promise<{
  success: boolean;
  data?: HospitalConsumption[];
  error?: string;
}> {
  try {
    const exits = await prisma.stockExit.groupBy({
      by: ["hospitalId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const hospitalIds = exits.map((e) => e.hospitalId);
    const hospitals = await prisma.hospital.findMany({
      where: { id: { in: hospitalIds } },
      select: { id: true, name: true },
    });

    const hospitalMap = new Map(hospitals.map((h) => [h.id, h.name]));

    const data: HospitalConsumption[] = exits.map((exit) => ({
      hospitalId: exit.hospitalId,
      hospitalName: hospitalMap.get(exit.hospitalId) || "Inconnu",
      totalQuantity: exit._sum.quantity || 0,
      totalValue: 0, // Would need to calculate based on product prices
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Top hospitals error:", error);
    return { success: false, error: "Erreur lors de la récupération des hôpitaux" };
  }
}

/**
 * Get critical alerts for dashboard
 */
export async function getCriticalAlerts(): Promise<{
  success: boolean;
  data?: CriticalAlert[];
  error?: string;
}> {
  try {
    const alerts: CriticalAlert[] = [];
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Critical expiring (< 30 days)
    const criticalBatches = await prisma.batch.findMany({
      where: {
        expiryDate: { lte: thirtyDays },
        quantity: { gt: 0 },
      },
      include: { product: true },
      orderBy: { expiryDate: "asc" },
      take: 10,
    });

    for (const batch of criticalBatches) {
      const daysUntilExpiry = Math.ceil(
        (batch.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      alerts.push({
        type: batch.product.category === "VACCIN" ? "INSULIN_EXPIRY" : "EXPIRY",
        severity: daysUntilExpiry <= 7 ? "CRITICAL" : "WARNING",
        productId: batch.product.id,
        productName: batch.product.name,
        productCode: batch.product.code,
        message:
          daysUntilExpiry <= 0
            ? `Périmé depuis ${Math.abs(daysUntilExpiry)} jours`
            : `Expire dans ${daysUntilExpiry} jours`,
        date: batch.expiryDate,
        quantity: batch.quantity,
      });
    }

    // Low stock alerts
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { batches: true },
    });

    for (const product of products) {
      const totalStock = product.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      if (totalStock <= product.minStock) {
        alerts.push({
          type: "LOW_STOCK",
          severity: totalStock === 0 ? "CRITICAL" : "WARNING",
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          message: `Stock faible: ${totalStock} ${product.unit} (min: ${product.minStock})`,
          date: now,
          quantity: totalStock,
        });
      }
    }

    // Sort by severity
    const severityOrder = { CRITICAL: 0, WARNING: 1, NOTICE: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return { success: true, data: alerts.slice(0, 10) };
  } catch (error) {
    console.error("Critical alerts error:", error);
    return { success: false, error: "Erreur lors de la récupération des alertes" };
  }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(
  limit: number = 10
): Promise<{
  success: boolean;
  data?: RecentActivity[];
  error?: string;
}> {
  try {
    const [entries, exits] = await Promise.all([
      prisma.stockEntry.findMany({
        take: limit,
        orderBy: { entryDate: "desc" },
        include: {
          product: { select: { name: true, code: true, unit: true } },
        },
      }),
      prisma.stockExit.findMany({
        take: limit,
        orderBy: { exitDate: "desc" },
        include: {
          product: { select: { name: true, code: true, unit: true } },
          hospital: { select: { name: true } },
        },
      }),
    ]);

    const activities: RecentActivity[] = [
      ...entries.map((entry) => ({
        id: entry.id,
        type: "ENTRY" as const,
        productName: entry.product.name,
        productCode: entry.product.code,
        quantity: entry.quantity,
        unit: entry.product.unit,
        date: entry.entryDate,
        reference: entry.referenceDoc || undefined,
      })),
      ...exits.map((exit) => ({
        id: exit.id,
        type: "EXIT" as const,
        productName: exit.product.name,
        productCode: exit.product.code,
        quantity: exit.quantity,
        unit: exit.product.unit,
        date: exit.exitDate,
        hospitalName: exit.hospital?.name,
      })),
    ];

    // Sort by date and take limit
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, data: activities.slice(0, limit) };
  } catch (error) {
    console.error("Recent activity error:", error);
    return { success: false, error: "Erreur lors de la récupération de l'activité" };
  }
}

/**
 * Get distribution events for calendar
 */
export async function getDistributionEvents(
  quarter?: number,
  year?: number
): Promise<{
  success: boolean;
  data?: DistributionEvent[];
  error?: string;
}> {
  try {
    const now = new Date();
    const targetQuarter = quarter || Math.floor(now.getMonth() / 3) + 1;
    const targetYear = year || now.getFullYear();

    const deliveryNotes = await prisma.deliveryNote.findMany({
      where: {
        quarter: targetQuarter,
        year: targetYear,
      },
      include: {
        hospital: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const events: DistributionEvent[] = deliveryNotes.map((note) => {
      // Determine status based on note status and dates
      let status: DistributionEvent["status"] = "pending";
      if (note.status === "LIVRE") {
        status = "completed";
      } else if (note.status === "VALIDE") {
        status = "in_progress";
      } else if (note.status === "BROUILLON") {
        status = "scheduled";
      }

      return {
        id: note.id,
        hospitalId: note.hospital.id,
        hospitalName: note.hospital.name,
        hospitalCode: note.hospital.code,
        scheduledDate: note.deliveredAt || note.createdAt,
        status,
        noteNumber: note.noteNumber,
        quarter: note.quarter,
        year: note.year,
      };
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Distribution events error:", error);
    return { success: false, error: "Erreur lors de la récupération des distributions" };
  }
}

/**
 * Get detailed category stats with monthly consumption
 */
export async function getCategoryStats(): Promise<{
  success: boolean;
  data?: CategoryStat[];
  error?: string;
}> {
  try {
    // Get all active products with their batches
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { batches: true },
    });

    // Calculate last 3 months consumption per category
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const stockExits = await prisma.stockExit.findMany({
      where: { exitDate: { gte: threeMonthsAgo } },
      include: { product: { select: { category: true } } },
    });

    // Calculate consumption per category
    const consumptionByCategory = new Map<Category, number>();
    for (const exit of stockExits) {
      const current = consumptionByCategory.get(exit.product.category) || 0;
      consumptionByCategory.set(exit.product.category, current + exit.quantity);
    }

    // Group products by category
    const categoryMap = new Map<
      Category,
      { count: number; stock: number; value: number; minStock: number }
    >();

    for (const product of products) {
      const existing = categoryMap.get(product.category) || {
        count: 0,
        stock: 0,
        value: 0,
        minStock: 0,
      };

      const productStock = product.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );
      const productValue = product.batches.reduce(
        (sum, batch) =>
          sum + batch.quantity * (product.price?.toNumber() || 0),
        0
      );

      categoryMap.set(product.category, {
        count: existing.count + 1,
        stock: existing.stock + productStock,
        value: existing.value + productValue,
        minStock: existing.minStock + product.minStock,
      });
    }

    // Build result with monthly consumption
    const data: CategoryStat[] = Array.from(categoryMap.entries()).map(
      ([category, stats]) => {
        const totalConsumption = consumptionByCategory.get(category) || 0;
        const avgMonthlyConsumption = totalConsumption / 3;

        return {
          category,
          count: stats.count,
          stock: stats.stock,
          value: stats.value,
          avgMonthlyConsumption,
          minStock: stats.minStock,
        };
      }
    );

    // Sort by stock value descending
    data.sort((a, b) => b.value - a.value);

    return { success: true, data };
  } catch (error) {
    console.error("Category stats error:", error);
    return { success: false, error: "Erreur lors de la récupération des statistiques" };
  }
}
