import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Header Skeleton
function HeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 rounded-xl bg-muted/50">
        <Skeleton className="h-12 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

// Stats Cards Skeleton
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Category Stats Skeleton
function CategoryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-3">
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Pie Chart Skeleton
function PieChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32 mt-1" />
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="mx-auto aspect-square max-h-[220px] w-full rounded-full" />
          <div className="flex flex-col gap-2 min-w-[140px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Area Chart Skeleton
function AreaChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
          <Skeleton className="h-9 w-[140px]" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

// Bar Chart Skeleton
function BarChartSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
          </div>
          <Skeleton className="h-12 w-24" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="h-[200px] w-full" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Distribution Calendar Skeleton
function DistributionCalendarSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-28 mt-1" />
            </div>
          </div>
          <Skeleton className="h-12 w-16" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alerts Widget Skeleton
function AlertsWidgetSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Skeleton
function RecentActivitySkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
      <div className="p-4 pt-2">
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-6 pb-2">
        <HeaderSkeleton />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4 lg:p-6 pt-2">
        <StatsCardsSkeleton />
        
        {/* Category Stats */}
        <section>
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <CategoryStatsSkeleton />
        </section>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PieChartSkeleton />
          <AreaChartSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <BarChartSkeleton />
          </div>
          <div className="lg:col-span-4">
            <DistributionCalendarSkeleton />
          </div>
          <div className="lg:col-span-4">
            <AlertsWidgetSkeleton />
          </div>
        </div>

      </div>
    </div>
  );
}
