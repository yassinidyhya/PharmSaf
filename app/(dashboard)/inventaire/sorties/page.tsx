"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, TrendingDown, Building2, Package, Syringe } from "lucide-react";
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
  getStockExits, 
  getStockExitsStats, 
  exportStockExitsToExcel,
  StockExitFilters, 
  PaginationParams 
} from "./actions";
import { formatNumber } from "@/lib/utils";

export default function StockExitsPage() {
  const [exits, setExits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationParams>(({
    page: 1,
    limit: 20,
  }));
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    const filters: StockExitFilters = {};
    if (search) filters.search = search;

    const [exitsResult, statsResult] = await Promise.all([
      getStockExits(filters, pagination),
      getStockExitsStats(),
    ]);

    if (exitsResult.success) {
      setExits(exitsResult.data || []);
      if (exitsResult.pagination) {
        setPaginationInfo(exitsResult.pagination);
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
    const filters: StockExitFilters = {};
    if (search) filters.search = search;

    const result = await exportStockExitsToExcel(filters);
    
    if (result.success && result.data) {
      const blob = new Blob([result.data as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename || "sorties_stock.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error(result.error || "Export failed");
    }
  };

  const handleExportPDF = async () => {
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
            <h1 className="text-2xl font-bold tracking-tight">Sorties de Stock</h1>
            <p className="text-muted-foreground">
              Historique des distributions vers les hôpitaux
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/inventaire/sorties/nouveau?type=insulin">
              <Syringe className="mr-2 h-4 w-4 text-red-500" />
              Distribution Insuline
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inventaire/sorties/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Sortie
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats?.totalExits || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tous les temps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties Récentes</CardTitle>
            <Badge variant="secondary" className="text-xs">30j</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatNumber(stats?.recentExits || 0)}
            </div>
            <p className="text-xs text-muted-foreground">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité Totale</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatNumber(stats?.totalQuantity || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unités distribuées</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des sorties</CardTitle>
          <CardDescription>
            Consultez les distributions effectuées vers les hôpitaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryDataTable
            type="exits"
            data={exits}
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
