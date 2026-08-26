"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { IconUser, IconShieldCheck, IconSettings, IconLogout } from "@tabler/icons-react";

const isMockMode =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
  process.env.USE_MOCK_DATA === "true";

function MockUserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold ring-offset-background transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Menu utilisateur"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
              PE
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">Pharmacien Essaouira</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Démo
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              demo@pharmasaf.ma
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/produits" className="flex items-center gap-2 cursor-pointer">
            <IconShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span>Rôle: Administrateur</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/rapports" className="flex items-center gap-2 cursor-pointer">
            <IconUser className="h-4 w-4 text-muted-foreground" />
            <span>Pharmacie Provinciale</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/sign-in" className="flex items-center gap-2 text-destructive cursor-pointer">
            <IconLogout className="h-4 w-4" />
            <span>Changer de session</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ClerkUserButtonWrapper() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { UserButton } = require("@clerk/nextjs");
    return (
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 rounded-lg",
          },
        }}
      />
    );
  } catch {
    return <MockUserDropdown />;
  }
}

export function AuthUserButton() {
  if (isMockMode) {
    return <MockUserDropdown />;
  }

  return <ClerkUserButtonWrapper />;
}
