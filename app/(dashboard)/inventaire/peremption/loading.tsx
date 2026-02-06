import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Header Skeleton
function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Skeleton className="h-9 w-9 shrink-0" />
      <div>
        <Skeleton className="h-6 sm:h-7 w-48 mb-1" />
        <Skeleton className="h-3 sm:h-4 w-64" />
      </div>
    </div>
  )
}

// Stats Cards Skeleton
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Critical */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 sm:h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
      {/* Warning */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 sm:h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
      {/* Notice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 sm:h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
      {/* Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 sm:h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    </div>
  )
}

// Filters Skeleton
function FiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <Skeleton className="h-9 w-full sm:w-[160px]" />
      <Skeleton className="h-9 w-full sm:w-[200px]" />
    </div>
  )
}

// Table Skeleton
function TableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 sm:h-6 w-40 mb-1" />
        <Skeleton className="h-3 sm:h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          {/* Table Header */}
          <div className="border-b bg-muted/50">
            <div className="flex items-center h-10 px-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1 mx-2 first:ml-0 last:mr-0" />
              ))}
            </div>
          </div>
          {/* Table Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center h-14 px-4">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1 mx-2 first:ml-0 last:mr-0" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PeremptionLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header Section */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        <HeaderSkeleton />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-3 lg:p-4 xl:p-6 pt-2">
        {/* Stats Cards */}
        <StatsCardsSkeleton />

        {/* Filters - Inline */}
        <FiltersSkeleton />

        {/* Table */}
        <TableSkeleton />
      </div>
    </div>
  )
}
