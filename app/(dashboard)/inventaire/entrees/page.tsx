import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, TrendingUp } from "lucide-react";
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
import { getStockEntries } from "./actions";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Entrées de Stock | Pharmacie Provinciale",
  description: "Historique des entrées de stock",
};

export default async function StockEntriesPage() {
  const result = await getStockEntries();
  const entries = result.success ? result.data : [];

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
          <h1 className="text-2xl font-bold tracking-tight">Entrées de Stock</h1>
          <p className="text-muted-foreground">
            Historique des mouvements d&apos;entrée
          </p>
        </div>
        <Button asChild>
          <Link href="/inventaire/entrees/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Entrée
          </Link>
        </Button>
      </div>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des entrées</CardTitle>
          <CardDescription>
            {entries.length} entrée(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune entrée de stock enregistrée
              </p>
              <Button asChild className="mt-4">
                <Link href="/inventaire/entrees/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une entrée
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Référence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.entryDate)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.product.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.batch?.batchNumber || "—"}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        +{formatNumber(entry.quantity)} {entry.product.unit}
                      </TableCell>
                      <TableCell>
                        {entry.batch?.expiryDate
                          ? formatDate(entry.batch.expiryDate)
                          : "—"}
                      </TableCell>
                      <TableCell>{entry.referenceDoc || "—"}</TableCell>
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
