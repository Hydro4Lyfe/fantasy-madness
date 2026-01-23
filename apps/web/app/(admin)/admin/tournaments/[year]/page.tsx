export default async function AdminTournamentPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Admin Tournament {year}</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: admin tools for tournaments (locks, recompute, sanity checks).</p>
    </main>
  );
}
