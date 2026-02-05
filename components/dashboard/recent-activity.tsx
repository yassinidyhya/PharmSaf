"use client";

import Link from "next/link";
import { 
  IconArrowRight,
  IconPackageImport,
  IconPackageExport,
  IconHistory,
  IconCalendar,
  IconClock
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatNumber, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { isToday, isYesterday, format } from "date-fns";
import { fr } from "date-fns/locale";

interface Activity {
  id: string;
  type: "ENTRY" | "EXIT";
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  date: Date;
  reference?: string;
  hospitalName?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

// Group activities by time period
function groupActivitiesByDate(activities: Activity[]) {
  const groups: { label: string; activities: Activity[] }[] = [];
  
  const today: Activity[] = [];
  const yesterday: Activity[] = [];
  const earlier: Activity[] = [];
  
  activities.forEach((activity) => {
    const date = new Date(activity.date);
    if (isToday(date)) {
      today.push(activity);
    } else if (isYesterday(date)) {
      yesterday.push(activity);
    } else {
      earlier.push(activity);
    }
  });
  
  if (today.length > 0) {
    groups.push({ label: "Aujourd'hui", activities: today });
  }
  if (yesterday.length > 0) {
    groups.push({ label: "Hier", activities: yesterday });
  }
  
  // Group earlier by day
  const dayMap = new Map<string, Activity[]>();
  earlier.forEach((activity) => {
    const dateKey = format(new Date(activity.date), "dd MMM yyyy", { locale: fr });
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, []);
    }
    dayMap.get(dateKey)!.push(activity);
  });
  
  dayMap.forEach((activities, label) => {
    groups.push({ label, activities });
  });
  
  return groups;
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return formatDate(date);
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Count entries and exits
  const entryCount = activities.filter(a => a.type === "ENTRY").length;
  const exitCount = activities.filter(a => a.type === "EXIT").length;
  
  // Group by date
  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <IconHistory className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Activité Récente</CardTitle>
              <CardDescription className="text-xs">
                {activities.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-medium">
                      {entryCount} entrée{entryCount !== 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span className="text-rose-600 font-medium">
                      {exitCount} sortie{exitCount !== 1 ? 's' : ''}
                    </span>
                  </span>
                ) : (
                  "Derniers mouvements de stock"
                )}
              </CardDescription>
            </div>
          </div>
          
          {activities.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {activities.length} récents
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <IconHistory className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">Aucune activité</p>
            <p className="text-xs mt-0.5">Les mouvements apparaîtront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[240px] pr-3">
            <div className="space-y-3">
              {groupedActivities.map((group) => (
                <div key={group.label}>
                  {/* Date Header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <IconCalendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  {/* Activities */}
                  <div className="space-y-1.5">
                    {group.activities.map((activity) => {
                      const isEntry = activity.type === "ENTRY";
                      const Icon = isEntry ? IconPackageImport : IconPackageExport;
                      
                      return (
                        <Link
                          key={activity.id}
                          href={isEntry ? `/inventaire/entrees` : `/inventaire/sorties`}
                          className={cn(
                            "group flex items-center gap-2.5 p-2 rounded-md border transition-all",
                            "hover:shadow-sm hover:bg-muted/30 hover:border-primary/20"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                            isEntry 
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" 
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm truncate" title={activity.productName}>
                                {activity.productName}
                              </span>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1 py-0 h-3.5 shrink-0",
                                  isEntry 
                                    ? "text-emerald-600 border-emerald-200 dark:border-emerald-800" 
                                    : "text-rose-600 border-rose-200 dark:border-rose-800"
                                )}
                              >
                                {isEntry ? "Entrée" : "Sortie"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5" title={formatDateTime(activity.date)}>
                                <IconClock className="w-3 h-3" />
                                {formatRelativeTime(activity.date)}
                              </span>
                              {activity.hospitalName && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[100px]" title={activity.hospitalName}>
                                    {activity.hospitalName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="text-right shrink-0">
                            <span className={cn(
                              "font-bold text-sm",
                              isEntry ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {isEntry ? "+" : "-"}{formatNumber(activity.quantity)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-0.5">
                              {activity.unit}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full gap-1" 
          asChild
        >
          <Link href="/inventaire">
            Voir tout l&apos;historique
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
