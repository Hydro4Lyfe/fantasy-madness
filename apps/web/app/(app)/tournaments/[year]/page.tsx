import Link from "next/link";

export default async function TournamentHubPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;

  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Tournament {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Hub page. Hook up DAL queries here: tournament meta, lock windows, counts.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={`/tournaments/${year}/bracket`}>Bracket</Link>
        <Link href={`/play/solo/${year}`}>Play Solo</Link>
        <Link href={`/play/global/${year}`}>Join Global</Link>
        <Link href={`/leaderboards/global/${year}`}>Global Leaderboard</Link>
      </div>
    </main>
  );
}
