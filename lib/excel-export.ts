import ExcelJS from "exceljs";
import { Category } from "@prisma/client";

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  INSULINE: "Insuline",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const actionLabels: Record<string, string> = {
  CREATE_PRODUCT: "Création produit",
  UPDATE_PRODUCT: "Modification produit",
  DELETE_PRODUCT: "Suppression produit",
  CREATE_DISTRIBUTION: "Nouvelle distribution",
  UPDATE_DISTRIBUTION: "Modification distribution",
  CREATE_DELIVERY_NOTE: "Bon de livraison",
  UPDATE_DELIVERY_NOTE: "MAJ bon livraison",
  CREATE_HOSPITAL: "Création hôpital",
  UPDATE_HOSPITAL: "Modification hôpital",
  CREATE_ALLOCATION: "Nouvelle allocation",
  UPDATE_ALLOCATION: "Modification allocation",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "MAD",
  });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("fr-FR");
}

function triggerDownload(buffer: any, filename: string) {
  if (typeof window !== "undefined") {
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export async function exportQuarterlyReport(
  year: number,
  quarter: number,
  data: any
) {
  const workbook = new ExcelJS.Workbook();

  // Summary sheet
  const summarySheet = workbook.addWorksheet("Résumé");
  summarySheet.columns = [
    { header: "Indicateur", key: "label", width: 30 },
    { header: "Valeur", key: "value", width: 20 },
  ];

  summarySheet.addRow([
    "Rapport Trimestriel",
    `T${quarter} - ${year}`,
  ]).font = { bold: true, size: 14 };
  summarySheet.addRow([]);
  summarySheet.addRow(["Total distributions", data.summary.totalDistributions]);
  summarySheet.addRow(["Quantité totale", data.summary.totalQuantity]);
  summarySheet.addRow(["Valeur totale", formatCurrency(data.summary.totalValue)]);
  summarySheet.addRow([]);

  // By Category
  summarySheet.addRow(["Par catégorie"]).font = { bold: true };
  summarySheet.addRow(["Catégorie", "Nombre", "Quantité", "Valeur"]);
  Object.entries(data.byCategory).forEach(([cat, stats]: [string, any]) => {
    summarySheet.addRow([
      categoryLabels[cat as Category],
      stats.count,
      stats.quantity,
      formatCurrency(stats.value),
    ]);
  });

  // By Hospital
  summarySheet.addRow([]);
  summarySheet.addRow(["Par hôpital"]).font = { bold: true };
  summarySheet.addRow(["Hôpital", "Distributions", "Quantité", "Valeur"]);
  data.byHospital
    .sort((a: any, b: any) => b.value - a.value)
    .forEach((h: any) => {
      summarySheet.addRow([h.name, h.count, h.quantity, formatCurrency(h.value)]);
    });

  // Details sheet
  const detailsSheet = workbook.addWorksheet("Détail");
  detailsSheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Hôpital", key: "hospital", width: 25 },
    { header: "Produit", key: "product", width: 30 },
    { header: "Catégorie", key: "category", width: 15 },
    { header: "Quantité", key: "quantity", width: 12 },
    { header: "Unité", key: "unit", width: 10 },
    { header: "Valeur", key: "value", width: 15 },
  ];

  data.distributions.forEach((dist: any) => {
    detailsSheet.addRow({
      date: formatDate(dist.exitDate),
      hospital: dist.hospital.name,
      product: dist.product.name,
      category: categoryLabels[dist.product.category as Category],
      quantity: dist.quantity,
      unit: dist.product.unit,
      value: formatCurrency(Number(dist.product.price || 0) * dist.quantity),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer as any, `rapport_T${quarter}_${year}.xlsx`);
}

export async function exportAnnualReport(year: number, data: any) {
  const workbook = new ExcelJS.Workbook();

  // Summary sheet
  const summarySheet = workbook.addWorksheet("Résumé");
  summarySheet.columns = [
    { header: "Indicateur", key: "label", width: 30 },
    { header: "Valeur", key: "value", width: 20 },
  ];

  summarySheet.addRow(["Rapport Annuel", year.toString()]).font = {
    bold: true,
    size: 14,
  };
  summarySheet.addRow([]);
  summarySheet.addRow(["Total distributions", data.totalDistributions]);
  summarySheet.addRow(["Valeur totale", formatCurrency(data.totalValue)]);
  summarySheet.addRow(["Budget alloué", formatCurrency(data.totalBudget)]);
  summarySheet.addRow(["Budget consommé", formatCurrency(data.totalConsumed)]);
  summarySheet.addRow([
    "Taux d'exécution",
    data.totalBudget > 0
      ? `${((data.totalConsumed / data.totalBudget) * 100).toFixed(2)}%`
      : "0%",
  ]);
  summarySheet.addRow([]);

  // By Quarter
  summarySheet.addRow(["Par trimestre"]).font = { bold: true };
  summarySheet.addRow(["Trimestre", "Nombre", "Quantité", "Valeur"]);
  data.byQuarter.forEach((q: any) => {
    summarySheet.addRow([
      `T${q.quarter}`,
      q.count,
      q.quantity,
      formatCurrency(q.value),
    ]);
  });

  // By Category
  summarySheet.addRow([]);
  summarySheet.addRow(["Par catégorie"]).font = { bold: true };
  summarySheet.addRow(["Catégorie", "Nombre", "Quantité", "Valeur", "%"]);
  Object.entries(data.byCategory)
    .sort((a: any, b: any) => b[1].value - a[1].value)
    .forEach(([cat, stats]: [string, any]) => {
      summarySheet.addRow([
        categoryLabels[cat as Category],
        stats.count,
        stats.quantity,
        formatCurrency(stats.value),
        `${((stats.value / data.totalValue) * 100).toFixed(1)}%`,
      ]);
    });

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer as any, `rapport_annuel_${year}.xlsx`);
}

export async function exportActivityLogs(logs: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Activité");

  sheet.columns = [
    { header: "Date & Heure", key: "datetime", width: 20 },
    { header: "Utilisateur", key: "user", width: 25 },
    { header: "Email", key: "email", width: 25 },
    { header: "Action", key: "action", width: 20 },
    { header: "Description", key: "description", width: 40 },
    { header: "IP", key: "ip", width: 15 },
  ];

  logs.forEach((log) => {
    sheet.addRow({
      datetime: formatDateTime(log.createdAt),
      user: log.user ? `${log.user.firstName} ${log.user.lastName}` : "Système",
      email: log.user?.email || "",
      action: actionLabels[log.action] || log.action,
      description: log.description,
      ip: log.ipAddress,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split("T")[0];
  triggerDownload(buffer as any, `journal_activite_${dateStr}.xlsx`);
}

export async function exportStockInventory(products: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventaire");

  sheet.columns = [
    { header: "Code", key: "code", width: 15 },
    { header: "Produit", key: "name", width: 35 },
    { header: "Catégorie", key: "category", width: 18 },
    { header: "Stock", key: "stock", width: 12 },
    { header: "Unité", key: "unit", width: 10 },
    { header: "Stock min", key: "minStock", width: 12 },
    { header: "Prix unitaire", key: "price", width: 15 },
    { header: "Valeur stock", key: "value", width: 15 },
    { header: "Statut", key: "status", width: 15 },
  ];

  products.forEach((p) => {
    const stockValue = Number(p.currentStock) * Number(p.price || 0);
    let status = "OK";
    if (p.currentStock <= 0) status = "Rupture";
    else if (p.currentStock <= p.minStock) status = "Stock bas";

    sheet.addRow({
      code: p.code,
      name: p.name,
      category: categoryLabels[p.category as Category],
      stock: p.currentStock,
      unit: p.unit,
      minStock: p.minStock,
      price: formatCurrency(Number(p.price || 0)),
      value: formatCurrency(stockValue),
      status,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split("T")[0];
  triggerDownload(buffer as any, `inventaire_stock_${dateStr}.xlsx`);
}
