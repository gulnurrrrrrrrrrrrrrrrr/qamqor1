import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Prisma] DATABASE_URL is not set — API database calls will fail");
  } else {
    console.log("[Prisma] Client initialized");
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let connectionChecked = false;
let connectionOk = false;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Throws ApiError-compatible message when DATABASE_URL is missing. */
export function assertDatabaseConfigured(): void {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured. Set DATABASE_URL in your .env file.");
  }
}

/** Ping database once per process (cached). */
export async function ensureDatabaseConnection(): Promise<void> {
  assertDatabaseConfigured();
  if (connectionChecked && connectionOk) return;

  try {
    await prisma.$queryRaw`SELECT 1`;
    connectionOk = true;
    if (!connectionChecked) {
      console.log("[Prisma] Database connection OK");
    }
  } catch (err) {
    connectionOk = false;
    console.error("[Prisma] Database connection failed", err);
    throw new Error("Database connection failed. Check DATABASE_URL and that PostgreSQL is running.");
  } finally {
    connectionChecked = true;
  }
}
