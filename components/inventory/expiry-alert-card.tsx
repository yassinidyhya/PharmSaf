"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExpiringBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  daysUntilExpiry: number;
  product: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
}

interface ExpiryAlertCardProps {
  batches: ExpiringBatch[];
  maxDisplay?: number;
}

function getUrgencyLevel(days: number) {
  if (days <= 30) return { level: "critical", label: "Critique", color: "bg-red-100 text-red-800 border-red-200" };
  if (days <= 60) return { level: "warning", label: "Attention", color: "bg-orange-100 text-orange-800 border-orange-200" };
  return { level: "notice", label: "Surveillance", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
}

export function ExpiryAlertCard({ batches, maxDisplay = 5 }: ExpiryAlertCardProps) {
  const criticalCount = batches.filter((b) => b.daysUntilExpiry <= 30).length;
  const warningCount = batches.filter((b) => b.daysUntilExpiry > 30 && b.daysUntilExpiry <= 60).length;

  return (
    <Card className={cn(criticalCount > 0 && "border-red-200")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {criticalCount > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              Alertes Peremption
            </CardTitle>
            <CardDescription>
              {batches.length} lot(s) a surveiller
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="h-6">
                {criticalCount} critique
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="default" className="h-6 bg-orange-500">
                {warningCount} attention
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {batches.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun lot ne perime dans les 90 jours</p>
          </div>
        ) : (
          <>
            {batches.slice(0, maxDisplay).map((batch) => {
              const urgency = getUrgencyLevel(batch.daysUntilExpiry);
              return (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{batch.product.name}</p>
                      <Badge variant="outline" className={cn("text-xs", urgency.color)}>
                        {urgency.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lot: {batch.batchNumber} · {formatNumber(batch.quantity)} {batch.product.unit}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className={cn(
                      "text-sm font-semibold",
                      urgency.level === "critical" && "text-red-600",
                      urgency.level === "warning" && "text-orange-600"
                    )}>
                      {batch.daysUntilExpiry}j
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(batch.expiryDate)}
                    </p>
                  </div>
                </div>
              );
            })}
            {batches.length > maxDisplay && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{batches.length - maxDisplay} autres lots...
              </p>
            )}
            <Button asChild variant="ghost" className="w-full mt-2" size="sm">
              <Link href="/inventaire/peremption">
                Voir toutes les alertes
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
