import { Suspense } from "react";
import { Metadata } from "next";
import {
  getDashboardStats,
  getStockByCategory,
  getStockMovementTrends,
  getTopHospitals,
  getCriticalAlerts,
  getRecentActivity,
  getDistributionEvents,
  getCategoryStats,
} from "./actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CategoryDistribution } from "@/components/dashboard/category-distribution";
import { MovementTrends } from "@/components/dashboard/movement-trends";
import { TopHospitals } from "@/components/dashboard/top-hospitals";
import { AlertsWidget } from "@/components/dashboard/alerts-widget";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CategoryStats } from "@/components/dashboard/category-stats";
import { DistributionCalendar } from "@/components/dashboard/distribution-calendar";
import DashboardLoading from "./loading";

export const metadata: Metadata = {
  title: "Tableau de Bord | Pharmacie Provinciale",
  description: "Vue d'ensemble de l'inventaire et des statistiques",
};

// Main dashboard content
async function DashboardContent() {
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
    getStockMovementTrends(90),
    getTopHospitals(5),
    getCriticalAlerts(),
    getRecentActivity(10),
    getDistributionEvents(),
    getCategoryStats(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const categories = categoryResult.success ? categoryResult.data : [];
  const trends = trendsResult.success ? trendsResult.data : [];
  const hospitals = hospitalsResult.success ? hospitalsResult.data : [];
  const alerts = alertsResult.success ? alertsResult.data : [];
  const activities = activityResult.success ? activityResult.data : [];
  const distributions = distributionResult.success ? distributionResult.data : [];
  const categoryStats = categoryStatsResult.success ? categoryStatsResult.data : [];

  return (
    <div className="flex flex-1 flex-col">
      {/* Header Section */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 pt-2">
        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Category Stats - Stock by Category with Months */}
        {categoryStats.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Stock par Catégorie</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Niveaux de stock et mois de couverture
                </p>
              </div>
            </div>
            <CategoryStats data={categoryStats} />
          </section>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CategoryDistribution data={categories} />
          <MovementTrends data={trends} />
        </div>

        {/* Middle Row: Top Hospitals + Distribution Calendar + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <TopHospitals data={hospitals} />
          <DistributionCalendar events={distributions} />
          <AlertsWidget alerts={alerts} />
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
          <RecentActivity activities={activities} />
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
