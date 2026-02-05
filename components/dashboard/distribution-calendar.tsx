"use client";

import Link from "next/link";
import { 
  IconCalendar,
  IconCheck,
  IconCircle,
  IconClock,
  IconTruck,
  IconArrowRight,
  IconBuildingHospital
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format, addDays, startOfQuarter, endOfQuarter, eachWeekOfInterval, isSameMonth, getWeek } from "date-fns";
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
    icon: IconCheck,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  in_progress: {
    label: "En cours",
    icon: IconTruck,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  scheduled: {
    label: "Planifié",
    icon: IconClock,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  pending: {
    label: "En attente",
    icon: IconCircle,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
  },
};

const quarterNames: Record<number, string> = {
  1: "Trimestre 1 (Jan-Mar)",
  2: "Trimestre 2 (Avr-Juin)",
  3: "Trimestre 3 (Juil-Sep)",
  4: "Trimestre 4 (Oct-Déc)",
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
  const inProgressCount = sortedEvents.filter(e => e.status === "in_progress").length;
  const pendingCount = sortedEvents.filter(e => e.status === "pending" || e.status === "scheduled").length;
  const progress = sortedEvents.length > 0 
    ? Math.round((completedCount / sortedEvents.length) * 100) 
    : 0;

  // Group events by month
  const eventsByMonth = sortedEvents.reduce((acc, event) => {
    const monthKey = format(event.scheduledDate, "MMMM yyyy", { locale: fr });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, DistributionEvent[]>);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <IconCalendar className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Calendrier Distributions</CardTitle>
              <CardDescription className="text-xs">
                {quarterNames[currentQuarter]} {currentYear}
              </CardDescription>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="text-xs text-muted-foreground">complété</div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="flex items-center gap-3 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">{completedCount} livré{completedCount > 1 ? 's' : ''}</span>
          </div>
          {inProgressCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">{inProgressCount} en cours</span>
            </div>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">{pendingCount} en attente</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {sortedEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <IconCalendar className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">Aucune distribution planifiée</p>
            <p className="text-xs mt-1">Créez une nouvelle distribution</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {month}
                </h4>
                <div className="space-y-2">
                  {monthEvents.map((event) => {
                    const status = statusConfig[event.status];
                    const StatusIcon = status.icon;
                    const isPast = event.scheduledDate < now && event.status !== "completed";

                    return (
                      <Link
                        key={event.id}
                        href={`/distributions/${event.id}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all",
                          "hover:shadow-sm hover:-translate-y-0.5 hover:bg-muted/30",
                          isPast && "border-rose-200 bg-rose-50/50"
                        )}
                      >
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted shrink-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            {format(event.scheduledDate, "EEE", { locale: fr })}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {format(event.scheduledDate, "d")}
                          </span>
                        </div>

                        {/* Hospital Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <IconBuildingHospital className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {event.hospitalName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 py-0 h-4", status.color)}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            {event.noteNumber && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {event.noteNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Dot */}
                        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", status.dotColor)} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button variant="ghost" size="sm" className="w-full gap-1" asChild>
          <Link href="/distributions">
            Voir toutes les distributions
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
