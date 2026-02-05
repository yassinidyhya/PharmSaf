"use client"

import * as React from "react"
import {
  IconBuildingHospital,
  IconDashboard,
  IconPackage,
  IconPackageExport,
  IconPackageImport,
  IconPill,
  IconReport,
  IconSettings,
  IconTruckDelivery,
  IconUpload,
  IconUsers,
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
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Inventaire",
      url: "/inventaire",
      icon: IconPackage,
    },
    {
      title: "Produits",
      url: "/produits",
      icon: IconPill,
    },
    {
      title: "Hôpitaux",
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
              <a href="/">
                <IconBuildingHospital className="!size-5" />
                <span className="text-base font-semibold">Pharmacie Provinciale</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="md:hidden">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
