"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, TrendingUp, DollarSign, Building2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getAnnualReportData } from "../actions";
import { exportAnnualReport } from "@/lib/excel-export";
import { formatCurrency, formatNumber } from "@/lib/utils";
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

export default function AnnualReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function loadReport() {
    setLoading(true);
    const result = await getAnnualReportData(year);
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReport();
  }, [year]);

  async function handleExport() {
    if (!data) return;
    setExporting(true);
    await exportAnnualReport(year, data);
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
            Rapport Annuel
          </h1>
          <p className="text-muted-foreground">
            Bilan complet de l&apos;année budgétaire
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!data || exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Export..." : "Exporter"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8">Chargement...</p>
      ) : !data ? (
        <p className="text-center py-8 text-muted-foreground">
          Aucune donnée disponible
        </p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Distributions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(data.totalDistributions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total annuel
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valeur totale
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Montant distribué
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Budget alloué
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.totalBudget)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total {year}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Budget consommé
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.totalConsumed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((data.totalConsumed / data.totalBudget) * 100).toFixed(1)}% du budget
                </p>
              </CardContent>
            </Card>
          </div>

          {/* By Quarter */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par trimestre</CardTitle>
              <CardDescription>
                Evolution des distributions sur l&apos;année
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.byQuarter.map((q: any) => (
                  <div key={q.quarter} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium w-20">Trimestre {q.quarter}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(q.count)} distributions
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(q.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={data.totalValue > 0 ? (q.value / data.totalValue) * 100 : 0}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {data.totalValue > 0 ? ((q.value / data.totalValue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle>Par catégorie de produit</CardTitle>
              <CardDescription>
                Répartition par type de produit distribué
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Distributions</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.byCategory)
                      .sort((a: any, b: any) => b[1].value - a[1].value)
                      .map(([cat, stats]: [string, any]) => (
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
                          <TableCell className="text-right">
                            {((stats.value / data.totalValue) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Global Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Suivi budgétaire global</CardTitle>
              <CardDescription>
                Taux d&apos;exécution du budget annuel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Budget alloué</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.totalBudget)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Budget consommé</p>
                    <p className="text-2xl font-bold">{formatCurrency(data.totalConsumed)}</p>
                  </div>
                </div>
                <Progress
                  value={data.totalBudget > 0 ? (data.totalConsumed / data.totalBudget) * 100 : 0}
                  className="h-3"
                />
                <p className="text-center text-sm text-muted-foreground">
                  {data.totalBudget > 0 ? ((data.totalConsumed / data.totalBudget) * 100).toFixed(2) : 0}% du budget utilisé
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
