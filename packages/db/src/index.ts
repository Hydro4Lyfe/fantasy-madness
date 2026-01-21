import { PrismaClient } from "@prisma/client";

// One PrismaClient per process (prevents exhausting connections in dev/hot reload scenarios)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
