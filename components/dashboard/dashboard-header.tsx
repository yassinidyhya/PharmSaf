"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { 
  IconPlus, 
  IconPackageImport, 
  IconPackageExport,
  IconFileDownload,
  IconRefresh
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  const { user } = useUser();
  const currentDate = new Date();
  
  // Get first name from user
  const firstName = user?.firstName || user?.username?.split(" ")[0] || "Utilisateur";

  // Time-based greeting
  const hour = currentDate.getHours();
  let greeting = "Bonjour";
  if (hour >= 12 && hour < 18) greeting = "Bon après-midi";
  else if (hour >= 18) greeting = "Bonsoir";

  const quickActions = [
    {
      label: "Nouveau Produit",
      href: "/produits/nouveau",
      icon: IconPlus,
      variant: "default" as const,
    },
    {
      label: "Entrée Stock",
      href: "/inventaire/entrees/nouveau",
      icon: IconPackageImport,
      variant: "outline" as const,
    },
    {
      label: "Distribution",
      href: "/distributions/nouveau",
      icon: IconPackageExport,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici ce qui se passe dans votre pharmacie aujourd&apos;hui
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Last Updated */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-2">
            <span>Mis à jour :</span>
            <span className="font-medium">
              {format(currentDate, "HH:mm", { locale: fr })}
            </span>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 w-9"
            >
              <IconRefresh className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
        </div>
      </div>

      {/* Date & Quick Actions Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 rounded-xl bg-muted/50 border">
        {/* Date Display */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {format(currentDate, "EEEE", { locale: fr })}
            </span>
            <span className="text-lg font-semibold text-foreground">
              {format(currentDate, "d MMMM yyyy", { locale: fr })}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              asChild
              className="h-9"
            >
              <Link href={action.href} className="gap-1.5">
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
