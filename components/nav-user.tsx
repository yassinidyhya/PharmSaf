"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AuthUserButton } from "@/components/auth-user-button";
import { useAuthUser } from "@/hooks/use-auth-user";

export function NavUser() {
  const { user } = useAuthUser();

  return (
    <SidebarMenu className="md:hidden">
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-3 py-2">
          <AuthUserButton />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.fullName || user?.firstName || "Pharmacien Essaouira"}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
