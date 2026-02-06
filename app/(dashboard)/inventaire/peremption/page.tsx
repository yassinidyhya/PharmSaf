"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Calendar, Package, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import PeremptionLoading from "./loading";
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
import { getExpiringProducts, ExpiryFilters } from "./actions";
import { formatDate, formatNumber } from "@/lib/utils";
import { Category } from "@/lib/types";

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicament",
  VACCIN: "Vaccin",
  REACTIF: "Réactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const urgencyConfig = {
  critical: {
    label: "Critique",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    daysText: "≤ 30 jours",
  },
  warning: {
    label: "Attention",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Calendar,
    daysText: "31-60 jours",
  },
  notice: {
    label: "À surveiller",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Calendar,
    daysText: "61-90 jours",
  },
};

export default function ExpiryAlertsPage() {
  const [filters, setFilters] = useState<ExpiryFilters>({ days: 90 });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    const result = await getExpiringProducts(filters);
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  }

  const getUrgencyLevel = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 30) return "critical";
    if (daysUntilExpiry <= 60) return "warning";
    return "notice";
  };

  const today = new Date()

  return (
    <div className="flex flex-1 flex-col">
      {/* Header Section */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/inventaire">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Alertes de Péremption
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {format(today, "EEEE d MMMM yyyy", { locale: fr })} · Produits proches de la date d&apos;expiration
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-3 lg:p-4 xl:p-6 pt-2">

        {/* Stats Cards */}
        <section>
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
                Vue d&apos;ensemble
              </h2>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                Répartition par niveau d&apos;urgence
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Critique (≤30j)
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(data?.stats.critical.count || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.stats.critical.quantity || 0)} unités
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">
                Attention (31-60j)
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(data?.stats.warning.count || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.stats.warning.quantity || 0)} unités
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                À surveiller (61-90j)
              </CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatNumber(data?.stats.notice.count || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.stats.notice.quantity || 0)} unités
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data?.stats.total.count || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.stats.total.quantity || 0)} unités
              </p>
            </CardContent>
          </Card>
        </div>
        </section>

        {/* Filters - Inline */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select
            value={filters.days?.toString() || "90"}
            onValueChange={(value) =>
              setFilters({ ...filters, days: parseInt(value) })
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="60">60 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="180">6 mois</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                category: value === "all" ? undefined : (value as Category),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Produits à surveiller</CardTitle>
                <CardDescription>
                  {data?.batches.length || 0} lot(s) trouvé(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : data?.batches.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun produit ne périmera dans cette période
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Urgence</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
                    <TableHead className="hidden md:table-cell">Lot</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead className="hidden lg:table-cell">Expiration</TableHead>
                    <TableHead className="text-right">Jours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.batches.map((batch: any) => {
                    const urgency = getUrgencyLevel(batch.daysUntilExpiry);
                    const config = urgencyConfig[urgency as keyof typeof urgencyConfig];
                    const Icon = config.icon;

                    return (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 w-fit ${config.color}`}
                          >
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{batch.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {batch.product.code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {categoryLabels[batch.product.category as Category]}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{batch.batchNumber}</TableCell>
                        <TableCell>
                          {formatNumber(batch.quantity)} <span className="text-xs text-muted-foreground">{batch.product.unit}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(batch.expiryDate)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`tabular-nums ${
                              batch.daysUntilExpiry <= 30
                                ? "border-red-200 text-red-600 bg-red-50 dark:bg-red-950/30"
                                : batch.daysUntilExpiry <= 60
                                ? "border-orange-200 text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                                : "border-yellow-200 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30"
                            }`}
                          >
                            {batch.daysUntilExpiry}j
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
