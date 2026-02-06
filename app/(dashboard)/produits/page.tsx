import { Metadata } from "next";
import { getProducts } from "./actions";
import { ProductsTable } from "@/components/tables/products-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FilterX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryLabels } from "@/lib/types";
import { Category } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produits | Pharmacie Provinciale",
  description: "Catalogue des produits pharmaceutiques",
};

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function ProductsList({ category }: { category?: Category }) {
  const { products, total } = await getProducts(
    category ? { category } : undefined
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} produit(s) au total
        </p>
        {category && (
          <Badge variant="secondary" className="gap-2">
            Filtre: {CategoryLabels[category] || category}
            <Link href="/produits" className="hover:text-primary">
              <FilterX className="h-3 w-3" />
            </Link>
          </Badge>
        )}
      </div>
      <ProductsTable data={products} />
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const categoryParam = searchParams.category;
  const category = typeof categoryParam === "string" 
    ? (categoryParam as Category) 
    : undefined;

  // Dynamic title based on category
  const title = category 
    ? CategoryLabels[category] || "Produits"
    : "Médicaments et DM";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {category 
              ? `Produits de la catégorie ${CategoryLabels[category] || category}`
              : "Gérez votre catalogue de médicaments et dispositifs médicaux"
            }
          </p>
        </div>

        <div className="flex gap-2">
          {category && (
            <Button variant="outline" asChild>
              <Link href="/produits">
                <FilterX className="mr-2 h-4 w-4" />
                Tous les produits
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/produits/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Produit
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsList category={category} />
      </Suspense>
    </div>
  );
}
