"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Calendar, Package, Filter } from "lucide-react";
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
import { Category } from "@prisma/client";

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventaire">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Alertes de Péremption
          </h1>
          <p className="text-muted-foreground">
            Produits proches de la date d&apos;expiration
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Critique (≤30j)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "—" : formatNumber(data?.stats.critical.count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "—" : formatNumber(data?.stats.critical.quantity || 0)} unités
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              Attention (31-60j)
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? "—" : formatNumber(data?.stats.warning.count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "—" : formatNumber(data?.stats.warning.quantity || 0)} unités
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              À surveiller (61-90j)
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? "—" : formatNumber(data?.stats.notice.count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "—" : formatNumber(data?.stats.notice.quantity || 0)} unités
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
              {loading ? "—" : formatNumber(data?.stats.total.count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "—" : formatNumber(data?.stats.total.quantity || 0)} unités
            </p>
          </CardContent>
        </Card>
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
              <span className="text-sm font-medium">Période:</span>
              <Select
                value={filters.days?.toString() || "90"}
                onValueChange={(value) =>
                  setFilters({ ...filters, days: parseInt(value) })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="180">6 mois</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Catégorie:</span>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    category: value === "all" ? undefined : (value as Category),
                  })
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Toutes les catégories" />
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produits à surveiller</CardTitle>
          <CardDescription>
            {loading
              ? "Chargement..."
              : `${data?.batches.length || 0} lot(s) trouvé(s)`}
          </CardDescription>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Jours restants</TableHead>
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
                        <TableCell>
                          {categoryLabels[batch.product.category]}
                        </TableCell>
                        <TableCell>{batch.batchNumber}</TableCell>
                        <TableCell>
                          {formatNumber(batch.quantity)} {batch.product.unit}
                        </TableCell>
                        <TableCell>{formatDate(batch.expiryDate)}</TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              batch.daysUntilExpiry <= 30
                                ? "text-red-600"
                                : batch.daysUntilExpiry <= 60
                                ? "text-orange-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {batch.daysUntilExpiry} jour
                            {batch.daysUntilExpiry > 1 ? "s" : ""}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
