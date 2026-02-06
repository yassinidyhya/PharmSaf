"use client"

import * as React from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Category } from "@prisma/client"
import { IconAlertTriangle, IconPackageOff, IconClock, IconDotsVertical, IconEye, IconShoppingCart, IconTruckDelivery, IconCheck, IconAlertCircle } from "@tabler/icons-react"

import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface CriticalProduct {
  id: string
  code: string
  name: string
  category: Category
  unit: string
  currentStock: number
  minStock: number
  daysUntilExpiry: number | null
  batchNumber: string | null
  urgency: "CRITICAL" | "WARNING" | "NOTICE"
  urgencyType: "EXPIRY" | "LOW_STOCK" | "BOTH"
}

interface CriticalProductsTableProps {
  data: CriticalProduct[]
}

const categoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicament",
  VACCIN: "Vaccin",
  REACTIF: "Réactif",
  CONSOMMABLE: "Consommable",
  PETIT_MATERIEL: "Petit Matériel",
  MATERIEL_BUREAU: "Matériel Bureau",
}

const categoryColors: Record<Category, string> = {
  MEDICAMENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  VACCIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REACTIF: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  CONSOMMABLE: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  PETIT_MATERIEL: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  MATERIEL_BUREAU: "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300",
}

export function CriticalProductsTable({ data }: CriticalProductsTableProps) {
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const columns: ColumnDef<CriticalProduct>[] = [
    {
      accessorKey: "name",
      header: "Produit",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="min-w-0">
            <Link 
              href={`/produits/${product.id}`}
              className="font-medium hover:text-primary transition-colors line-clamp-1"
            >
              {product.name}
            </Link>
            <p className="text-xs text-muted-foreground">{product.code}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => {
        const category = row.getValue("category") as Category
        return (
          <Badge variant="secondary" className={cn("text-[10px] sm:text-xs px-1.5 sm:px-2.5", categoryColors[category])}>
            <span className="hidden sm:inline">{categoryLabels[category]}</span>
            <span className="sm:hidden">{category.slice(0, 3)}</span>
          </Badge>
        )
      },
    },
    {
      accessorKey: "currentStock",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original
        const percentage = product.minStock > 0 
          ? Math.min((product.currentStock / product.minStock) * 100, 100) 
          : 0
        
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={cn(
                "font-medium tabular-nums",
                product.currentStock <= product.minStock * 0.5 && "text-rose-600"
              )}>
                {formatNumber(product.currentStock)}
              </span>
              <span className="text-muted-foreground">
                /{formatNumber(product.minStock)}
              </span>
            </div>
            <Progress 
              value={percentage} 
              className={cn(
                "h-1.5",
                product.currentStock === 0 ? "bg-rose-200 [&>div]:bg-rose-500" :
                product.currentStock <= product.minStock * 0.5 ? "bg-amber-200 [&>div]:bg-amber-500" :
                "bg-emerald-200 [&>div]:bg-emerald-500"
              )}
            />
          </div>
        )
      },
    },
    {
      accessorKey: "daysUntilExpiry",
      header: "Péremption",
      cell: ({ row }) => {
        const days = row.getValue("daysUntilExpiry") as number | null
        const batchNumber = row.original.batchNumber
        
        if (days === null) {
          return <span className="text-muted-foreground text-xs">-</span>
        }
        
        return (
          <div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                days <= 0 ? "border-rose-300 text-rose-700 bg-rose-50" :
                days <= 7 ? "border-rose-300 text-rose-700 bg-rose-50" :
                days <= 30 ? "border-amber-300 text-amber-700 bg-amber-50" :
                "border-slate-300"
              )}
            >
              {days <= 0 ? `Périmé ${Math.abs(days)}j` : `${days}j`}
            </Badge>
            {batchNumber && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Lot: {batchNumber}</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "urgency",
      header: "Urgence",
      cell: ({ row }) => {
        const urgency = row.getValue("urgency") as string
        const type = row.original.urgencyType
        
        const labels: Record<string, string> = {
          CRITICAL: "Critique",
          WARNING: "Attention",
          NOTICE: "Info",
        }
        
        const typeLabels: Record<string, string> = {
          EXPIRY: "Péremption",
          LOW_STOCK: "Stock",
          BOTH: "Stock + Pér.",
        }

        const TypeIcon = type === "EXPIRY" ? IconClock : IconPackageOff
        
        return (
          <div className="flex flex-col gap-0.5">
            <Badge 
              variant={urgency === "CRITICAL" ? "destructive" : urgency === "WARNING" ? "secondary" : "outline"}
              className="text-[10px] sm:text-xs w-fit gap-0.5 sm:gap-1 px-1 sm:px-2"
            >
              <IconAlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{labels[urgency]}</span>
              <span className="sm:hidden">{labels[urgency].slice(0, 4)}</span>
            </Badge>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-0.5 sm:gap-1">
              <TypeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{typeLabels[type]}</span>
              <span className="sm:hidden">{type === "EXPIRY" ? "Pér." : type === "LOW_STOCK" ? "Stock" : "Les 2"}</span>
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/5">
                <span className="sr-only">Actions</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/inventaire/entrees/nouveau?product=${product.id}`} className="gap-2">
                  <IconShoppingCart className="w-4 h-4" />
                  Commander
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/distributions/nouveau?product=${product.id}`} className="gap-2">
                  <IconTruckDelivery className="w-4 h-4" />
                  Distribuer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/produits/${product.id}`} className="gap-2">
                  <IconEye className="w-4 h-4" />
                  Voir détails
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Produits Critiques</CardTitle>
          <CardDescription className="text-xs">Stock faible et péremption imminente</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <IconCheck className="w-10 h-10 mb-3 text-emerald-500" />
          <p className="text-sm font-medium text-muted-foreground">Aucun produit critique</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Tous les stocks sont dans les normes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      filterColumn="name"
      filterPlaceholder="Rechercher un produit..."
    />
  )
}
