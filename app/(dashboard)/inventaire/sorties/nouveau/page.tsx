import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiStockExitForm } from "@/components/forms/multi-stock-exit-form";
import { getProductsWithStock, getHospitals } from "../actions";

export const metadata: Metadata = {
  title: "Nouvelle Sortie | Pharmacie Provinciale",
  description: "Enregistrer une nouvelle sortie de stock",
};

interface NewStockExitPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewStockExitPage({ searchParams }: NewStockExitPageProps) {
  const typeParam = searchParams.type;
  const isInsulinMode = typeParam === "insulin";

  const [productsResult, hospitalsResult] = await Promise.all([
    getProductsWithStock(),
    getHospitals(),
  ]);

  const allProducts = productsResult.success ? productsResult.data ?? [] : [];
  const hospitals = hospitalsResult.success ? hospitalsResult.data ?? [] : [];

  // Filter to insulin products only if in insulin mode
  const products = isInsulinMode
    ? allProducts.filter((p: any) => p.category === "INSULINE")
    : allProducts;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventaire/sorties">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isInsulinMode ? "Distribution Insuline" : "Nouvelle Sortie"}
          </h1>
          <p className="text-muted-foreground">
            {isInsulinMode
              ? "Distribution immédiate d'insuline aux centres de santé (hors planning trimestriel)"
              : "Enregistrer une ou plusieurs sorties de stock vers un hôpital"
            }
          </p>
        </div>
      </div>

      {/* Info Card for Insulin Mode */}
      {isInsulinMode && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 text-base flex items-center gap-2">
              <span>ℹ️</span>
              Distribution Insuline - Mode On-Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Les centres de santé viennent chercher l'insuline directement</li>
              <li>Pas de planning trimestriel - distribution immédiate</li>
              <li>Pas de bon de livraison généré</li>
              <li>Les stocks sont décrémentés immédiatement</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <MultiStockExitForm 
        products={products} 
        hospitals={hospitals} 
        isInsulinMode={isInsulinMode}
      />
    </div>
  );
}
