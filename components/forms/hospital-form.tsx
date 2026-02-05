"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Hospital, HospitalType } from "@prisma/client";
import { createHospital, updateHospital } from "@/app/(dashboard)/hopitaux/actions";
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

const hospitalSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  type: z.nativeEnum(HospitalType, {
    errorMap: () => ({ message: "Le type est requis" }),
  }),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  bedCapacity: z.coerce.number().min(0).optional(),
});

type HospitalInput = z.infer<typeof hospitalSchema>;

const typeLabels: Record<HospitalType, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

interface HospitalFormProps {
  hospital?: Hospital;
  onSuccess?: () => void;
}

export function HospitalForm({ hospital, onSuccess }: HospitalFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const isEditing = !!hospital;

  const form = useForm<HospitalInput>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      code: hospital?.code || "",
      name: hospital?.name || "",
      type: hospital?.type || undefined,
      address: hospital?.address || "",
      phone: hospital?.phone || "",
      email: hospital?.email || "",
      bedCapacity: hospital?.bedCapacity || undefined,
    },
  });

  async function onSubmit(data: HospitalInput) {
    setIsPending(true);

    const formData = new FormData();
    formData.append("code", data.code);
    formData.append("name", data.name);
    formData.append("type", data.type);
    if (data.address) formData.append("address", data.address);
    if (data.phone) formData.append("phone", data.phone);
    if (data.email) formData.append("email", data.email);
    if (data.bedCapacity !== undefined)
      formData.append("bedCapacity", data.bedCapacity.toString());

    const result = isEditing
      ? await updateHospital(hospital.id, formData)
      : await createHospital(formData);

    if (result.success) {
      toast.success(
        isEditing
          ? "Hôpital mis à jour avec succès"
          : "Hôpital créé avec succès"
      );
      onSuccess?.();
      if (!isEditing) {
        router.push("/hopitaux");
      }
      router.refresh();
    } else {
      toast.error(result.error || "Erreur lors de l'enregistrement");
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
                  placeholder="HOP-001"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Type */}
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="type">Type *</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="type" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
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
              <FieldLabel htmlFor="name">Nom de l&apos;hôpital *</FieldLabel>
              <Input
                {...field}
                id="name"
                placeholder="Hôpital Provincial Essaouira"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Address */}
        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="address">Adresse</FieldLabel>
              <Input
                {...field}
                id="address"
                placeholder="123 Rue principale, Essaouira"
                aria-invalid={fieldState.invalid}
                value={field.value || ""}
              />
              <FieldDescription>Adresse complète de l&apos;établissement</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Phone */}
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
                <Input
                  {...field}
                  id="phone"
                  placeholder="+212 5XX-XXXXXX"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="contact@hopital.ma"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Bed Capacity */}
        <Controller
          name="bedCapacity"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="bedCapacity">Capacité en lits</FieldLabel>
              <Input
                {...field}
                id="bedCapacity"
                type="number"
                min="0"
                placeholder="100"
                aria-invalid={fieldState.invalid}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : parseInt(e.target.value)
                  )
                }
              />
              <FieldDescription>Nombre total de lits disponibles</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-4">
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/hopitaux")}
            disabled={isPending}
          >
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer l'hôpital"}
        </Button>
      </div>
    </form>
  );
}
