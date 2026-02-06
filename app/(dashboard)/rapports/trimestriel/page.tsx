"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  Building2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getQuarterlyReportData } from "../actions";
import { exportQuarterlyReport } from "@/lib/excel-export";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";
import { Category } from "@/lib/types";

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  INSULINE: "Insuline",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-100 text-blue-800",
  VACCIN: "bg-green-100 text-green-800",
  INSULINE: "bg-red-100 text-red-800",
  REACTIF: "bg-purple-100 text-purple-800",
  CONSOMMABLE: "bg-orange-100 text-orange-800",
  PETIT_MATERIEL: "bg-gray-100 text-gray-800",
  MATERIEL_BUREAU: "bg-slate-100 text-slate-800",
};

export default function QuarterlyReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function loadReport() {
    setLoading(true);
    const result = await getQuarterlyReportData(year, quarter);
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReport();
  }, [year, quarter]);

  async function handleExport() {
    if (!data) return;
    setExporting(true);
    await exportQuarterlyReport(year, quarter, data);
    setExporting(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rapports">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Rapport Trimestriel
          </h1>
          <p className="text-muted-foreground">
            Analyse des distributions par trimestre
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!data || exporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Export..." : "Exporter Excel"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Trimestre:</span>
              <Select
                value={quarter.toString()}
                onValueChange={(v) => setQuarter(parseInt(v))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">T1 (Jan-Mar)</SelectItem>
                  <SelectItem value="2">T2 (Avr-Juin)</SelectItem>
                  <SelectItem value="3">T3 (Juil-Sep)</SelectItem>
                  <SelectItem value="4">T4 (Oct-Déc)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Année:</span>
              <Select
                value={year.toString()}
                onValueChange={(v) => setYear(parseInt(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center py-8">Chargement...</p>
      ) : !data ? (
        <p className="text-center py-8 text-muted-foreground">
          Aucune donnée disponible
        </p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Distributions
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(data.summary.totalDistributions)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quantité totale
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(data.summary.totalQuantity)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valeur totale
                </CardTitle>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(data.summary.totalValue)}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Budget consommé
                </p>
              </CardContent>
            </Card>
          </div>

          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle>Par catégorie</CardTitle>
              <CardDescription>
                Répartition des distributions par catégorie de produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Nombre</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.byCategory).map(([cat, stats]: [string, any]) => (
                      <TableRow key={cat}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={categoryColors[cat as Category]}
                          >
                            {categoryLabels[cat as Category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(stats.count)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(stats.quantity)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(stats.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* By Hospital */}
          <Card>
            <CardHeader>
              <CardTitle>Par hôpital</CardTitle>
              <CardDescription>
                Top hôpitaux par volume de distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hôpital</TableHead>
                      <TableHead className="text-right">Distributions</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byHospital
                      .sort((a: any, b: any) => b.value - a.value)
                      .map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{h.name}</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(h.count)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(h.quantity)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(h.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Distributions */}
          <Card>
            <CardHeader>
              <CardTitle>Distributions détaillées</CardTitle>
              <CardDescription>
                Liste complète des distributions du trimestre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hôpital</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.distributions.slice(0, 20).map((dist: any) => (
                      <TableRow key={dist.id}>
                        <TableCell>{formatDate(dist.exitDate)}</TableCell>
                        <TableCell>{dist.hospital.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dist.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryLabels[dist.product.category as Category]}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(dist.quantity)} {dist.product.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(dist.product.price || 0) * dist.quantity
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {data.distributions.length > 20 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Et {data.distributions.length - 20} distributions supplémentaires...
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
