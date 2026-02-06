"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalProducts: number;
    totalStockValue: number;
    lowStockCount: number;
    criticalExpiryCount: number;
    monthlyStockChange: {
      entries: number;
      exits: number;
    };
  };
}

interface StatCard {
  title: string;
  value: string;
  href: string;
  subtitle: string;
  alert: boolean;
  variant: "default" | "warning" | "danger" | "success";
}

export function StatsCards({ stats }: StatsCardsProps) {
  const netChange = stats.monthlyStockChange.entries - stats.monthlyStockChange.exits;
  
  const cards: StatCard[] = [
    {
      title: "Total Produits",
      value: formatNumber(stats.totalProducts),
      href: "/produits",
      subtitle: `${netChange >= 0 ? "+" : ""}${netChange} ce mois`,
      alert: false,
      variant: "default",
    },
    {
      title: "Stock Faible",
      value: formatNumber(stats.lowStockCount),
      href: "/inventaire",
      subtitle: stats.lowStockCount > 0 
        ? `${stats.lowStockCount} alerte${stats.lowStockCount !== 1 ? 's' : ''}` 
        : "Aucune alerte",
      alert: stats.lowStockCount > 0,
      variant: stats.lowStockCount > 0 ? "warning" : "default",
    },
    {
      title: "Valeur du Stock",
      value: formatCurrency(stats.totalStockValue),
      href: "/rapports",
      subtitle: "En temps réel",
      alert: false,
      variant: "success",
    },
    {
      title: "Péremption",
      value: formatNumber(stats.criticalExpiryCount),
      href: "/inventaire/peremption",
      subtitle: stats.criticalExpiryCount > 0 
        ? `${stats.criticalExpiryCount} lot${stats.criticalExpiryCount !== 1 ? 's' : ''} < 30j`
        : "Aucune alerte",
      alert: stats.criticalExpiryCount > 0,
      variant: stats.criticalExpiryCount > 0 ? "warning" : "default",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

function StatCard({ title, value, href, subtitle, alert, variant }: StatCard) {
  const variantStyles = {
    default: {
      border: "border-border/50",
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    },
    warning: {
      border: alert ? "border-amber-300" : "border-border/50",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    danger: {
      border: alert ? "border-rose-300" : "border-border/50",
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    },
    success: {
      border: "border-border/50",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Link href={href} className="block group">
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          "hover:shadow-md hover:border-primary/20",
          "border",
          styles.border
        )}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2">
            {/* Title */}
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {title}
            </p>
            
            {/* Value */}
            <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            
            {/* Subtitle Badge */}
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] sm:text-xs font-normal",
                styles.badge
              )}
            >
              {subtitle}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
