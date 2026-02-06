"use client"

import * as React from "react"
import Link from "next/link"
import { Category } from "@prisma/client"
import { IconArrowRight, IconChartBar } from "@tabler/icons-react"
import { RippleButton } from "@/components/ui/ripple-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface CategoryData {
  category: Category
  count: number
  stock: number
  value: number
}

interface CategoryDistributionProps {
  data: CategoryData[]
}

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit Matériel",
  MATERIEL_BUREAU: "Matériel Bureau",
}

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-500",
  VACCIN: "bg-emerald-500",
  REACTIF: "bg-violet-500",
  CONSOMMABLE: "bg-amber-500",
  PETIT_MATERIEL: "bg-cyan-500",
  MATERIEL_BUREAU: "bg-slate-500",
}

export function CategoryDistribution({ data }: CategoryDistributionProps) {
  const totalStock = data.reduce((acc, item) => acc + item.stock, 0)
  const totalProducts = data.reduce((acc, item) => acc + item.count, 0)

  // Sort by stock value descending
  const sortedData = [...data].sort((a, b) => b.stock - a.stock)

  if (data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Stock par Catégorie</CardTitle>
          <CardDescription className="text-xs">Répartition du stock</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <IconChartBar className="w-10 h-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Aucune donnée disponible</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Les statistiques apparaîtront ici</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Stock par Catégorie</CardTitle>
            <CardDescription className="text-xs">
              {formatNumber(totalStock)} unités · {totalProducts} produits
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold tabular-nums">{data.length}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">catégories</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-2">
        {sortedData.map((item) => {
          const percentage = totalStock > 0 ? Math.round((item.stock / totalStock) * 100) : 0
          
          return (
            <Link
              key={item.category}
              href={`/produits?category=${item.category}`}
              className="group block"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium group-hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-none">
                    {categoryLabels[item.category]}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] h-4 sm:h-5">
                      {percentage}%
                    </Badge>
                    <span className="text-[10px] sm:text-xs tabular-nums w-12 sm:w-16 text-right">
                      {formatNumber(item.stock)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Progress 
                    value={percentage} 
                    className={cn("h-1.5 sm:h-2 flex-1", categoryColors[item.category])}
                  />
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                  {item.count} produit{item.count > 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          )
        })}
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link href="/produits">
          <RippleButton rippleColor="hsl(var(--primary))" className="hover:text-primary hover:border-primary/50">
            <span>Voir tous les produits</span>
            <IconArrowRight className="w-3 h-3 ml-1" />
          </RippleButton>
        </Link>
      </CardFooter>
    </Card>
  )
}
