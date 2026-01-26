import { requireUserId } from "@/server/auth/guards";

export default async function DraftResultsPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  await requireUserId();

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Draft Results</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>Draft: <code>{draftId}</code></p>
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: show final rosters, computed scores, standings.</p>
    </main>
  );
}
