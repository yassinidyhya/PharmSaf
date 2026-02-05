"use client";

import Link from "next/link";
import { 
  IconAlertCircle, 
  IconPackageOff, 
  IconClock,
  IconTrendingDown,
  IconArrowRight,
  IconCheck
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  type: "EXPIRY" | "LOW_STOCK" | "INSULIN_EXPIRY";
  severity: "CRITICAL" | "WARNING" | "NOTICE";
  productId: string;
  productName: string;
  productCode: string;
  message: string;
  date: Date;
  quantity?: number;
}

interface AlertsWidgetProps {
  alerts: Alert[];
}

const severityConfig = {
  CRITICAL: { 
    label: "Critique",
    badge: "destructive" as const,
    icon: IconAlertCircle,
    colors: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
    dotColor: "bg-rose-500",
  },
  WARNING: { 
    label: "Attention",
    badge: "warning" as const,
    icon: IconClock,
    colors: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  NOTICE: { 
    label: "Info",
    badge: "secondary" as const,
    icon: IconTrendingDown,
    colors: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
};

const typeConfig = {
  EXPIRY: { icon: IconClock, label: "Péremption" },
  INSULIN_EXPIRY: { icon: IconClock, label: "Insuline" },
  LOW_STOCK: { icon: IconPackageOff, label: "Stock faible" },
};

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter(a => a.severity === "WARNING").length;
  const noticeCount = alerts.filter(a => a.severity === "NOTICE").length;

  // Sort alerts by severity
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, WARNING: 1, NOTICE: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <IconAlertCircle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Alertes</CardTitle>
              <CardDescription className="text-xs">
                {alerts.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    {criticalCount > 0 && (
                      <span className="text-rose-600 font-medium">
                        {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {criticalCount > 0 && warningCount > 0 && <span>•</span>}
                    {warningCount > 0 && (
                      <span className="text-amber-600 font-medium">
                        {warningCount} avertissement{warningCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {(criticalCount === 0 && warningCount === 0) && noticeCount > 0 && (
                      <span>{noticeCount} info{noticeCount > 1 ? 's' : ''}</span>
                    )}
                  </span>
                ) : (
                  "Aucune alerte active"
                )}
              </CardDescription>
            </div>
          </div>
          
          {alerts.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {alerts.length} total
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {sortedAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3">
              <IconCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">Tout va bien !</p>
            <p className="text-xs mt-1">Aucune alerte à signaler</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAlerts.slice(0, 5).map((alert, index) => {
              const severity = severityConfig[alert.severity];
              const type = typeConfig[alert.type];
              const Icon = type.icon;

              return (
                <Link
                  key={`${alert.productId}-${index}`}
                  href={`/produits/${alert.productId}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all",
                    "hover:shadow-sm hover:-translate-y-0.5",
                    severity.colors
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 opacity-70" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {alert.productName}
                      </span>
                      <Badge 
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0 border-current opacity-70"
                      >
                        {severity.label}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-80 truncate">
                      {alert.message}
                    </p>
                    {alert.quantity !== undefined && (
                      <p className="text-[10px] opacity-60 mt-0.5">
                        Qté disponible: {alert.quantity}
                      </p>
                    )}
                  </div>

                  <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", severity.dotColor)} />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>

      {sortedAlerts.length > 5 && (
        <CardFooter className="pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground"
          >
            Voir {sortedAlerts.length - 5} alertes supplémentaires
            <IconArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
