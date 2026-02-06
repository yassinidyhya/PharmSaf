"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Product, Category } from "@prisma/client";
import { updateProduct } from "@/app/(dashboard)/produits/actions";
import { updateProductSchema, UpdateProductInput } from "@/lib/validation";
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

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicament",
  VACCIN: "Vaccin",
  REACTIF: "Réactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

interface ProductEditFormProps {
  product: Product;
  onSuccess?: () => void;
}

export function ProductEditForm({ product, onSuccess }: ProductEditFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema) as any,
    defaultValues: {
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      packaging: product.packaging || "",
      price: product.price ? Number(product.price) : undefined,
      minStock: product.minStock,
    },
  });

  async function onSubmit(data: UpdateProductInput) {
    setIsPending(true);

    const formData = new FormData();
    if (data.code) formData.append("code", data.code);
    if (data.name) formData.append("name", data.name);
    if (data.category) formData.append("category", data.category);
    if (data.unit) formData.append("unit", data.unit);
    if (data.packaging !== undefined) formData.append("packaging", data.packaging);
    if (data.price !== undefined) formData.append("price", data.price.toString());
    if (data.minStock !== undefined) formData.append("minStock", data.minStock.toString());

    const result = await updateProduct(product.id, formData);

    if (result.success) {
      toast.success("Produit mis à jour avec succès");
      onSuccess?.();
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Code */}
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-code">Code *</FieldLabel>
                <Input
                  {...field}
                  id="edit-code"
                  placeholder="PRD-001"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Category */}
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-category">Catégorie *</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="edit-category"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Name */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="edit-name">Nom du produit *</FieldLabel>
              <Input
                {...field}
                id="edit-name"
                placeholder="Paracétamol 500mg"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Unit */}
          <Controller
            name="unit"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-unit">Unité *</FieldLabel>
                <Input
                  {...field}
                  id="edit-unit"
                  placeholder="boîte, flacon, unité..."
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Packaging */}
          <Controller
            name="packaging"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-packaging">Conditionnement</FieldLabel>
                <Input
                  {...field}
                  id="edit-packaging"
                  placeholder="Boîte de 100"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                />
                <FieldDescription>Optionnel</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Price */}
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-price">Prix unitaire (MAD)</FieldLabel>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : parseFloat(value));
                  }}
                />
                <FieldDescription>Optionnel</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Min Stock */}
          <Controller
            name="minStock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-minStock">Stock minimum d&apos;alerte</FieldLabel>
                <Input
                  {...field}
                  id="edit-minStock"
                  type="number"
                  min="0"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
