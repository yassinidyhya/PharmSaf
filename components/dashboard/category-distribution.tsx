"use client";

import * as React from "react";
import Link from "next/link";
import { Label, Pie, PieChart } from "recharts";
import { IconChartPie, IconArrowRight } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Category } from "@prisma/client";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryData {
  category: Category;
  count: number;
  stock: number;
  value: number;
}

interface CategoryDistributionProps {
  data: CategoryData[];
}

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit matériel",
  MATERIEL_BUREAU: "Matériel bureau",
};

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "var(--chart-1)",
  VACCIN: "var(--chart-2)",
  REACTIF: "var(--chart-3)",
  CONSOMMABLE: "var(--chart-4)",
  PETIT_MATERIEL: "var(--chart-5)",
  MATERIEL_BUREAU: "var(--chart-6, #94a3b8)",
};

export function CategoryDistribution({ data }: CategoryDistributionProps) {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      name: categoryLabels[item.category],
      value: item.stock,
      fill: categoryColors[item.category],
      count: item.count,
      category: item.category,
    }));
  }, [data]);

  const totalStock = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const totalProducts = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = { value: { label: "Stock" } };
    data.forEach((item) => {
      config[item.category] = {
        label: categoryLabels[item.category],
        color: categoryColors[item.category],
      };
    });
    return config;
  }, [data]);

  // Empty state
  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Stock par Catégorie</CardTitle>
          <CardDescription>Répartition du stock total</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <IconChartPie className="size-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Stock par Catégorie</CardTitle>
            <CardDescription>Répartition du stock total</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Chart */}
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[220px] flex-1"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value: number, _name, payload) => (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{payload?.payload?.name}</span>
                        <span className="text-muted-foreground">
                          {formatNumber(value)} unités
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {payload?.payload?.count} produits
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                strokeWidth={3}
                stroke="var(--background)"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {formatNumber(totalStock)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            unités
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {chartData.map((item) => {
              const percentage = totalStock > 0 
                ? Math.round((item.value / totalStock) * 100) 
                : 0;
              
              return (
                <Link
                  key={item.category}
                  href={`/produits?category=${item.category}`}
                  className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {percentage}% • {formatNumber(item.value)} unités
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button variant="ghost" size="sm" className="w-full gap-1" asChild>
          <Link href="/produits">
            Voir tous les produits
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
