"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/hooks/use-auth-user"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface CommandMenuProps {
  products?: Array<{
    id: string
    name: string
    code: string
  }>
  hospitals?: Array<{
    id: string
    name: string
    code: string
  }>
}

export function CommandMenu({ products = [], hospitals = [] }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { user } = useAuthUser()

  // Keyboard shortcut to open command menu
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const userRole = user?.publicMetadata?.role as string | undefined

  const navigationItems = [
    {
      group: "Navigation",
      items: [
        { label: "Tableau de Bord", href: "/", shortcut: "⌘D" },
        { label: "Produits", href: "/produits", shortcut: "⌘P" },
        { label: "Inventaire", href: "/inventaire", shortcut: "⌘I" },
        { label: "Hôpitaux", href: "/hopitaux", shortcut: "⌘H" },
        { label: "Distributions", href: "/distributions", shortcut: "⌘L" },
        { label: "Bons de Livraison", href: "/bons-livraison", shortcut: "⌘B" },
        { label: "Rapports", href: "/rapports", shortcut: "⌘R" },
      ],
    },
    {
      group: "Actions",
      items: [
        { label: "Nouveau Produit", href: "/produits/nouveau" },
        { label: "Nouvelle Entrée", href: "/inventaire/entrees/nouveau" },
        { label: "Nouvelle Distribution", href: "/distributions/nouveau" },
        { label: "Nouvel Hôpital", href: "/hopitaux/nouveau" },
      ],
    },
  ]

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* Keyboard Shortcut Indicator */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden md:flex items-center gap-2 px-3 py-1.5",
          "text-xs text-muted-foreground bg-muted rounded-md",
          "hover:bg-muted/80 transition-colors"
        )}
      >
        <span>Rechercher...</span>
        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher un produit, hôpital, ou commande..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Actions Rapides">
            <CommandItem onSelect={() => handleSelect("/produits/nouveau")}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouveau Produit
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/inventaire/entrees/nouveau")}>
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              Nouvelle Entrée
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/distributions/nouveau")}>
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              Nouvelle Distribution
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Products */}
          {products.length > 0 && (
            <CommandGroup heading="Produits">
              {products.slice(0, 5).map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleSelect(`/produits/${product.id}`)}
                >
                  <PackageIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">{product.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {product.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Hospitals */}
          {hospitals.length > 0 && (
            <CommandGroup heading="Hôpitaux">
              {hospitals.slice(0, 5).map((hospital) => (
                <CommandItem
                  key={hospital.id}
                  onSelect={() => handleSelect(`/hopitaux/${hospital.id}`)}
                >
                  <BuildingIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">{hospital.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {hospital.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelect("/")}>
              <HomeIcon className="mr-2 h-4 w-4" />
              Tableau de Bord
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/produits")}>
              <PackageIcon className="mr-2 h-4 w-4" />
              Produits
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/inventaire")}>
              <ClipboardIcon className="mr-2 h-4 w-4" />
              Inventaire
              <CommandShortcut>⌘I</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/hopitaux")}>
              <BuildingIcon className="mr-2 h-4 w-4" />
              Hôpitaux
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/distributions")}>
              <TruckIcon className="mr-2 h-4 w-4" />
              Distributions
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/bons-livraison")}>
              <FileIcon className="mr-2 h-4 w-4" />
              Bons de Livraison
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/rapports")}>
              <ChartIcon className="mr-2 h-4 w-4" />
              Rapports
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

// Simple icon components
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  )
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
