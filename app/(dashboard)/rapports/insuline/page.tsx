"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Syringe, TrendingUp, Calendar, Building2, Package, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatNumber, formatDate } from "@/lib/utils";
import { getInsulinDistributions, exportInsulinReport, type InsulinReportData } from "./actions";

export default function InsulinReportPage() {
  const [data, setData] = useState<InsulinReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(null);
  const [hospitalId, setHospitalId] = useState<string>("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const result = await getInsulinDistributions({
      year,
      month: month || undefined,
      hospitalId: hospitalId || undefined,
    });
    if (result.success) {
      setData(result.data || null);
    } else {
      toast.error(result.error || "Failed to load insulin report");
    }
    setIsLoading(false);
  }, [year, month, hospitalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    const result = await exportInsulinReport({
      year,
      month: month || undefined,
      hospitalId: hospitalId || undefined,
    });
    if (result.success && result.data) {
      const blob = new Blob([result.data as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename || `insulin_report_${year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
    } else {
      toast.error(result.error || "Export failed");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/rapports">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Syringe className="h-6 w-6 text-red-500" />
              Insulin Distribution Report
            </h1>
            <p className="text-muted-foreground">
              Track on-demand insulin distributions to health centers
            </p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Month (Optional)</label>
              <Select 
                value={month?.toString() || "all"} 
                onValueChange={(v) => setMonth(v === "all" ? null : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Health Center (Optional)</label>
              <Select 
                value={hospitalId || "all"} 
                onValueChange={(v) => setHospitalId(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All centers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All centers</SelectItem>
                  {data?.hospitals.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.summary.totalDistributions)}
              </div>
              <p className="text-xs text-muted-foreground">
                {month ? months.find(m => m.value === month)?.label : "All year"} {year}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(data.summary.totalQuantity)}
              </div>
              <p className="text-xs text-muted-foreground">Units distributed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Centers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.summary.uniqueHospitals)}
              </div>
              <p className="text-xs text-muted-foreground">Received insulin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.summary.uniqueProducts)}
              </div>
              <p className="text-xs text-muted-foreground">Different insulin types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Health Centers */}
      {data && data.byHospital.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Health Centers
            </CardTitle>
            <CardDescription>
              Health centers with highest insulin consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.byHospital.slice(0, 5).map((h, index) => (
                <div 
                  key={h.hospitalId} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{h.hospitalName}</div>
                      <div className="text-sm text-muted-foreground">
                        {h.distributionCount} distributions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatNumber(h.totalQuantity)}</div>
                    <div className="text-sm text-muted-foreground">units</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Product */}
      {data && data.byProduct.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Distribution by Product
            </CardTitle>
            <CardDescription>
              Breakdown by insulin type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.byProduct.map((p) => (
                <div 
                  key={p.productId} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{p.productName}</div>
                    <div className="text-sm text-muted-foreground">{p.productCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatNumber(p.totalQuantity)}</div>
                    <div className="text-sm text-muted-foreground">units</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Distributions Table */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Health Center</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Lot</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentDistributions.map((dist) => (
                    <tr key={dist.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{formatDate(dist.exitDate)}</td>
                      <td className="py-3 px-4">{dist.hospitalName}</td>
                      <td className="py-3 px-4">{dist.productName}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatNumber(dist.quantity)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{dist.batchNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
