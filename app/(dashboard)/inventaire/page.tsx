"use client"

import * as React from "react"
import Link from "next/link"
import { subDays, startOfDay, endOfDay, format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  IconPackage,
  IconCoins,
  IconAlertTriangle,
  IconCalendarOff,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCalendar,
  IconPlus,
  IconArrowRight,
  IconPill,
  IconClock,
  IconHistory,
  IconBuildingHospital,
  IconActivity,
  IconTruckDelivery,
} from "@tabler/icons-react"

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { RippleButton } from "@/components/ui/ripple-button"
import InventoryLoading from "./loading"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  getInventoryStats,
  getRecentStockMovements,
  getStockCoverage,
  getExpiringBatches,
} from "./actions"
import { formatNumber, formatCurrency, cn } from "@/lib/utils"
import { Category } from "@/lib/types";
import { isToday, isYesterday } from "date-fns"

interface DateRange {
  from: Date
  to: Date
}

// Category configuration matching dashboard
const categoryConfig: Record<Category, {
  label: string
  color: string
  progressColor: string
  icon: React.ElementType
}> = {
  MEDICAMENT: {
    label: "Medicaments",
    color: "text-blue-600 dark:text-blue-400",
    progressColor: "bg-blue-500",
    icon: IconPill,
  },
  VACCIN: {
    label: "Vaccins",
    color: "text-emerald-600 dark:text-emerald-400",
    progressColor: "bg-emerald-500",
    icon: IconPackage,
  },
  REACTIF: {
    label: "Reactifs",
    color: "text-violet-600 dark:text-violet-400",
    progressColor: "bg-violet-500",
    icon: IconActivity,
  },
  CONSOMMABLE: {
    label: "Consommables",
    color: "text-amber-600 dark:text-amber-400",
    progressColor: "bg-amber-500",
    icon: IconPackage,
  },
  PETIT_MATERIEL: {
    label: "Petit Materiel",
    color: "text-cyan-600 dark:text-cyan-400",
    progressColor: "bg-cyan-500",
    icon: IconPackage,
  },
  MATERIEL_BUREAU: {
    label: "Materiel Bureau",
    color: "text-slate-600 dark:text-slate-400",
    progressColor: "bg-slate-500",
    icon: IconPackage,
  },
}

function getStockStatus(monthsOfStock: number): {
  label: string
  badgeVariant: "default" | "secondary" | "destructive" | "outline"
} {
  if (monthsOfStock <= 1) {
    return { label: "Critique", badgeVariant: "destructive" }
  }
  if (monthsOfStock <= 2) {
    return { label: "Faible", badgeVariant: "secondary" }
  }
  if (monthsOfStock <= 6) {
    return { label: "Optimal", badgeVariant: "outline" }
  }
  return { label: "Exces", badgeVariant: "default" }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return "A l'instant"
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours}h`
  return format(new Date(date), "dd/MM")
}

export default function InventoryPage() {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [selectedRange, setSelectedRange] = React.useState<{ from?: Date; to?: Date }>({
    from: dateRange.from,
    to: dateRange.to,
  })
  const [data, setData] = React.useState<{
    stats: any
    movements: any
    coverage: any[]
    expiringBatches: any[]
  } | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      const from = startOfDay(dateRange.from)
      const to = endOfDay(dateRange.to)

      const [
        statsResult,
        movementsResult,
        coverageResult,
        expiringResult,
      ] = await Promise.all([
        getInventoryStats(),
        getRecentStockMovements(),
        getStockCoverage(),
        getExpiringBatches(90),
      ])

      setData({
        stats: statsResult.success ? statsResult.data : null,
        movements: movementsResult.success ? movementsResult.data : null,
        coverage: coverageResult.success ? coverageResult.data : [],
        expiringBatches: expiringResult.success ? expiringResult.data : [],
      })
    }

    fetchData()
  }, [dateRange])

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setSelectedRange(range)
      if (range.from && range.to) {
        setDateRange({ from: range.from, to: range.to })
        setCalendarOpen(false)
      }
    }
  }

  if (!data) {
    return <InventoryLoading />
  }

  const today = new Date()

  // Calculate stats from movements
  const entries = data.movements?.entries || []
  const exits = data.movements?.exits || []
  const totalEntries = entries.reduce((sum: number, e: any) => sum + (e.quantity || 0), 0)
  const totalExits = exits.reduce((sum: number, e: any) => sum + (e.quantity || 0), 0)

  return (
    <div className="flex flex-1 flex-col">
      {/* Header Section */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        <div className="space-y-3 sm:space-y-4">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Inventaire
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {format(today, "EEEE d MMMM yyyy", { locale: fr })} · Vue d&apos;ensemble du stock
              </p>
            </div>

            {/* Calendar + Actions */}
            <div className="flex items-center gap-1.5">
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
                      {[
                        { label: "7 jours", days: 7 },
                        { label: "30 jours", days: 30 },
                        { label: "90 jours", days: 90 },
                        { label: "1 an", days: 365 },
                      ].map((preset) => (
                        <Button
                          key={preset.days}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const from = subDays(new Date(), preset.days)
                            const to = new Date()
                            setSelectedRange({ from, to })
                            setDateRange({ from, to })
                            setCalendarOpen(false)
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    {/* Calendar */}
                    <Calendar
                      mode="range"
                      selected={{ from: selectedRange.from, to: selectedRange.to }}
                      onSelect={handleCalendarSelect}
                      numberOfMonths={1}
                      defaultMonth={dateRange.from}
                      locale={fr}
                      required={false}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* KPI Pills */}
          <TooltipProvider delayDuration={100}>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <KpiBadge
                icon={IconPackage}
                label="Produits"
                value={formatNumber(data.stats?.totalProducts || 0)}
                subtext={`${data.stats?.newProductsThisMonth || 0} ce mois`}
                href="/produits"
              />
              <Separator orientation="vertical" className="h-3 sm:h-4 mx-0.5 hidden sm:block" />
              <KpiBadge
                icon={IconCoins}
                label="Valeur"
                value={formatCurrency(data.stats?.totalStockValue || 0)}
                subtext="Valeur totale du stock"
                href="/inventaire"
              />
              <Separator orientation="vertical" className="h-3 sm:h-4 mx-0.5 hidden sm:block" />
              <KpiBadge
                icon={IconAlertTriangle}
                label="Alertes"
                value={formatNumber(data.stats?.lowStockProducts?.length || 0)}
                subtext="Stock faible"
                href="/inventaire"
                variant={data.stats?.lowStockProducts?.length > 0 ? "destructive" : "default"}
              />
              <Separator orientation="vertical" className="h-3 sm:h-4 mx-0.5 hidden sm:block" />
              <KpiBadge
                icon={IconCalendarOff}
                label="Péremption"
                value={formatNumber(data.stats?.expiringStats?.critical || 0)}
                subtext="< 30 jours"
                href="/inventaire/peremption"
                variant={data.stats?.expiringStats?.critical > 0 ? "destructive" : "default"}
              />
              <Separator orientation="vertical" className="h-3 sm:h-4 mx-0.5 hidden sm:block" />
              <KpiBadge
                icon={IconArrowDownLeft}
                label="Entrées"
                value={formatNumber(totalEntries)}
                subtext={`Période sélectionnée`}
                href="/inventaire/entrees"
              />
              <Separator orientation="vertical" className="h-3 sm:h-4 mx-0.5 hidden sm:block" />
              <KpiBadge
                icon={IconArrowUpRight}
                label="Sorties"
                value={formatNumber(totalExits)}
                subtext={`Période sélectionnée`}
                href="/inventaire/sorties"
              />
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-3 lg:p-4 xl:p-6 pt-2">
        {/* Quick Actions - Prominent */}
        <QuickActions />

        {/* Stock by Category */}
        {data.coverage.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <div>
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
                  Stock par Catégorie
                </h2>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                  Niveaux de stock et mois de couverture
                </p>
              </div>
            </div>
            <CategoryStatsGrid data={data.coverage} />
          </section>
        )}

        {/* Alerts Section - Combined */}
        <AlertsSection
          expiringBatches={data.expiringBatches}
          lowStockProducts={data.stats?.lowStockProducts || []}
        />

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
                Derniers Mouvements
              </h2>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                Activité récente du stock
              </p>
            </div>
          </div>
          <RecentActivityCard movements={data.movements} />
        </section>
      </div>
    </div>
  )
}

// ==================== SUB-COMPONENTS ====================

function KpiBadge({
  icon: Icon,
  label,
  value,
  subtext,
  href,
  variant = "default",
}: {
  icon: React.ElementType
  label: string
  value: string
  subtext?: string
  href: string
  variant?: "default" | "destructive"
}) {
  const badge = (
    <Badge
      variant={variant === "default" ? "outline" : variant}
      className={cn(
        "cursor-pointer hover:bg-muted transition-colors h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs font-normal gap-1 sm:gap-1.5",
        variant === "default" && "hover:border-primary/50"
      )}
    >
      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      <span className="text-muted-foreground hidden sm:inline">{label}:</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </Badge>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>{badge}</Link>
      </TooltipTrigger>
      {subtext && (
        <TooltipContent side="bottom" className="text-xs">
          {subtext}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

function CategoryStatsGrid({ data }: { data: any[] }) {
  const activeCategories = data
    .filter((cat) => cat.totalQuantity > 0)
    .sort((a, b) => b.stockValue - a.stockValue)

  if (activeCategories.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <IconPackage className="w-10 h-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Aucune donnee disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {activeCategories.map((category) => {
        const catKey = category.category as Category
        const config = categoryConfig[catKey]
        const stockStatus = getStockStatus(category.monthsOfStock)
        const isLowStock = category.monthsOfStock <= 2
        const isCritical = category.monthsOfStock <= 1
        const progressValue = Math.min((category.monthsOfStock / 12) * 100, 100)

        return (
          <Link
            key={catKey}
            href={`/produits?category=${catKey}`}
            className="block group"
          >
            <Card
              className={cn(
                "h-full transition-all duration-200 hover:shadow-md hover:border-primary/20",
                isCritical ? "border-rose-200" : isLowStock ? "border-amber-200" : "border-border/50"
              )}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className={cn("w-5 h-5", config.color)} />
                      <h3 className={cn("font-semibold text-sm sm:text-base group-hover:text-primary transition-colors", config.color)}>
                        {config.label}
                      </h3>
                    </div>
                    <Badge variant={stockStatus.badgeVariant} className="text-[10px]">
                      {stockStatus.label}
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-bold">{formatNumber(category.totalQuantity)}</span>
                    <span className="text-xs text-muted-foreground">{formatCurrency(category.stockValue)}</span>
                  </div>

                  <div className="space-y-1">
                    <Progress value={progressValue} className={cn("h-1.5", config.progressColor)} />
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <span>Stock</span>
                      <span>{category.monthsOfStock < 0.1 ? "< 0.1" : category.monthsOfStock.toFixed(1)} mois</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function QuickActions() {
  return (
    <section>
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div>
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold">Actions Rapides</h2>
          <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
            Opérations courantes du stock
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Link href="/inventaire/entrees/nouveau" className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 group">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <IconArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Entrée Stock</p>
                <p className="text-[10px] text-muted-foreground">Nouvelle réception</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventaire/sorties/nouveau" className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800 group">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors">
                <IconArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sortie Stock</p>
                <p className="text-[10px] text-muted-foreground">Retrait / Consommation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributions/nouveau" className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <IconTruckDelivery className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Distribution</p>
                <p className="text-[10px] text-muted-foreground">Vers hôpital</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventaire/peremption" className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 group">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                <IconCalendarOff className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Péremption</p>
                <p className="text-[10px] text-muted-foreground">Voir alertes</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  )
}

function AlertsSection({
  expiringBatches,
  lowStockProducts,
}: {
  expiringBatches: any[]
  lowStockProducts: any[]
}) {
  const hasAlerts = expiringBatches.length > 0 || lowStockProducts.length > 0
  const criticalExpiry = expiringBatches.filter((b) => b.daysUntilExpiry <= 30).length

  return (
    <section>
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div>
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold">Alertes</h2>
          <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
            {hasAlerts
              ? `${expiringBatches.length} péremption${expiringBatches.length > 1 ? "s" : ""} · ${lowStockProducts.length} stock faible`
              : "Aucune alerte en cours"}
          </p>
        </div>
        {hasAlerts && (
          <Badge variant="outline" className="text-[10px] sm:text-xs">
            {expiringBatches.length + lowStockProducts.length}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Expiry Alerts */}
        <ExpiryAlertsCard
          batches={expiringBatches}
          criticalCount={criticalExpiry}
          warningCount={expiringBatches.filter((b) => b.daysUntilExpiry > 30 && b.daysUntilExpiry <= 60).length}
        />

        {/* Low Stock Alerts */}
        <Card className={cn(lowStockProducts.length > 0 && "border-rose-200 dark:border-rose-800")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <IconAlertTriangle className={cn("h-4 w-4", lowStockProducts.length > 0 ? "text-rose-600" : "text-muted-foreground")} />
                  Stock Faible
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">
                  {lowStockProducts.length > 0
                    ? `${lowStockProducts.length} produit${lowStockProducts.length > 1 ? "s" : ""} sous le seuil`
                    : "Stock suffisant"}
                </CardDescription>
              </div>
              {lowStockProducts.length > 0 && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs">
                  {lowStockProducts.length}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                <IconPackage className="w-10 h-10 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">Stock suffisant</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Tous les produits sont bien approvisionnés</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px] sm:h-[240px] pr-2 sm:pr-3">
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 8).map((product) => (
                    <Link
                      key={product.id}
                      href={`/produits/${product.id}`}
                      className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                        <p className="text-[10px] sm:text-xs opacity-70">{product.code}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm font-bold text-rose-600">{formatNumber(product.totalStock || 0)}</p>
                        <p className="text-[9px] sm:text-[10px] opacity-60">Min: {product.minStock}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>

          {lowStockProducts.length > 0 && (
            <CardFooter className="pt-0 justify-center">
              <Link href="/produits">
                <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
                  <span>Voir tous les produits</span>
                  <IconArrowRight className="w-3 h-3 ml-1" />
                </RippleButton>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  )
}

function ExpiryAlertsCard({
  batches,
  criticalCount,
  warningCount,
}: {
  batches: any[]
  criticalCount: number
  warningCount: number
}) {
  // Sort by urgency: critical first, then warning, then notice
  const sortedBatches = [...batches].sort((a, b) => {
    const urgencyA = a.daysUntilExpiry <= 30 ? 0 : a.daysUntilExpiry <= 60 ? 1 : 2
    const urgencyB = b.daysUntilExpiry <= 30 ? 0 : b.daysUntilExpiry <= 60 ? 1 : 2
    if (urgencyA !== urgencyB) return urgencyA - urgencyB
    return a.daysUntilExpiry - b.daysUntilExpiry
  })

  const displayCount = Math.min(sortedBatches.length, 8)
  const hasMore = sortedBatches.length > 8

  return (
    <Card className={cn("h-full flex flex-col", criticalCount > 0 && "border-rose-200 dark:border-rose-800")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              criticalCount > 0 
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50" 
                : warningCount > 0 
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-950/50"
            )}>
              <IconAlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Alertes Péremption</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                {batches.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    {criticalCount > 0 && (
                      <span className="text-rose-600 font-medium">
                        {criticalCount} critique{criticalCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {criticalCount > 0 && warningCount > 0 && <span className="text-muted-foreground">•</span>}
                    {warningCount > 0 && (
                      <span className="text-amber-600 font-medium">
                        {warningCount} avertissement{warningCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {batches.length > 0 && criticalCount === 0 && warningCount === 0 && (
                      <span className="text-blue-600">{batches.length} à surveiller</span>
                    )}
                  </span>
                ) : (
                  "Aucune alerte"
                )}
              </CardDescription>
            </div>
          </div>
          {batches.length > 0 && (
            <Badge 
              variant={criticalCount > 0 ? "destructive" : warningCount > 0 ? "default" : "outline"} 
              className="text-[10px] sm:text-xs h-5 sm:h-6"
            >
              {displayCount}/{batches.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {sortedBatches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-3">
              <IconCalendar className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aucune alerte</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Tous les lots sont bons</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] sm:h-[240px] pr-2 sm:pr-3">
            <div className="space-y-2">
              {sortedBatches.slice(0, 8).map((batch) => {
                const isCritical = batch.daysUntilExpiry <= 30
                const isWarning = batch.daysUntilExpiry > 30 && batch.daysUntilExpiry <= 60
                const progressValue = Math.max(0, Math.min(100, (batch.daysUntilExpiry / 90) * 100))

                return (
                  <Link
                    key={batch.id}
                    href={`/produits/${batch.product.id}`}
                    className={cn(
                      "block p-2.5 sm:p-3 rounded-lg border transition-all hover:shadow-sm relative overflow-hidden",
                      isCritical
                        ? "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800"
                        : isWarning
                        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                        : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                    )}
                  >
                    {/* Progress bar background */}
                    <div 
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 transition-all",
                        isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-blue-500"
                      )}
                      style={{ width: `${progressValue}%` }}
                    />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-xs sm:text-sm truncate">{batch.product.name}</p>
                          {isCritical && (
                            <IconAlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                          Lot {batch.batchNumber} · {formatNumber(batch.quantity)} {batch.product.unit}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-bold tabular-nums h-6",
                            isCritical 
                              ? "border-rose-300 text-rose-700 bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300" 
                              : isWarning 
                                ? "border-amber-300 text-amber-700 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300"
                                : "border-blue-300 text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300"
                          )}
                        >
                          {batch.daysUntilExpiry}j
                        </Badge>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                          {format(new Date(batch.expiryDate), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
              
              {hasMore && (
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    +{sortedBatches.length - 8} autres lots...
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link href="/inventaire/peremption">
          <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
            <span>Voir toutes les alertes</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  )
}

function RecentActivityCard({ movements }: { movements: any }) {
  if (!movements) return null

  const entries = movements.entries || []
  const exits = movements.exits || []

  // Combine and sort
  const allActivities = [
    ...entries.map((e: any) => ({ ...e, type: "ENTRY" as const, date: e.entryDate })),
    ...exits.map((e: any) => ({ ...e, type: "EXIT" as const, date: e.exitDate, hospitalName: e.hospital?.name })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const entryCount = entries.length
  const exitCount = exits.length

  // Group by date
  const groups: { label: string; activities: typeof allActivities }[] = []
  const today: typeof allActivities = []
  const yesterday: typeof allActivities = []
  const earlier: typeof allActivities = []

  allActivities.slice(0, 10).forEach((activity) => {
    const date = new Date(activity.date)
    if (isToday(date)) {
      today.push(activity)
    } else if (isYesterday(date)) {
      yesterday.push(activity)
    } else {
      earlier.push(activity)
    }
  })

  if (today.length > 0) groups.push({ label: "Aujourd'hui", activities: today })
  if (yesterday.length > 0) groups.push({ label: "Hier", activities: yesterday })

  const dayMap = new Map<string, typeof allActivities>()
  earlier.forEach((activity) => {
    const dateKey = format(new Date(activity.date), "dd MMM", { locale: fr })
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, [])
    }
    dayMap.get(dateKey)!.push(activity)
  })
  dayMap.forEach((activities, label) => {
    groups.push({ label, activities })
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Activité Récente</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              {entryCount} entree{entryCount !== 1 ? "s" : ""} · {exitCount} sortie{exitCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {allActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 h-full text-center">
            <IconHistory className="w-10 h-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">Aucune activite</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Les mouvements apparaitront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] sm:h-[240px] pr-2 sm:pr-3">
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">{group.label}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-1">
                    {group.activities.map((activity, idx) => {
                      const isEntry = activity.type === "ENTRY"
                      return (
                        <Link
                          key={`${activity.type}-${idx}`}
                          href={isEntry ? "/inventaire/entrees" : "/inventaire/sorties"}
                          className="group flex items-center justify-between p-1.5 sm:p-2 rounded-md border hover:bg-muted/50 hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                "w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shrink-0",
                                isEntry ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                              )}
                            >
                              {isEntry ? (
                                <IconArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              ) : (
                                <IconArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium text-xs sm:text-sm truncate block">{activity.product.name}</span>
                              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                                <span>{formatRelativeTime(activity.date)}</span>
                                {activity.hospitalName && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[60px] sm:max-w-[80px] lg:max-w-[120px]">{activity.hospitalName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-1.5 sm:ml-2">
                            <span className={cn("font-semibold text-xs sm:text-sm", isEntry ? "text-emerald-600" : "text-rose-600")}>
                              {isEntry ? "+" : "-"}
                              {formatNumber(activity.quantity)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground ml-0.5">{activity.product.unit}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-3 justify-center">
        <Link href="/inventaire/entrees">
          <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
            <span>Voir tout l&apos;historique</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  )
}


