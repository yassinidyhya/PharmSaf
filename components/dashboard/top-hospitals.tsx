"use client";

import Link from "next/link";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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
import { formatNumber } from "@/lib/utils";
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
function truncateName(name: string, maxLength: number = 18): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "...";
}

export function TopHospitals({ data }: TopHospitalsProps) {
  const chartData = data.map((h) => ({
    name: h.hospitalName,
    shortName: truncateName(h.hospitalName, 14),
    quantity: h.totalQuantity,
    value: h.totalValue,
    id: h.hospitalId,
  }));

  const totalQuantity = data.reduce((sum, h) => sum + h.totalQuantity, 0);

  // Empty state
  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Top Hôpitaux</CardTitle>
          <CardDescription className="text-xs">Consommation par établissement</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
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
            <CardTitle className="text-base sm:text-lg">Top Hôpitaux</CardTitle>
            <CardDescription className="text-xs">Consommation par établissement</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold">{formatNumber(totalQuantity)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">unités distribuées</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[160px] sm:h-[180px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
          >
            <XAxis type="number" dataKey="quantity" hide />
            <YAxis
              dataKey="shortName"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={90}
              style={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.1 }}
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
            <Bar
              dataKey="quantity"
              fill="var(--color-totalQuantity)"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>

        {/* Hospital List Preview */}
        <div className="mt-3 space-y-1">
          {data.slice(0, 3).map((hospital, index) => (
            <Link
              key={hospital.hospitalId}
              href={`/hopitaux/${hospital.hospitalId}`}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                <span className="truncate group-hover:text-primary transition-colors">
                  {truncateName(hospital.hospitalName, 22)}
                </span>
              </div>
              <span className="font-medium text-xs shrink-0">
                {formatNumber(hospital.totalQuantity)}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/hopitaux">
            Voir tous les hôpitaux
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
