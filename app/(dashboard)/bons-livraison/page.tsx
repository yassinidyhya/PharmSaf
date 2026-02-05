"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Filter,
  Search,
  CheckCircle,
  Truck,
  Clock,
  Printer,
  Eye,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDeliveryNotes,
  getFiltersData,
  DeliveryNoteFilters,
} from "./actions";
import { NoteStatus } from "@prisma/client";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validé",
  LIVRE: "Livré",
};

const statusColors: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-800",
  VALIDE: "bg-blue-100 text-blue-800",
  LIVRE: "bg-green-100 text-green-800",
};

const statusIcons: Record<string, typeof Clock> = {
  BROUILLON: Clock,
  VALIDE: CheckCircle,
  LIVRE: Truck,
};

export default function DeliveryNotesPage() {
  const [filters, setFilters] = useState<DeliveryNoteFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [filterData, setFilterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    const [notesResult, filtersResult] = await Promise.all([
      getDeliveryNotes(filters),
      getFiltersData(),
    ]);

    if (notesResult.success) {
      setNotes(notesResult.data || []);
    }
    if (filtersResult.success) {
      setFilterData(filtersResult.data);
    }
    setLoading(false);
  }

  function handleSearch() {
    setFilters({ ...filters, search: searchQuery || undefined });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bons de Livraison
          </h1>
          <p className="text-muted-foreground">
            Gestion des bons de livraison officiels
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par n° ou hôpital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
              <Button variant="secondary" onClick={handleSearch}>
                Rechercher
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Année:</span>
              <Select
                value={filters.year?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    year: value === "all" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {filterData?.years?.map((year: number) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Trimestre:</span>
              <Select
                value={filters.quarter?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    quarter: value === "all" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="1">T1</SelectItem>
                  <SelectItem value="2">T2</SelectItem>
                  <SelectItem value="3">T3</SelectItem>
                  <SelectItem value="4">T4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Statut:</span>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value === "all" ? undefined : (value as NoteStatus),
                  })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="BROUILLON">Brouillon</SelectItem>
                  <SelectItem value="VALIDE">Validé</SelectItem>
                  <SelectItem value="LIVRE">Livré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["BROUILLON", "VALIDE", "LIVRE"].map((status) => {
          const Icon = statusIcons[status];
          const count = notes.filter((n) => n.status === status).length;
          return (
            <Card key={status} className={status === "LIVRE" ? "border-green-200" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {statusLabels[status]}
                </CardTitle>
                <Icon
                  className={`h-4 w-4 ${
                    status === "LIVRE"
                      ? "text-green-600"
                      : status === "VALIDE"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">bons</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des bons de livraison</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `${notes.length} bon(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">
              Chargement...
            </p>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun bon de livraison trouvé
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Bon</TableHead>
                    <TableHead>Hôpital</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">
                        {note.noteNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{note.hospital.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {note.hospital.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          T{note.quarter} {note.year}
                        </Badge>
                      </TableCell>
                      <TableCell>{note._count.items} article(s)</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(note.totalAmount || 0))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[note.status]}
                        >
                          {statusLabels[note.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/bons-livraison/${note.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/bons-livraison/${note.id}/pdf`}>
                              <Printer className="h-4 w-4" />
                            </Link>
                          </Button>
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
