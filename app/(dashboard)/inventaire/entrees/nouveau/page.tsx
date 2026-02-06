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
import { StockEntryForm } from "@/components/forms/stock-entry-form";
import { getProductsForEntry } from "../actions";

export const metadata: Metadata = {
  title: "Nouvelle Entrée | Pharmacie Provinciale",
  description: "Ajouter une entrée de stock",
};

export default async function NewStockEntryPage() {
  const result = await getProductsForEntry();
  const products = result.success ? result.data ?? [] : [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventaire/entrees">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle Entrée</h1>
          <p className="text-muted-foreground">
            Enregistrer une entrée de stock
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de l&apos;entrée</CardTitle>
          <CardDescription>
            Remplissez les informations de la nouvelle entrée de stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockEntryForm products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
