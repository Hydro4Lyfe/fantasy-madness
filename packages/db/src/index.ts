import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// In Docker + Node, this must be a DIRECT connection string (no pgbouncer).
// If you only have DATABASE_URL, use that. If you have DIRECT_URL, prefer it.
const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL for Prisma Postgres connection");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Global singleton (prevents creating tons of pools in dev/hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
