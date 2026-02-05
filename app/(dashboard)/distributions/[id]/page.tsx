"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Package,
  TrendingDown,
  Calendar,
  FileText,
  Plus,
  Printer,
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
import { getDistribution, createDeliveryNote } from "./actions";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  MEDICAMENT: "Médicament",
  VACCIN: "Vaccin",
  REACTIF: "Réactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const hospitalTypeLabels: Record<string, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

export default function DistributionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingNote, setCreatingNote] = useState(false);

  useEffect(() => {
    loadDistribution();
  }, [id]);

  async function loadDistribution() {
    setLoading(true);
    const result = await getDistribution(id);
    if (result.success) {
      setDistribution(result.data);
    }
    setLoading(false);
  }

  async function handleCreateDeliveryNote() {
    setCreatingNote(true);
    const result = await createDeliveryNote(id);
    if (result.success) {
      toast.success("Bon de livraison créé avec succès");
      loadDistribution();
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }
    setCreatingNote(false);
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!distribution) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-center py-8 text-muted-foreground">
          Distribution non trouvée
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/distributions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Distribution
          </h1>
          <p className="text-muted-foreground">
            Détails de la distribution
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/distributions/${id}/pdf`}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Link>
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {formatDate(distribution.exitDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Période</CardTitle>
            <Badge variant="outline">T{distribution.quarter}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              Trimestre {distribution.quarter}
            </div>
            <p className="text-xs text-muted-foreground">
              Année {distribution.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatNumber(distribution.quantity)}
            </div>
            <p className="text-xs text-muted-foreground">
              {distribution.product.unit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                Number(distribution.product.price || 0) * distribution.quantity
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(Number(distribution.product.price || 0))} / unité
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Hospital Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hôpital destinataire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-lg">{distribution.hospital.name}</p>
                <p className="text-sm text-muted-foreground">
                  {distribution.hospital.code} •{" "}
                  {hospitalTypeLabels[distribution.hospital.type]}
                </p>
              </div>
              {distribution.hospital.address && (
                <p className="text-sm">{distribution.hospital.address}</p>
              )}
              {distribution.hospital.phone && (
                <p className="text-sm">Tél: {distribution.hospital.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produit distribué
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-lg">{distribution.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {distribution.product.code}
                </p>
              </div>
              <Badge variant="outline">
                {categoryLabels[distribution.product.category]}
              </Badge>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Lot: {distribution.batch.batchNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expiration: {formatDate(distribution.batch.expiryDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Note */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bon de Livraison
            </CardTitle>
            <CardDescription>
              Document de livraison associé
            </CardDescription>
          </div>
          {distribution.deliveryNote ? (
            <Badge
              variant={
                distribution.deliveryNote.status === "LIVRE"
                  ? "default"
                  : "outline"
              }
            >
              {distribution.deliveryNote.status === "BROUILLON"
                ? "Brouillon"
                : distribution.deliveryNote.status === "VALIDE"
                ? "Validé"
                : "Livré"}
            </Badge>
          ) : (
            <Button
              onClick={handleCreateDeliveryNote}
              disabled={creatingNote}
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un bon
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {distribution.deliveryNote ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    N° {distribution.deliveryNote.noteNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Créé le {formatDate(distribution.deliveryNote.createdAt)}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/bons-livraison/${distribution.deliveryNote.id}`}>
                    Voir le bon
                  </Link>
                </Button>
              </div>

              {distribution.deliveryNote.items.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Articles:</h4>
                  {distribution.deliveryNote.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b last:border-0"
                    >
                      <span>{item.batch.product.name}</span>
                      <span className="font-medium">
                        {formatNumber(item.quantity)} x{" "}
                        {formatCurrency(Number(item.unitPrice))}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(Number(distribution.deliveryNote.totalAmount))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun bon de livraison créé pour cette distribution
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
