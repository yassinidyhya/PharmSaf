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
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDistribution } from "../actions";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  MEDICAMENT: "Médicament",
  VACCIN: "Vaccin",
  INSULINE: "Insuline",
  REACTIF: "Réactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

export default function DistributionPDFPage() {
  const params = useParams();
  const id = params.id as string;

  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistribution();
    // Auto-print when loaded
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  async function loadDistribution() {
    setLoading(true);
    const result = await getDistribution(id);
    if (result.success) {
      setDistribution(result.data);
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

  if (!distribution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Distribution non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/distributions/${id}`}>
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
            BON DE SORTIE N° {distribution.id.slice(-6).toUpperCase()}
          </h2>
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
                <p className="font-semibold text-lg">{distribution.hospital.name}</p>
                <p className="text-sm text-muted-foreground">
                  Code: {distribution.hospital.code}
                </p>
                {distribution.hospital.address && (
                  <p className="text-sm">{distribution.hospital.address}</p>
                )}
                {distribution.hospital.phone && (
                  <p className="text-sm">Tél: {distribution.hospital.phone}</p>
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
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(distribution.exitDate)}
                </p>
                <p>
                  <span className="font-medium">Trimestre:</span>{" "}
                  <Badge variant="outline">T{distribution.quarter}</Badge>
                </p>
                <p>
                  <span className="font-medium">Année:</span> {distribution.year}
                </p>
                {distribution.deliveryNote && (
                  <p>
                    <span className="font-medium">Bon de livraison:</span>{" "}
                    {distribution.deliveryNote.noteNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="border-2 mb-8">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="text-left p-4 font-bold">Produit</th>
                  <th className="text-left p-4 font-bold">Catégorie</th>
                  <th className="text-left p-4 font-bold">Lot</th>
                  <th className="text-right p-4 font-bold">Quantité</th>
                  <th className="text-right p-4 font-bold">Prix Unitaire</th>
                  <th className="text-right p-4 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{distribution.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {distribution.product.code}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {categoryLabels[distribution.product.category]}
                  </td>
                  <td className="p-4">{distribution.batch.batchNumber}</td>
                  <td className="p-4 text-right">
                    {formatNumber(distribution.quantity)} {distribution.product.unit}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(Number(distribution.product.price || 0))}
                  </td>
                  <td className="p-4 text-right font-bold">
                    {formatCurrency(
                      Number(distribution.product.price || 0) * distribution.quantity
                    )}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={5} className="p-4 text-right font-bold">
                    TOTAL:
                  </td>
                  <td className="p-4 text-right font-bold text-lg">
                    {formatCurrency(
                      Number(distribution.product.price || 0) * distribution.quantity
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Notes */}
        {distribution.notes && (
          <div className="mb-8">
            <h3 className="font-bold mb-2">Notes:</h3>
            <p className="text-sm border p-3 rounded">{distribution.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-16">
          <div className="text-center">
            <p className="font-bold mb-2">Livré par:</p>
            <p className="text-sm text-muted-foreground mb-8">
              Pharmacie Provinciale
            </p>
            <div className="border-t border-black pt-2">
              <p className="text-sm">Signature et cachet</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold mb-2">Reçu par:</p>
            <p className="text-sm text-muted-foreground mb-8">
              {distribution.hospital.name}
            </p>
            <div className="border-t border-black pt-2">
              <p className="text-sm">Nom, qualité, signature et cachet</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Document généré le {formatDate(new Date().toISOString())}</p>
          <p>Pharmacie Provinciale d&apos;Essaouira</p>
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
