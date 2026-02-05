"use client";

import Link from "next/link";
import { 
  IconPill, 
  IconVaccine, 
  IconFlask, 
  IconPackage,
  IconTools,
  IconPaperclip,
  IconAlertCircle,
  IconCheck,
  IconArrowRight
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}> = {
  MEDICAMENT: {
    label: "Médicaments",
    icon: IconPill,
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
    description: "Stock de médicaments",
  },
  VACCIN: {
    label: "Vaccins",
    icon: IconVaccine,
    color: "emerald",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
    description: "Stock de vaccins",
  },
  REACTIF: {
    label: "Réactifs",
    icon: IconFlask,
    color: "violet",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    textColor: "text-violet-600 dark:text-violet-400",
    description: "Réactifs de laboratoire",
  },
  CONSOMMABLE: {
    label: "Consommables",
    icon: IconPackage,
    color: "amber",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-600 dark:text-amber-400",
    description: "Articles consommables",
  },
  PETIT_MATERIEL: {
    label: "Petit Matériel",
    icon: IconTools,
    color: "cyan",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    textColor: "text-cyan-600 dark:text-cyan-400",
    description: "Petit matériel médical",
  },
  MATERIEL_BUREAU: {
    label: "Matériel Bureau",
    icon: IconPaperclip,
    color: "slate",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    description: "Fournitures de bureau",
  },
};

function getStockStatus(monthsOfStock: number): {
  status: "critical" | "low" | "good" | "excess";
  label: string;
  color: string;
  progressColor: string;
} {
  if (monthsOfStock <= 1) {
    return { 
      status: "critical", 
      label: "Critique", 
      color: "text-rose-600",
      progressColor: "bg-rose-500"
    };
  }
  if (monthsOfStock <= 2) {
    return { 
      status: "low", 
      label: "Faible", 
      color: "text-amber-600",
      progressColor: "bg-amber-500"
    };
  }
  if (monthsOfStock <= 6) {
    return { 
      status: "good", 
      label: "Optimal", 
      color: "text-emerald-600",
      progressColor: "bg-emerald-500"
    };
  }
  return { 
    status: "excess", 
    label: "Excès", 
    color: "text-blue-600",
    progressColor: "bg-blue-500"
  };
}

export function CategoryStats({ data }: CategoryStatsProps) {
  // Filter out categories with no stock
  const activeCategories = data.filter(cat => cat.stock > 0);
  
  if (activeCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock par Catégorie</CardTitle>
          <CardDescription>Aucun stock disponible</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <IconPackage className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {activeCategories.map((category) => {
        const config = categoryConfig[category.category];
        const Icon = config.icon;
        
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
              "h-full transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-0.5",
              "border",
              isCritical ? "border-rose-300 ring-1 ring-rose-200" : 
              isLowStock ? "border-amber-300" : "border-border"
            )}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    config.bgColor,
                    config.textColor
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <Badge 
                    variant={isCritical ? "destructive" : isLowStock ? "warning" : "secondary"}
                    className="text-xs"
                  >
                    {isCritical ? (
                      <><IconAlertCircle className="w-3 h-3 mr-1" /> Critique</>
                    ) : isLowStock ? (
                      <><IconAlertCircle className="w-3 h-3 mr-1" /> Faible</>
                    ) : (
                      <><IconCheck className="w-3 h-3 mr-1" /> {stockStatus.label}</>
                    )}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {config.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">
                        {formatNumber(category.stock)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {category.count} produit{category.count > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={progressValue} 
                        className={cn("h-1.5 flex-1", stockStatus.progressColor)}
                      />
                      <span className={cn("text-xs font-medium whitespace-nowrap", stockStatus.color)}>
                        {monthsOfStock < 0.1 ? '< 0.1' : monthsOfStock.toFixed(1)} mois
                      </span>
                    </div>
                  </div>

                  {isLowStock && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <IconAlertCircle className="w-3 h-3" />
                      Stock faible - Réapprovisionnement conseillé
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
