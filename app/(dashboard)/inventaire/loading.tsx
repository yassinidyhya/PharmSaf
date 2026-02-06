import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// KPI Header Skeleton
function KpiHeaderSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <Skeleton className="h-6 sm:h-7 w-32 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-48" />
        </div>
        <Skeleton className="h-7 sm:h-8 w-32 sm:w-48" />
      </div>

      {/* KPI Pills */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 sm:h-7 w-20 sm:w-24" />
        ))}
      </div>
    </div>
  )
}

// Quick Actions Skeleton
function QuickActionsSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div>
          <Skeleton className="h-5 sm:h-6 lg:h-7 w-32 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 sm:h-28 w-full rounded-lg" />
        ))}
      </div>
    </section>
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
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-7 sm:h-8 w-20" />
                <Skeleton className="h-3 sm:h-4 w-16" />
              </div>
              <Skeleton className="h-1.5 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Alerts Section Skeleton
function AlertsSectionSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div>
          <Skeleton className="h-5 sm:h-6 lg:h-7 w-20 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-48" />
        </div>
        <Skeleton className="h-5 sm:h-6 w-10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Expiry Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 sm:h-6 w-32 mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 sm:h-6 w-12" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 sm:h-18 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 sm:h-6 w-28 mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 sm:h-6 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 sm:h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

// Recent Activity Skeleton
function RecentActivitySkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div>
          <Skeleton className="h-5 sm:h-6 lg:h-7 w-40 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 sm:h-6 w-36 mb-1" />
          <Skeleton className="h-3 sm:h-4 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((group, gIdx) => (
              <div key={gIdx}>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-px flex-1" />
                </div>
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 sm:h-12 w-full rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    </section>
  )
}

export default function InventoryLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header Section */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        <KpiHeaderSkeleton />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-3 lg:p-4 xl:p-6 pt-2">
        {/* Quick Actions */}
        <QuickActionsSkeleton />

        {/* Stock by Category */}
        <section>
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div>
              <Skeleton className="h-5 sm:h-6 lg:h-7 w-40 mb-1" />
              <Skeleton className="h-3 sm:h-4 w-56" />
            </div>
          </div>
          <CategoryStatsSkeleton />
        </section>

        {/* Alerts Section */}
        <AlertsSectionSkeleton />

        {/* Recent Activity */}
        <RecentActivitySkeleton />
      </div>
    </div>
  )
}
