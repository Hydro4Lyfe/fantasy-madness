import Link from "next/link";

export default function PlayPage() {
  return (
    <main style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Play</h1>
      <p style={{ margin: 0, opacity: 0.85 }}>Choose a mode. (DAL wiring comes next.)</p>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Solo</h3>
          <p style={{ marginTop: 0, opacity: 0.85 }}>One entry, slot-based picks.</p>
          <Link href="/play/solo/2026">Start Solo (2026)</Link>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Global</h3>
          <p style={{ marginTop: 0, opacity: 0.85 }}>Everyone competes in one contest.</p>
          <Link href="/play/global/2026">Join Global (2026)</Link>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>Drafts</h3>
          <p style={{ marginTop: 0, opacity: 0.85 }}>Private rooms, pick order, roster size.</p>
          <Link href="/drafts">Go to Drafts</Link>
        </div>
      </div>
    </main>
  );
}
