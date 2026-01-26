import { requireUserId } from "@/server/auth/guards";

export default async function SoloEntryPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  // For now this just proves the auth boundary works.
  const userId = await requireUserId();

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>My Solo Entry — {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        User: <code>{userId}</code>
      </p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        TODO: DAL queries: get bracket slots, get my picks, save picks via server action.
      </p>
    </main>
  );
}
