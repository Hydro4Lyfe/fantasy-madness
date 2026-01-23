export default async function DraftLeaderboardPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Draft Leaderboard</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Draft: <code>{draftId}</code>
      </p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        TODO: DAL query: draft score standings.
      </p>
    </main>
  );
}
