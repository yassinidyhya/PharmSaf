import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// KPI Header Skeleton
function KpiHeaderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* KPI Pills Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24" />
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>
  )
}

// Critical Products Table Skeleton
function CriticalProductsTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-9 w-full max-w-sm mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// Category Stats Skeleton
function CategoryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-7 sm:h-8 w-20" />
                <Skeleton className="h-3 sm:h-4 w-16" />
              </div>
              <Skeleton className="h-1.5 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Pie Chart Skeleton
function PieChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-4">
        <Skeleton className="h-5 sm:h-6 w-32 mb-1" />
        <Skeleton className="h-3 sm:h-4 w-24 mb-4" />
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Skeleton className="mx-auto aspect-square max-h-[160px] sm:max-h-[180px] w-full rounded-full" />
          <div className="flex flex-row sm:flex-col flex-wrap justify-center gap-2 sm:gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 sm:h-10 w-24 sm:w-28" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Area Chart Skeleton
function AreaChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Skeleton className="h-5 sm:h-6 w-28 mb-1" />
            <Skeleton className="h-3 sm:h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 sm:h-16 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[120px] sm:h-[140px] w-full" />
      </CardContent>
    </Card>
  )
}

// Budget Tracker Skeleton
function BudgetTrackerSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Skeleton className="h-5 sm:h-6 w-28 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Distribution Calendar Skeleton
function DistributionCalendarSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Skeleton className="h-5 sm:h-6 w-28 mb-1" />
            <Skeleton className="h-3 sm:h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-16" />
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 sm:h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Alerts Widget Skeleton
function AlertsWidgetSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Skeleton className="h-5 sm:h-6 w-20 mb-1" />
            <Skeleton className="h-3 sm:h-4 w-28" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Bar Chart Skeleton
function BarChartSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Skeleton className="h-5 sm:h-6 w-28 mb-1" />
            <Skeleton className="h-3 sm:h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-[140px] sm:h-[160px] w-full mb-3" />
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 sm:h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Recent Activity Skeleton
function RecentActivitySkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 sm:h-12 w-full rounded-md" />
            ))}
          </div>
        </div>
      </CardContent>
      <div className="px-4 pb-3">
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  )
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        <KpiHeaderSkeleton />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 pt-2">
        {/* Critical Products */}
        <section>
          <div className="mb-3 sm:mb-4 space-y-1">
            <Skeleton className="h-5 sm:h-6 w-48" />
            <Skeleton className="h-3 sm:h-4 w-40" />
          </div>
          <CriticalProductsTableSkeleton />
        </section>

        {/* Category Stats */}
        <section>
          <div className="mb-3 sm:mb-4 space-y-1">
            <Skeleton className="h-5 sm:h-6 w-32" />
            <Skeleton className="h-3 sm:h-4 w-48" />
          </div>
          <CategoryStatsSkeleton />
        </section>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PieChartSkeleton />
          <AreaChartSkeleton />
        </div>

        {/* Middle Row: Budget + Calendar + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <BudgetTrackerSkeleton />
          <DistributionCalendarSkeleton />
          <AlertsWidgetSkeleton />
        </div>

        {/* Bottom Row: Top Hospitals + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <BarChartSkeleton />
          <RecentActivitySkeleton />
        </div>
      </div>
    </div>
  )
}
