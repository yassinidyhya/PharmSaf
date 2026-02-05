"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Category } from "@prisma/client";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CategoryStat {
  category: Category;
  count: number;
  stock: number;
  value: number;
  avgMonthlyConsumption: number;
  minStock: number;
}

interface CategoryStatsProps {
  data: CategoryStat[];
}

const categoryConfig: Record<Category, {
  label: string;
  color: string;
  progressColor: string;
}> = {
  MEDICAMENT: {
    label: "Médicaments",
    color: "text-blue-600 dark:text-blue-400",
    progressColor: "bg-blue-500",
  },
  VACCIN: {
    label: "Vaccins",
    color: "text-emerald-600 dark:text-emerald-400",
    progressColor: "bg-emerald-500",
  },
  REACTIF: {
    label: "Réactifs",
    color: "text-violet-600 dark:text-violet-400",
    progressColor: "bg-violet-500",
  },
  CONSOMMABLE: {
    label: "Consommables",
    color: "text-amber-600 dark:text-amber-400",
    progressColor: "bg-amber-500",
  },
  PETIT_MATERIEL: {
    label: "Petit Matériel",
    color: "text-cyan-600 dark:text-cyan-400",
    progressColor: "bg-cyan-500",
  },
  MATERIEL_BUREAU: {
    label: "Matériel Bureau",
    color: "text-slate-600 dark:text-slate-400",
    progressColor: "bg-slate-500",
  },
};

function getStockStatus(monthsOfStock: number): {
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
} {
  if (monthsOfStock <= 1) {
    return { label: "Critique", badgeVariant: "destructive" };
  }
  if (monthsOfStock <= 2) {
    return { label: "Faible", badgeVariant: "secondary" };
  }
  if (monthsOfStock <= 6) {
    return { label: "Optimal", badgeVariant: "outline" };
  }
  return { label: "Excès", badgeVariant: "default" };
}

export function CategoryStats({ data }: CategoryStatsProps) {
  // Filter out categories with no stock and sort by stock value
  const activeCategories = data
    .filter(cat => cat.stock > 0)
    .sort((a, b) => b.value - a.value);
  
  if (activeCategories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p className="text-sm">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {activeCategories.map((category) => {
        const config = categoryConfig[category.category];
        
        // Calculate months of stock
        const monthsOfStock = category.avgMonthlyConsumption > 0 
          ? category.stock / category.avgMonthlyConsumption 
          : category.stock > 0 ? 12 : 0;
        
        const stockStatus = getStockStatus(monthsOfStock);
        const isLowStock = monthsOfStock <= 2;
        const isCritical = monthsOfStock <= 1;

        // Progress bar value (max 12 months)
        const progressValue = Math.min((monthsOfStock / 12) * 100, 100);

        return (
          <Link 
            key={category.category} 
            href={`/produits?category=${category.category}`}
            className="block group"
          >
            <Card className={cn(
              "h-full transition-all duration-200",
              "hover:shadow-md hover:border-primary/20",
              "border",
              isCritical ? "border-rose-200" : 
              isLowStock ? "border-amber-200" : "border-border/50"
            )}>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "font-semibold text-sm sm:text-base group-hover:text-primary transition-colors",
                      config.color
                    )}>
                      {config.label}
                    </h3>
                    <Badge 
                      variant={stockStatus.badgeVariant}
                      className="text-[10px]"
                    >
                      {stockStatus.label}
                    </Badge>
                  </div>

                  {/* Stock Info */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold">
                      {formatNumber(category.stock)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {category.count} produit{category.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <Progress 
                      value={progressValue} 
                      className={cn("h-1.5", config.progressColor)}
                    />
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>Stock</span>
                      <span>
                        {monthsOfStock < 0.1 ? '< 0.1' : monthsOfStock.toFixed(1)} mois
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
