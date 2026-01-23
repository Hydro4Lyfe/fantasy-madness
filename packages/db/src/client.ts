import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db).");

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type DbClient = PrismaClient | Prisma.TransactionClient;

// ✅ 1-arg style (db optional, defaults to prisma)
export async function withTx<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  db: PrismaClient = prisma,
): Promise<T> {
  return db.$transaction((tx) => fn(tx));
}
