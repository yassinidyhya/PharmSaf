"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  "": "Tableau de bord",
  "produits": "Produits",
  "nouveau": "Nouveau",
  "inventaire": "Inventaire",
  "entrees": "Entrées",
  "sorties": "Sorties",
  "peremption": "Péremption",
  "hopitaux": "Hôpitaux",
  "allocations": "Allocations",
  "distributions": "Distributions",
  "bons-livraison": "Bons de Livraison",
  "rapports": "Rapports",
  "trimestriel": "Trimestriel",
  "annuel": "Annuel",
  "activite": "Activité",
  "import": "Import",
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Always start with home
  const items: BreadcrumbItem[] = [{ label: "Tableau de bord", href: "/" }];
  
  if (pathname === "/") {
    return items;
  }
  
  // Split path and build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  let currentPath = "";
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Check if it's a dynamic segment (ID)
    const isDynamic = segment.length > 8 && /^[a-z0-9]+$/.test(segment);
    
    if (isDynamic) {
      // For dynamic routes, show as "Détail" or use parent context
      const parentSegment = segments[i - 1];
      const parentLabel = parentSegment ? routeLabels[parentSegment] : "";
      items.push({ 
        label: parentLabel ? `Détail ${parentLabel.slice(0, -1)}` : "Détail",
        href: i === segments.length - 1 ? undefined : currentPath 
      });
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = i === segments.length - 1;
      items.push({ 
        label, 
        href: isLast ? undefined : currentPath 
      });
    }
  }
  
  return items;
}

export function SiteHeader() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href || "/"}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 rounded-lg",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
