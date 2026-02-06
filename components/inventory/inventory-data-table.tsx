"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Package,
  Building,
  FileSpreadsheet,
  FileText,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import { Category } from "@/lib/types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface InventoryDataTableProps {
  type: "entries" | "exits";
  data: any[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  searchValue: string;
  isLoading?: boolean;
  onExportExcel?: () => Promise<void>;
  onExportPDF?: () => Promise<void>;
}

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Medicament",
  VACCIN: "Vaccin",
  REACTIF: "Reactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit materiel",
  MATERIEL_BUREAU: "Materiel bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  VACCIN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REACTIF: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  CONSOMMABLE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  PETIT_MATERIEL: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  MATERIEL_BUREAU: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

export function InventoryDataTable({
  type,
  data,
  pagination,
  onPageChange,
  onSearch,
  searchValue,
  isLoading = false,
  onExportExcel,
  onExportPDF,
}: InventoryDataTableProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [isExporting, setIsExporting] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleExportExcel = async () => {
    if (!onExportExcel) {
      toast.error("Export Excel non disponible");
      return;
    }
    setIsExporting(true);
    try {
      await onExportExcel();
      toast.success("Export Excel réussi");
    } catch (error) {
      toast.error("Erreur lors de l'export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!onExportPDF) {
      toast.error("Export PDF non disponible");
      return;
    }
    setIsExporting(true);
    try {
      await onExportPDF();
      toast.success("Export PDF réussi");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.totalCount);

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isExporting || isLoading}
                className="gap-2"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                <FileText className="h-4 w-4 text-red-600" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-muted-foreground">
            <span className="hidden sm:inline">
              Affichage {startItem}-{endItem} sur {pagination.totalCount} résultats
            </span>
            <span className="sm:hidden">
              {pagination.totalCount} résultats
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Produit</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Catégorie</TableHead>
                {type === "entries" ? (
                  <>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Lot</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">Expiration</TableHead>
                    <TableHead className="whitespace-nowrap hidden xl:table-cell">Référence</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="whitespace-nowrap">Hôpital</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Trimestre</TableHead>
                  </>
                )}
                <TableHead className="text-right whitespace-nowrap">Quantité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell 
                    colSpan={type === "entries" ? 7 : 6} 
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={type === "entries" ? 7 : 6} 
                    className="h-24 text-center text-muted-foreground"
                  >
                    Aucun résultat trouvé
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm whitespace-nowrap">
                          {formatDate(type === "entries" ? item.entryDate : item.exitDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <Link 
                            href={`/produits/${item.productId}`}
                            className="font-medium text-sm hover:text-primary hover:underline truncate block max-w-[150px] sm:max-w-[200px]"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.product.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge 
                        variant="outline" 
                        className={`${categoryColors[item.product.category as Category]} text-xs`}
                      >
                        {categoryLabels[item.product.category as Category]}
                      </Badge>
                    </TableCell>
                    {type === "entries" ? (
                      <>
                        <TableCell className="text-sm hidden md:table-cell font-mono">
                          {item.batch?.batchNumber || "—"}
                        </TableCell>
                        <TableCell className="text-sm hidden lg:table-cell whitespace-nowrap">
                          {item.batch?.expiryDate
                            ? formatDate(item.batch.expiryDate)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm max-w-[120px] xl:max-w-[150px] truncate hidden xl:table-cell">
                          {item.referenceDoc || "—"}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <Link
                                href={`/hopitaux/${item.hospitalId}`}
                                className="font-medium text-sm hover:text-primary hover:underline truncate block max-w-[120px] sm:max-w-[150px]"
                              >
                                {item.hospital.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">{item.hospital.code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            T{item.quarter} {item.year}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    <TableCell className={`text-right font-medium whitespace-nowrap ${
                      type === "entries" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {type === "entries" ? "+" : "-"}
                      {formatNumber(item.quantity)} 
                      <span className="text-xs text-muted-foreground ml-1">
                        {item.product.unit}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lignes par page:</span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onPageChange(1)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Page {pagination.page} sur {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
