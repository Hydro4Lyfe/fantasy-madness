import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 880 }}>
      <h1 style={{ margin: 0 }}>How it works</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        The ingest service keeps tournaments, teams, bracket slots, and game results fresh. The web app handles entries,
        picks, drafts, and leaderboards.
      </p>

      <h2 style={{ margin: "12px 0 0" }}>Modes</h2>
      <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
        <li><b>Solo</b>: You against the clock and the bracket.</li>
        <li><b>Global</b>: Everyone in one contest.</li>
        <li><b>Drafts</b>: Private rooms, pick order, roster size, and trash talk.</li>
      </ul>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Link href="/play">Go to Play</Link>
        <Link href="/drafts">Go to Drafts</Link>
      </div>
    </main>
  );
}
