"use client";

import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Product, Batch, Hospital, HospitalType } from "@prisma/client";
import { createStockExit } from "@/app/(dashboard)/inventaire/sorties/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const stockExitSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  batchId: z.string().min(1, "Le lot est requis"),
  hospitalId: z.string().min(1, "L'hôpital est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  quarter: z.coerce.number().min(1).max(4),
  year: z.coerce.number().min(2020).max(2100),
  exitDate: z.string().optional(),
  notes: z.string().optional(),
});

type StockExitInput = z.infer<typeof stockExitSchema>;

interface ProductWithBatches extends Product {
  batches: Batch[];
}

const hospitalTypeLabels: Record<HospitalType, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

interface StockExitFormProps {
  products: ProductWithBatches[];
  hospitals: Hospital[];
}

export function StockExitForm({ products, hospitals }: StockExitFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [showFEFOWarning, setShowFEFOWarning] = useState(false);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const form = useForm<StockExitInput>({
    resolver: zodResolver(stockExitSchema) as any,
    defaultValues: {
      productId: "",
      batchId: "",
      hospitalId: "",
      quantity: 1,
      quarter: currentQuarter,
      year: currentYear,
      exitDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  const selectedProductId = form.watch("productId");
  const selectedBatchId = form.watch("batchId");

  const selectedProduct = useMemo(() =>
    products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

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

  // Check FEFO compliance when batch changes
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

  async function onSubmit(data: StockExitInput) {
    setIsPending(true);

    const formData = new FormData();
    formData.append("productId", data.productId);
    formData.append("batchId", data.batchId);
    formData.append("hospitalId", data.hospitalId);
    formData.append("quantity", data.quantity.toString());
    formData.append("quarter", data.quarter.toString());
    formData.append("year", data.year.toString());
    if (data.exitDate) formData.append("exitDate", data.exitDate);
    if (data.notes) formData.append("notes", data.notes);

    const result = await createStockExit(formData);

    if (result.success) {
      toast.success("Sortie de stock créée avec succès");
      router.push("/inventaire/sorties");
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-6">
        {/* Product */}
        <Controller
          name="productId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="productId">Produit *</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("batchId", "");
                  form.setValue("quantity", 1);
                  setShowFEFOWarning(false);
                }}
              >
                <SelectTrigger
                  id="productId"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const totalStock = product.batches.reduce((sum, b) => sum + b.quantity, 0);
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({product.code}) • Stock: {totalStock} {product.unit}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Batch Selection with FEFO */}
        <Controller
          name="batchId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="batchId">Lot *</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  checkFEFO(value);
                }}
                disabled={!selectedProduct || availableBatches.length === 0}
              >
                <SelectTrigger
                  id="batchId"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue
                    placeholder={
                      !selectedProduct
                        ? "Sélectionnez d'abord un produit"
                        : availableBatches.length === 0
                        ? "Aucun lot disponible"
                        : "Sélectionner un lot"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableBatches.map((batch, index) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <span className="font-medium">
                        Lot: {batch.batchNumber}
                        {index === 0 && (
                          <span className="ml-2 text-xs text-emerald-600 font-normal">
                            (plus ancien)
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        • Stock: {batch.quantity} • Exp: {formatDate(batch.expiryDate)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBatch && (
                <FieldDescription>
                  Stock disponible: {selectedBatch.quantity} unités • Expiration: {formatDate(selectedBatch.expiryDate)}
                </FieldDescription>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* FEFO Warning */}
        {showFEFOWarning && (
          <Alert variant="warning" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Attention FEFO</AlertTitle>
            <AlertDescription className="text-amber-700">
              Vous avez sélectionné un lot qui n&apos;est pas le plus ancien. 
              Pour respecter la règle FEFO (First Expired First Out), il est recommandé 
              d&apos;utiliser d&apos;abord le lot: <strong>{availableBatches[0]?.batchNumber}</strong> 
              (expire le {formatDate(availableBatches[0]?.expiryDate)}).
            </AlertDescription>
          </Alert>
        )}

        {/* Hospital */}
        <Controller
          name="hospitalId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="hospitalId">Hôpital destinataire *</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="hospitalId"
                  aria-invalid={fieldState.invalid}
                >
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Quantity */}
        <Controller
          name="quantity"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="quantity">
                Quantité * {selectedProduct && `(${selectedProduct.unit})`}
              </FieldLabel>
              <Input
                {...field}
                id="quantity"
                type="number"
                min="1"
                max={selectedBatch?.quantity || 999999}
                placeholder="0"
                aria-invalid={fieldState.invalid}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                disabled={!selectedBatch}
              />
              {selectedBatch && (
                <FieldDescription>
                  Maximum disponible: {selectedBatch.quantity} {selectedProduct?.unit}
                </FieldDescription>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Quarter */}
          <Controller
            name="quarter"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="quarter">Trimestre *</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger
                    id="quarter"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">T1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">T2 (Avr-Juin)</SelectItem>
                    <SelectItem value="3">T3 (Juil-Sep)</SelectItem>
                    <SelectItem value="4">T4 (Oct-Déc)</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Year */}
          <Controller
            name="year"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="year">Année *</FieldLabel>
                <Input
                  {...field}
                  id="year"
                  type="number"
                  min="2020"
                  max="2100"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || currentYear)}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Exit Date */}
          <Controller
            name="exitDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="exitDate">Date de sortie</FieldLabel>
                <Input
                  {...field}
                  id="exitDate"
                  type="date"
                  aria-invalid={fieldState.invalid}
                  value={field.value || format(new Date(), "yyyy-MM-dd")}
                />
                <FieldDescription>Par défaut: aujourd&apos;hui</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Notes */}
        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Input
                {...field}
                id="notes"
                placeholder="Observations éventuelles..."
                aria-invalid={fieldState.invalid}
                value={field.value || ""}
              />
              <FieldDescription>Informations complémentaires</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/inventaire/sorties")}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer la sortie"}
        </Button>
      </div>
    </form>
  );
}
