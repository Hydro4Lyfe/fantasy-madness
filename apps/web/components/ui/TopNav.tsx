import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { getOptionalUser } from "@/server/auth/guards";

export async function TopNav(props: { variant?: "app" | "admin" }) {
  const user = await getOptionalUser();

  const items = props.variant === "admin"
    ? [
        ["/admin", "Admin"],
        ["/admin/ingest", "Ingest"],
        ["/admin/ingest/sync-logs", "Sync Logs"],
      ]
    : [
        ["/drafts", "Drafts"],
        ["/play", "My Picks"],
        ["/leaderboards/global/2026", "Leaderboard"],
        ["/tournaments/2026", "Bracket"],
      ];

  // Get user initials for avatar
  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="glass-card border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={props.variant === "admin" ? "/admin" : "/"} className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🏀</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white m-0">Fantasy Madness</h1>
              <p className="text-xs text-gray-400 m-0">March Madness Draft Central</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {items.map(([href, label], i) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition no-underline ${
                  i === 0 ? "text-gray-300 hover:text-white" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-sm font-bold text-white" href={"/account"}>
                  {initials}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 gradient-primary text-white font-medium rounded-lg no-underline text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
