"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  TrendingDown,
  Wallet,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getHospitalAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
} from "./actions";
import { AllocationForm } from "@/components/forms/allocation-form";
import { formatCurrency } from "@/lib/utils";
import { Category } from "@/lib/types";

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  INSULINE: "Insuline",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel de bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-100 text-blue-800",
  VACCIN: "bg-green-100 text-green-800",
  INSULINE: "bg-red-100 text-red-800",
  REACTIF: "bg-purple-100 text-purple-800",
  CONSOMMABLE: "bg-orange-100 text-orange-800",
  PETIT_MATERIEL: "bg-gray-100 text-gray-800",
  MATERIEL_BUREAU: "bg-slate-100 text-slate-800",
};

interface Allocation {
  id: string;
  category: Category;
  year: number;
  budget: number;
  q1Consumed: number;
  q2Consumed: number;
  q3Consumed: number;
  q4Consumed: number;
}

export default function HospitalAllocationsPage() {
  const params = useParams();
  const hospitalId = params.id as string;

  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAllocation, setEditingAllocation] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadAllocations();
  }, [hospitalId]);

  async function loadAllocations() {
    setLoading(true);
    const result = await getHospitalAllocations(hospitalId);
    if (result.success) {
      setAllocations(result.data || []);
    }
    setLoading(false);
  }

  async function handleCreate(formData: FormData) {
    const result = await createAllocation(hospitalId, formData);
    if (result.success) {
      setIsDialogOpen(false);
      loadAllocations();
    }
    return result;
  }

  async function handleUpdate(allocationId: string, formData: FormData) {
    const result = await updateAllocation(allocationId, hospitalId, formData);
    if (result.success) {
      setEditingAllocation(null);
      loadAllocations();
    }
    return result;
  }

  async function handleDelete(allocationId: string) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette allocation ?")) {
      const result = await deleteAllocation(allocationId, hospitalId);
      if (result.success) {
        loadAllocations();
      }
    }
  }

  const getConsumedAmount = (allocation: Allocation) => {
    return (
      Number(allocation.q1Consumed) +
      Number(allocation.q2Consumed) +
      Number(allocation.q3Consumed) +
      Number(allocation.q4Consumed)
    );
  };

  const getConsumptionPercentage = (allocation: Allocation) => {
    const consumed = getConsumedAmount(allocation);
    return Math.min(100, Math.round((consumed / Number(allocation.budget)) * 100));
  };

  // Group by year
  const allocationsByYear = allocations.reduce((acc: Record<number, any[]>, allocation: any) => {
    if (!acc[allocation.year]) {
      acc[allocation.year] = [];
    }
    acc[allocation.year].push(allocation);
    return acc;
  }, {} as Record<number, any[]>);

  const years = Object.keys(allocationsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/hopitaux/${hospitalId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Allocations Budgétaires
          </h1>
          <p className="text-muted-foreground">
            Gestion des budgets annuels par catégorie
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Allocation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Allocation</DialogTitle>
              <DialogDescription>
                Créer un nouveau budget annuel pour une catégorie
              </DialogDescription>
            </DialogHeader>
            <AllocationForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budget {new Date().getFullYear()}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                allocations
                  .filter((a) => a.year === new Date().getFullYear())
                  .reduce((sum, a) => sum + Number(a.budget), 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consommé {new Date().getFullYear()}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                allocations
                  .filter((a) => a.year === new Date().getFullYear())
                  .reduce((sum, a) => sum + getConsumedAmount(a), 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre d&apos;allocations
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Allocations by Year */}
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
      ) : years.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune allocation budgétaire définie
            </p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une allocation
            </Button>
          </CardContent>
        </Card>
      ) : (
        years.map((year) => (
          <Card key={year}>
            <CardHeader>
              <CardTitle>Année {year}</CardTitle>
              <CardDescription>
                {allocationsByYear[year].length} catégorie(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Consommation</TableHead>
                      <TableHead>T1</TableHead>
                      <TableHead>T2</TableHead>
                      <TableHead>T3</TableHead>
                      <TableHead>T4</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationsByYear[year].map((allocation) => {
                      const consumed = getConsumedAmount(allocation);
                      const percentage = getConsumptionPercentage(allocation);

                      return (
                        <TableRow key={allocation.id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={categoryColors[allocation.category as Category]}
                            >
                              {categoryLabels[allocation.category as Category]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(allocation.budget))}
                          </TableCell>
                          <TableCell>
                            <div className="w-[150px]">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{formatCurrency(consumed)}</span>
                                <span
                                  className={
                                    percentage > 100
                                      ? "text-red-600"
                                      : percentage > 75
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }
                                >
                                  {percentage}%
                                </span>
                              </div>
                              <Progress
                                value={percentage}
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(allocation.q1Consumed))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(allocation.q2Consumed))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(allocation.q3Consumed))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(allocation.q4Consumed))}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setEditingAllocation(allocation)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(allocation.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAllocation}
        onOpenChange={() => setEditingAllocation(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;Allocation</DialogTitle>
            <DialogDescription>
              Modifier le budget pour{" "}
              {editingAllocation &&
                categoryLabels[editingAllocation.category as Category]}{" "}
              ({editingAllocation?.year})
            </DialogDescription>
          </DialogHeader>
          {editingAllocation && (
            <AllocationForm
              allocation={editingAllocation}
              onSubmit={(formData) =>
                handleUpdate(editingAllocation.id, formData)
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
