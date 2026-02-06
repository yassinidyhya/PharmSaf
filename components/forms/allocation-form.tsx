"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Field,
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

const allocationSchema = z.object({
  category: z.nativeEnum(Category, {
    message: "La catégorie est requise",
  }),
  year: z.coerce.number().min(2020).max(2100),
  budget: z.coerce.number().min(0, "Le budget doit être positif"),
});

const updateAllocationSchema = z.object({
  budget: z.coerce.number().min(0, "Le budget doit être positif"),
});

type AllocationInput = z.infer<typeof allocationSchema>;
type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

interface Allocation {
  id: string;
  category: Category;
  year: number;
  budget: number;
  q1Consumed: number;
  q2Consumed: number;
  q3Consumed: number;
  q4Consumed: number;
}

interface AllocationFormProps {
  allocation?: Allocation;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function AllocationForm({ allocation, onSubmit }: AllocationFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!allocation;

  const currentYear = new Date().getFullYear();

  const form = useForm<AllocationInput>({
    resolver: zodResolver(isEditing ? updateAllocationSchema : allocationSchema) as any,
    defaultValues: {
      category: allocation?.category || undefined,
      year: allocation?.year || currentYear,
      budget: allocation?.budget ? Number(allocation.budget) : undefined,
    },
  });

  async function handleSubmit(data: AllocationInput) {
    setIsPending(true);
    setError(null);

    const formData = new FormData();
    if (!isEditing) {
      formData.append("category", data.category);
      formData.append("year", data.year.toString());
    }
    formData.append("budget", data.budget.toString());

    const result = await onSubmit(formData);

    if (!result.success) {
      setError(result.error || "Une erreur est survenue");
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <FieldGroup className="gap-6">
        {!isEditing && (
          <>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || currentYear)
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </>
        )}

        {/* Budget */}
        <Controller
          name="budget"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="budget">Budget (MAD) *</FieldLabel>
              <Input
                {...field}
                id="budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="100000"
                aria-invalid={fieldState.invalid}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Enregistrement..."
            : isEditing
            ? "Modifier le budget"
            : "Créer l'allocation"}
        </Button>
      </div>
    </form>
  );
}
