import { Metadata } from "next";
import { getProducts } from "./actions";
import { ProductsTable } from "@/components/tables/products-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produits | Pharmacie Provinciale",
  description: "Catalogue des produits pharmaceutiques",
};

async function ProductsList() {
  const { products, total } = await getProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} produit(s) au total
        </p>
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

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits pharmaceutiques
          </p>
        </div>

        <Button asChild>
          <Link href="/produits/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Produit
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
