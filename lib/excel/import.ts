"use server";

import * as XLSX from "xlsx";
import { z } from "zod";
import { Category, HospitalType } from "@prisma/client";

// Validation schemas
const productImportSchema = z.object({
  code: z.string().min(1, "Code requis"),
  name: z.string().min(1, "Nom requis"),
  category: z.nativeEnum(Category),
  unit: z.string().min(1, "Unité requise"),
  packaging: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  minStock: z.coerce.number().min(0).default(0),
});

const stockEntryImportSchema = z.object({
  productCode: z.string().min(1, "Code produit requis"),
  batchNumber: z.string().min(1, "N° lot requis"),
  quantity: z.coerce.number().min(1, "Quantité minimale 1"),
  expiryDate: z.coerce.date(),
  temperature: z.string().optional(),
  referenceDoc: z.string().optional(),
});

const hospitalImportSchema = z.object({
  code: z.string().min(1, "Code requis"),
  name: z.string().min(1, "Nom requis"),
  type: z.nativeEnum(HospitalType),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  bedCapacity: z.coerce.number().min(0).optional(),
});

export interface ImportResult<T> {
  success: boolean;
  data?: T[];
  errors?: Array<{ row: number; message: string }>;
  preview?: T[];
}

export interface ParsedProduct {
  code: string;
  name: string;
  category: Category;
  unit: string;
  packaging?: string;
  price?: number;
  minStock: number;
}

export interface ParsedStockEntry {
  productCode: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  temperature?: string;
  referenceDoc?: string;
}

export interface ParsedHospital {
  code: string;
  name: string;
  type: HospitalType;
  address?: string;
  phone?: string;
  email?: string;
  bedCapacity?: number;
}

function parseExcelFile(fileBuffer: Buffer): any[] {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (jsonData.length < 2) {
    throw new Error("Fichier vide ou en-têtes manquants");
  }

  const headers = (jsonData[0] as string[]).map((h) =>
    h.toString().trim().toLowerCase().replace(/\s+/g, "_")
  );

  return jsonData.slice(1).map((row: any) => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function normalizeCategory(value: string): Category | null {
  const normalized = value.toUpperCase().trim();
  const mapping: Record<string, Category> = {
    MEDICAMENT: Category.MEDICAMENT,
    MEDICAMENTS: Category.MEDICAMENT,
    MED: Category.MEDICAMENT,
    VACCIN: Category.VACCIN,
    VACCINS: Category.VACCIN,
    REACTIF: Category.REACTIF,
    REACTIFS: Category.REACTIF,
    CONSOMMABLE: Category.CONSOMMABLE,
    CONSOMMABLES: Category.CONSOMMABLE,
    PETIT_MATERIEL: Category.PETIT_MATERIEL,
    MATERIEL_BUREAU: Category.MATERIEL_BUREAU,
  };
  return mapping[normalized] || null;
}

function normalizeHospitalType(value: string): HospitalType | null {
  const normalized = value.toUpperCase().trim();
  const mapping: Record<string, HospitalType> = {
    "CENTRE_HOSPITALIER": HospitalType.CENTRE_HOSPITALIER,
    "CENTRE HOSPITALIER": HospitalType.CENTRE_HOSPITALIER,
    CH: HospitalType.CENTRE_HOSPITALIER,
    "CENTRE_SANTE": HospitalType.CENTRE_SANTE,
    "CENTRE DE SANTE": HospitalType.CENTRE_SANTE,
    CS: HospitalType.CENTRE_SANTE,
    "HOPITAL_PROVINCIAL": HospitalType.HOPITAL_PROVINCIAL,
    "HOPITAL PROVINCIAL": HospitalType.HOPITAL_PROVINCIAL,
    HP: HospitalType.HOPITAL_PROVINCIAL,
  };
  return mapping[normalized] || null;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  
  // Excel date serial number
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return date;
  }
  
  // String date
  const str = value.toString().trim();
  const formats = [
    // DD/MM/YYYY
    { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, fn: (m: RegExpMatchArray) => new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])) },
    // YYYY-MM-DD
    { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, fn: (m: RegExpMatchArray) => new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) },
    // DD-MM-YYYY
    { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, fn: (m: RegExpMatchArray) => new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])) },
  ];

  for (const format of formats) {
    const match = str.match(format.regex);
    if (match) {
      const date = format.fn(match);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Try native Date parsing
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

export async function parseProductsExcel(
  fileBuffer: Buffer,
  previewOnly: boolean = false
): Promise<ImportResult<ParsedProduct>> {
  try {
    const rows = parseExcelFile(fileBuffer);
    const results: ParsedProduct[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-based + header)

      try {
        // Normalize category
        const category = normalizeCategory(row.categorie || row.category || row.type);
        if (!category) {
          errors.push({
            row: rowNum,
            message: `Catégorie invalide: "${row.categorie || row.category || row.type}"`,
          });
          continue;
        }

        const data = {
          code: row.code?.toString().trim(),
          name: row.nom?.toString().trim() || row.name?.toString().trim(),
          category,
          unit: row.unite?.toString().trim() || row.unit?.toString().trim() || row.unite,
          packaging: row.conditionnement?.toString().trim() || row.packaging?.toString().trim() || undefined,
          price: row.prix ? parseFloat(row.prix) : undefined,
          minStock: row.stock_min ? parseInt(row.stock_min) : 0,
        };

        const validated = productImportSchema.parse(data);
        results.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: rowNum,
            message: error.issues.map((e) => e.message).join(", "),
          });
        } else {
          errors.push({
            row: rowNum,
            message: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      data: previewOnly ? undefined : results,
      preview: previewOnly ? results.slice(0, 10) : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          row: 0,
          message: error instanceof Error ? error.message : "Erreur lors du parsing",
        },
      ],
    };
  }
}

export async function parseStockEntriesExcel(
  fileBuffer: Buffer,
  previewOnly: boolean = false
): Promise<ImportResult<ParsedStockEntry>> {
  try {
    const rows = parseExcelFile(fileBuffer);
    const results: ParsedStockEntry[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const expiryDate = parseDate(row.date_peremption || row.expiry_date || row.peremption);
        if (!expiryDate) {
          errors.push({
            row: rowNum,
            message: `Date de péremption invalide: "${row.date_peremption || row.expiry_date || row.peremption}"`,
          });
          continue;
        }

        const data = {
          productCode: row.code_produit?.toString().trim() || row.product_code?.toString().trim(),
          batchNumber: row.lot?.toString().trim() || row.batch?.toString().trim() || row.numero_lot?.toString().trim(),
          quantity: parseInt(row.quantite || row.quantity || row.qte),
          expiryDate,
          temperature: row.temperature?.toString().trim() || undefined,
          referenceDoc: row.document_reference?.toString().trim() || row.reference?.toString().trim() || undefined,
        };

        const validated = stockEntryImportSchema.parse(data);
        results.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: rowNum,
            message: error.issues.map((e) => e.message).join(", "),
          });
        } else {
          errors.push({
            row: rowNum,
            message: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      data: previewOnly ? undefined : results,
      preview: previewOnly ? results.slice(0, 10) : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          row: 0,
          message: error instanceof Error ? error.message : "Erreur lors du parsing",
        },
      ],
    };
  }
}

export async function parseHospitalsExcel(
  fileBuffer: Buffer,
  previewOnly: boolean = false
): Promise<ImportResult<ParsedHospital>> {
  try {
    const rows = parseExcelFile(fileBuffer);
    const results: ParsedHospital[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const type = normalizeHospitalType(row.type || row.categorie);
        if (!type) {
          errors.push({
            row: rowNum,
            message: `Type invalide: "${row.type || row.categorie}"`,
          });
          continue;
        }

        const data = {
          code: row.code?.toString().trim(),
          name: row.nom?.toString().trim() || row.name?.toString().trim(),
          type,
          address: row.adresse?.toString().trim() || row.address?.toString().trim() || undefined,
          phone: row.telephone?.toString().trim() || row.phone?.toString().trim() || undefined,
          email: row.email?.toString().trim() || undefined,
          bedCapacity: row.lits ? parseInt(row.lits) : row.bed_capacity ? parseInt(row.bed_capacity) : undefined,
        };

        const validated = hospitalImportSchema.parse(data);
        results.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: rowNum,
            message: error.issues.map((e) => e.message).join(", "),
          });
        } else {
          errors.push({
            row: rowNum,
            message: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      data: previewOnly ? undefined : results,
      preview: previewOnly ? results.slice(0, 10) : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          row: 0,
          message: error instanceof Error ? error.message : "Erreur lors du parsing",
        },
      ],
    };
  }
}
