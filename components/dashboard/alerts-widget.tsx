"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
    colors: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100",
  },
  WARNING: { 
    label: "Attention",
    colors: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100",
  },
  NOTICE: { 
    label: "Info",
    colors: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100",
  },
};

const typeLabels = {
  EXPIRY: "Péremption",
  INSULIN_EXPIRY: "Insuline",
  LOW_STOCK: "Stock",
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
            <Badge variant="outline" className="text-xs">
              {alerts.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {sortedAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-6">
            <p className="text-sm font-medium">Tout va bien</p>
            <p className="text-xs mt-0.5">Aucune alerte à signaler</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAlerts.slice(0, 5).map((alert, index) => {
              const severity = severityConfig[alert.severity];

              return (
                <Link
                  key={`${alert.productId}-${index}`}
                  href={`/produits/${alert.productId}`}
                  className={cn(
                    "block p-2.5 sm:p-3 rounded-lg border transition-all",
                    "hover:shadow-sm",
                    severity.colors
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate">
                          {alert.productName}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 truncate">
                        {alert.message}
                      </p>
                      {alert.quantity !== undefined && (
                        <p className="text-[10px] opacity-60 mt-0.5">
                          Qté: {alert.quantity}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 shrink-0 border-current opacity-70"
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

      {sortedAlerts.length > 5 && (
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground text-xs"
          >
            Voir {sortedAlerts.length - 5} alertes supplémentaires
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
