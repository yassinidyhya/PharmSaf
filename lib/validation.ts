import { z } from "zod";
import { CategoryEnum } from "@/lib/types";

export const createProductSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  category: z.nativeEnum(CategoryEnum, {
    message: "La catégorie est requise",
  }),
  unit: z.string().min(1, "L'unité est requise"),
  packaging: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif").optional(),
  minStock: z.coerce.number().min(0, "Le stock minimum doit être positif").default(0),
  // Optional initial stock fields
  initialQuantity: z.coerce.number().min(0).optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
