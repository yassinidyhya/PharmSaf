"use client"

import { UserButton } from "@clerk/nextjs"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser() {
  return (
    <SidebarMenu className="md:hidden">
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg",
              },
            }}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Mon Compte</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
