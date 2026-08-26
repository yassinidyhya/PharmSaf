/**
 * Database client — switches between the real Prisma client and the
 * in-memory mock client depending on the USE_MOCK_DATA environment variable.
 *
 * IMPORTANT: We do NOT statically import PrismaClient here because Prisma
 * validates DATABASE_URL at import time. In mock mode we never need the real
 * client, so we skip the import entirely to avoid the "Environment variable
 * not found: DATABASE_URL" error.
 */

import { mockPrisma } from "./mock-db";
import type { PrismaClient } from "@prisma/client";

const isMockMode = process.env.USE_MOCK_DATA === "true";

// In mock mode export the in-memory client immediately — no DB, no Prisma init.
// In real mode lazily create (and cache) a PrismaClient singleton.

type PrismaClientType = PrismaClient;

const globalForPrisma = global as unknown as { prisma: PrismaClientType };

async function getRealPrisma(): Promise<PrismaClientType> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const { PrismaClient } = await import("@prisma/client");
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

// Synchronously export the mock client when in mock mode so that server
// actions can import `prisma` without awaiting.
export const prisma: PrismaClientType = isMockMode
  ? (mockPrisma as unknown as PrismaClientType)
  : // In real mode this cast is fine — the singleton is created on first use
    new Proxy({} as PrismaClientType, {
      get(_target, prop) {
        // Return a lazy getter that resolves the real client on first access
        return new Proxy(() => {}, {
          apply(_fn, _thisArg, args) {
            return getRealPrisma().then((client) =>
              (client as any)[prop](...args)
            );
          },
          get(_fn, innerProp) {
            return (...args: any[]) =>
              getRealPrisma().then((client) =>
                (client as any)[prop][innerProp](...args)
              );
          },
        });
      },
    });

export default prisma;

