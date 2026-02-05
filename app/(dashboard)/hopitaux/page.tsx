import { Metadata } from "next";
import Link from "next/link";
import { Plus, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getHospitals } from "./actions";
import { HospitalType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Hôpitaux | Pharmacie Provinciale",
  description: "Liste des hôpitaux et centres de santé",
};

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

export default async function HospitalsPage() {
  const result = await getHospitals();
  const hospitals = result.success ? result.data : [];
  const total = result.success ? result.total : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hôpitaux</h1>
          <p className="text-muted-foreground">
            {total} hôpital(aux) et centre(s) de santé
          </p>
        </div>
        <Button asChild>
          <Link href="/hopitaux/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Hôpital
          </Link>
        </Button>
      </div>

      {/* Hospitals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des hôpitaux</CardTitle>
          <CardDescription>
            Gérez les hôpitaux et centres de santé de la province
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hospitals.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun hôpital enregistré
              </p>
              <Button asChild className="mt-4">
                <Link href="/hopitaux/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un hôpital
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital: any) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">
                        {hospital.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{hospital.name}</p>
                          {hospital.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hospital.address}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeColors[hospital.type]}>
                          {typeLabels[hospital.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {hospital.phone && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {hospital.phone}
                            </p>
                          )}
                          {hospital.email && (
                            <p className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {hospital.email}
                            </p>
                          )}
                          {!hospital.phone && !hospital.email && (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {hospital.bedCapacity ? (
                          <span>{hospital.bedCapacity} lits</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/hopitaux/${hospital.id}`}>
                            Détails
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
