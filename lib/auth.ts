"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { User } from "@prisma/client";

/**
 * Gets the current user from Clerk and ensures they exist in the local database.
 * Creates the user if they don't exist yet (lazy sync pattern).
 * 
 * @returns The local User record or null if not authenticated
 */
export async function getOrCreateUser(): Promise<User | null> {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return null;
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // If not found, fetch from Clerk and create
  if (!user) {
    try {
      const clerkUser = await (await clerkClient()).users.getUser(clerkId);
      
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const firstName = clerkUser.firstName ?? "";
      const lastName = clerkUser.lastName ?? "";

      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
        },
      });
    } catch (error) {
      console.error("Failed to sync user from Clerk:", error);
      return null;
    }
  }

  return user;
}

/**
 * Gets just the local user ID for use in audit logs.
 * Returns null if user doesn't exist and can't be created.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getOrCreateUser();
  return user?.id ?? null;
}

/**
 * Requires authentication. Throws if not authenticated.
 * All server actions should call this at the start.
 */
export async function requireAuth(): Promise<User> {
  const user = await getOrCreateUser();
  
  if (!user) {
    throw new Error("Non authentifié. Veuillez vous connecter.");
  }
  
  return user;
}
