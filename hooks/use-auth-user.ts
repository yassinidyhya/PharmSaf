"use client";

import * as React from "react";

const isMockMode =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
  process.env.USE_MOCK_DATA === "true";

export interface SafeUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  publicMetadata?: Record<string, unknown>;
}

const MOCK_SAFE_USER: SafeUser = {
  id: "user-demo",
  firstName: "Pharmacien",
  lastName: "Essaouira",
  fullName: "Pharmacien Essaouira",
  username: "pharmacien",
  imageUrl: null,
  primaryEmailAddress: { emailAddress: "demo@pharmasaf.ma" },
  publicMetadata: { role: "admin" },
};

function useClerkUserSafe() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useUser } = require("@clerk/nextjs");
    return useUser();
  } catch {
    return { isLoaded: true, isSignedIn: false, user: null };
  }
}

export function useAuthUser(): {
  user: SafeUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
} {
  if (isMockMode) {
    return {
      user: MOCK_SAFE_USER,
      isLoaded: true,
      isSignedIn: true,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerk = useClerkUserSafe();
  return {
    user: clerk.user ?? null,
    isLoaded: clerk.isLoaded ?? true,
    isSignedIn: !!clerk.isSignedIn,
  };
}
