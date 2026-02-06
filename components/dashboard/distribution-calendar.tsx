"use client";

import Link from "next/link";
import { IconCalendar, IconCheck, IconClock, IconCircle, IconTruckDelivery, IconArrowRight } from "@tabler/icons-react";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";

interface DistributionEvent {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCode: string;
  scheduledDate: Date;
  status: "completed" | "in_progress" | "scheduled" | "pending";
  noteNumber?: string;
  quarter: number;
  year: number;
}

interface DistributionCalendarProps {
  events: DistributionEvent[];
}

const statusConfig = {
  completed: {
    label: "Livré",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
    icon: IconCheck,
  },
  in_progress: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300",
    dotColor: "bg-blue-500",
    icon: IconTruckDelivery,
  },
  scheduled: {
    label: "Planifié",
    color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300",
    dotColor: "bg-amber-500",
    icon: IconClock,
  },
  pending: {
    label: "En attente",
    color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300",
    dotColor: "bg-slate-400",
    icon: IconCircle,
  },
};

const quarterNames: Record<number, string> = {
  1: "T1",
  2: "T2",
  3: "T3",
  4: "T4",
};

export function DistributionCalendar({ events }: DistributionCalendarProps) {
  const now = new Date();
  const currentQuarter = Math.floor((now.getMonth() / 3)) + 1;
  const currentYear = now.getFullYear();
  
  // Filter events for current quarter
  const quarterEvents = events.filter(
    e => e.quarter === currentQuarter && e.year === currentYear
  );
  
  // Sort by date
  const sortedEvents = [...quarterEvents].sort(
    (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()
  );

  // Calculate stats
  const completedCount = sortedEvents.filter(e => e.status === "completed").length;
  const pendingCount = sortedEvents.filter(e => e.status === "pending" || e.status === "scheduled").length;
  const progress = sortedEvents.length > 0 
    ? Math.round((completedCount / sortedEvents.length) * 100) 
    : 0;

  // Group events by month
  const eventsByMonth = sortedEvents.reduce((acc, event) => {
    const monthKey = format(event.scheduledDate, "MMMM", { locale: fr });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, typeof sortedEvents>);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Distributions</CardTitle>
            <CardDescription className="text-xs">
              {quarterNames[currentQuarter]} {currentYear} • {progress}% complété
            </CardDescription>
          </div>
          
          <div className="text-right">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{completedCount}/{sortedEvents.length}</div>
            <div className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">livrées</div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">{completedCount} livrée{completedCount > 1 ? 's' : ''}</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">{pendingCount} en attente</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {sortedEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 text-center">
            <IconTruckDelivery className="w-10 h-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">Aucune distribution</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Les livraisons apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                  {month}
                </h4>
                <div className="space-y-1.5">
                  {monthEvents.map((event) => {
                    const status = statusConfig[event.status];
                    const isPastEvent = isPast(event.scheduledDate) && event.status !== "completed";

                    return (
                      <Link
                        key={event.id}
                        href={`/distributions/${event.id}`}
                        className={cn(
                          "flex items-center gap-2 sm:gap-3 p-2 rounded-lg border transition-all",
                          "hover:bg-muted/50",
                          isPastEvent ? "border-rose-200 bg-rose-50/30" : "border-border/50"
                        )}
                      >
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-muted shrink-0">
                          <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase">
                            {format(event.scheduledDate, "EEE", { locale: fr }).slice(0, 3)}
                          </span>
                          <span className="text-xs sm:text-sm font-bold leading-none">
                            {format(event.scheduledDate, "d")}
                          </span>
                        </div>

                        {/* Hospital Info */}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm truncate block">
                            {event.hospitalName}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1 py-0 h-4", status.color)}
                            >
                              {status.label}
                            </Badge>
                            {event.noteNumber && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {event.noteNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Dot */}
                        <div className={cn("w-2 h-2 rounded-full shrink-0", status.dotColor)} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link href="/distributions">
          <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
            <span>Voir toutes les distributions</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  );
}
