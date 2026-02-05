"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
      label: "Produit",
      href: "/produits/nouveau",
      variant: "default" as const,
    },
    {
      label: "Entrée",
      href: "/inventaire/entrees/nouveau",
      variant: "outline" as const,
    },
    {
      label: "Distribution",
      href: "/distributions/nouveau",
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {/* Quick Actions - Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              asChild
              className="h-8"
            >
              <Link href={action.href}>
                + {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions - Mobile */}
      <div className="flex sm:hidden items-center gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            asChild
            className="h-8 flex-1 text-xs"
          >
            <Link href={action.href}>
              + {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
