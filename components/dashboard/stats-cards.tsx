"use client";

import Link from "next/link";
import { 
  IconPackage, 
  IconAlertTriangle, 
  IconCoin, 
  IconCalendarClock,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";
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
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  alert: boolean;
  variant: "blue" | "amber" | "emerald" | "rose";
}

export function StatsCards({ stats }: StatsCardsProps) {
  const netChange = stats.monthlyStockChange.entries - stats.monthlyStockChange.exits;
  
  const cards: StatCard[] = [
    {
      title: "Total Produits",
      value: formatNumber(stats.totalProducts),
      href: "/produits",
      icon: IconPackage,
      trend: netChange > 0 ? "up" : netChange < 0 ? "down" : "neutral",
      trendValue: `${netChange >= 0 ? "+" : ""}${netChange} ce mois`,
      alert: false,
      variant: "blue",
    },
    {
      title: "Stock Faible",
      value: formatNumber(stats.lowStockCount),
      href: "/inventaire",
      icon: IconAlertTriangle,
      trend: stats.lowStockCount > 0 ? "down" : "neutral",
      trendValue: `${stats.lowStockCount} alerte${stats.lowStockCount !== 1 ? 's' : ''}`,
      alert: stats.lowStockCount > 0,
      variant: "amber",
    },
    {
      title: "Valeur du Stock",
      value: formatCurrency(stats.totalStockValue),
      href: "/rapports",
      icon: IconCoin,
      trend: "neutral",
      trendValue: "En temps réel",
      alert: false,
      variant: "emerald",
    },
    {
      title: "Périmant < 30j",
      value: formatNumber(stats.criticalExpiryCount),
      href: "/inventaire/peremption",
      icon: IconCalendarClock,
      trend: stats.criticalExpiryCount > 0 ? "down" : "neutral",
      trendValue: `${stats.criticalExpiryCount} lot${stats.criticalExpiryCount !== 1 ? 's' : ''}`,
      alert: stats.criticalExpiryCount > 0,
      variant: "rose",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

function StatCard({ title, value, href, icon: Icon, trend, trendValue, alert, variant }: StatCard) {
  const variantStyles = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      border: "border-blue-200/50 dark:border-blue-800/30",
      trendUp: "text-blue-600 dark:text-blue-400",
      trendDown: "text-blue-600 dark:text-blue-400",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      border: alert ? "border-amber-300 dark:border-amber-700" : "border-amber-200/50 dark:border-amber-800/30",
      trendUp: "text-amber-600 dark:text-amber-400",
      trendDown: "text-amber-600 dark:text-amber-400",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      trendUp: "text-emerald-600 dark:text-emerald-400",
      trendDown: "text-emerald-600 dark:text-emerald-400",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-rose-900/10",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      border: alert ? "border-rose-300 dark:border-rose-700" : "border-rose-200/50 dark:border-rose-800/30",
      trendUp: "text-rose-600 dark:text-rose-400",
      trendDown: "text-rose-600 dark:text-rose-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Link href={href} className="block group">
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-0.5",
          "border",
          styles.bg,
          styles.border,
          alert && "ring-1 ring-inset ring-opacity-50"
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                styles.iconBg,
                "transition-transform duration-300 group-hover:scale-110"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Value */}
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  {title}
                </p>
              </div>
            </div>

            {/* Trend Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "h-6 text-xs gap-1 font-medium",
                "bg-white/50 dark:bg-black/20",
                trend === "up" && styles.trendUp,
                trend === "down" && styles.trendDown,
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              <TrendIcon trend={trend} />
              <span>{trendValue}</span>
            </Badge>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <IconArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up") return <IconTrendingUp className="w-3.5 h-3.5" />;
  if (trend === "down") return <IconTrendingDown className="w-3.5 h-3.5" />;
  return <IconMinus className="w-3.5 h-3.5" />;
}
