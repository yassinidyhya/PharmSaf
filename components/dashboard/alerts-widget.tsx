"use client";

import Link from "next/link";
import { IconAlertCircle, IconPackageOff, IconClock, IconCheck, IconArrowRight } from "@tabler/icons-react";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    colors: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100",
    icon: IconAlertCircle,
  },
  WARNING: { 
    label: "Attention",
    colors: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100",
    icon: IconClock,
  },
  NOTICE: { 
    label: "Info",
    colors: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100",
    icon: IconClock,
  },
};

const typeLabels = {
  EXPIRY: "Péremption",
  INSULIN_EXPIRY: "Insuline",
  LOW_STOCK: "Stock",
};

const typeIcons = {
  EXPIRY: IconClock,
  INSULIN_EXPIRY: IconClock,
  LOW_STOCK: IconPackageOff,
};

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter(a => a.severity === "WARNING").length;

  // Sort alerts by severity
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, WARNING: 1, NOTICE: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Alertes</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              {alerts.length > 0 ? (
                <span className="flex items-center gap-1 sm:gap-1.5">
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
                  {alerts.length > 0 && criticalCount === 0 && warningCount === 0 && (
                    <span>{alerts.length} info</span>
                  )}
                </span>
              ) : (
                "Aucune alerte"
              )}
            </CardDescription>
          </div>
          
          {alerts.length > 0 && (
            <Badge variant="outline" className="text-[10px] sm:text-xs h-5 sm:h-6">
              {alerts.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {sortedAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 text-center">
            <IconCheck className="w-10 h-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">Tout va bien</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Aucune alerte à signaler</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAlerts.slice(0, 5).map((alert, index) => {
              const severity = severityConfig[alert.severity];
              const TypeIcon = typeIcons[alert.type];

              return (
                <Link
                  key={`${alert.productId}-${index}`}
                  href={`/produits/${alert.productId}`}
                  className={cn(
                    "block p-2 sm:p-2.5 lg:p-3 rounded-lg border transition-all",
                    "hover:shadow-sm",
                    severity.colors
                  )}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className="shrink-0 mt-0.5">
                      <TypeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {alert.productName}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs opacity-80 truncate">
                        {alert.message}
                      </p>
                      {alert.quantity !== undefined && (
                        <p className="text-[9px] sm:text-[10px] opacity-60 mt-0.5">
                          Qté: {alert.quantity}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="outline"
                      className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5 shrink-0 border-current opacity-70"
                    >
                      {typeLabels[alert.type]}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link href="/inventaire/peremption">
          <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
            <span>{sortedAlerts.length > 5 ? `Voir ${sortedAlerts.length - 5} alertes supplémentaires` : "Voir toutes les alertes"}</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  );
}
