export default async function GlobalLeaderboardPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Global Leaderboard — {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        TODO: DAL query: leaderboard snapshot by tournament/year.
      </p>
    </main>
  );
}
