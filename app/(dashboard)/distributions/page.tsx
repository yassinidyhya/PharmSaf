"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  TrendingDown,
  Building2,
  Filter,
  ArrowRight,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDistributions,
  getDistributionStats,
  getFiltersData,
  DistributionFilters,
} from "./actions";
import { formatDate, formatNumber } from "@/lib/utils";
import { Category } from "@/lib/types";

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicament",
  VACCIN: "Vaccin",
  INSULINE: "Insuline",
  REACTIF: "Réactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel bureau",
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

export default function DistributionsPage() {
  const [filters, setFilters] = useState<DistributionFilters>({});
  const [distributions, setDistributions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filterData, setFilterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    const [distributionsResult, statsResult, filtersResult] = await Promise.all([
      getDistributions(filters),
      getDistributionStats(),
      getFiltersData(),
    ]);

    if (distributionsResult.success) {
      setDistributions(distributionsResult.data || []);
    }
    if (statsResult.success) {
      setStats(statsResult.data);
    }
    if (filtersResult.success) {
      setFilterData(filtersResult.data);
    }
    setLoading(false);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Distributions</h1>
          <p className="text-muted-foreground">
            Gestion des distributions aux hôpitaux
          </p>
        </div>
        <Button asChild>
          <Link href="/distributions/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Distribution
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Distributions {currentYear}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : formatNumber(stats?.totalDistributions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Cette année</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quantité Totale
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : formatNumber(stats?.totalQuantity || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unités distribuées</p>
          </CardContent>
        </Card>

        {stats?.byQuarter?.map((q: any) => (
          <Card key={q.quarter}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trimestre {q.quarter}
              </CardTitle>
              <Badge variant="outline">T{q.quarter}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(q._count.id)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(q._sum.quantity || 0)} unités
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Année:</span>
              <Select
                value={filters.year?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, year: value === "all" ? undefined : parseInt(value) })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {filterData?.years?.map((year: number) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Trimestre:</span>
              <Select
                value={filters.quarter?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, quarter: value === "all" ? undefined : parseInt(value) })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="1">T1</SelectItem>
                  <SelectItem value="2">T2</SelectItem>
                  <SelectItem value="3">T3</SelectItem>
                  <SelectItem value="4">T4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Hôpital:</span>
              <Select
                value={filters.hospitalId || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, hospitalId: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les hôpitaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les hôpitaux</SelectItem>
                  {filterData?.hospitals?.map((hospital: any) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Hospitals */}
      {stats?.topHospitals?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Top Hôpitaux ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topHospitals.map((h: any) => (
                <Badge key={h.hospitalId} variant="secondary" className="text-sm">
                  {h.hospitalName}: {h.count} distributions
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des distributions</CardTitle>
          <CardDescription>
            {loading
              ? "Chargement..."
              : `${distributions.length} distribution(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">
              Chargement...
            </p>
          ) : distributions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune distribution trouvée
              </p>
              <Button asChild className="mt-4">
                <Link href="/distributions/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une distribution
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hôpital</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Bon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((distribution: any) => (
                    <TableRow key={distribution.id}>
                      <TableCell>{formatDate(distribution.exitDate)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {distribution.hospital.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {distribution.hospital.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {distribution.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Lot: {distribution.batch?.batchNumber || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={categoryColors[distribution.product.category as Category]}
                        >
                          {categoryLabels[distribution.product.category as Category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        -{formatNumber(distribution.quantity)}{" "}
                        {distribution.product.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          T{distribution.quarter} {distribution.year}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {distribution.deliveryNote ? (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/bons-livraison/${distribution.deliveryNote.id}`}
                            >
                              {distribution.deliveryNote.noteNumber}
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
