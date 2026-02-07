"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/lib/types";

interface InventoryBarChartProps {
  data: Array<{
    category: Category;
    label: string;
    stock: number;
    products: number;
    color: string;
  }>;
}

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "#3b82f6",    // blue-500
  VACCIN: "#22c55e",        // green-500
  INSULINE: "#ef4444",      // red-500
  REACTIF: "#a855f7",       // purple-500
  CONSOMMABLE: "#f97316",   // orange-500
  PETIT_MATERIEL: "#6b7280", // gray-500
  MATERIEL_BUREAU: "#64748b", // slate-500
};

export function InventoryBarChart({ data }: InventoryBarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: categoryColors[item.category] || item.color,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Stock par Catégorie</CardTitle>
        <CardDescription>Répartition quantitative du stock</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium text-sm">{data.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.stock.toLocaleString("fr-FR")} unités
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.products} produit(s)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
