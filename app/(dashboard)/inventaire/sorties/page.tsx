import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, TrendingDown } from "lucide-react";
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
import { getStockExits } from "./actions";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sorties de Stock | Pharmacie Provinciale",
  description: "Historique des sorties de stock",
};

export default async function StockExitsPage() {
  const result = await getStockExits();
  const exits = result.success ? result.data : [];

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
          <h1 className="text-2xl font-bold tracking-tight">Sorties de Stock</h1>
          <p className="text-muted-foreground">
            Historique des mouvements de sortie
          </p>
        </div>
        <Button asChild>
          <Link href="/inventaire/sorties/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Sortie
          </Link>
        </Button>
      </div>

      {/* Exits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des sorties</CardTitle>
          <CardDescription>
            {exits.length} sortie(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exits.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune sortie de stock enregistrée
              </p>
              <Button asChild className="mt-4">
                <Link href="/inventaire/sorties/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une sortie
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
                    <TableHead>Hôpital</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Trimestre</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exits.map((exit: any) => (
                    <TableRow key={exit.id}>
                      <TableCell>{formatDate(exit.exitDate)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exit.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exit.product.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exit.hospital.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exit.hospital.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        -{formatNumber(exit.quantity)} {exit.product.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          T{exit.quarter} {exit.year}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {exit.notes || "—"}
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
