"use client"

import * as React from "react"
import Link from "next/link"
import { IconTrendingUp, IconArrowDownLeft, IconArrowUpRight, IconArrowRight, IconActivity } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RippleButton } from "@/components/ui/ripple-button"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface MovementData {
  date: string
  entries: number
  exits: number
}

interface MovementTrendsProps {
  data: MovementData[]
  fromDate?: Date
  toDate?: Date
}

export function MovementTrends({ data, fromDate, toDate }: MovementTrendsProps) {
  // Calculate summary stats
  const stats = React.useMemo(() => {
    const totalEntries = data.reduce((sum, item) => sum + item.entries, 0)
    const totalExits = data.reduce((sum, item) => sum + item.exits, 0)
    const netChange = totalEntries - totalExits
    const trend = netChange > 0 ? "up" : netChange < 0 ? "down" : "neutral"
    
    return { totalEntries, totalExits, netChange, trend }
  }, [data])

  // Calculate period label
  const periodLabel = React.useMemo(() => {
    if (fromDate && toDate) {
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      return `${days}j`
    }
    return "Période par défaut"
  }, [fromDate, toDate])

  // Limit data points on mobile for better visualization
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Show all data on desktop, limit to last 14 on mobile
  const chartData = isMobile && data.length > 14 ? data.slice(-14) : data
  const maxValue = Math.max(...chartData.map(d => Math.max(d.entries, d.exits)), 1)
  
  // Check if there's any actual data
  const hasData = chartData.some(d => d.entries > 0 || d.exits > 0)

  if (data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Mouvements</CardTitle>
          <CardDescription className="text-xs">Entrées vs Sorties ({periodLabel})</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <IconActivity className="w-10 h-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Aucune donnée disponible</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Les mouvements apparaîtront ici</p>
        </CardContent>
        <CardFooter className="pt-0 justify-center">
          <Link href="/inventaire">
            <RippleButton 
              rippleColor="hsl(var(--primary))"
              className="text-foreground hover:text-primary hover:border-primary/50"
            >
              <span>Voir l&apos;historique complet</span>
              <IconArrowRight className="w-3 h-3 ml-1" />
            </RippleButton>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Mouvements</CardTitle>
            <CardDescription className="text-xs">Entrées vs Sorties ({periodLabel})</CardDescription>
          </div>
          <Badge 
            variant={stats.trend === "up" ? "default" : stats.trend === "down" ? "destructive" : "outline"}
            className="text-xs"
          >
            {stats.trend === "up" ? "+" : stats.trend === "down" ? "" : ""}
            {formatNumber(stats.netChange)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <StatBox 
            label="Entrées" 
            value={stats.totalEntries} 
            color="emerald"
            icon={IconArrowDownLeft}
          />
          <StatBox 
            label="Sorties" 
            value={stats.totalExits} 
            color="rose"
            icon={IconArrowUpRight}
          />
          <StatBox 
            label="Variation" 
            value={stats.netChange} 
            color={stats.trend === "up" ? "emerald" : stats.trend === "down" ? "rose" : "slate"}
            prefix={stats.netChange > 0 ? "+" : ""}
            icon={IconTrendingUp}
          />
        </div>

        {/* Sparkline Bars - Only show if there's data */}
        {hasData ? (
          <div className="space-y-3">
            {/* Entries Sparkline */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <IconArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Entrées</span>
              </div>
              <div className="flex items-end gap-[1px] sm:gap-[2px] h-10 sm:h-12">
                {chartData.map((day, i) => {
                  const height = maxValue > 0 ? (day.entries / maxValue) * 100 : 0
                  return (
                    <div
                      key={`entry-${i}`}
                      className="flex-1 bg-emerald-200 dark:bg-emerald-900/30 rounded-t-[1px] sm:rounded-t-sm relative group min-w-[2px]"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-400"
                        style={{ height: '100%' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatNumber(day.entries)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Exits Sparkline */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <IconArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-600 font-medium">Sorties</span>
              </div>
              <div className="flex items-end gap-[1px] sm:gap-[2px] h-10 sm:h-12">
                {chartData.map((day, i) => {
                  const height = maxValue > 0 ? (day.exits / maxValue) * 100 : 0
                  return (
                    <div
                      key={`exit-${i}`}
                      className="flex-1 bg-rose-200 dark:bg-rose-900/30 rounded-t-[1px] sm:rounded-t-sm relative group min-w-[2px]"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-t-sm transition-all group-hover:bg-rose-400"
                        style={{ height: '100%' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatNumber(day.exits)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <IconActivity className="w-8 h-8 mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">Aucun mouvement</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Dans cette période</p>
          </div>
        )}

      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link href="/inventaire">
          <RippleButton 
            rippleColor="hsl(var(--primary))"
            className="text-foreground hover:text-primary hover:border-primary/50"
          >
            <span>Voir l&apos;historique complet</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  )
}

interface StatBoxProps {
  label: string
  value: number
  color: "emerald" | "rose" | "slate"
  prefix?: string
  icon: React.ElementType
}

function StatBox({ label, value, color, prefix = "", icon: Icon }: StatBoxProps) {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
    slate: "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg", colorStyles[color])}>
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
        <span className="text-[9px] sm:text-[10px] uppercase font-medium opacity-80">{label}</span>
      </div>
      <span className="text-base sm:text-lg font-bold tabular-nums">
        {prefix}{formatNumber(value)}
      </span>
    </div>
  )
}
