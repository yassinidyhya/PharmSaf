"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, CategoryLabels } from "@/lib/types";
import { createProduct } from "@/app/(dashboard)/produits/actions";
import { createProductSchema, CreateProductInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categoryLabels = CategoryLabels;

const unitOptions = ["boîte", "flacon", "unité", "comprimé", "ampoule", "tube", "sachet", "ml", "g"];

export function ProductForm() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      category: undefined,
      unit: "",
      packaging: "",
      price: undefined,
      minStock: 0,
      initialQuantity: undefined,
      batchNumber: "",
      expiryDate: "",
    },
  });

  const hasInitialStock = form.watch("initialQuantity") && form.watch("initialQuantity") > 0;

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
    if (data.initialQuantity && data.initialQuantity > 0) {
      formData.append("initialQuantity", data.initialQuantity.toString());
      if (data.batchNumber) formData.append("batchNumber", data.batchNumber);
      if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
    }

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Section: Identification */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identification</h3>
        
        <div className="space-y-1">
          <Label htmlFor="code" className="text-xs">Code produit *</Label>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} id="code" placeholder="PRD-001" className={cn("h-10", fieldState.error && "border-destructive")} />
                {fieldState.error && <p className="text-[10px] text-destructive">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Nom du produit *</Label>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} id="name" placeholder="Paracétamol 500mg" className={cn("h-10", fieldState.error && "border-destructive")} />
                {fieldState.error && <p className="text-[10px] text-destructive">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="category" className="text-xs">Catégorie *</Label>
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className={cn("h-10", fieldState.error && "border-destructive")}>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <p className="text-[10px] text-destructive">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>
      </div>

      {/* Section: Unité & Conditionnement */}
      <div className="space-y-3 pt-2 border-t">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Unité & Conditionnement</h3>
        
        <div className="space-y-1">
          <Label htmlFor="unit" className="text-xs">Unité *</Label>
          <Controller
            name="unit"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="unit" className={cn("h-10", fieldState.error && "border-destructive")}>
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <p className="text-[10px] text-destructive">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="packaging" className="text-xs">Conditionnement</Label>
          <Controller
            name="packaging"
            control={form.control}
            render={({ field }) => (
              <Input {...field} id="packaging" placeholder="Boîte de 100" className="h-10" value={field.value || ""} />
            )}
          />
        </div>
      </div>

      {/* Section: Prix & Stock */}
      <div className="space-y-3 pt-2 border-t">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Prix & Stock</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="price" className="text-xs">Prix unitaire (MAD)</Label>
            <Controller
              name="price"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-10"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="minStock" className="text-xs">Stock min. alerte</Label>
            <Controller
              name="minStock"
              control={form.control}
              render={({ field }) => (
                <Input {...field} id="minStock" type="number" min="0" className="h-10" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
              )}
            />
          </div>
        </div>
      </div>

      {/* Section: Stock Initial (Optional) */}
      <div className="space-y-3 pt-2 border-t">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stock Initial (Optionnel)</h3>
        
        <div className="space-y-1">
          <Label htmlFor="initialQuantity" className="text-xs">Quantité</Label>
          <Controller
            name="initialQuantity"
            control={form.control}
            render={({ field }) => (
              <Input
                id="initialQuantity"
                type="number"
                min="0"
                placeholder="0"
                className="h-10"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="batchNumber" className="text-xs">N° Lot</Label>
            <Controller
              name="batchNumber"
              control={form.control}
              render={({ field }) => (
                <Input {...field} id="batchNumber" placeholder="LOT-001" className="h-10" value={field.value || ""} disabled={!hasInitialStock} />
              )}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="expiryDate" className="text-xs">Date expiration</Label>
            <Controller
              name="expiryDate"
              control={form.control}
              render={({ field }) => (
                <Input {...field} id="expiryDate" type="date" className="h-10" value={field.value || ""} disabled={!hasInitialStock} />
              )}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => router.push("/produits")} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" className="flex-1 h-11" disabled={isPending}>
          {isPending ? "Création..." : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
