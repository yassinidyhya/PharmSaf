"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Product, Category, CategoryLabels } from "@/lib/types";
import { createStockEntry } from "@/app/(dashboard)/inventaire/entrees/actions";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const stockEntrySchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.coerce.number().min(1, "La quantité doit être au moins 1"),
  batchNumber: z.string().min(1, "Le numéro de lot est requis"),
  expiryDate: z.string().min(1, "La date d'expiration est requise"),
  entryDate: z.string().optional(),
  temperature: z.string().optional(),
  referenceDoc: z.string().optional(),
  notes: z.string().optional(),
});

type StockEntryInput = z.infer<typeof stockEntrySchema>;

const categoryLabels = CategoryLabels;

interface StockEntryFormProps {
  products: Product[];
}

export function StockEntryForm({ products }: StockEntryFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<StockEntryInput>({
    resolver: zodResolver(stockEntrySchema) as any,
    defaultValues: {
      productId: "",
      quantity: 1,
      batchNumber: "",
      expiryDate: "",
      entryDate: format(new Date(), "yyyy-MM-dd"),
      temperature: "",
      referenceDoc: "",
      notes: "",
    },
  });

  async function onSubmit(data: StockEntryInput) {
    setIsPending(true);

    const formData = new FormData();
    formData.append("productId", data.productId);
    formData.append("quantity", data.quantity.toString());
    formData.append("batchNumber", data.batchNumber);
    formData.append("expiryDate", data.expiryDate);
    if (data.entryDate) formData.append("entryDate", data.entryDate);
    if (data.temperature) formData.append("temperature", data.temperature);
    if (data.referenceDoc) formData.append("referenceDoc", data.referenceDoc);
    if (data.notes) formData.append("notes", data.notes);

    const result = await createStockEntry(formData);

    if (result.success) {
      toast.success("Entrée de stock créée avec succès");
      router.push("/inventaire/entrees");
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }

    setIsPending(false);
  }

  const selectedProduct = products.find(
    (p) => p.id === form.watch("productId")
  );

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
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="productId"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ({product.code}) • {categoryLabels[product.category]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  placeholder="0"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Batch Number */}
          <Controller
            name="batchNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="batchNumber">Numéro de lot *</FieldLabel>
                <Input
                  {...field}
                  id="batchNumber"
                  placeholder="LOT-2024-001"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Expiry Date */}
          <Controller
            name="expiryDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="expiryDate">Date d&apos;expiration *</FieldLabel>
                <Input
                  {...field}
                  id="expiryDate"
                  type="date"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>Format: JJ/MM/AAAA</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Entry Date */}
          <Controller
            name="entryDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="entryDate">Date d&apos;entrée</FieldLabel>
                <Input
                  {...field}
                  id="entryDate"
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Temperature */}
          <Controller
            name="temperature"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="temperature">Température</FieldLabel>
                <Input
                  {...field}
                  id="temperature"
                  placeholder="+2°C à +8°C"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                />
                <FieldDescription>Requis pour les vaccins et réactifs</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Reference Document */}
          <Controller
            name="referenceDoc"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="referenceDoc">Document de référence</FieldLabel>
                <Input
                  {...field}
                  id="referenceDoc"
                  placeholder="Facture N°12345, Bon de commande..."
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                />
                <FieldDescription>Numéro de facture ou bon de commande</FieldDescription>
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
          onClick={() => router.push("/inventaire/entrees")}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer l'entrée"}
        </Button>
      </div>
    </form>
  );
}
