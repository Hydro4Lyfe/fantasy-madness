/**
 * Temporary dev-only auth scaffolding.
 * Replace with Auth.js / Supabase / Clerk / your real provider.
 */

export function requireUserId(): string {
  const userId = process.env.DEV_USER_ID;
  if (!userId) {
    throw new Error("Auth not configured. Set DEV_USER_ID in apps/web/.env.local to use scaffolded authenticated routes.");
  }
  return userId;
}

export function requireAdmin(): void {
  const isAdmin = process.env.DEV_ADMIN === "1" || process.env.DEV_ADMIN === "true";
  if (!isAdmin) {
    throw new Error("Admin not configured. Set DEV_ADMIN=1 in apps/web/.env.local for local scaffolding.");
  }
}
