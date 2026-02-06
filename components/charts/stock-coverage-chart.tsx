"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/lib/types";

interface StockCoverageData {
  category: Category;
  label: string;
  monthsOfStock: number;
  optimalRange: { min: number; max: number };
}

interface StockCoverageChartProps {
  data: StockCoverageData[];
}

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "#3b82f6",
  VACCIN: "#22c55e",
  REACTIF: "#a855f7",
  CONSOMMABLE: "#f97316",
  PETIT_MATERIEL: "#6b7280",
  MATERIEL_BUREAU: "#64748b",
};

export function StockCoverageChart({ data }: StockCoverageChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: categoryColors[item.category],
    isLow: item.monthsOfStock < item.optimalRange.min,
    isHigh: item.monthsOfStock > item.optimalRange.max,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Couverture de Stock</CardTitle>
        <CardDescription>Mois de stock disponible par categorie</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
                tickFormatter={(value) => `${value} mois`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const status = data.isLow 
                      ? "Stock faible" 
                      : data.isHigh 
                      ? "Stock eleve" 
                      : "Stock optimal";
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium text-sm">{data.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.monthsOfStock.toFixed(1)} mois de couverture
                        </p>
                        <p className={`text-xs ${data.isLow ? "text-red-500" : data.isHigh ? "text-orange-500" : "text-green-500"}`}>
                          {status}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optimal: {data.optimalRange.min}-{data.optimalRange.max} mois
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Min", position: "top", fontSize: 10 }} />
              <ReferenceLine x={6} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Optimal", position: "top", fontSize: 10 }} />
              <Bar dataKey="monthsOfStock" radius={[0, 4, 4, 0]} maxBarSize={25}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isLow ? "#ef4444" : entry.isHigh ? "#f97316" : entry.fill} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Faible (&lt;3 mois)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Optimal (3-6 mois)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Eleve (&gt;6 mois)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
