"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getActivityLogs, getUsersForFilter } from "../actions";
import { exportActivityLogs } from "@/lib/excel-export";
import { formatDateTime } from "@/lib/utils";

const actionLabels: Record<string, string> = {
  CREATE_PRODUCT: "Création produit",
  UPDATE_PRODUCT: "Modification produit",
  DELETE_PRODUCT: "Suppression produit",
  CREATE_DISTRIBUTION: "Nouvelle distribution",
  UPDATE_DISTRIBUTION: "Modification distribution",
  CREATE_DELIVERY_NOTE: "Bon de livraison",
  UPDATE_DELIVERY_NOTE: "MAJ bon livraison",
  CREATE_HOSPITAL: "Création hôpital",
  UPDATE_HOSPITAL: "Modification hôpital",
  CREATE_ALLOCATION: "Nouvelle allocation",
  UPDATE_ALLOCATION: "Modification allocation",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
};

const actionColors: Record<string, string> = {
  CREATE_PRODUCT: "bg-blue-100 text-blue-800",
  UPDATE_PRODUCT: "bg-amber-100 text-amber-800",
  DELETE_PRODUCT: "bg-red-100 text-red-800",
  CREATE_DISTRIBUTION: "bg-green-100 text-green-800",
  UPDATE_DISTRIBUTION: "bg-amber-100 text-amber-800",
  CREATE_DELIVERY_NOTE: "bg-purple-100 text-purple-800",
  UPDATE_DELIVERY_NOTE: "bg-amber-100 text-amber-800",
  CREATE_HOSPITAL: "bg-blue-100 text-blue-800",
  UPDATE_HOSPITAL: "bg-amber-100 text-amber-800",
  CREATE_ALLOCATION: "bg-indigo-100 text-indigo-800",
  UPDATE_ALLOCATION: "bg-amber-100 text-amber-800",
  LOGIN: "bg-gray-100 text-gray-800",
  LOGOUT: "bg-gray-100 text-gray-800",
};

export default function ActivityReportPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    userId: "all",
    action: "all",
    startDate: "",
    endDate: "",
  });

  async function loadData() {
    setLoading(true);
    const [logsResult, usersResult] = await Promise.all([
      getActivityLogs(),
      getUsersForFilter(),
    ]);

    if (logsResult.success) {
      setLogs(logsResult.data);
    }
    if (usersResult.success) {
      setUsers(usersResult.data);
    }
    setLoading(false);
  }

  async function applyFilters() {
    setLoading(true);
    const filterData: any = {};
    if (filters.userId !== "all") filterData.userId = filters.userId;
    if (filters.action !== "all") filterData.action = filters.action;
    if (filters.startDate) filterData.startDate = filters.startDate;
    if (filters.endDate) filterData.endDate = filters.endDate;

    const result = await getActivityLogs(
      Object.keys(filterData).length > 0 ? filterData : undefined
    );
    if (result.success) {
      setLogs(result.data);
    }
    setLoading(false);
  }

  function resetFilters() {
    setFilters({
      userId: "all",
      action: "all",
      startDate: "",
      endDate: "",
    });
    loadData();
  }

  async function handleExport() {
    setExporting(true);
    await exportActivityLogs(logs);
    setExporting(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filters.userId !== "all" && log.userId !== filters.userId) return false;
    if (filters.action !== "all" && log.action !== filters.action) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rapports">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Journal d&apos;activité
          </h1>
          <p className="text-muted-foreground">
            Historique des actions des utilisateurs
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting || logs.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Export..." : "Exporter"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Utilisateur</label>
              <Select
                value={filters.userId}
                onValueChange={(v) => setFilters({ ...filters, userId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les utilisateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select
                value={filters.action}
                onValueChange={(v) => setFilters({ ...filters, action: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date début</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date fin</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Filtrer
              </Button>
              <Button variant="outline" size="icon" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historique ({filteredLogs.length} entrées)
          </CardTitle>
          <CardDescription>
            {logs.length !== filteredLogs.length
              ? `${logs.length - filteredLogs.length} entrées filtrées`
              : "Toutes les entrées sont affichées"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Chargement...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucune entrée trouvée
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <p className="font-medium">
                              {log.user.firstName} {log.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Système</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={actionColors[log.action] || "bg-gray-100"}
                        >
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {log.ipAddress}
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
