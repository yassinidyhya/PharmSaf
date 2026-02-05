import { Metadata } from "next";
import Link from "next/link";
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  ArrowRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInventoryStats, getRecentStockMovements } from "./actions";
import { formatDate, formatNumber } from "@/lib/utils";
import { Category } from "@prisma/client";

export const metadata: Metadata = {
  title: "Inventaire | Pharmacie Provinciale",
  description: "Vue d'ensemble du stock",
};

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-500",
  VACCIN: "bg-green-500",
  REACTIF: "bg-purple-500",
  CONSOMMABLE: "bg-orange-500",
  PETIT_MATERIEL: "bg-gray-500",
  MATERIEL_BUREAU: "bg-slate-500",
};

export default async function InventoryPage() {
  const [statsResult, movementsResult] = await Promise.all([
    getInventoryStats(),
    getRecentStockMovements(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const movements = movementsResult.success ? movementsResult.data : null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaire</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble du stock et des mouvements
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/inventaire/entrees/nouveau">
              <TrendingUp className="mr-2 h-4 w-4" />
              Entrée
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/inventaire/sorties/nouveau">
              <TrendingDown className="mr-2 h-4 w-4" />
              Sortie
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats?.totalProducts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Produits actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(stats?.lowStockProducts.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Produits en alerte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Périmant &lt; 30j</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(stats?.expiringStats.critical || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lots critiques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Périmant &lt; 90j</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(stats?.expiringStats.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lots à surveiller</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stock par catégorie</CardTitle>
            <CardDescription>Répartition du stock par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.categoryStats && Object.entries(stats.categoryStats).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${categoryColors[category as Category]}`} />
                    <span className="text-sm font-medium">
                      {categoryLabels[category as Category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{data.count} produits</span>
                    <span className="font-medium">{formatNumber(data.stock)} unités</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alertes stock faible</CardTitle>
              <CardDescription>Produits sous le seuil minimum</CardDescription>
            </div>
            <Badge variant="destructive" className="h-6">
              {stats?.lowStockProducts.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            {stats?.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun produit en alerte
              </p>
            ) : (
              <div className="space-y-2">
                {(stats?.lowStockProducts || []).slice(0, 5).map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {formatNumber(product.totalStock || 0)} {product.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/inventaire/peremption">
                Voir tous les stocks faibles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dernières entrées</CardTitle>
            <CardDescription>Mouvements de stock récents</CardDescription>
          </CardHeader>
          <CardContent>
            {movements?.entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucune entrée récente
              </p>
            ) : (
              <div className="space-y-2">
                {movements?.entries.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-md">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.entryDate)}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-green-600">
                      +{formatNumber(entry.quantity)} {entry.product.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/inventaire/entrees">
                Voir toutes les entrées
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières sorties</CardTitle>
            <CardDescription>Sorties de stock récentes</CardDescription>
          </CardHeader>
          <CardContent>
            {movements?.exits.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucune sortie récente
              </p>
            ) : (
              <div className="space-y-2">
                {movements?.exits.map((exit: any) => (
                  <div
                    key={exit.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-md">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{exit.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exit.hospital?.name} • {formatDate(exit.exitDate)}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-red-600">
                      -{formatNumber(exit.quantity)} {exit.product.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/inventaire/sorties">
                Voir toutes les sorties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
