"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface DistributionFilters {
  quarter?: number;
  year?: number;
  hospitalId?: string;
}

export async function getDistributions(filters?: DistributionFilters) {
  try {
    const where = {
      ...(filters?.quarter && { quarter: filters.quarter }),
      ...(filters?.year && { year: filters.year }),
      ...(filters?.hospitalId && { hospitalId: filters.hospitalId }),
    };

    const distributions = await prisma.stockExit.findMany({
      where,
      orderBy: { exitDate: "desc" },
      include: {
        product: {
          select: { name: true, code: true, unit: true, category: true },
        },
        hospital: {
          select: { name: true, code: true },
        },
        batch: {
          select: { batchNumber: true },
        },
        deliveryNote: {
          select: { id: true, noteNumber: true, status: true },
        },
      },
    });

    return { success: true, data: distributions };
  } catch (error) {
    console.error("Get distributions error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des distributions",
    };
  }
}

export async function getDistributionStats() {
  try {
    const currentYear = new Date().getFullYear();
    
    const [totalDistributions, totalQuantity, byQuarter, byHospital] = await Promise.all([
      prisma.stockExit.count({
        where: { year: currentYear },
      }),
      prisma.stockExit.aggregate({
        where: { year: currentYear },
        _sum: { quantity: true },
      }),
      prisma.stockExit.groupBy({
        by: ["quarter"],
        where: { year: currentYear },
        _count: { id: true },
        _sum: { quantity: true },
      }),
      prisma.stockExit.groupBy({
        by: ["hospitalId"],
        where: { year: currentYear },
        _count: { id: true },
        orderBy: { _count: { hospitalId: "desc" } },
        take: 5,
      }),
    ]);

    // Get hospital names for top hospitals
    const hospitalIds = byHospital.map(h => h.hospitalId);
    const hospitals = await prisma.hospital.findMany({
      where: { id: { in: hospitalIds } },
      select: { id: true, name: true },
    });

    const hospitalMap = new Map(hospitals.map(h => [h.id, h.name]));

    return {
      success: true,
      data: {
        totalDistributions,
        totalQuantity: totalQuantity._sum.quantity || 0,
        byQuarter,
        topHospitals: byHospital.map(h => ({
          hospitalId: h.hospitalId,
          hospitalName: hospitalMap.get(h.hospitalId) || "Inconnu",
          count: typeof h._count === "object" ? h._count?.id ?? 0 : h._count ?? 0,
        })),
      },
    };
  } catch (error) {
    console.error("Get distribution stats error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
  }
}

export async function getFiltersData() {
  try {
    const [hospitals, years] = await Promise.all([
      prisma.hospital.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true },
      }),
      prisma.stockExit.groupBy({
        by: ["year"],
        orderBy: { year: "desc" },
      }),
    ]);

    return {
      success: true,
      data: {
        hospitals,
        years: years.map(y => y.year),
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
