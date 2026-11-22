import { PrismaClient } from "@prisma/client";

// Prevent Windows-specific query engine DLL from breaking Linux/Vercel deployments
if (process.env.PRISMA_QUERY_ENGINE_LIBRARY && process.platform !== "win32") {
  delete process.env.PRISMA_QUERY_ENGINE_LIBRARY;
}

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_3VqDfxXUF9lc@ep-green-mode-bewo2r7e-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const DEFAULT_DIRECT_URL =
  "postgresql://neondb_owner:npg_3VqDfxXUF9lc@ep-green-mode-bewo2r7e.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";

// Fallback in case Vercel environment variables are missing or empty string
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

if (!process.env.DIRECT_URL || process.env.DIRECT_URL.trim() === "") {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}

const activeDbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? process.env.DATABASE_URL
    : DEFAULT_DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: activeDbUrl,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

