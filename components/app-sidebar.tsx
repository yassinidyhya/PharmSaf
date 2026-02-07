"use client"

import * as React from "react"
import {
  IconBuildingHospital,
  IconDashboard,
  IconPackage,
  IconPackageExport,
  IconPill,
  IconReport,
  IconSettings,
  IconTruckDelivery,
  IconUpload,
  IconBabyCarriage,
  IconHeartRateMonitor,
  IconVaccine,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Stock",
      url: "/inventaire",
      icon: IconPackage,
    },
    {
      title: "Médicaments et DM",
      url: "/produits",
      icon: IconPill,
    },
    {
      title: "Insuline",
      url: "/insuline",
      icon: IconVaccine,
    },
    {
      title: "Kit d'accouchement",
      url: "/kits",
      icon: IconBabyCarriage,
    },
    {
      title: "Centres de santé",
      url: "/hopitaux",
      icon: IconBuildingHospital,
    },
    {
      title: "Distributions",
      url: "/distributions",
      icon: IconPackageExport,
    },
    {
      title: "Bons Livraison",
      url: "/bons-livraison",
      icon: IconTruckDelivery,
    },
  ],
  navTools: [
    {
      title: "Rapports",
      url: "/rapports",
      icon: IconReport,
    },
    {
      title: "Import",
      url: "/import",
      icon: IconUpload,
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "#",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500">
                  <IconBuildingHospital className="!size-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">Pharmacie</span>
                  <span className="text-xs text-muted-foreground leading-tight">Provinciale</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} />
        <SidebarSeparator className="mx-4 my-2 w-auto" />
        <NavSecondary 
          items={data.navTools} 
          title="Outils"
        />
        <div className="mt-auto">
          <SidebarSeparator className="mx-4 my-2 w-auto" />
          <NavSecondary items={data.navSecondary} />
        </div>
      </SidebarContent>
      <SidebarFooter className="md:hidden">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
