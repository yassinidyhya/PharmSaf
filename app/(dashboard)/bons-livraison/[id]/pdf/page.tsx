"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Building2,
  Package,
  Calendar,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDeliveryNote, logPrintAction } from "../../actions";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validé",
  LIVRE: "Livré",
};

export default function DeliveryNotePDFPage() {
  const params = useParams();
  const id = params.id as string;

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
    // Log the print action
    logPrintAction(id);
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  async function loadNote() {
    setLoading(true);
    const result = await getDeliveryNote(id);
    if (result.success) {
      setNote(result.data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Bon de livraison non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/bons-livraison/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>

      {/* Print Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-6">
          <h1 className="text-xl font-bold">ROYAUME DU MAROC</h1>
          <h2 className="text-lg font-semibold">
            MINISTÈRE DE LA SANTÉ ET DE LA PROTECTION SOCIALE
          </h2>
          <h3 className="text-base font-medium">
            DÉLÉGATION PROVINCIALE – ESSAOUIRA
          </h3>
          <h4 className="text-lg font-bold mt-2">PHARMACIE PROVINCIALE</h4>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold border-2 border-black inline-block px-8 py-2">
            BON DE LIVRAISON N° {note.noteNumber}
          </h2>
          <div className="mt-2">
            <Badge variant="outline" className="text-base">
              {statusLabels[note.status]}
            </Badge>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="border-2">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Destinataire
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{note.hospital.name}</p>
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

          <Card className="border-2">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Date création:</span>{" "}
                  {formatDate(note.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Trimestre:</span>{" "}
                  <Badge variant="outline">T{note.quarter}</Badge>
                </p>
                <p>
                  <span className="font-medium">Année:</span> {note.year}
                </p>
                {note.deliveredAt && (
                  <p>
                    <span className="font-medium">Date livraison:</span>{" "}
                    {formatDate(note.deliveredAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card className="border-2 mb-8">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="text-left p-4 font-bold">N°</th>
                  <th className="text-left p-4 font-bold">Produit</th>
                  <th className="text-left p-4 font-bold">Lot</th>
                  <th className="text-right p-4 font-bold">Quantité</th>
                  <th className="text-right p-4 font-bold">Prix Unitaire</th>
                  <th className="text-right p-4 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {note.items.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {item.batch.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.batch.product.code}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">{item.batch.batchNumber}</td>
                    <td className="p-4 text-right">
                      {formatNumber(item.quantity)}{" "}
                      {item.batch.product.unit}
                    </td>
                    <td className="p-4 text-right">
                      {formatCurrency(Number(item.unitPrice))}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(Number(item.totalPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={5} className="p-4 text-right font-bold">
                    TOTAL:
                  </td>
                  <td className="p-4 text-right font-bold text-lg">
                    {formatCurrency(Number(note.totalAmount || 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Notes */}
        {(note.notes || note.deliveredBy) && (
          <div className="mb-8">
            <h3 className="font-bold mb-2">Informations complémentaires:</h3>
            {note.deliveredBy && (
              <p className="text-sm">
                <span className="font-medium">Livré par:</span> {note.deliveredBy}
              </p>
            )}
            {note.notes && (
              <p className="text-sm mt-1">
                <span className="font-medium">Notes:</span> {note.notes}
              </p>
            )}
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-16">
          <div className="text-center">
            <p className="font-bold mb-2">Livré par:</p>
            <p className="text-sm text-muted-foreground mb-8">
              Pharmacie Provinciale d&apos;Essaouira
            </p>
            {note.deliveredBy && (
              <p className="text-sm mb-4">{note.deliveredBy}</p>
            )}
            <div className="border-t border-black pt-2">
              <p className="text-sm">Signature et cachet</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold mb-2">Reçu par:</p>
            <p className="text-sm text-muted-foreground mb-8">
              {note.hospital.name}
            </p>
            <div className="border-t border-black pt-2">
              <p className="text-sm">Nom, qualité, signature et cachet</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Document généré le {formatDate(new Date().toISOString())}</p>
          <p>Pharmacie Provinciale d&apos;Essaouira - Tél: 0524 XX XX XX</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
