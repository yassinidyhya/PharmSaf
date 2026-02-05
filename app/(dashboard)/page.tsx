"use client"

import * as React from "react"
import {
  getDashboardStats,
  getStockByCategory,
  getStockMovementTrends,
  getTopHospitals,
  getCriticalAlerts,
  getRecentActivity,
  getDistributionEvents,
  getCategoryStats,
} from "./actions"
import { KpiHeader } from "@/components/dashboard/kpi-header"
import { CategoryStats } from "@/components/dashboard/category-stats"
import { AlertsWidget } from "@/components/dashboard/alerts-widget"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { MovementTrends } from "@/components/dashboard/movement-trends"
import { TopHospitals } from "@/components/dashboard/top-hospitals"
import { DistributionCalendar } from "@/components/dashboard/distribution-calendar"
import DashboardLoading from "./loading"

// Main dashboard content
function DashboardContent() {
  const [timeRange, setTimeRange] = React.useState<"7" | "30" | "90" | "365">("30")
  const [data, setData] = React.useState<{
    stats: Awaited<ReturnType<typeof getDashboardStats>>["data"]
    categories: Awaited<ReturnType<typeof getStockByCategory>>["data"]
    trends: Awaited<ReturnType<typeof getStockMovementTrends>>["data"]
    hospitals: Awaited<ReturnType<typeof getTopHospitals>>["data"]
    alerts: Awaited<ReturnType<typeof getCriticalAlerts>>["data"]
    activities: Awaited<ReturnType<typeof getRecentActivity>>["data"]
    distributions: Awaited<ReturnType<typeof getDistributionEvents>>["data"]
    categoryStats: Awaited<ReturnType<typeof getCategoryStats>>["data"]
  } | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      const [
        statsResult,
        categoryResult,
        trendsResult,
        hospitalsResult,
        alertsResult,
        activityResult,
        distributionResult,
        categoryStatsResult,
      ] = await Promise.all([
        getDashboardStats(),
        getStockByCategory(),
        getStockMovementTrends(parseInt(timeRange)),
        getTopHospitals(5),
        getCriticalAlerts(),
        getRecentActivity(10),
        getDistributionEvents(),
        getCategoryStats(),
      ])

      setData({
        stats: statsResult.success ? statsResult.data : null,
        categories: categoryResult.success ? categoryResult.data : [],
        trends: trendsResult.success ? trendsResult.data : [],
        hospitals: hospitalsResult.success ? hospitalsResult.data : [],
        alerts: alertsResult.success ? alertsResult.data : [],
        activities: activityResult.success ? activityResult.data : [],
        distributions: distributionResult.success ? distributionResult.data : [],
        categoryStats: categoryStatsResult.success ? categoryStatsResult.data : [],
      })
    }

    fetchData()
  }, [timeRange])

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
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 pt-2">
        {/* Category Stats - Stock by Category with Months */}
        {data.categoryStats && data.categoryStats.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Stock par Catégorie</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Niveaux de stock et mois de couverture
                </p>
              </div>
            </div>
            <CategoryStats data={data.categoryStats} />
          </section>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CategoryDistribution data={data.categories || []} />
          <MovementTrends data={data.trends || []} />
        </div>

        {/* Middle Row: Top Hospitals + Distribution Calendar + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <TopHospitals data={data.hospitals || []} />
          <DistributionCalendar events={data.distributions || []} />
          <AlertsWidget alerts={data.alerts || []} />
        </div>

        {/* Recent Activity Section */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold">Activité Récente</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Derniers mouvements de stock
              </p>
            </div>
          </div>
          <RecentActivity activities={data.activities || []} />
        </section>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
