"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthUser } from "@/hooks/use-auth-user"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import { 
  IconPackage, 
  IconCoins, 
  IconAlertTriangle, 
  IconCalendarOff,
  IconTruckDelivery,
  IconBuildingHospital,
  IconPlus,
  IconCalendar,
  IconPill,
  IconArrowDownLeft
} from "@tabler/icons-react"

import { AuroraText } from "@/components/ui/aurora-text"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface DateRange {
  from: Date
  to: Date
}

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
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

const presets = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
  { label: "1 an", days: 365 },
]

export function KpiHeader({ stats, dateRange, onDateRangeChange }: KpiHeaderProps) {
  const { user } = useAuthUser()
  const today = new Date()
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [selectedRange, setSelectedRange] = React.useState<{ from?: Date; to?: Date }>({
    from: dateRange.from,
    to: dateRange.to,
  })
  
  const firstName = user?.firstName || user?.username?.split(" ")[0] || "Utilisateur"
  const hour = today.getHours()
  let greeting = "Bonjour"
  if (hour >= 12 && hour < 18) greeting = "Bon après-midi"
  else if (hour >= 18) greeting = "Bonsoir"

  const handlePresetSelect = (days: number) => {
    const from = subDays(today, days)
    const to = today
    setSelectedRange({ from, to })
    onDateRangeChange({ from, to })
    setCalendarOpen(false)
  }

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setSelectedRange(range)
      if (range.from && range.to) {
        onDateRangeChange({ from: range.from, to: range.to })
        setCalendarOpen(false)
      }
    }
  }

  const kpis = [
    {
      label: "Produits",
      value: formatNumber(stats.totalProducts),
      subtext: `+${stats.newProductsThisMonth} ce mois`,
      href: "/produits",
      variant: "default" as const,
      icon: IconPackage,
    },
    {
      label: "Stock",
      value: formatCurrency(stats.totalStockValue),
      subtext: "Valeur totale",
      href: "/inventaire",
      variant: "default" as const,
      icon: IconCoins,
    },
    {
      label: "Alertes",
      value: formatNumber(stats.lowStockCount),
      subtext: "Stock faible",
      href: "/inventaire",
      variant: stats.lowStockCount > 0 ? ("warning" as const) : ("default" as const),
      icon: IconAlertTriangle,
    },
    {
      label: "Périmant",
      value: formatNumber(stats.criticalExpiryCount),
      subtext: "< 30 jours",
      href: "/inventaire/peremption",
      variant: stats.criticalExpiryCount > 0 ? ("warning" as const) : ("default" as const),
      icon: IconCalendarOff,
    },
    {
      label: "Distros",
      value: `${stats.distributionsCompleted}/${stats.distributionsTotal}`,
      subtext: `T${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`,
      href: "/distributions",
      variant: "default" as const,
      icon: IconTruckDelivery,
    },
    {
      label: "Hôpitaux",
      value: formatNumber(stats.hospitalsActive),
      subtext: "Actifs",
      href: "/hopitaux",
      variant: "default" as const,
      icon: IconBuildingHospital,
    },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Bar: Greeting + Date | Calendar + Actions (desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-sm sm:text-lg font-semibold tracking-tight">
            {greeting}, <AuroraText className="font-semibold">{firstName}</AuroraText>
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {format(today, "EEEE d MMMM yyyy", { locale: fr })} · T{Math.floor(today.getMonth() / 3) + 1} {today.getFullYear()}
          </p>
        </div>

        {/* Calendar + Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Date Range Picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 text-[10px] sm:text-xs gap-1 px-2 sm:px-2.5"
              >
                <IconCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">
                  {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                </span>
                <span className="sm:hidden">
                  {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" side="bottom" sideOffset={4}>
              <div className="flex flex-col sm:flex-row">
                {/* Presets */}
                <div className="border-b sm:border-b-0 sm:border-r p-2 space-y-1 bg-muted/50">
                  {presets.map((preset) => (
                    <Button
                      key={preset.days}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                      onClick={() => handlePresetSelect(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                {/* Calendar */}
                <Calendar
                  mode="range"
                  selected={{
                    from: selectedRange.from,
                    to: selectedRange.to,
                  }}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  defaultMonth={dateRange.from}
                  locale={fr}
                  required={false}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Desktop: Quick Actions inline with calendar */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3 gap-1.5 hover:bg-primary/5 hover:border-primary/20 transition-colors" 
              asChild
            >
              <Link href="/produits/nouveau">
                <IconPill className="w-3.5 h-3.5" />
                <span>Produit</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs px-3 gap-1.5 hover:bg-primary/5 hover:border-primary/20 transition-colors" 
              asChild
            >
              <Link href="/inventaire/entrees/nouveau">
                <IconArrowDownLeft className="w-3.5 h-3.5" />
                <span>Entrée</span>
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3 gap-1.5 shadow-sm hover:shadow transition-shadow" 
              asChild
            >
              <Link href="/distributions/nouveau">
                <IconTruckDelivery className="w-3.5 h-3.5" />
                <span>Distribution</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: Quick Actions on separate row (horizontal scroll) */}
      <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-[10px] px-2 gap-1 hover:bg-primary/5 hover:border-primary/20 transition-colors shrink-0" 
          asChild
        >
          <Link href="/produits/nouveau">
            <IconPill className="w-3 h-3" />
            <span>Produit</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-[10px] px-2 gap-1 hover:bg-primary/5 hover:border-primary/20 transition-colors shrink-0" 
          asChild
        >
          <Link href="/inventaire/entrees/nouveau">
            <IconArrowDownLeft className="w-3 h-3" />
            <span>Entrée</span>
          </Link>
        </Button>
        <Button 
          size="sm" 
          className="h-7 text-[10px] px-2 gap-1 shadow-sm hover:shadow transition-shadow shrink-0" 
          asChild
        >
          <Link href="/distributions/nouveau">
            <IconTruckDelivery className="w-3 h-3" />
            <span>Distribution</span>
          </Link>
        </Button>
      </div>

      {/* KPI Pills Row */}
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <React.Fragment key={kpi.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={kpi.href}>
                      <Badge
                        variant={kpi.variant === "default" || kpi.variant === "warning" ? "outline" : kpi.variant}
                        className={cn(
                          "cursor-pointer hover:bg-muted transition-colors h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs font-normal gap-1 sm:gap-1.5",
                          kpi.variant === "default" && "hover:border-primary/50",
                          kpi.variant === "warning" && "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                        )}
                      >
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="text-muted-foreground hidden sm:inline">{kpi.label}:</span>
                        <span className="font-semibold tabular-nums">{kpi.value}</span>
                      </Badge>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {kpi.subtext}
                  </TooltipContent>
                </Tooltip>
                {index < kpis.length - 1 && (
                  <Separator orientation="vertical" className="h-3 sm:h-4 mx-0.5 hidden sm:block" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  )
}
