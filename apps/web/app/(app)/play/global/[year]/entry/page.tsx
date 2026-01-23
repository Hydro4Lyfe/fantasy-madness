import { requireUserId } from "@/server/auth/guards";

export default async function GlobalEntryPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const userId = requireUserId();

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>My Global Entry — {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        User: <code>{userId}</code>
      </p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        TODO: DAL queries: get or create global entry, load picks, upsert picks.
      </p>
    </main>
  );
}
