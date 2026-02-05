"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Printer,
  Truck,
  User,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getDeliveryNote,
  validateDeliveryNote,
  markAsDelivered,
} from "../actions";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validé",
  LIVRE: "Livré",
};

const statusColors: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-800 border-gray-300",
  VALIDE: "bg-blue-100 text-blue-800 border-blue-300",
  LIVRE: "bg-green-100 text-green-800 border-green-300",
};

const statusIcons: Record<string, typeof Clock> = {
  BROUILLON: Clock,
  VALIDE: CheckCircle,
  LIVRE: Truck,
};

export default function DeliveryNoteDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [id]);

  async function loadNote() {
    setLoading(true);
    const result = await getDeliveryNote(id);
    if (result.success && result.data) {
      setNote(result.data);
    }
    setLoading(false);
  }

  async function handleValidate() {
    const result = await validateDeliveryNote(id);
    if (result.success) {
      toast.success("Bon de livraison validé");
      loadNote();
    } else {
      toast.error(result.error);
    }
  }

  async function handleMarkAsDelivered() {
    const result = await markAsDelivered(id);
    if (result.success) {
      toast.success("Marqué comme livré");
      loadNote();
    } else {
      toast.error(result.error);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-center py-8">Chargement...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-center py-8 text-muted-foreground">
          Bon de livraison non trouvé
        </p>
      </div>
    );
  }

  const StatusIcon = statusIcons[note.status];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/bons-livraison">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Bon de Livraison
              </h1>
              <Badge
                variant="outline"
                className={`${statusColors[note.status]} flex items-center gap-1`}
              >
                <StatusIcon className="h-3 w-3" />
                {statusLabels[note.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{note.noteNumber}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/bons-livraison/${id}/pdf`}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Link>
          </Button>
          {note.status === "BROUILLON" && (
            <Button onClick={handleValidate}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider
            </Button>
          )}
          {note.status === "VALIDE" && (
            <Button onClick={handleMarkAsDelivered}>
              <Truck className="mr-2 h-4 w-4" />
              Marquer livré
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date création</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {formatDate(note.createdAt)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Période</CardTitle>
            <Badge variant="outline">T{note.quarter}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">Trimestre {note.quarter}</div>
            <p className="text-xs text-muted-foreground">{note.year}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{note.items.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(Number(note.totalAmount || 0))}
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Montant total</p>
          </CardContent>
        </Card>
      </div>

      {/* Hospital Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Destinataire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium text-lg">{note.hospital.name}</p>
            <p className="text-sm text-muted-foreground">
              Code: {note.hospital.code}
            </p>
            {note.hospital.address && (
              <p className="text-sm">{note.hospital.address}</p>
            )}
            {note.hospital.phone && (
              <p className="text-sm">Tél: {note.hospital.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles livrés</CardTitle>
          <CardDescription>Liste des produits inclus dans ce bon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {note.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.batch.product.name}
                    </TableCell>
                    <TableCell>{item.batch.batchNumber}</TableCell>
                    <TableCell>
                      {formatDate(item.batch.expiryDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.batch.product.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unitPrice))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(item.totalPrice))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(note.totalAmount || 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations de livraison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date de livraison
              </label>
              <Input
                value={
                  note.deliveredAt
                    ? formatDate(note.deliveredAt)
                    : "Non livré"
                }
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
