"use server";

import { prisma } from "@/lib/db";
import { ActionType } from "@prisma/client";

interface LogActivityOptions {
  userId?: string;
  action: ActionType;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export async function logActivity(options: LogActivityOptions) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        description: options.description,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - logging should not break the main flow
  }
}

// Helper functions for common actions
export async function logCreate(
  userId: string | undefined,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    userId,
    action: ActionType.CREATE,
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logUpdate(
  userId: string | undefined,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    userId,
    action: ActionType.UPDATE,
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logDelete(
  userId: string | undefined,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    userId,
    action: ActionType.DELETE,
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logPrint(
  userId: string | undefined,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    userId,
    action: ActionType.PRINT,
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logLogin(
  userId: string,
  email: string,
  ipAddress?: string
) {
  return logActivity({
    userId,
    action: ActionType.LOGIN,
    entityType: "User",
    entityId: userId,
    description: `Connexion de ${email}`,
    ipAddress,
  });
}

export async function logLogout(
  userId: string,
  email: string,
  ipAddress?: string
) {
  return logActivity({
    userId,
    action: ActionType.LOGOUT,
    entityType: "User",
    entityId: userId,
    description: `Déconnexion de ${email}`,
    ipAddress,
  });
}

// Specific entity helpers
export async function logProductCreate(
  userId: string | undefined,
  productId: string,
  productName: string,
  productCode: string
) {
  return logCreate(userId, "Product", productId, `Création du produit "${productName}" (${productCode})`, {
    name: productName,
    code: productCode,
  });
}

export async function logProductUpdate(
  userId: string | undefined,
  productId: string,
  productName: string,
  changes: Record<string, any>
) {
  return logUpdate(userId, "Product", productId, `Modification du produit "${productName}"`, changes);
}

export async function logStockEntryCreate(
  userId: string | undefined,
  entryId: string,
  productName: string,
  quantity: number,
  batchNumber?: string
) {
  return logCreate(userId, "StockEntry", entryId, `Entrée stock: ${quantity} x ${productName}`, {
    product: productName,
    quantity,
    batch: batchNumber,
  });
}

export async function logStockExitCreate(
  userId: string | undefined,
  exitId: string,
  productName: string,
  quantity: number,
  hospitalName: string
) {
  return logCreate(userId, "StockExit", exitId, `Sortie stock: ${quantity} x ${productName} vers ${hospitalName}`, {
    product: productName,
    quantity,
    hospital: hospitalName,
  });
}

export async function logDistributionCreate(
  userId: string | undefined,
  distributionId: string,
  hospitalName: string,
  itemCount: number,
  totalValue: number
) {
  return logCreate(userId, "Distribution", distributionId, `Distribution à ${hospitalName}: ${itemCount} produits`, {
    hospital: hospitalName,
    itemCount,
    totalValue,
  });
}

export async function logDeliveryNotePrint(
  userId: string | undefined,
  noteId: string,
  noteNumber: string,
  hospitalName: string
) {
  return logPrint(userId, "DeliveryNote", noteId, `Impression du bon de livraison ${noteNumber} - ${hospitalName}`, {
    noteNumber,
    hospital: hospitalName,
  });
}

export async function logHospitalCreate(
  userId: string | undefined,
  hospitalId: string,
  hospitalName: string,
  hospitalCode: string
) {
  return logCreate(userId, "Hospital", hospitalId, `Création de l'hôpital "${hospitalName}" (${hospitalCode})`, {
    name: hospitalName,
    code: hospitalCode,
  });
}

export async function logAllocationCreate(
  userId: string | undefined,
  allocationId: string,
  hospitalName: string,
  category: string,
  year: number,
  budget: number
) {
  return logCreate(
    userId,
    "AnnualAllocation",
    allocationId,
    `Allocation budget ${year} pour ${hospitalName} - ${category}: ${budget} MAD`,
    {
      hospital: hospitalName,
      category,
      year,
      budget,
    }
  );
}

export async function logImport(
  userId: string | undefined,
  importType: string,
  count: number,
  created: number,
  updated: number
) {
  return logCreate(userId, "Import", "bulk", `Import ${importType}: ${count} lignes (${created} créés, ${updated} mis à jour)`, {
    type: importType,
    count,
    created,
    updated,
  });
}
