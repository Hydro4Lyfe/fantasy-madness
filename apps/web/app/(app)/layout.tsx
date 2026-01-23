import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/">Fantasy Madness</Link>
        <span style={{ opacity: 0.35 }}>|</span>
        <Link href="/play">Play</Link>
        <Link href="/tournaments/2026">Tournaments</Link>
        <Link href="/drafts">Drafts</Link>
        <Link href="/leaderboards/global/2026">Leaderboards</Link>
        <span style={{ flex: 1 }} />
        <Link href="/account">Account</Link>
      </header>
      {children}
    </div>
  );
}
