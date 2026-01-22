import { Pool, type PoolClient } from "pg";

/**
 * Distributed mutex for Kubernetes / multi-pod safety.
 *
 * Why this exists:
 * - Postgres advisory locks are held by a *session/connection*.
 * - Prisma uses a pool, so `prisma.$queryRaw('pg_try_advisory_lock')` and later
 *   `prisma.$queryRaw('pg_advisory_unlock')` can (and often will) run on *different*
 *   sessions — which means the unlock does nothing and the lock can be stuck
 *   until the original connection is recycled.
 *
 * Fix:
 * - Use a dedicated `pg` client connection for the duration of the critical
 *   section so lock + unlock are guaranteed to hit the same session.
 *
 * Notes:
 * - Prefer DIRECT_DATABASE_URL (no pgbouncer) for session locks.
 * - Falls back to DATABASE_URL if DIRECT_DATABASE_URL is not set.
 */

const connectionString =
  process.env.DIRECT_DATABASE_URL ??
  process.env.DATABASE_URL ??
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  // Don't throw at import time in case this module is bundled/loaded for tooling.
  // We'll throw when someone tries to use the lock.
}

let pool: Pool | null = null;
function getPool(): Pool {
  if (pool) return pool;
  if (!connectionString) {
    throw new Error(
      "Missing DIRECT_DATABASE_URL (preferred) or DATABASE_URL for advisory locks",
    );
  }
  pool = new Pool({ connectionString });
  return pool;
}

async function tryLock(client: PoolClient, lockName: string): Promise<boolean> {
  const res = await client.query<{ acquired: boolean }>(
    "SELECT pg_try_advisory_lock(hashtext($1)::bigint) AS acquired",
    [lockName],
  );
  return Boolean(res.rows?.[0]?.acquired);
}

async function unlock(client: PoolClient, lockName: string): Promise<void> {
  await client.query("SELECT pg_advisory_unlock(hashtext($1)::bigint)", [lockName]);
}

export async function withAdvisoryLock<T>(
  lockName: string,
  fn: () => Promise<T>,
): Promise<{ ran: boolean; result?: T }> {
  const client = await getPool().connect();
  try {
    const acquired = await tryLock(client, lockName);
    if (!acquired) return { ran: false };

    try {
      const result = await fn();
      return { ran: true, result };
    } finally {
      await unlock(client, lockName).catch(() => undefined);
    }
  } finally {
    client.release();
  }
}
