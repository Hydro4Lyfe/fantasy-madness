import { requireUserId } from "@/server/auth/guards";

export default async function AccountEntriesPage() {
  const userId = requireUserId();
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>My Entries</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: list solo/global entries for user <code>{userId}</code></p>
    </main>
  );
}
