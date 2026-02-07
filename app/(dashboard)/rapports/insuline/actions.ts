"use server";

import { prisma } from "@/lib/db";
import { Category } from "@prisma/client";

// Type definitions for the report data
export interface InsulinDistribution {
  id: string;
  exitDate: Date;
  hospitalName: string;
  productName: string;
  productCode: string;
  quantity: number;
  batchNumber: string;
}

export interface HospitalSummary {
  hospitalId: string;
  hospitalName: string;
  totalQuantity: number;
  distributionCount: number;
}

export interface ProductSummary {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
}

export interface InsulinSummary {
  totalDistributions: number;
  totalQuantity: number;
  uniqueHospitals: number;
  uniqueProducts: number;
}

export interface InsulinReportData {
  summary: InsulinSummary;
  byHospital: HospitalSummary[];
  byProduct: ProductSummary[];
  recentDistributions: InsulinDistribution[];
  hospitals: { id: string; name: string }[];
}

interface ReportParams {
  year: number;
  month?: number;
  hospitalId?: string;
}

export async function getInsulinDistributions(
  params: ReportParams
): Promise<{ success: boolean; data?: InsulinReportData; error?: string }> {
  try {
    const { year, month, hospitalId } = params;

    // Build date range filter
    let dateFilter: { gte: Date; lte: Date } | undefined;
    if (month) {
      dateFilter = {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      };
    } else {
      dateFilter = {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    // Build where clause - filter by INSULINE category
    const where: any = {
      exitDate: dateFilter,
      product: {
        category: Category.INSULINE,
      },
    };

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    // Fetch stock exits for insulin products
    const exits = await prisma.stockExit.findMany({
      where,
      include: {
        hospital: true,
        product: true,
        batch: true,
      },
      orderBy: {
        exitDate: "desc",
      },
    });

    // Process data
    const distributions: InsulinDistribution[] = [];
    const hospitalMap = new Map<string, HospitalSummary>();
    const productMap = new Map<string, ProductSummary>();
    let totalQuantity = 0;

    for (const exit of exits) {
      if (!exit.product) continue;

      totalQuantity += exit.quantity;

      // Add to distributions list
      distributions.push({
        id: exit.id,
        exitDate: exit.exitDate,
        hospitalName: exit.hospital?.name || "Unknown",
        productName: exit.product.name,
        productCode: exit.product.code,
        quantity: exit.quantity,
        batchNumber: exit.batch?.batchNumber || "N/A",
      });

      // Aggregate by hospital
      const hospitalKey = exit.hospitalId;
      const existingHospital = hospitalMap.get(hospitalKey);
      if (existingHospital) {
        existingHospital.totalQuantity += exit.quantity;
        existingHospital.distributionCount += 1;
      } else {
        hospitalMap.set(hospitalKey, {
          hospitalId: exit.hospitalId,
          hospitalName: exit.hospital?.name || "Unknown",
          totalQuantity: exit.quantity,
          distributionCount: 1,
        });
      }

      // Aggregate by product
      const productKey = exit.productId;
      const existingProduct = productMap.get(productKey);
      if (existingProduct) {
        existingProduct.totalQuantity += exit.quantity;
      } else {
        productMap.set(productKey, {
          productId: exit.productId,
          productName: exit.product.name,
          productCode: exit.product.code,
          totalQuantity: exit.quantity,
        });
      }
    }

    // Get all hospitals for filter dropdown
    const allHospitals = await prisma.hospital.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    // Sort aggregations
    const byHospital = Array.from(hospitalMap.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );
    const byProduct = Array.from(productMap.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    const summary: InsulinSummary = {
      totalDistributions: distributions.length,
      totalQuantity,
      uniqueHospitals: hospitalMap.size,
      uniqueProducts: productMap.size,
    };

    return {
      success: true,
      data: {
        summary,
        byHospital,
        byProduct,
        recentDistributions: distributions.slice(0, 50),
        hospitals: allHospitals,
      },
    };
  } catch (error) {
    console.error("Error fetching insulin report:", error);
    return {
      success: false,
      error: "Failed to load insulin report data",
    };
  }
}

export async function exportInsulinReport(
  params: ReportParams
): Promise<{ success: boolean; data?: ArrayBuffer; filename?: string; error?: string }> {
  try {
    // Fetch the data
    const result = await getInsulinDistributions(params);
    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Failed to fetch data" };
    }

    const { data } = result;

    // Create a simple CSV export
    const csvRows: string[] = [];
    
    // Title
    csvRows.push(`Insulin Distribution Report - ${params.year}${params.month ? ` - Month ${params.month}` : ""}`);
    csvRows.push("");
    
    // Summary
    csvRows.push("Summary");
    csvRows.push(`Total Distributions,${data.summary.totalDistributions}`);
    csvRows.push(`Total Quantity,${data.summary.totalQuantity}`);
    csvRows.push(`Unique Health Centers,${data.summary.uniqueHospitals}`);
    csvRows.push(`Unique Products,${data.summary.uniqueProducts}`);
    csvRows.push("");
    
    // By Hospital
    csvRows.push("Distribution by Health Center");
    csvRows.push("Health Center,Total Quantity,Distribution Count");
    for (const h of data.byHospital) {
      csvRows.push(`"${h.hospitalName}",${h.totalQuantity},${h.distributionCount}`);
    }
    csvRows.push("");
    
    // By Product
    csvRows.push("Distribution by Product");
    csvRows.push("Product Code,Product Name,Total Quantity");
    for (const p of data.byProduct) {
      csvRows.push(`"${p.productCode}","${p.productName}",${p.totalQuantity}`);
    }
    csvRows.push("");
    
    // Recent Distributions
    csvRows.push("Distribution Details");
    csvRows.push("Date,Health Center,Product,Quantity,Lot Number");
    for (const d of data.recentDistributions) {
      const date = new Date(d.exitDate).toLocaleDateString("fr-FR");
      csvRows.push(`"${date}","${d.hospitalName}","${d.productName}",${d.quantity},"${d.batchNumber}"`);
    }

    const csvContent = csvRows.join("\n");
    const encoder = new TextEncoder();
    const csvBuffer = encoder.encode(csvContent);
    
    return {
      success: true,
      data: csvBuffer as unknown as ArrayBuffer,
      filename: `insulin_report_${params.year}${params.month ? `_m${params.month}` : ""}.csv`,
    };
  } catch (error) {
    console.error("Error exporting insulin report:", error);
    return {
      success: false,
      error: "Failed to export report",
    };
  }
}
