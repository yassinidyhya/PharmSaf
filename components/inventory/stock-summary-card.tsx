"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  icon: "package" | "alert" | "calendar" | "dollar" | "trendingUp" | "trendingDown";
  variant?: "default" | "warning" | "danger" | "success";
  className?: string;
}

const iconMap = {
  package: Package,
  alert: AlertTriangle,
  calendar: Calendar,
  dollar: DollarSign,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
};

const variantStyles = {
  default: {
    card: "",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  warning: {
    card: "border-yellow-200 bg-yellow-50/30",
    icon: "bg-yellow-100 text-yellow-600",
    value: "text-yellow-700",
  },
  danger: {
    card: "border-red-200 bg-red-50/30",
    icon: "bg-red-100 text-red-600",
    value: "text-red-700",
  },
  success: {
    card: "border-green-200 bg-green-50/30",
    icon: "bg-green-100 text-green-600",
    value: "text-green-700",
  },
};

export function StockSummaryCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = "default",
  className,
}: StockSummaryCardProps) {
  const Icon = iconMap[icon];
  const styles = variantStyles[variant];

  return (
    <Card className={cn(styles.card, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-md", styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", styles.value)}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.direction === "up" && "text-green-600",
                trend.direction === "down" && "text-red-600",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.direction === "up" && "+"}
              {trend.direction === "down" && "-"}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
