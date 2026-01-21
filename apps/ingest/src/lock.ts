import { prisma } from "@fantasy-madness/db";

/**
 * Postgres advisory lock using a stable int hash derived from the lock name.
 * This prevents multiple ingestion workers from running concurrently.
 */
export async function withAdvisoryLock<T>(
  lockName: string,
  fn: () => Promise<T>
): Promise<{ ran: boolean; result?: T }> {
  const acquired = await tryLock(lockName);
  if (!acquired) return { ran: false };

  try {
    const result = await fn();
    return { ran: true, result };
  } finally {
    await unlock(lockName);
  }
}

async function tryLock(lockName: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ acquired: boolean }[]>`
    SELECT pg_try_advisory_lock(hashtext(${lockName})::bigint) AS acquired
  `;
  return Boolean(rows?.[0]?.acquired);
}

async function unlock(lockName: string): Promise<void> {
  await prisma.$queryRaw`
    SELECT pg_advisory_unlock(hashtext(${lockName})::bigint)
  `;
}
