"use client";

import Link from "next/link";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { IconBuildingHospital, IconArrowRight, IconTrendingUp } from "@tabler/icons-react";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HospitalData {
  hospitalId: string;
  hospitalName: string;
  totalQuantity: number;
  totalValue: number;
}

interface TopHospitalsProps {
  data: HospitalData[];
}

const chartConfig = {
  totalQuantity: {
    label: "Quantité",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Truncate hospital name for display
function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "...";
}

export function TopHospitals({ data }: TopHospitalsProps) {
  const chartData = data.map((h) => ({
    name: h.hospitalName,
    shortName: truncateName(h.hospitalName, 16),
    quantity: h.totalQuantity,
    value: h.totalValue,
    id: h.hospitalId,
  }));

  const totalQuantity = data.reduce((sum, h) => sum + h.totalQuantity, 0);
  const totalValue = data.reduce((sum, h) => sum + h.totalValue, 0);

  // Empty state
  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Top Hôpitaux</CardTitle>
          <CardDescription>Consommation par établissement</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <IconBuildingHospital className="size-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconBuildingHospital className="w-5 h-5 text-primary" />
              Top Hôpitaux
            </CardTitle>
            <CardDescription>Consommation par établissement</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatNumber(totalQuantity)}</p>
            <p className="text-xs text-muted-foreground">unités distribuées</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
          >
            <XAxis type="number" dataKey="quantity" hide />
            <YAxis
              dataKey="shortName"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={110}
              style={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value: number, _name, payload) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{payload?.payload?.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {formatNumber(value)} unités
                        </span>
                        {payload?.payload?.value > 0 && (
                          <span className="text-muted-foreground">
                            • {formatCurrency(payload.payload.value)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="quantity"
              fill="var(--color-totalQuantity)"
              radius={[0, 4, 4, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ChartContainer>

        {/* Hospital List Preview */}
        <div className="mt-4 space-y-2">
          {data.slice(0, 3).map((hospital, index) => (
            <Link
              key={hospital.hospitalId}
              href={`/hopitaux/${hospital.hospitalId}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center shrink-0 text-xs">
                  {index + 1}
                </Badge>
                <span className="text-sm truncate group-hover:text-primary transition-colors">
                  {truncateName(hospital.hospitalName, 25)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{formatNumber(hospital.totalQuantity)}</span>
                <span className="text-xs text-muted-foreground">unités</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button variant="ghost" size="sm" className="w-full gap-1" asChild>
          <Link href="/hopitaux">
            Voir tous les hôpitaux
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
