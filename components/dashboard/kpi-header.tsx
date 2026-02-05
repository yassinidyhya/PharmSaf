"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface KpiHeaderProps {
  stats: {
    totalProducts: number
    newProductsThisMonth: number
    totalStockValue: number
    lowStockCount: number
    criticalExpiryCount: number
    distributionsCompleted: number
    distributionsTotal: number
    hospitalsActive: number
  }
  timeRange: "7" | "30" | "90" | "365"
  onTimeRangeChange: (value: "7" | "30" | "90" | "365") => void
}

const timeRangeLabels: Record<string, string> = {
  "7": "7J",
  "30": "30J",
  "90": "90J",
  "365": "1AN",
}

export function KpiHeader({ stats, timeRange, onTimeRangeChange }: KpiHeaderProps) {
  const { user } = useUser()
  const today = new Date()
  
  const firstName = user?.firstName || user?.username?.split(" ")[0] || "Utilisateur"
  const hour = today.getHours()
  let greeting = "Bonjour"
  if (hour >= 12 && hour < 18) greeting = "Bon après-midi"
  else if (hour >= 18) greeting = "Bonsoir"

  const kpis = [
    {
      label: "Produits",
      value: formatNumber(stats.totalProducts),
      subtext: `+${stats.newProductsThisMonth} ce mois`,
      href: "/produits",
      variant: "default" as const,
    },
    {
      label: "Stock",
      value: formatCurrency(stats.totalStockValue),
      subtext: "Valeur totale",
      href: "/inventaire",
      variant: "default" as const,
    },
    {
      label: "Alertes",
      value: formatNumber(stats.lowStockCount),
      subtext: "Stock faible",
      href: "/inventaire",
      variant: stats.lowStockCount > 0 ? "destructive" : "default" as const,
    },
    {
      label: "Périmant",
      value: formatNumber(stats.criticalExpiryCount),
      subtext: "< 30 jours",
      href: "/inventaire/peremption",
      variant: stats.criticalExpiryCount > 0 ? "warning" : "default" as const,
    },
    {
      label: "Distros",
      value: `${stats.distributionsCompleted}/${stats.distributionsTotal}`,
      subtext: `T${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`,
      href: "/distributions",
      variant: "default" as const,
    },
    {
      label: "Hôpitaux",
      value: formatNumber(stats.hospitalsActive),
      subtext: "Actifs",
      href: "/hopitaux",
      variant: "default" as const,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Top Bar: Greeting + Date + Time Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {format(today, "EEEE d MMMM yyyy", { locale: fr })} · T{Math.floor(today.getMonth() / 3) + 1} {today.getFullYear()}
            </p>
          </div>
        </div>

        {/* Time Range Toggle */}
        <ToggleGroup
          type="single"
          value={timeRange}
          onValueChange={(value) => value && onTimeRangeChange(value as "7" | "30" | "90" | "365")}
          className="bg-muted p-0.5 rounded-md h-8"
        >
          {Object.entries(timeRangeLabels).map(([value, label]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="text-xs px-2.5 h-6 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* KPI Pills Row */}
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-wrap items-center gap-1.5">
          {kpis.map((kpi, index) => (
            <React.Fragment key={kpi.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={kpi.href}>
                    <Badge
                      variant={kpi.variant === "default" ? "outline" : kpi.variant}
                      className={cn(
                        "cursor-pointer hover:bg-muted transition-colors h-7 px-2.5 text-xs font-normal",
                        kpi.variant === "default" && "hover:border-primary/50"
                      )}
                    >
                      <span className="text-muted-foreground mr-1.5">{kpi.label}:</span>
                      <span className="font-semibold tabular-nums">{kpi.value}</span>
                    </Badge>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {kpi.subtext}
                </TooltipContent>
              </Tooltip>
              {index < kpis.length - 1 && (
                <Separator orientation="vertical" className="h-4 mx-0.5 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
          
          <div className="flex-1" />
          
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" asChild>
              <Link href="/produits/nouveau">+ Produit</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" asChild>
              <Link href="/inventaire/entrees/nouveau">+ Entrée</Link>
            </Button>
            <Button size="sm" className="h-7 text-xs px-2.5" asChild>
              <Link href="/distributions/nouveau">+ Distro</Link>
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
