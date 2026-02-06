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
  if (days <= 0) return { level: "expired", label: "Périmé", color: "bg-gradient-to-r from-rose-500 to-red-500 text-white border-rose-400 shadow-sm" };
  if (days <= 7) return { level: "critical", label: "Urgent", color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-sm" };
  if (days <= 30) return { level: "warning", label: "Attention", color: "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 border-amber-300" };
  if (days <= 60) return { level: "notice", label: "Prévention", color: "bg-gradient-to-r from-sky-400 to-blue-400 text-white border-sky-300" };
  return { level: "ok", label: "Surveillance", color: "bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-emerald-300" };
}

export function ExpiryAlertCard({ batches, maxDisplay = 5 }: ExpiryAlertCardProps) {
  const criticalCount = batches.filter((b) => b.daysUntilExpiry <= 30).length;
  const warningCount = batches.filter((b) => b.daysUntilExpiry > 30 && b.daysUntilExpiry <= 60).length;

  return (
    <Card className={cn("border-border/50", batches.some(b => b.daysUntilExpiry <= 0) && "border-rose-300")}>
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
            {batches.filter(b => b.daysUntilExpiry <= 0).length > 0 && (
              <Badge variant="destructive" className="h-6 bg-rose-500">
                {batches.filter(b => b.daysUntilExpiry <= 0).length} périmé
              </Badge>
            )}
            {batches.filter(b => b.daysUntilExpiry > 0 && b.daysUntilExpiry <= 7).length > 0 && (
              <Badge className="h-6 bg-orange-500">
                {batches.filter(b => b.daysUntilExpiry > 0 && b.daysUntilExpiry <= 7).length} urgent
              </Badge>
            )}
            {batches.filter(b => b.daysUntilExpiry > 7 && b.daysUntilExpiry <= 30).length > 0 && (
              <Badge className="h-6 bg-amber-500">
                {batches.filter(b => b.daysUntilExpiry > 7 && b.daysUntilExpiry <= 30).length} attention
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
                      urgency.level === "expired" && "text-rose-600",
                      urgency.level === "critical" && "text-orange-600",
                      urgency.level === "warning" && "text-amber-600",
                      urgency.level === "notice" && "text-blue-600",
                      urgency.level === "ok" && "text-emerald-600"
                    )}>
                      {batch.daysUntilExpiry <= 0 ? `${Math.abs(batch.daysUntilExpiry)}j` : `${batch.daysUntilExpiry}j`}
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
