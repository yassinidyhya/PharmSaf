"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from "@/lib/utils";
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
    const dateKey = format(new Date(activity.date), "dd MMM", { locale: fr });
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
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  return format(new Date(date), "dd/MM");
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Count entries and exits
  const entryCount = activities.filter(a => a.type === "ENTRY").length;
  const exitCount = activities.filter(a => a.type === "EXIT").length;
  
  // Group by date
  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Stats Summary */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">{entryCount} entrée{entryCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-muted-foreground">{exitCount} sortie{exitCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
            <p className="text-sm font-medium">Aucune activité</p>
            <p className="text-xs mt-0.5">Les mouvements apparaîtront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] sm:h-[240px] pr-3">
            <div className="space-y-4">
              {groupedActivities.map((group) => (
                <div key={group.label}>
                  {/* Date Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  {/* Activities */}
                  <div className="space-y-1">
                    {group.activities.map((activity) => {
                      const isEntry = activity.type === "ENTRY";
                      
                      return (
                        <Link
                          key={activity.id}
                          href={isEntry ? `/inventaire/entrees` : `/inventaire/sorties`}
                          className={cn(
                            "group flex items-center justify-between p-2 rounded-md border transition-all",
                            "hover:bg-muted/50 hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Entry/Exit Indicator */}
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              isEntry ? "bg-emerald-500" : "bg-rose-500"
                            )} />

                            {/* Content */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm truncate" title={activity.productName}>
                                  {activity.productName}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>{formatRelativeTime(activity.date)}</span>
                                {activity.hospitalName && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[80px] sm:max-w-[120px]" title={activity.hospitalName}>
                                      {activity.hospitalName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="text-right shrink-0 ml-2">
                            <span className={cn(
                              "font-semibold text-sm",
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
          className="w-full text-xs" 
          asChild
        >
          <Link href="/inventaire">
            Voir tout l&apos;historique
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
