export default async function BracketPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Bracket {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Render bracket slots + outcomes. DAL target: list bracket slots, candidates, resolved winners.
      </p>
    </main>
  );
}
