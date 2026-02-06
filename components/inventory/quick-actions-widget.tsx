"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  AlertTriangle,
  PackagePlus,
  PackageMinus,
  FileText
} from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: "entry" | "exit" | "expiry" | "export" | "report";
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
}

interface QuickActionsWidgetProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { label: "Nouvelle Entree", href: "/inventaire/entrees/nouveau", icon: "entry", variant: "default" },
  { label: "Nouvelle Sortie", href: "/inventaire/sorties/nouveau", icon: "exit", variant: "outline" },
  { label: "Alertes Peremption", href: "/inventaire/peremption", icon: "expiry", variant: "secondary" },
  { label: "Exporter Stock", href: "#", icon: "export", variant: "ghost" },
];

const iconMap = {
  entry: PackagePlus,
  exit: PackageMinus,
  expiry: AlertTriangle,
  export: FileSpreadsheet,
  report: FileText,
};

export function QuickActionsWidget({ actions = defaultActions }: QuickActionsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon];
          return (
            <Button
              key={index}
              asChild
              variant={action.variant}
              className="w-full justify-start gap-2"
            >
              <Link href={action.href}>
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
