"use client";

import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { IconChartLine, IconArrowRight, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MovementData {
  date: string;
  entries: number;
  exits: number;
}

interface MovementTrendsProps {
  data: MovementData[];
}

const chartConfig = {
  entries: {
    label: "Entrées",
    color: "var(--chart-2)",
  },
  exits: {
    label: "Sorties",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MovementTrends({ data }: MovementTrendsProps) {
  const [timeRange, setTimeRange] = React.useState<"7" | "30" | "90">("30");

  const filteredData = React.useMemo(() => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return data.filter((item) => new Date(item.date) >= cutoffDate);
  }, [data, timeRange]);

  // Calculate summary stats
  const stats = React.useMemo(() => {
    const totalEntries = filteredData.reduce((sum, item) => sum + item.entries, 0);
    const totalExits = filteredData.reduce((sum, item) => sum + item.exits, 0);
    const netChange = totalEntries - totalExits;
    const trend = netChange > 0 ? "up" : netChange < 0 ? "down" : "neutral";
    
    return { totalEntries, totalExits, netChange, trend };
  }, [filteredData]);

  // Empty state
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mouvements de Stock</CardTitle>
              <CardDescription>Entrées vs Sorties</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <IconChartLine className="size-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg">Mouvements de Stock</CardTitle>
            <CardDescription>Entrées vs Sorties sur la période</CardDescription>
          </div>
          <CardAction>
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as "7" | "30" | "90")}
            >
              <SelectTrigger className="w-[140px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>

      {/* Summary Stats */}
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <SummaryStat 
            label="Entrées"
            value={stats.totalEntries}
            color="emerald"
            icon={IconTrendingUp}
          />
          <SummaryStat 
            label="Sorties"
            value={stats.totalExits}
            color="rose"
            icon={IconTrendingDown}
          />
          <SummaryStat 
            label="Variation"
            value={stats.netChange}
            color={stats.trend === "up" ? "emerald" : stats.trend === "down" ? "rose" : "gray"}
            prefix={stats.netChange > 0 ? "+" : ""}
            trend={stats.trend}
          />
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="fillEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-entries)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-entries)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-exits)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-exits)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                });
              }}
              style={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value as string)}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="entries"
              type="monotone"
              fill="url(#fillEntries)"
              stroke="var(--color-entries)"
              strokeWidth={2}
            />
            <Area
              dataKey="exits"
              type="monotone"
              fill="url(#fillExits)"
              stroke="var(--color-exits)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="pt-2">
        <Button variant="ghost" size="sm" className="w-full gap-1" asChild>
          <Link href="/inventaire">
            Voir l&apos;historique complet
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface SummaryStatProps {
  label: string;
  value: number;
  color: "emerald" | "rose" | "gray" | "blue";
  icon?: React.ElementType;
  prefix?: string;
  trend?: "up" | "down" | "neutral";
}

function SummaryStat({ label, value, color, icon: Icon, prefix = "", trend }: SummaryStatProps) {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    gray: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-2 rounded-lg",
      colorStyles[color]
    )}>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-lg font-bold">
          {prefix}{formatNumber(value)}
        </span>
      </div>
    </div>
  );
}
