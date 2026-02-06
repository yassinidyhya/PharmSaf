"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, TrendingUp, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryDataTable } from "@/components/inventory/inventory-data-table";
import { 
  getStockEntries, 
  getStockEntriesStats, 
  exportStockEntriesToExcel,
  StockEntryFilters, 
  PaginationParams 
} from "./actions";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { subDays } from "date-fns";

export default function StockEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
  });
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    const filters: StockEntryFilters = {};
    if (search) filters.search = search;

    const [entriesResult, statsResult] = await Promise.all([
      getStockEntries(filters, pagination),
      getStockEntriesStats(),
    ]);

    if (entriesResult.success) {
      setEntries(entriesResult.data || []);
      if (entriesResult.pagination) {
        setPaginationInfo(entriesResult.pagination);
      }
    }

    if (statsResult.success) {
      setStats(statsResult.data);
    }

    setIsLoading(false);
  }, [search, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleExportExcel = async () => {
    const filters: StockEntryFilters = {};
    if (search) filters.search = search;

    const result = await exportStockEntriesToExcel(filters);
    
    if (result.success && result.data) {
      // Trigger download
      const blob = new Blob([result.data as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename || "entrees_stock.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error(result.error || "Export failed");
    }
  };

  const handleExportPDF = async () => {
    // For PDF, we'll use the browser's print functionality
    // In a real implementation, you might want to use a library like jsPDF
    window.print();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventaire">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Entrées de Stock</h1>
            <p className="text-muted-foreground">
              Historique des mouvements d&apos;entrée
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/inventaire/entrees/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Entrée
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats?.totalEntries || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tous les temps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées Récentes</CardTitle>
            <Badge variant="secondary" className="text-xs">30j</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatNumber(stats?.recentEntries || 0)}
            </div>
            <p className="text-xs text-muted-foreground">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité Totale</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats?.totalQuantity || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unités entrantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des entrées</CardTitle>
          <CardDescription>
            Consultez et recherchez dans l&apos;historique des entrées de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryDataTable
            type="entries"
            data={entries}
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            searchValue={search}
            isLoading={isLoading}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        </CardContent>
      </Card>
    </div>
  );
}
