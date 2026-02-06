import { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Package,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getReportStats } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rapports | Pharmacie Provinciale",
  description: "Rapports et analyses",
};

const reportTypes = [
  {
    title: "Rapport Trimestriel",
    description: "Analyse des distributions par trimestre",
    icon: Calendar,
    href: "/rapports/trimestriel",
    color: "bg-blue-500",
  },
  {
    title: "Rapport Annuel",
    description: "Bilan complet de l'année",
    icon: TrendingUp,
    href: "/rapports/annuel",
    color: "bg-green-500",
  },
  {
    title: "Rapport d'Activité",
    description: "Historique des actions utilisateurs",
    icon: Users,
    href: "/rapports/activite",
    color: "bg-purple-500",
  },
];

export default async function ReportsPage() {
  const statsResult = await getReportStats();
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <p className="text-muted-foreground">
          Générez et exportez des rapports détaillés
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Distributions (Année)
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDistributions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valeur totale
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "MAD",
              }).format(stats?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hôpitaux actifs
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeHospitals || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bons de livraison
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDeliveryNotes || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:border-primary transition-colors">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={report.href}>
                    Générer le rapport
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de l&apos;activité récente</CardTitle>
          <CardDescription>Aperçu des dernières opérations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Badge variant="outline">{activity.action}</Badge>
              </div>
            ))}
            {!stats?.recentActivity?.length && (
              <p className="text-muted-foreground text-center py-4">
                Aucune activité récente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
