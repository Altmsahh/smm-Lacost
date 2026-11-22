import { PrismaClient } from "@prisma/client";

// Prevent Windows-specific query engine DLL from breaking Linux/Vercel deployments
if (process.env.PRISMA_QUERY_ENGINE_LIBRARY && process.platform !== "win32") {
  delete process.env.PRISMA_QUERY_ENGINE_LIBRARY;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

