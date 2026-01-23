import Link from "next/link";
import { requireAdmin } from "@/server/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // DEV-only guard. Replace with real auth/roles.
  requireAdmin();

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/">Home</Link>
        <span style={{ opacity: 0.35 }}>|</span>
        <Link href="/admin">Admin</Link>
        <Link href="/admin/ingest">Ingest</Link>
        <Link href="/admin/ingest/sync-logs">Sync logs</Link>
      </header>
      {children}
    </div>
  );
}
