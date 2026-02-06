import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  BedDouble,
  Package,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHospital } from "../actions";
import { HospitalForm } from "@/components/forms/hospital-form";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";
import { HospitalType, Category } from "@prisma/client";

interface HospitalDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const typeLabels: Record<HospitalType, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

const typeColors: Record<HospitalType, string> = {
  CENTRE_HOSPITALIER: "bg-blue-100 text-blue-800",
  CENTRE_SANTE: "bg-green-100 text-green-800",
  HOPITAL_PROVINCIAL: "bg-purple-100 text-purple-800",
};

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

export async function generateMetadata({
  params,
}: HospitalDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getHospital(id);

  if (!result.success || !result.data) {
    return {
      title: "Hôpital non trouvé | Pharmacie Provinciale",
    };
  }

  return {
    title: `${result.data.name} | Pharmacie Provinciale`,
    description: `Détails de ${result.data.name}`,
  };
}

export default async function HospitalDetailPage({
  params,
}: HospitalDetailPageProps) {
  const { id } = await params;
  const result = await getHospital(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const hospital = result.data;

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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {hospital.name}
            </h1>
            <Badge variant="outline" className={typeColors[hospital.type]}>
              {typeLabels[hospital.type]}
            </Badge>
          </div>
          <p className="text-muted-foreground">Code: {hospital.code}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {typeLabels[hospital.type]}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacité</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospital.bedCapacity ? formatNumber(hospital.bedCapacity) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {hospital.bedCapacity ? "lits" : "Non spécifié"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distributions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(hospital._count.stockExits)}
            </div>
            <p className="text-xs text-muted-foreground">Sorties de stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocations</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(hospital._count.allocations)}
            </div>
            <p className="text-xs text-muted-foreground">Budgets annuels</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {hospital.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    {hospital.address}
                  </p>
                </div>
              </div>
            )}
            {hospital.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">
                    {hospital.phone}
                  </p>
                </div>
              </div>
            )}
            {hospital.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {hospital.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modifier l&apos;hôpital</CardTitle>
              <CardDescription>
                Modifiez les informations de l&apos;établissement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HospitalForm hospital={hospital} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distributions Tab */}
        <TabsContent value="distributions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historique des distributions</CardTitle>
                <CardDescription>
                  Dernières sorties de stock vers cet hôpital
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/inventaire/sorties/nouveau?hospital=${hospital.id}`}>
                  Nouvelle sortie
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {hospital.stockExits.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune distribution enregistrée
                </p>
              ) : (
                <div className="space-y-2">
                  {hospital.stockExits.map((exit: any) => (
                    <div
                      key={exit.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-md">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {exit.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(exit.exitDate)} • T{exit.quarter}{" "}
                            {exit.year}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-red-600">
                        -{formatNumber(exit.quantity)} {exit.product.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Budgets annuels</CardTitle>
                <CardDescription>
                  Allocations budgétaires par catégorie
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/hopitaux/${hospital.id}/allocations`}>
                  Gérer les allocations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {hospital.allocations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune allocation budgétaire définie
                </p>
              ) : (
                <div className="space-y-4">
                  {hospital.allocations.map((allocation: any) => (
                    <div
                      key={allocation.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {categoryLabels[allocation.category as Category]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Année {allocation.year}
                          </p>
                        </div>
                        <p className="text-lg font-bold">
                          {formatCurrency(Number(allocation.budget))}
                        </p>
                      </div>
                      {/* Consumption bars */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Consommé:
                          </span>
                          <span>
                            {formatCurrency(
                              Number(allocation.q1Consumed) +
                                Number(allocation.q2Consumed) +
                                Number(allocation.q3Consumed) +
                                Number(allocation.q4Consumed)
                            )}{" "}
                            /
                            {formatCurrency(Number(allocation.budget))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
