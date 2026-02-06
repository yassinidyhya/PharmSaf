"use client"

import * as React from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  getDashboardStats,
  getStockByCategory,
  getStockMovementTrends,
  getTopHospitals,
  getCriticalAlerts,
  getRecentActivity,
  getDistributionEvents,
  getCategoryStats,
  getCriticalProducts,
  getBudgetConsumption,
} from "./actions"
import { KpiHeader } from "@/components/dashboard/kpi-header"
import { CategoryStats } from "@/components/dashboard/category-stats"
import { AlertsWidget } from "@/components/dashboard/alerts-widget"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { MovementTrends } from "@/components/dashboard/movement-trends"
import { TopHospitals } from "@/components/dashboard/top-hospitals"
import { DistributionCalendar } from "@/components/dashboard/distribution-calendar"
import { CriticalProductsTable } from "@/components/dashboard/critical-products-table"
import { BudgetTracker } from "@/components/dashboard/budget-tracker"
import DashboardLoading from "./loading"

interface DateRange {
  from: Date
  to: Date
}

// Main dashboard content
function DashboardContent() {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [data, setData] = React.useState<{
    stats: Awaited<ReturnType<typeof getDashboardStats>>["data"]
    categories: Awaited<ReturnType<typeof getStockByCategory>>["data"]
    trends: Awaited<ReturnType<typeof getStockMovementTrends>>["data"]
    hospitals: Awaited<ReturnType<typeof getTopHospitals>>["data"]
    alerts: Awaited<ReturnType<typeof getCriticalAlerts>>["data"]
    activities: Awaited<ReturnType<typeof getRecentActivity>>["data"]
    distributions: Awaited<ReturnType<typeof getDistributionEvents>>["data"]
    categoryStats: Awaited<ReturnType<typeof getCategoryStats>>["data"]
    criticalProducts: Awaited<ReturnType<typeof getCriticalProducts>>["data"]
    budgetConsumption: Awaited<ReturnType<typeof getBudgetConsumption>>["data"]
  } | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const from = startOfDay(dateRange.from)
        const to = endOfDay(dateRange.to)

        const [
          statsResult,
          categoryResult,
          trendsResult,
          hospitalsResult,
          alertsResult,
          activityResult,
          distributionResult,
          categoryStatsResult,
          criticalProductsResult,
          budgetResult,
        ] = await Promise.all([
          getDashboardStats(from, to),
          getStockByCategory(),
          getStockMovementTrends(from, to),
          getTopHospitals(5, from, to),
          getCriticalAlerts(from, to),
          getRecentActivity(10, from, to),
          getDistributionEvents(from, to),
          getCategoryStats(from, to),
          getCriticalProducts(),
          getBudgetConsumption(),
        ])

        setData({
          stats: statsResult.success ? statsResult.data : undefined,
          categories: categoryResult.success ? categoryResult.data : [],
          trends: trendsResult.success ? trendsResult.data : [],
          hospitals: hospitalsResult.success ? hospitalsResult.data : [],
          alerts: alertsResult.success ? alertsResult.data : [],
          activities: activityResult.success ? activityResult.data : [],
          distributions: distributionResult.success ? distributionResult.data : [],
          categoryStats: categoryStatsResult.success ? categoryStatsResult.data : [],
          criticalProducts: criticalProductsResult.success ? criticalProductsResult.data : [],
          budgetConsumption: budgetResult.success ? budgetResult.data : [],
        })
      } catch (error) {
        console.error("Dashboard fetch error:", error)
        // Set empty data to stop loading
        setData({
          stats: undefined,
          categories: [],
          trends: [],
          hospitals: [],
          alerts: [],
          activities: [],
          distributions: [],
          categoryStats: [],
          criticalProducts: [],
          budgetConsumption: [],
        })
      }
    }

    fetchData()
  }, [dateRange])

  if (!data) {
    return <DashboardLoading />
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header Section */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        {data.stats && (
          <KpiHeader
            stats={data.stats}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-3 lg:p-4 xl:p-6 pt-2">
        {/* Critical Products Table */}
        {data.criticalProducts && data.criticalProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <div>
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
                  Produits Requérant Attention
                  <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-normal text-muted-foreground">
                    ({data.criticalProducts.length})
                  </span>
                </h2>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                  Stock faible ou péremption proche
                </p>
              </div>
            </div>
            <CriticalProductsTable data={data.criticalProducts} />
          </section>
        )}

        {/* Category Stats - Stock by Category with Months */}
        {data.categoryStats && data.categoryStats.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <div>
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold">Stock par Catégorie</h2>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                  Niveaux de stock et mois de couverture
                </p>
              </div>
            </div>
            <CategoryStats data={data.categoryStats} />
          </section>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <CategoryDistribution data={data.categories || []} />
          <MovementTrends data={data.trends || []} fromDate={dateRange.from} toDate={dateRange.to} />
        </div>

        {/* Middle Row: Budget Tracker + Distribution Calendar + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <BudgetTracker data={data.budgetConsumption || []} />
          <DistributionCalendar events={data.distributions || []} />
          <AlertsWidget alerts={data.alerts || []} />
        </div>

        {/* Bottom Row: Top Hospitals + Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <TopHospitals data={data.hospitals || []} />
          <RecentActivity activities={data.activities || []} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
