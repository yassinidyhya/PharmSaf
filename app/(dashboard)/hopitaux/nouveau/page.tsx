import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HospitalForm } from "@/components/forms/hospital-form";

export const metadata: Metadata = {
  title: "Nouvel Hôpital | Pharmacie Provinciale",
  description: "Ajouter un nouvel hôpital ou centre de santé",
};

export default function NewHospitalPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/hopitaux">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvel Hôpital</h1>
          <p className="text-muted-foreground">
            Ajouter un nouvel hôpital ou centre de santé
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de l&apos;établissement</CardTitle>
          <CardDescription>
            Remplissez les informations de l&apos;hôpital ou centre de santé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HospitalForm />
        </CardContent>
      </Card>
    </div>
  );
}
