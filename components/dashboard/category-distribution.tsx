"use client";

import * as React from "react";
import Link from "next/link";
import { Label, Pie, PieChart } from "recharts";

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
          <CardTitle className="text-base sm:text-lg">Stock par Catégorie</CardTitle>
          <CardDescription className="text-xs">Répartition du stock</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
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
            <CardTitle className="text-base sm:text-lg">Stock par Catégorie</CardTitle>
            <CardDescription className="text-xs">Répartition du stock total</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Chart */}
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[180px] sm:max-h-[200px] flex-1"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value: number, _name, payload) => (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-xs">{payload?.payload?.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatNumber(value)} unités
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
                innerRadius={45}
                strokeWidth={2}
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
                            className="fill-foreground text-lg font-bold"
                          >
                            {formatNumber(totalStock)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-muted-foreground text-[10px]"
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
          <div className="flex flex-row sm:flex-col flex-wrap justify-center gap-2 sm:gap-1.5 sm:min-w-[120px]">
            {chartData.map((item) => {
              const percentage = totalStock > 0 
                ? Math.round((item.value / totalStock) * 100) 
                : 0;
              
              return (
                <Link
                  key={item.category}
                  href={`/produits?category=${item.category}`}
                  className="group flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {percentage}% • {formatNumber(item.value)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/produits">
            Voir tous les produits
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
