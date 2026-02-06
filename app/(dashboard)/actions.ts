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
export async function getDashboardStats(
  fromDate?: Date,
  toDate?: Date
): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setDate(1); // Start of current month
    }
    startDate.setHours(0, 0, 0, 0);

    const currentQuarter = Math.floor((endDate.getMonth() / 3)) + 1;
    const currentYear = endDate.getFullYear();

    const [products, lowStockBatches, criticalExpiry, newProducts, hospitals, deliveryNotes, periodEntries, periodExits] = await Promise.all([
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
          expiryDate: { lte: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000) },
          quantity: { gt: 0 },
        },
      }),
      // New products in date range
      prisma.product.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate, lte: endDate },
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
      // Period entries count
      prisma.stockEntry.count({
        where: { entryDate: { gte: startDate, lte: endDate } },
      }),
      // Period exits count
      prisma.stockExit.count({
        where: { exitDate: { gte: startDate, lte: endDate } },
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
          entries: periodEntries,
          exits: periodExits,
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
  fromDate?: Date,
  toDate?: Date
): Promise<{
  success: boolean;
  data?: StockMovementTrend[];
  error?: string;
}> {
  try {
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setDate(startDate.getDate() - 90);
    }
    startDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference for initializing the date map
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const [entries, exits] = await Promise.all([
      prisma.stockEntry.findMany({
        where: { 
          entryDate: { 
            gte: startDate,
            lte: endDate,
          } 
        },
        select: { entryDate: true, quantity: true },
      }),
      prisma.stockExit.findMany({
        where: { 
          exitDate: { 
            gte: startDate,
            lte: endDate,
          } 
        },
        select: { exitDate: true, quantity: true },
      }),
    ]);

    // Group by date
    const dateMap = new Map<string, { entries: number; exits: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
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
  limit: number = 5,
  fromDate?: Date,
  toDate?: Date
): Promise<{
  success: boolean;
  data?: HospitalConsumption[];
  error?: string;
}> {
  try {
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setMonth(startDate.getMonth() - 3);
    }
    startDate.setHours(0, 0, 0, 0);

    const exits = await prisma.stockExit.groupBy({
      by: ["hospitalId"],
      where: {
        exitDate: { gte: startDate, lte: endDate }
      },
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
export async function getCriticalAlerts(
  fromDate?: Date,
  toDate?: Date
): Promise<{
  success: boolean;
  data?: CriticalAlert[];
  error?: string;
}> {
  try {
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setDate(startDate.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);

    const alerts: CriticalAlert[] = [];
    const now = new Date();
    const thirtyDays = new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Critical expiring (< 30 days)
    const criticalBatches = await prisma.batch.findMany({
      where: {
        expiryDate: { lte: thirtyDays, gte: startDate },
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
        type: batch.product.category === "INSULINE" ? "INSULIN_EXPIRY" : "EXPIRY",
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
  limit: number = 10,
  fromDate?: Date,
  toDate?: Date
): Promise<{
  success: boolean;
  data?: RecentActivity[];
  error?: string;
}> {
  try {
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setDate(startDate.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);

    const [entries, exits] = await Promise.all([
      prisma.stockEntry.findMany({
        where: { entryDate: { gte: startDate, lte: endDate } },
        take: limit,
        orderBy: { entryDate: "desc" },
        include: {
          product: { select: { name: true, code: true, unit: true } },
        },
      }),
      prisma.stockExit.findMany({
        where: { exitDate: { gte: startDate, lte: endDate } },
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
  fromDate?: Date,
  toDate?: Date
): Promise<{
  success: boolean;
  data?: DistributionEvent[];
  error?: string;
}> {
  try {
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setMonth(startDate.getMonth() - 3);
    }
    startDate.setHours(0, 0, 0, 0);

    const deliveryNotes = await prisma.deliveryNote.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
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
export async function getCategoryStats(
  fromDate?: Date,
  toDate?: Date
): Promise<{
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

    // Calculate consumption per category for date range
    const endDate = toDate ? new Date(toDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = fromDate ? new Date(fromDate) : new Date();
    if (!fromDate) {
      startDate.setMonth(startDate.getMonth() - 3);
    }
    startDate.setHours(0, 0, 0, 0);

    const stockExits = await prisma.stockExit.findMany({
      where: { exitDate: { gte: startDate, lte: endDate } },
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

    // Calculate months difference for avg calculation
    const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

    // Build result with monthly consumption
    const data: CategoryStat[] = Array.from(categoryMap.entries()).map(
      ([category, stats]) => {
        const totalConsumption = consumptionByCategory.get(category) || 0;
        const avgMonthlyConsumption = totalConsumption / monthsDiff;

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

// Type for budget consumption
export interface BudgetConsumption {
  category: Category;
  budget: number;
  consumed: number;
  remaining: number;
  percentage: number;
  quarter: number;
  year: number;
}

/**
 * Get budget consumption by category for current quarter
 */
export async function getBudgetConsumption(
  quarter?: number,
  year?: number
): Promise<{
  success: boolean;
  data?: BudgetConsumption[];
  error?: string;
}> {
  try {
    const now = new Date();
    const targetQuarter = quarter || Math.floor(now.getMonth() / 3) + 1;
    const targetYear = year || now.getFullYear();

    // Get all allocations for the year
    const allocations = await prisma.annualAllocation.findMany({
      where: { year: targetYear },
    });

    // Group by category and sum up
    const categoryMap = new Map<Category, { budget: number; consumed: number }>();

    for (const allocation of allocations) {
      const existing = categoryMap.get(allocation.category) || { budget: 0, consumed: 0 };
      
      // Get consumed for target quarter
      let quarterConsumed = 0;
      switch (targetQuarter) {
        case 1: quarterConsumed = allocation.q1Consumed.toNumber(); break;
        case 2: quarterConsumed = allocation.q2Consumed.toNumber(); break;
        case 3: quarterConsumed = allocation.q3Consumed.toNumber(); break;
        case 4: quarterConsumed = allocation.q4Consumed.toNumber(); break;
      }

      // Annual budget, but we'll show quarterly progress
      categoryMap.set(allocation.category, {
        budget: existing.budget + allocation.budget.toNumber() / 4, // Quarterly budget
        consumed: existing.consumed + quarterConsumed,
      });
    }

    // Build result
    const data: BudgetConsumption[] = Array.from(categoryMap.entries()).map(
      ([category, stats]) => ({
        category,
        budget: Math.round(stats.budget),
        consumed: Math.round(stats.consumed),
        remaining: Math.round(stats.budget - stats.consumed),
        percentage: stats.budget > 0 ? Math.round((stats.consumed / stats.budget) * 100) : 0,
        quarter: targetQuarter,
        year: targetYear,
      })
    );

    // Sort by percentage descending (most consumed first)
    data.sort((a, b) => b.percentage - a.percentage);

    return { success: true, data };
  } catch (error) {
    console.error("Budget consumption error:", error);
    return { success: false, error: "Erreur lors de la récupération du budget" };
  }
}

/**
 * Get products for command menu search
 */
export async function getProductsForSearch(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string; code: string }>;
  error?: string;
}> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
      take: 50,
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Products search error:", error);
    return { success: false, error: "Erreur lors de la récupération des produits" };
  }
}

/**
 * Get hospitals for command menu search
 */
export async function getHospitalsForSearch(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string; code: string }>;
  error?: string;
}> {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
      take: 50,
    });

    return { success: true, data: hospitals };
  } catch (error) {
    console.error("Hospitals search error:", error);
    return { success: false, error: "Erreur lors de la récupération des hôpitaux" };
  }
}

// Type for critical product in data table
export interface CriticalProduct {
  id: string;
  code: string;
  name: string;
  category: Category;
  unit: string;
  currentStock: number;
  minStock: number;
  daysUntilExpiry: number | null;
  batchNumber: string | null;
  urgency: "CRITICAL" | "WARNING" | "NOTICE";
  urgencyType: "EXPIRY" | "LOW_STOCK" | "BOTH";
}

/**
 * Get critical products for data table (low stock + expiring)
 */
export async function getCriticalProducts(): Promise<{
  success: boolean;
  data?: CriticalProduct[];
  error?: string;
}> {
  try {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get products with low stock
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { batches: true },
    });

    // Get batches expiring within 30 days
    const expiringBatches = await prisma.batch.findMany({
      where: {
        expiryDate: { lte: thirtyDays },
        quantity: { gt: 0 },
      },
      include: { product: true },
    });

    const criticalProductsMap = new Map<string, CriticalProduct>();

    // Process low stock products
    for (const product of products) {
      const totalStock = product.batches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );

      if (totalStock <= product.minStock) {
        const nearestExpiry = product.batches
          .filter((b) => b.expiryDate && b.quantity > 0)
          .sort((a, b) => (a.expiryDate!.getTime() - b.expiryDate!.getTime()))[0];

        const daysUntilExpiry = nearestExpiry?.expiryDate
          ? Math.ceil((nearestExpiry.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
          : null;

        const isCriticalStock = totalStock === 0;
        const isCriticalExpiry = daysUntilExpiry !== null && daysUntilExpiry <= 7;

        criticalProductsMap.set(product.id, {
          id: product.id,
          code: product.code,
          name: product.name,
          category: product.category,
          unit: product.unit,
          currentStock: totalStock,
          minStock: product.minStock,
          daysUntilExpiry,
          batchNumber: nearestExpiry?.batchNumber || null,
          urgency: isCriticalStock || isCriticalExpiry ? "CRITICAL" : "WARNING",
          urgencyType: daysUntilExpiry !== null && daysUntilExpiry <= 30 ? "BOTH" : "LOW_STOCK",
        });
      }
    }

    // Process expiring batches (add or update)
    for (const batch of expiringBatches) {
      const daysUntilExpiry = Math.ceil(
        (batch.expiryDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      const existing = criticalProductsMap.get(batch.product.id);
      
      if (existing) {
        // Update existing to include expiry info
        existing.daysUntilExpiry = daysUntilExpiry;
        existing.batchNumber = batch.batchNumber;
        existing.urgencyType = "BOTH";
        if (daysUntilExpiry <= 7) existing.urgency = "CRITICAL";
      } else {
        // Add new expiry-only product
        // Look up full product data from already-fetched products array
        const fullProduct = products.find(p => p.id === batch.product.id);
        const totalStock = fullProduct?.batches.reduce(
          (sum, b) => sum + b.quantity, 0
        ) ?? 0;

        criticalProductsMap.set(batch.product.id, {
          id: batch.product.id,
          code: batch.product.code,
          name: batch.product.name,
          category: batch.product.category,
          unit: batch.product.unit,
          currentStock: totalStock,
          minStock: batch.product.minStock,
          daysUntilExpiry,
          batchNumber: batch.batchNumber,
          urgency: daysUntilExpiry <= 7 ? "CRITICAL" : "WARNING",
          urgencyType: "EXPIRY",
        });
      }
    }

    // Convert to array and sort by urgency
    const data = Array.from(criticalProductsMap.values()).sort((a, b) => {
      const urgencyOrder = { CRITICAL: 0, WARNING: 1, NOTICE: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    return { success: true, data };
  } catch (error) {
    console.error("Critical products error:", error);
    return { success: false, error: "Erreur lors de la récupération des produits critiques" };
  }
}
