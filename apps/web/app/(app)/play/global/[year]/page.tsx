import Link from "next/link";

export default async function GlobalModePage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Global Contest — {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>Join the global contest and make your picks.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={`/play/global/${year}/entry`}>Go to my entry</Link>
        <Link href={`/leaderboards/global/${year}`}>View leaderboard</Link>
      </div>
    </main>
  );
}
