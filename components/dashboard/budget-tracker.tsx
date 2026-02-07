"use client"

import * as React from "react"
import Link from "next/link"
import { Category } from "@/lib/types";
import { IconAlertTriangle, IconChevronDown, IconCoins, IconArrowRight, IconBuildingHospital } from "@tabler/icons-react"
import { RippleButton } from "@/components/ui/ripple-button"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface BudgetConsumption {
  category: Category
  budget: number
  consumed: number
  remaining: number
  percentage: number
  quarter: number
  year: number
}

interface BudgetTrackerProps {
  data: BudgetConsumption[]
}

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  INSULINE: "Insuline",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit Matériel",
  MATERIEL_BUREAU: "Matériel Bureau",
}

export function BudgetTracker({ data }: BudgetTrackerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Calculate totals
  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0)
  const totalConsumed = data.reduce((sum, item) => sum + item.consumed, 0)
  const totalPercentage = totalBudget > 0 ? Math.round((totalConsumed / totalBudget) * 100) : 0

  // Find critical categories (>80% consumed)
  const criticalCategories = data.filter((item) => item.percentage > 80)

  const quarter = data[0]?.quarter || Math.floor(new Date().getMonth() / 3) + 1
  const year = data[0]?.year || new Date().getFullYear()

  if (data.length === 0) {
    const emptyQuarter = Math.floor(new Date().getMonth() / 3) + 1
    const emptyYear = new Date().getFullYear()
    
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Budget T{emptyQuarter} {emptyYear}
          </CardTitle>
          <CardDescription className="text-xs">
            Consommation par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <IconCoins className="w-10 h-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Aucune donnée de budget</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Les allocations apparaîtront ici</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Budget T{quarter} {year}
            </CardTitle>
            <CardDescription className="text-xs">
              Consommation par catégorie
            </CardDescription>
          </div>
          <div className="text-right">
            <p className={cn(
              "text-lg sm:text-xl lg:text-2xl font-bold tabular-nums",
              totalPercentage > 90 ? "text-rose-600" :
              totalPercentage > 70 ? "text-amber-600" :
              "text-emerald-600"
            )}>
              {totalPercentage}%
            </p>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
              {formatCurrency(totalConsumed)} / {formatCurrency(totalBudget)}
            </p>
          </div>
        </div>

        {criticalCategories.length > 0 && (
          <div className="mt-2 p-1.5 sm:p-2 rounded-md bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800">
            <p className="text-[10px] sm:text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1 sm:gap-1.5">
              <IconAlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="font-medium">
                {criticalCategories.length} catégorie{criticalCategories.length > 1 ? 's' : ''} à plus de 80%
              </span>
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Link 
                href={`/produits?category=${item.category}`}
                className="font-medium hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-none"
              >
                <span className="hidden sm:inline">{categoryLabels[item.category]}</span>
                <span className="sm:hidden">{categoryLabels[item.category].split(' ')[0]}</span>
              </Link>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={cn(
                  "text-[10px] sm:text-xs tabular-nums font-medium",
                  item.percentage > 90 ? "text-rose-600" :
                  item.percentage > 70 ? "text-amber-600" :
                  "text-emerald-600"
                )}>
                  {item.percentage}%
                </span>
                <Badge 
                  variant="outline" 
                  className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5 hidden sm:inline-flex"
                >
                  {formatCurrency(item.consumed)}
                </Badge>
              </div>
            </div>
            
            <Progress 
              value={Math.min(item.percentage, 100)} 
              className={cn(
                "h-1.5 sm:h-2",
                item.percentage > 90 ? "bg-rose-200 [&>div]:bg-rose-500" :
                item.percentage > 70 ? "bg-amber-200 [&>div]:bg-amber-500" :
                "bg-emerald-200 [&>div]:bg-emerald-500"
              )}
            />
            
            <div className="flex justify-between text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
              <span>Reste: {formatCurrency(item.remaining)}</span>
              <span className="sm:hidden">{formatCurrency(item.consumed)}</span>
              <span className="hidden sm:inline">Budget: {formatCurrency(item.budget)}</span>
            </div>
          </div>
        ))}

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs h-8 gap-1.5 hover:bg-primary/5"
            >
              {isOpen ? "Voir moins" : "Voir détails"}
              <IconChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3 mt-3 border-t space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-muted-foreground">Budget Total</p>
                  <p className="font-semibold tabular-nums">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="text-center p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30">
                  <p className="text-emerald-700 dark:text-emerald-300">Consommé</p>
                  <p className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalConsumed)}
                  </p>
                </div>
                <div className="text-center p-2 rounded-md bg-blue-50 dark:bg-blue-950/30">
                  <p className="text-blue-700 dark:text-blue-300">Restant</p>
                  <p className="font-semibold tabular-nums text-blue-700 dark:text-blue-300">
                    {formatCurrency(totalBudget - totalConsumed)}
                  </p>
                </div>
              </div>
              
              <Link href="/hopitaux">
                <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
                  <span>Voir les allocations par hôpital</span>
                  <IconArrowRight className="w-3 h-3 ml-1" />
                </RippleButton>
              </Link>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
