"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Syringe,
  Plus,
  Minus,
  Package,
  Building2,
  AlertCircle,
  RotateCcw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  getInsulinStock,
  createInsulinEntry,
  createInsulinExit,
  getRecentInsulinMovements,
  getHospitals,
  type InsulinStockSummary,
  type InsulinMovement,
  type InsulinBatch,
} from "./actions";

// ============================================
// FIXED INSULIN PRODUCTS (from Excel)
// ============================================

const INSULIN_TYPES = [
  {
    id: "insuline-mixte-30-70",
    code: "3542608",
    name: "Insuline humaine semi lente mélange 30/70 fl 100UI/ml",
    shortName: "Mixte 30/70",
    unit: "flacon",
    price: 18.75,
  },
  {
    id: "insuline-simple",
    code: "3542608",
    name: "Insuline humaine semi lente simple fl 100UI/ml",
    shortName: "Simple",
    unit: "flacon",
    price: 19.0,
  },
  {
    id: "insuline-rapide",
    code: "3542608",
    name: "Insuline rapide fl 100 ui humaine",
    shortName: "Rapide",
    unit: "flacon",
    price: 19.6,
  },
] as const;

type InsulinTypeId = typeof INSULIN_TYPES[number]["id"];

interface Hospital {
  id: string;
  name: string;
  code: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function InsulinPage() {
  const [stock, setStock] = useState<Record<InsulinTypeId, InsulinStockSummary>>({
    "insuline-mixte-30-70": { totalStock: 0, batches: [] },
    "insuline-simple": { totalStock: 0, batches: [] },
    "insuline-rapide": { totalStock: 0, batches: [] },
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [movements, setMovements] = useState<InsulinMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [stockResult, hospitalsResult, movementsResult] = await Promise.all([
      getInsulinStock(),
      getHospitals(),
      getRecentInsulinMovements(10),
    ]);

    if (stockResult.success && stockResult.data) {
      const stockMap = stockResult.data;
      setStock({
        "insuline-mixte-30-70": stockMap["insuline-mixte-30-70"] || { totalStock: 0, batches: [] },
        "insuline-simple": stockMap["insuline-simple"] || { totalStock: 0, batches: [] },
        "insuline-rapide": stockMap["insuline-rapide"] || { totalStock: 0, batches: [] },
      });
    }
    if (hospitalsResult.success) setHospitals(hospitalsResult.data || []);
    if (movementsResult.success) setMovements(movementsResult.data || []);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <Syringe className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestion Insuline
            </h1>
            <p className="text-sm text-muted-foreground">
              Suivi des entrées, sorties et stock d'insuline
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* 3 Fixed Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INSULIN_TYPES.map((type) => (
          <InsulinStockCard
            key={type.id}
            type={type}
            stock={stock[type.id]}
          />
        ))}
      </div>

      {/* Forms Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EntryForm insulinTypes={INSULIN_TYPES} onSuccess={loadData} />
        <ExitForm
          insulinTypes={INSULIN_TYPES}
          hospitals={hospitals}
          stock={stock}
          onSuccess={loadData}
        />
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mouvements Récents
          </CardTitle>
          <CardDescription>
            Dernières entrées et sorties d'insuline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MovementsTable movements={movements} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// STOCK CARD COMPONENT
// ============================================

function InsulinStockCard({
  type,
  stock,
}: {
  type: typeof INSULIN_TYPES[number];
  stock: InsulinStockSummary;
}) {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const earliestExpiry = stock.batches.length > 0
    ? new Date(stock.batches[0].expiryDate)
    : null;

  const hasExpiryWarning = earliestExpiry && earliestExpiry < threeMonthsFromNow;
  const isOutOfStock = stock.totalStock === 0;

  return (
    <Card className={`${isOutOfStock ? "border-red-300 bg-red-50/50" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {type.shortName}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-1" title={type.name}>
              {type.name}
            </CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Syringe className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatNumber(stock.totalStock)}
            </span>
            <span className="text-sm text-muted-foreground">{type.unit}s</span>
          </div>

          <div className="text-sm text-muted-foreground">
            P.U: {type.price.toFixed(2)} DH
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {stock.batches.length} lot{stock.batches.length > 1 ? "s" : ""}
            </span>
          </div>

          {hasExpiryWarning && (
            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>Expire le: {formatDate(earliestExpiry)}</span>
            </div>
          )}

          {isOutOfStock && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>Stock épuisé</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// ENTRY FORM COMPONENT
// ============================================

function EntryForm({
  insulinTypes,
  onSuccess,
}: {
  insulinTypes: typeof INSULIN_TYPES;
  onSuccess: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [selectedType, setSelectedType] = useState<InsulinTypeId>(insulinTypes[0].id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createInsulinEntry(formData);

    if (result.success) {
      toast.success("Entrée enregistrée avec succès");
      e.currentTarget.reset();
      onSuccess();
    } else {
      toast.error(result.error || "Erreur lors de l'enregistrement");
    }

    setIsPending(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="h-5 w-5 text-green-600" />
          Nouvelle Entrée
        </CardTitle>
        <CardDescription>
          Enregistrer une réception d'insuline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Type d'insuline *</FieldLabel>
            <Select
              name="insulinType"
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as InsulinTypeId)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {insulinTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>N° Lot *</FieldLabel>
              <Input
                name="batchNumber"
                placeholder="Ex: LOT-2025-001"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Quantité *</FieldLabel>
              <Input
                name="quantity"
                type="number"
                min={1}
                placeholder="Ex: 100"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Date de péremption *</FieldLabel>
              <Input name="expiryDate" type="date" required />
            </Field>

            <Field>
              <FieldLabel>Température (optionnel)</FieldLabel>
              <Input name="temperature" placeholder="Ex: 4°C" />
            </Field>
          </div>

          <Field>
            <FieldLabel>Référence document (optionnel)</FieldLabel>
            <Input
              name="referenceDoc"
              placeholder="Ex: Commande Gov #2025-123"
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Ajouter au stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// EXIT FORM COMPONENT (Distribution)
// ============================================

function ExitForm({
  insulinTypes,
  hospitals,
  stock,
  onSuccess,
}: {
  insulinTypes: typeof INSULIN_TYPES;
  hospitals: Hospital[];
  stock: Record<InsulinTypeId, InsulinStockSummary>;
  onSuccess: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<InsulinTypeId, number>>({
    "insuline-mixte-30-70": 0,
    "insuline-simple": 0,
    "insuline-rapide": 0,
  });

  function updateQuantity(typeId: InsulinTypeId, value: number) {
    setQuantities((prev) => ({ ...prev, [typeId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const items = insulinTypes
      .filter((t) => quantities[t.id] > 0)
      .map((t) => ({
        insulinType: t.id,
        quantity: quantities[t.id],
      }));

    if (items.length === 0) {
      toast.error("Entrez une quantité pour au moins un produit");
      return;
    }

    setIsPending(true);

    const formData = new FormData();
    formData.append("hospitalId", selectedHospital);
    formData.append("items", JSON.stringify(items));

    const result = await createInsulinExit(formData);

    if (result.success) {
      toast.success("Distribution enregistrée avec succès");
      setSelectedHospital("");
      setQuantities({
        "insuline-mixte-30-70": 0,
        "insuline-simple": 0,
        "insuline-rapide": 0,
      });
      onSuccess();
    } else {
      toast.error(result.error || "Erreur lors de la distribution");
    }

    setIsPending(false);
  }

  const totalItems = insulinTypes.filter((t) => quantities[t.id] > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Minus className="h-5 w-5 text-red-600" />
          Distribution
        </CardTitle>
        <CardDescription>
          Enregistrer une sortie vers un centre de santé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Centre de Santé *</FieldLabel>
            <Select
              value={selectedHospital}
              onValueChange={setSelectedHospital}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un centre" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-3">
            <FieldLabel>Produits à distribuer *</FieldLabel>
            {insulinTypes.map((type) => {
              const typeStock = stock[type.id]?.totalStock || 0;
              const availableBatches = stock[type.id]?.batches || [];
              
              return (
                <div
                  key={type.id}
                  className="flex items-center gap-3 p-3 border rounded bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{type.shortName}</div>
                    <div className="text-xs text-muted-foreground">
                      Stock: {typeStock} | P.U: {type.price.toFixed(2)} DH
                    </div>
                    {availableBatches.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Lot: {availableBatches[0].batchNumber} (Exp: {formatDate(new Date(availableBatches[0].expiryDate))})
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={typeStock}
                    value={quantities[type.id] || ""}
                    onChange={(e) =>
                      updateQuantity(type.id, parseInt(e.target.value) || 0)
                    }
                    className="w-24 text-center"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {type.unit}s
                  </span>
                </div>
              );
            })}
          </div>

          {totalItems > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              {totalItems} produit(s) sélectionné(s)
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || totalItems === 0 || !selectedHospital}
          >
            {isPending ? "Enregistrement..." : "Enregistrer la distribution"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// MOVEMENTS TABLE COMPONENT
// ============================================

function MovementsTable({ movements }: { movements: InsulinMovement[] }) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun mouvement récent
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Lot</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead>Centre / Référence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{formatDate(new Date(m.date))}</TableCell>
              <TableCell>
                <Badge
                  variant={m.type === "ENTREE" ? "default" : "secondary"}
                  className={
                    m.type === "ENTREE"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  }
                >
                  {m.type === "ENTREE" ? "Entrée" : "Sortie"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{m.productName}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {m.batchNumber}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  m.type === "ENTREE" ? "text-green-600" : "text-red-600"
                }`}
              >
                {m.type === "ENTREE" ? "+" : "-"}
                {m.quantity}
              </TableCell>
              <TableCell>
                {m.hospitalName || m.reference || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
