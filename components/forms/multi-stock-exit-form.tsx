"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Product, Batch, Hospital, HospitalType } from "@/lib/types";
import { createMultiStockExit } from "@/app/(dashboard)/inventaire/sorties/actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const hospitalTypeLabels: Record<string, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

interface ProductWithBatches extends Product {
  batches: Batch[];
}

interface StockExitItem {
  productId: string;
  batchId: string;
  quantity: number;
}

interface MultiStockExitFormProps {
  products: ProductWithBatches[];
  hospitals: Hospital[];
  isInsulinMode?: boolean;
}

export function MultiStockExitForm({ products, hospitals, isInsulinMode = false }: MultiStockExitFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form data
  const [hospitalId, setHospitalId] = useState("");
  const [quarter, setQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [exitDate, setExitDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<StockExitItem[]>([]);
  
  // Temporary selection
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showFEFOWarning, setShowFEFOWarning] = useState(false);

  const router = useRouter();

  const selectedHospital = hospitals.find((h) => h.id === hospitalId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Sort batches by expiry date (FEFO)
  const availableBatches = useMemo(() => {
    const batches = selectedProduct?.batches
      .filter((b) => b.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()) || [];
    return batches;
  }, [selectedProduct]);

  const selectedBatch = useMemo(() =>
    availableBatches.find((b) => b.id === selectedBatchId),
    [availableBatches, selectedBatchId]
  );

  // Check FEFO compliance
  const checkFEFO = (batchId: string) => {
    if (!availableBatches.length || !batchId) {
      setShowFEFOWarning(false);
      return;
    }
    const oldestBatch = availableBatches[0];
    const selected = availableBatches.find((b) => b.id === batchId);
    if (selected && oldestBatch && selected.id !== oldestBatch.id) {
      setShowFEFOWarning(true);
    } else {
      setShowFEFOWarning(false);
    }
  };

  const addItem = () => {
    if (!selectedProductId || !selectedBatchId || selectedQuantity < 1) {
      toast.error("Veuillez sélectionner un produit, un lot et une quantité");
      return;
    }

    const batch = availableBatches.find((b) => b.id === selectedBatchId);
    if (!batch) return;

    if (selectedQuantity > batch.quantity) {
      toast.error(`Quantité trop élevée. Stock disponible: ${batch.quantity}`);
      return;
    }

    // Check if already added
    const existing = items.find((i) => i.batchId === selectedBatchId);
    if (existing) {
      toast.error("Ce lot est déjà ajouté à la liste");
      return;
    }

    setItems([
      ...items,
      {
        productId: selectedProductId,
        batchId: selectedBatchId,
        quantity: selectedQuantity,
      },
    ]);

    // Reset selection
    setSelectedProductId("");
    setSelectedBatchId("");
    setSelectedQuantity(1);
    setShowFEFOWarning(false);
    toast.success("Produit ajouté");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    const item = items[index];
    const product = products.find((p) => p.id === item.productId);
    const batch = product?.batches.find((b) => b.id === item.batchId);
    
    if (batch && newQuantity > batch.quantity) {
      toast.error(`Quantité max: ${batch.quantity}`);
      return;
    }

    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newQuantity);
    setItems(newItems);
  };

  const getProduct = (productId: string) => products.find((p) => p.id === productId);
  const getBatch = (productId: string, batchId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.batches.find((b) => b.id === batchId);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }

    setIsPending(true);

    const result = await createMultiStockExit({
      hospitalId,
      items,
      quarter,
      year,
      notes: notes || undefined,
      exitDate: exitDate || undefined,
    });

    if (result.success) {
      toast.success(`${result.data?.count} sortie(s) créée(s) avec succès`);
      router.push("/inventaire/sorties");
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }

    setIsPending(false);
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Step 1: Hospital & Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Étape 1: Destination et Détails
            </CardTitle>
            <CardDescription>
              Sélectionnez l&apos;hôpital et les informations de la sortie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-6">
              {/* Hospital */}
              <Field>
                <FieldLabel>Hôpital destinataire *</FieldLabel>
                <Select value={hospitalId} onValueChange={setHospitalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un hôpital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <span className="font-medium">{hospital.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({hospitalTypeLabels[hospital.type]})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Quarter & Year - Hidden in Insulin Mode */}
              {!isInsulinMode && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <Field>
                    <FieldLabel>Trimestre *</FieldLabel>
                    <Select 
                      value={quarter.toString()} 
                      onValueChange={(v) => setQuarter(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">T1 (Jan-Mar)</SelectItem>
                        <SelectItem value="2">T2 (Avr-Juin)</SelectItem>
                        <SelectItem value="3">T3 (Juil-Sep)</SelectItem>
                        <SelectItem value="4">T4 (Oct-Déc)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Année *</FieldLabel>
                    <Input
                      type="number"
                      min="2020"
                      max="2100"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Date de sortie</FieldLabel>
                    <Input
                      type="date"
                      value={exitDate}
                      onChange={(e) => setExitDate(e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* Date only for Insulin Mode */}
              {isInsulinMode && (
                <Field>
                  <FieldLabel>Date de distribution</FieldLabel>
                  <Input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                  />
                </Field>
              )}

              {/* Notes */}
              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Input
                  placeholder="Observations éventuelles..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!hospitalId}
                  className="gap-2"
                >
                  Suivant
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Products */}
      {step === 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Étape 2: Ajouter des Produits
              </CardTitle>
              <CardDescription>
                Sélectionnez les produits à distribuer (respect FEFO)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-4">
                {/* Product Selection */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <Field>
                      <FieldLabel>Produit</FieldLabel>
                      <Select 
                        value={selectedProductId} 
                        onValueChange={(value) => {
                          setSelectedProductId(value);
                          setSelectedBatchId("");
                          setShowFEFOWarning(false);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => {
                            const totalStock = product.batches.reduce((sum, b) => sum + b.quantity, 0);
                            const alreadyAdded = items.some(i => i.productId === product.id);
                            return (
                              <SelectItem key={product.id} value={product.id}>
                                <span className="font-medium">{product.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  ({product.code}) • Stock: {totalStock} {product.unit}
                                  {alreadyAdded && " ✓"}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="md:col-span-4">
                    <Field>
                      <FieldLabel>Lot</FieldLabel>
                      <Select 
                        value={selectedBatchId} 
                        onValueChange={(value) => {
                          setSelectedBatchId(value);
                          checkFEFO(value);
                        }}
                        disabled={!selectedProductId || availableBatches.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedProductId ? "Produit d'abord" : "Sélectionner"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBatches.map((batch, index) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              <span className="font-medium">
                                Lot: {batch.batchNumber}
                                {index === 0 && (
                                  <Badge variant="secondary" className="ml-2 text-xs bg-emerald-100">
                                    FEFO
                                  </Badge>
                                )}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                • {batch.quantity} unités • Exp: {formatDate(batch.expiryDate)}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field>
                      <FieldLabel>Quantité</FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        max={selectedBatch?.quantity || 999}
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                        disabled={!selectedBatch}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <Button 
                      onClick={addItem} 
                      disabled={!selectedProductId || !selectedBatchId}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {/* FEFO Warning */}
                {showFEFOWarning && (
                  <Alert variant="warning" className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Attention FEFO</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Vous avez sélectionné un lot qui n&apos;est pas le plus ancien. 
                      Il est recommandé d&apos;utiliser d&apos;abord le lot: <strong>{availableBatches[0]?.batchNumber}</strong> 
                      (expire le {formatDate(availableBatches[0]?.expiryDate)}).
                    </AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Produits sélectionnés ({totalItems})</span>
                  <Badge variant="secondary">Total: {totalQuantity} unités</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const product = getProduct(item.productId);
                    const batch = getBatch(item.productId, item.batchId);
                    if (!product || !batch) return null;

                    return (
                      <div 
                        key={item.batchId} 
                        className="flex items-center gap-4 p-3 border rounded-lg bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Lot: {batch.batchNumber} • Exp: {formatDate(batch.expiryDate)} • 
                            Stock restant: {batch.quantity - item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={batch.quantity}
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-20 text-center"
                          />
                          <span className="text-sm text-muted-foreground w-16">{product.unit}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isPending || items.length === 0}
                    className="gap-2"
                  >
                    {isPending ? "Enregistrement..." : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Enregistrer les sorties ({items.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {items.length === 0 && (
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
            </div>
          )}
        </>
      )}

      {/* Summary Card */}
      {selectedHospital && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{selectedHospital.name}</div>
                <div className="text-sm text-muted-foreground">
                  {hospitalTypeLabels[selectedHospital.type]}
                  {!isInsulinMode && ` • T${quarter} ${year}`}
                  {isInsulinMode && " • Distribution immédiate"}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm text-muted-foreground">
                  {items.length} produit(s) • {totalQuantity} unité(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
