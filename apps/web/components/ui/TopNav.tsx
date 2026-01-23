import Link from "next/link";

export function TopNav(props: { variant?: "app" | "admin" }) {
  const items = props.variant === "admin"
    ? [
        ["/admin", "Admin"],
        ["/admin/ingest", "Ingest"],
        ["/admin/ingest/sync-logs", "Sync Logs"],
      ]
    : [
        ["/play", "Play"],
        ["/tournaments/2026", "Tournament"],
        ["/drafts", "Drafts"],
        ["/leaderboards/global/2026", "Leaderboards"],
        ["/account", "Account"],
      ];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(10,10,12,0.75)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href={props.variant === "admin" ? "/admin" : "/"} style={{ color: "white", textDecoration: "none", fontWeight: 700 }}>
          Fantasy Madness
        </Link>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {items.map(([href, label]) => (
            <Link key={href} href={href} style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
