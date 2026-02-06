import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Boxes, TrendingDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProduct } from "../actions";
import { ProductEditForm } from "@/components/forms/product-edit-form";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";
import { Category, CategoryLabels } from "@/lib/types";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const categoryLabels = CategoryLabels;

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-100 text-blue-800",
  VACCIN: "bg-green-100 text-green-800",
  INSULINE: "bg-red-100 text-red-800",
  REACTIF: "bg-purple-100 text-purple-800",
  CONSOMMABLE: "bg-orange-100 text-orange-800",
  PETIT_MATERIEL: "bg-gray-100 text-gray-800",
  MATERIEL_BUREAU: "bg-slate-100 text-slate-800",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getProduct(id);

  if (!result.success || !result.data) {
    return {
      title: "Produit non trouvé | Pharmacie Provinciale",
    };
  }

  return {
    title: `${result.data.name} | Pharmacie Provinciale`,
    description: `Détails du produit ${result.data.name}`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const result = await getProduct(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const totalStock = product.batches.reduce((sum: number, batch: any) => sum + batch.quantity, 0);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/produits">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <Badge variant="outline" className={categoryColors[product.category as Category]}>
              {categoryLabels[product.category as Category]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Code: {product.code}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalStock)}</div>
            <p className="text-xs text-muted-foreground">{product.unit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lots</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(product._count.batches)}</div>
            <p className="text-xs text-muted-foreground">Lots en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(product._count.stockEntries)}</div>
            <p className="text-xs text-muted-foreground">Mouvements d&apos;entrée</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(product._count.stockExits)}</div>
            <p className="text-xs text-muted-foreground">Mouvements de sortie</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="batches">Lots</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modifier le produit</CardTitle>
              <CardDescription>
                Modifiez les informations du produit ci-dessous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductEditForm product={product} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Lots en stock</CardTitle>
              <CardDescription>
                Liste des lots disponibles pour ce produit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.batches.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun lot en stock
                </p>
              ) : (
                <div className="space-y-2">
                  {product.batches.map((batch: any) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Boxes className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Lot: {batch.batchNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Exp: {formatDate(batch.expiryDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(batch.quantity)}</p>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des mouvements</CardTitle>
              <CardDescription>
                Dernières entrées et sorties de stock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Entries */}
                {product.stockEntries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Dernières entrées</h4>
                    <div className="space-y-2">
                      {product.stockEntries.slice(0, 5).map((entry: any) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-md">
                              <TrendingDown className="h-4 w-4 text-green-600 rotate-180" />
                            </div>
                            <div>
                              <p className="font-medium">+{formatNumber(entry.quantity)} {product.unit}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(entry.entryDate)}
                                {entry.referenceDoc && ` • Réf: ${entry.referenceDoc}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Exits */}
                {product.stockExits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Dernières sorties</h4>
                    <div className="space-y-2">
                      {product.stockExits.slice(0, 5).map((exit: any) => (
                        <div
                          key={exit.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-md">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">-{formatNumber(exit.quantity)} {product.unit}</p>
                              <p className="text-sm text-muted-foreground">
                                {exit.hospital?.name} • {formatDate(exit.exitDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.stockEntries.length === 0 && product.stockExits.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun historique disponible
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
