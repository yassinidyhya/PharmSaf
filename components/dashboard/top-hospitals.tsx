"use client"

import Link from "next/link"
import { IconArrowRight, IconBuildingHospital } from "@tabler/icons-react"
import { RippleButton } from "@/components/ui/ripple-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface HospitalData {
  hospitalId: string
  hospitalName: string
  totalQuantity: number
  totalValue: number
}

interface TopHospitalsProps {
  data: HospitalData[]
}

// Generate consistent colors for hospitals
function getHospitalColor(index: number): string {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
  ]
  return colors[index % colors.length]
}

export function TopHospitals({ data }: TopHospitalsProps) {
  const totalQuantity = data.reduce((sum, h) => sum + h.totalQuantity, 0)
  const maxQuantity = Math.max(...data.map(h => h.totalQuantity), 1)

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Top Hôpitaux</CardTitle>
          <CardDescription className="text-xs">Consommation par établissement</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <IconBuildingHospital className="w-10 h-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Aucune donnée disponible</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Les consommations apparaîtront ici</p>
        </CardContent>
      </Card>
    )
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
            <p className="text-lg sm:text-xl font-bold tabular-nums">{formatNumber(totalQuantity)}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">unités distribuées</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {data.map((hospital, index) => {
          const percentage = maxQuantity > 0 ? Math.round((hospital.totalQuantity / maxQuantity) * 100) : 0
          
          return (
            <Link
              key={hospital.hospitalId}
              href={`/hopitaux/${hospital.hospitalId}`}
              className="group block"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge variant="outline" className="w-4 h-4 sm:w-5 sm:h-5 p-0 flex items-center justify-center text-[9px] sm:text-[10px]">
                      {index + 1}
                    </Badge>
                    <span className="font-medium truncate max-w-[120px] sm:max-w-[140px] lg:max-w-[180px] group-hover:text-primary transition-colors">
                      {hospital.hospitalName}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs tabular-nums font-medium">
                    {formatNumber(hospital.totalQuantity)}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn("h-1.5 sm:h-2", getHospitalColor(index))}
                />
              </div>
            </Link>
          )
        })}
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link href="/hopitaux">
          <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
            <span>Voir tous les hôpitaux</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  )
}
