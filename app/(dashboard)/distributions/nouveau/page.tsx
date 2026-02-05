import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistributionWizard } from "@/components/forms/distribution-wizard";

export const metadata: Metadata = {
  title: "Nouvelle Distribution | Pharmacie Provinciale",
  description: "Créer une nouvelle distribution",
};

export default function NewDistributionPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/distributions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nouvelle Distribution
          </h1>
          <p className="text-muted-foreground">
            Assistant de création de distribution
          </p>
        </div>
      </div>

      {/* Wizard */}
      <DistributionWizard />
    </div>
  );
}
