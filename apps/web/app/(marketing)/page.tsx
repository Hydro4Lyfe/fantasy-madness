import Link from "next/link";

export default function MarketingHome() {
  return (
    <main style={{ display: "grid", gap: 16, maxWidth: 880 }}>
      <h1 style={{ margin: 0 }}>Fantasy Madness</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>
        March Madness, but with drafts, picks, and leaderboards that don’t explode when multiple pods show up.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/play">Play</Link>
        <Link href="/drafts">Drafts</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/pricing">Pricing</Link>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Quick start</h2>
        <ol style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
          <li>Pick a tournament year.</li>
          <li>Choose Solo or Global, or create a Draft.</li>
          <li>Make picks, watch games lock in, climb the leaderboard.</li>
        </ol>
      </div>
    </main>
  );
}
