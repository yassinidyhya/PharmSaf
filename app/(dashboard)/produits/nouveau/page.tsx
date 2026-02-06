"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/forms/product-form";

export default function NewProductPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2" asChild>
            <Link href="/produits">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Nouveau Produit</h1>
            <p className="text-xs text-muted-foreground">Ajouter au catalogue</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 p-4">
        <ProductForm />
      </main>
    </div>
  );
}
