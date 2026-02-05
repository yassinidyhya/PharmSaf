"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Trash2,
  Eye,
  Filter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getKits, deleteKit } from "./actions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const kitTypeLabels: Record<string, string> = {
  NORMAL: "Accouchement normal",
  EPISIOTOMIE: "Épisiotomie",
};

const kitTypeColors: Record<string, string> = {
  NORMAL: "bg-blue-100 text-blue-800",
  EPISIOTOMIE: "bg-pink-100 text-pink-800",
};

export default function KitsPage() {
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "available" | "distributed" | "incomplete">("all");

  useEffect(() => {
    loadKits();
  }, []);

  async function loadKits() {
    setLoading(true);
    const result = await getKits();
    if (result.success) {
      setKits(result.data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce kit ?")) return;

    const result = await deleteKit(id);
    if (result.success) {
      toast.success("Kit supprimé avec succès");
      loadKits();
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  }

  const filteredKits = kits.filter((kit) => {
    switch (filter) {
      case "available":
        return kit.isComplete && !kit.isDistributed;
      case "distributed":
        return kit.isDistributed;
      case "incomplete":
        return !kit.isComplete;
      default:
        return true;
    }
  });

  const stats = {
    total: kits.length,
    available: kits.filter((k) => k.isComplete && !k.isDistributed).length,
    distributed: kits.filter((k) => k.isDistributed).length,
    incomplete: kits.filter((k) => !k.isComplete).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kits de Naissance</h1>
          <p className="text-muted-foreground">
            Gestion des kits pour accouchement
          </p>
        </div>
        <Button asChild>
          <Link href="/kits/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Kit
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribués</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.distributed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplets</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.incomplete}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les kits</SelectItem>
            <SelectItem value="available">Disponibles</SelectItem>
            <SelectItem value="distributed">Distribués</SelectItem>
            <SelectItem value="incomplete">Incomplets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Kits</CardTitle>
          <CardDescription>
            {filteredKits.length} kit(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : filteredKits.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun kit trouvé
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Kit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Composants</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Distribution</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKits.map((kit) => (
                    <TableRow key={kit.id}>
                      <TableCell className="font-medium">{kit.kitNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={kitTypeColors[kit.kitType]}
                        >
                          {kitTypeLabels[kit.kitType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{kit._count.components} articles</span>
                          {kit.isComplete ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {kit.isComplete ? (
                          <Badge variant="default" className="bg-green-600">
                            Complet
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">
                            Incomplet
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {kit.isDistributed ? (
                          <div>
                            <Badge variant="default" className="bg-blue-600">
                              Distribué
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(kit.distributedAt)}
                            </p>
                          </div>
                        ) : (
                          <Badge variant="outline">Non distribué</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/kits/${kit.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!kit.isDistributed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(kit.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
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
