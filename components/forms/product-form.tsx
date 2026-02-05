"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { createProduct } from "@/app/(dashboard)/produits/actions";
import { createProductSchema, CreateProductInput } from "@/lib/validation";
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

export function ProductForm() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      code: "",
      name: "",
      category: undefined,
      unit: "",
      packaging: "",
      price: undefined,
      minStock: 0,
    },
  });

  async function onSubmit(data: CreateProductInput) {
    setIsPending(true);

    const formData = new FormData();
    formData.append("code", data.code);
    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("unit", data.unit);
    if (data.packaging) formData.append("packaging", data.packaging);
    if (data.price !== undefined) formData.append("price", data.price.toString());
    formData.append("minStock", data.minStock.toString());

    const result = await createProduct(formData);

    if (result.success) {
      toast.success("Produit créé avec succès");
      router.push("/produits");
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de la création");
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
                <FieldLabel htmlFor="code">Code *</FieldLabel>
                <Input
                  {...field}
                  id="code"
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
                <FieldLabel htmlFor="category">Catégorie *</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="category"
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
              <FieldLabel htmlFor="name">Nom du produit *</FieldLabel>
              <Input
                {...field}
                id="name"
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
                <FieldLabel htmlFor="unit">Unité *</FieldLabel>
                <Input
                  {...field}
                  id="unit"
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
                <FieldLabel htmlFor="packaging">Conditionnement</FieldLabel>
                <Input
                  {...field}
                  id="packaging"
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
                <FieldLabel htmlFor="price">Prix unitaire (MAD)</FieldLabel>
                <Input
                  id="price"
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
                <FieldLabel htmlFor="minStock">Stock minimum d&apos;alerte</FieldLabel>
                <Input
                  {...field}
                  id="minStock"
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/produits")}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
