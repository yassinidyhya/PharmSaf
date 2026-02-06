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
import { StockExitForm } from "@/components/forms/stock-exit-form";
import { getProductsWithStock, getHospitals } from "../actions";

export const metadata: Metadata = {
  title: "Nouvelle Sortie | Pharmacie Provinciale",
  description: "Enregistrer une sortie de stock",
};

export default async function NewStockExitPage() {
  const [productsResult, hospitalsResult] = await Promise.all([
    getProductsWithStock(),
    getHospitals(),
  ]);

  const products = productsResult.success ? productsResult.data ?? [] : [];
  const hospitals = hospitalsResult.success ? hospitalsResult.data ?? [] : [];

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
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle Sortie</h1>
          <p className="text-muted-foreground">
            Enregistrer une sortie de stock vers un hôpital
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de la sortie</CardTitle>
          <CardDescription>
            Remplissez les informations de la nouvelle sortie de stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockExitForm products={products} hospitals={hospitals} />
        </CardContent>
      </Card>
    </div>
  );
}
