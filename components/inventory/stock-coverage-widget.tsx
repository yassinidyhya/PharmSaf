"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CoverageItem {
  category: Category;
  label: string;
  monthsOfStock: number;
  optimalRange: { min: number; max: number };
  stockValue: number;
}

interface StockCoverageWidgetProps {
  data: CoverageItem[];
}

const categoryColors: Record<Category, { bg: string; text: string; bar: string }> = {
  MEDICAMENT: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  VACCIN: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  REACTIF: { bg: "bg-purple-50", text: "text-purple-700", bar: "bg-purple-500" },
  CONSOMMABLE: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" },
  PETIT_MATERIEL: { bg: "bg-gray-50", text: "text-gray-700", bar: "bg-gray-500" },
  MATERIEL_BUREAU: { bg: "bg-slate-50", text: "text-slate-700", bar: "bg-slate-500" },
};

function getStockStatus(months: number, optimalRange: { min: number; max: number }) {
  if (months < optimalRange.min) {
    return { label: "Critique", color: "text-red-600", bgColor: "bg-red-100" };
  }
  if (months > optimalRange.max) {
    return { label: "Eleve", color: "text-orange-600", bgColor: "bg-orange-100" };
  }
  return { label: "Optimal", color: "text-green-600", bgColor: "bg-green-100" };
}

export function StockCoverageWidget({ data }: StockCoverageWidgetProps) {
  const totalValue = data.reduce((sum, item) => sum + item.stockValue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Couverture par Categorie</CardTitle>
        <CardDescription>
          Valeur totale: {totalValue.toLocaleString("fr-FR", { style: "currency", currency: "MAD" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const colors = categoryColors[item.category];
          const status = getStockStatus(item.monthsOfStock, item.optimalRange);
          const progressValue = Math.min((item.monthsOfStock / 12) * 100, 100);

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {item.label}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bgColor, status.color)}>
                    {status.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{item.monthsOfStock.toFixed(1)} mois</span>
                </div>
              </div>
              <Progress 
                value={progressValue} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Optimal: {item.optimalRange.min}-{item.optimalRange.max} mois</span>
                <span>{item.stockValue.toLocaleString("fr-FR", { style: "currency", currency: "MAD" })}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
