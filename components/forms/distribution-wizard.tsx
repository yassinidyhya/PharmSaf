"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Wallet,
  Package,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Plus,
  Trash2,
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Category } from "@prisma/client";
import {
  getHospitalsWithBudget,
  getProductsWithStockAndPrice,
  validateDistribution,
  createDistribution,
} from "@/app/(dashboard)/distributions/nouveau/actions";

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-100 text-blue-800",
  VACCIN: "bg-green-100 text-green-800",
  REACTIF: "bg-purple-100 text-purple-800",
  CONSOMMABLE: "bg-orange-100 text-orange-800",
  PETIT_MATERIEL: "bg-gray-100 text-gray-800",
  MATERIEL_BUREAU: "bg-slate-100 text-slate-800",
};

const hospitalTypeLabels: Record<string, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

interface DistributionItem {
  productId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
}

export function DistributionWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [deliveryNote, setDeliveryNote] = useState<any>(null);

  // Form data
  const [hospitalId, setHospitalId] = useState("");
  const [quarter, setQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [items, setItems] = useState<DistributionItem[]>([]);

  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const selectedHospital = hospitals.find((h) => h.id === hospitalId);

  useEffect(() => {
    if (step === 1) {
      loadHospitals();
    } else if (step === 3) {
      loadProducts();
    }
  }, [step]);

  async function loadHospitals() {
    setLoading(true);
    const result = await getHospitalsWithBudget(year, quarter);
    if (result.success) {
      setHospitals(result.data || []);
    }
    setLoading(false);
  }

  async function loadProducts() {
    setLoading(true);
    const result = await getProductsWithStockAndPrice();
    if (result.success) {
      setProducts(result.data || []);
    }
    setLoading(false);
  }

  async function handleValidate() {
    if (items.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }

    setLoading(true);
    const result = await validateDistribution(
      hospitalId,
      year,
      quarter,
      items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }))
    );

    if (result.success) {
      setValidation(result.data);
      setStep(4);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    setLoading(true);
    const result = await createDistribution({
      hospitalId,
      quarter,
      year,
      items: items.map((i) => ({
        productId: i.productId,
        batchId: i.batchId,
        quantity: i.quantity,
      })),
    });

    if (result.success) {
      toast.success("Distribution créée avec succès");
      setDeliveryNote(result.data.deliveryNote);
      setStep(5);
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }
    setLoading(false);
  }

  function addItem(product: any, batch: any) {
    const existing = items.find(
      (i) => i.productId === product.id && i.batchId === batch.id
    );
    if (existing) {
      toast.error("Ce lot est déjà ajouté");
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        batchId: batch.id,
        quantity: 1,
        unitPrice: Number(product.price) || 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateQuantity(index: number, quantity: number) {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, quantity);
    setItems(newItems);
  }

  function getProduct(productId: string) {
    return products.find((p) => p.id === productId);
  }

  function getBatch(productId: string, batchId: string) {
    const product = getProduct(productId);
    return product?.batches.find((b: any) => b.id === batchId);
  }

  // Calculate total cost by category
  const costByCategory = items.reduce((acc, item) => {
    const product = getProduct(item.productId);
    if (product) {
      const cost = item.unitPrice * item.quantity;
      acc[product.category] = (acc[product.category] || 0) + cost;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalCost = Object.values(costByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[
            { num: 1, label: "Hôpital", icon: Building2 },
            { num: 2, label: "Budget", icon: Wallet },
            { num: 3, label: "Produits", icon: Package },
            { num: 4, label: "Validation", icon: CheckCircle },
            { num: 5, label: "Confirmation", icon: CheckCircle },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-green-100 text-green-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {s.label}
                  </span>
                </div>
                {i < 4 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={(step / 5) * 100} className="h-2" />
      </div>

      {/* Step 1: Select Hospital */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 1: Sélectionner l&apos;hôpital</CardTitle>
            <CardDescription>
              Choisissez l&apos;hôpital destinataire et la période
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGroup className="gap-6">
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
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
                    min={2020}
                    max={2100}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Hôpital *</FieldLabel>
                {loading ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {hospitals.map((hospital) => (
                      <div
                        key={hospital.id}
                        onClick={() => setHospitalId(hospital.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          hospitalId === hospital.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{hospital.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {hospitalTypeLabels[hospital.type]} • {hospital.code}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Budget restant:
                            </p>
                            <p
                              className={`font-bold ${
                                hospital.totalRemaining > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(hospital.totalRemaining)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!hospitalId}
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Budget Overview */}
      {step === 2 && selectedHospital && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 2: Budget disponible</CardTitle>
            <CardDescription>
              Répartition du budget par catégorie pour {selectedHospital.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(selectedHospital.budgetByCategory).map(
                ([category, budget]: [string, any]) => (
                  <div
                    key={category}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={categoryColors[category as Category]}
                      >
                        {categoryLabels[category as Category]}
                      </Badge>
                      <span
                        className={`font-bold ${
                          budget.remaining > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(budget.remaining)} restant
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget total:</span>
                        <span>{formatCurrency(budget.budget)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Consommé:</span>
                        <span>{formatCurrency(budget.consumed)}</span>
                      </div>
                      <Progress
                        value={
                          budget.budget > 0
                            ? (budget.consumed / budget.budget) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                )
              )}
              {Object.keys(selectedHospital.budgetByCategory).length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun budget défini pour cet hôpital en {year}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vous pouvez continuer, mais aucune validation de budget ne sera effectuée.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              <Button onClick={() => setStep(3)}>
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Products */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 3: Ajouter les produits</CardTitle>
            <CardDescription>
              Sélectionnez les produits et les quantités à distribuer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current items */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Produits sélectionnés:</h4>
                {items.map((item, index) => {
                  const product = getProduct(item.productId);
                  const batch = getBatch(item.productId, item.batchId);
                  if (!product || !batch) return null;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Lot: {batch.batchNumber} • Exp: {formatDate(batch.expiryDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={batch.quantity}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(index, parseInt(e.target.value) || 1)
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {product.unit}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  );
                })}

                {/* Total by category */}
                <div className="p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Résumé par catégorie:</h5>
                  {Object.entries(costByCategory).map(([cat, cost]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span>{categoryLabels[cat as Category]}:</span>
                      <span className="font-medium">{formatCurrency(cost)}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Add products */}
            <div>
              <h4 className="font-medium mb-3">Ajouter un produit:</h4>
              {loading ? (
                <p className="text-muted-foreground">Chargement...</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.code} • Stock: {product.totalStock} {product.unit}
                            {product.price && ` • ${formatCurrency(Number(product.price))}`}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={categoryColors[product.category]}
                        >
                          {categoryLabels[product.category]}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Lots disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.batches.map((batch: any) => (
                            <Button
                              key={batch.id}
                              variant="outline"
                              size="sm"
                              onClick={() => addItem(product, batch)}
                              disabled={items.some(
                                (i) =>
                                  i.productId === product.id &&
                                  i.batchId === batch.id
                              )}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {batch.batchNumber} ({batch.quantity})
                              <span className="text-xs text-muted-foreground ml-1">
                                Exp: {formatDate(batch.expiryDate)}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              <Button
                onClick={handleValidate}
                disabled={items.length === 0 || loading}
              >
                Valider
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Validation */}
      {step === 4 && validation && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 4: Validation</CardTitle>
            <CardDescription>
              Vérifiez la distribution avant de la créer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget validation */}
            <div className="space-y-3">
              <h4 className="font-medium">Validation du budget:</h4>
              {Object.entries(validation.byCategory).map(
                ([category, data]: [string, any]) => (
                  <div
                    key={category}
                    className={`p-4 border rounded-lg ${
                      data.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={categoryColors[category as Category]}
                      >
                        {categoryLabels[category as Category]}
                      </Badge>
                      {data.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">{formatCurrency(data.budget)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Consommé</p>
                        <p className="font-medium">{formatCurrency(data.consumed)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Demandé</p>
                        <p className={`font-medium ${data.valid ? "" : "text-red-600"}`}>
                          {formatCurrency(data.requested)}
                        </p>
                      </div>
                    </div>
                    {!data.valid && (
                      <p className="text-red-600 text-sm mt-2">
                        ⚠️ Dépassement de budget de {formatCurrency(data.requested - data.remaining)}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Coût total:</span>
                <span className="text-xl font-bold">{formatCurrency(validation.totalCost)}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!validation.valid || loading}
                className={!validation.valid ? "opacity-50" : ""}
              >
                {loading ? "Création..." : "Créer la distribution"}
                <TrendingDown className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {!validation.valid && (
              <p className="text-center text-sm text-red-600">
                ⚠️ Corrigez les dépassements de budget avant de continuer
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Success */}
      {step === 5 && deliveryNote && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Distribution créée avec succès!
            </h2>
            <p className="text-muted-foreground mb-2">
              La distribution a été enregistrée et le stock a été mis à jour.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6 max-w-sm mx-auto">
              <p className="text-sm text-muted-foreground">Bon de livraison généré:</p>
              <p className="text-xl font-bold text-primary">N° {deliveryNote.noteNumber}</p>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button variant="outline" onClick={() => router.push("/distributions")}>
                Voir les distributions
              </Button>
              <Button variant="outline" onClick={() => router.push(`/bons-livraison/${deliveryNote.id}`)}>
                Voir le bon
              </Button>
              <Button onClick={() => router.push(`/bons-livraison/${deliveryNote.id}/pdf`)}>
                Imprimer PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
