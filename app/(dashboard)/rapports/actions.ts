"use server";

import { prisma } from "@/lib/db";

export async function getReportStats() {
  try {
    const currentYear = new Date().getFullYear();

    const [
      totalDistributions,
      totalValue,
      activeHospitals,
      totalDeliveryNotes,
      recentActivity,
    ] = await Promise.all([
      prisma.stockExit.count({
        where: { year: currentYear },
      }),
      prisma.stockExit.findMany({
        where: { year: currentYear },
        include: { product: true },
      }),
      prisma.hospital.count({
        where: { isActive: true },
      }),
      prisma.deliveryNote.count({
        where: { year: currentYear },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    // Calculate total value
    const totalValueAmount = totalValue.reduce(
      (sum, exit) => sum + Number(exit.product.price || 0) * exit.quantity,
      0
    );

    return {
      success: true,
      data: {
        totalDistributions,
        totalValue: totalValueAmount,
        activeHospitals,
        totalDeliveryNotes,
        recentActivity,
      },
    };
  } catch (error) {
    console.error("Get report stats error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
  }
}

export async function getQuarterlyReportData(year: number, quarter: number) {
  try {
    const distributions = await prisma.stockExit.findMany({
      where: { year, quarter },
      include: {
        product: true,
        hospital: true,
        batch: true,
      },
      orderBy: { exitDate: "desc" },
    });

    // Calculate totals by category
    const byCategory: Record<string, { count: number; quantity: number; value: number }> = {};
    const byHospital: Record<string, { count: number; quantity: number; value: number; name: string }> = {};

    distributions.forEach((dist) => {
      const category = dist.product.category;
      const hospitalId = dist.hospital.id;
      const value = Number(dist.product.price || 0) * dist.quantity;

      if (!byCategory[category]) {
        byCategory[category] = { count: 0, quantity: 0, value: 0 };
      }
      byCategory[category].count++;
      byCategory[category].quantity += dist.quantity;
      byCategory[category].value += value;

      if (!byHospital[hospitalId]) {
        byHospital[hospitalId] = { count: 0, quantity: 0, value: 0, name: dist.hospital.name };
      }
      byHospital[hospitalId].count++;
      byHospital[hospitalId].quantity += dist.quantity;
      byHospital[hospitalId].value += value;
    });

    const totalValue = distributions.reduce(
      (sum, d) => sum + Number(d.product.price || 0) * d.quantity,
      0
    );

    return {
      success: true,
      data: {
        distributions,
        byCategory,
        byHospital: Object.entries(byHospital).map(([id, data]) => ({
          id,
          ...data,
        })),
        summary: {
          totalDistributions: distributions.length,
          totalQuantity: distributions.reduce((s, d) => s + d.quantity, 0),
          totalValue,
        },
      },
    };
  } catch (error) {
    console.error("Get quarterly report error:", error);
    return {
      success: false,
      error: "Erreur lors de la génération du rapport",
    };
  }
}

export async function getAnnualReportData(year: number) {
  try {
    const [distributions, allocations, hospitals] = await Promise.all([
      prisma.stockExit.findMany({
        where: { year },
        include: {
          product: true,
          hospital: true,
        },
      }),
      prisma.annualAllocation.findMany({
        where: { year },
        include: {
          hospital: {
            select: { name: true },
          },
        },
      }),
      prisma.hospital.count({
        where: { isActive: true },
      }),
    ]);

    // Calculate by quarter
    const byQuarter = [1, 2, 3, 4].map((q) => {
      const quarterDists = distributions.filter((d) => d.quarter === q);
      return {
        quarter: q,
        count: quarterDists.length,
        quantity: quarterDists.reduce((s, d) => s + d.quantity, 0),
        value: quarterDists.reduce(
          (s, d) => s + Number(d.product.price || 0) * d.quantity,
          0
        ),
      };
    });

    // Calculate by category
    const byCategory: Record<string, { count: number; quantity: number; value: number }> = {};
    distributions.forEach((dist) => {
      const cat = dist.product.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, quantity: 0, value: 0 };
      }
      byCategory[cat].count++;
      byCategory[cat].quantity += dist.quantity;
      byCategory[cat].value += Number(dist.product.price || 0) * dist.quantity;
    });

    return {
      success: true,
      data: {
        byQuarter,
        byCategory,
        totalDistributions: distributions.length,
        totalValue: distributions.reduce(
          (s, d) => s + Number(d.product.price || 0) * d.quantity,
          0
        ),
        totalBudget: allocations.reduce((s, a) => s + Number(a.budget), 0),
        totalConsumed: allocations.reduce(
          (s, a) =>
            s +
            Number(a.q1Consumed) +
            Number(a.q2Consumed) +
            Number(a.q3Consumed) +
            Number(a.q4Consumed),
          0
        ),
        hospitalCount: hospitals,
      },
    };
  } catch (error) {
    console.error("Get annual report error:", error);
    return {
      success: false,
      error: "Erreur lors de la génération du rapport",
    };
  }
}

export async function getActivityLogs(filters?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
}) {
  try {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.action) {
      where.action = filters.action;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      take: 1000,
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error("Get activity logs error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des logs",
    };
  }
}

export async function getUsersForFilter() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Get users error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des utilisateurs",
    };
  }
}
