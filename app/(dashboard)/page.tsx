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
      <div className="px-4 lg:px-6 pt-6 pb-2">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-4 lg:p-6 pt-2">
        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Category Stats - Stock by Category with Months */}
        {categoryStats.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Stock par Catégorie</h2>
                <p className="text-sm text-muted-foreground">
                  Niveaux de stock et mois de couverture
                </p>
              </div>
            </div>
            <CategoryStats data={categoryStats} />
          </section>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CategoryDistribution data={categories} />
          <MovementTrends data={trends} />
        </div>

        {/* Middle Row: Top Hospitals + Alerts + Distribution Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <TopHospitals data={hospitals} />
          </div>
          <div className="lg:col-span-4">
            <DistributionCalendar events={distributions} />
          </div>
          <div className="lg:col-span-4">
            <AlertsWidget alerts={alerts} />
          </div>
        </div>


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
