import Link from "next/link";
import { getOptionalUser } from "@/server/auth/guards";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();

  return (
    <div className="min-h-screen">
      {/* Simple header for marketing pages */}
      <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🏀</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white m-0">Fantasy Madness</h1>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    href="/drafts"
                    className="text-sm font-medium text-slate-400 hover:text-slate-200 transition no-underline"
                  >
                    Drafts
                  </Link>
                  <Link
                    href="/play"
                    className="text-sm font-medium text-slate-400 hover:text-slate-200 transition no-underline"
                  >
                    My Picks
                  </Link>
                  <Link
                    href="/account"
                    className="px-4 py-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium rounded-lg no-underline text-sm hover:from-indigo-600 hover:to-purple-700 transition"
                  >
                    Account
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/how-it-works"
                    className="text-sm font-medium text-slate-400 hover:text-slate-200 transition no-underline"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-400 hover:text-slate-200 transition no-underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium rounded-lg no-underline text-sm hover:from-indigo-600 hover:to-purple-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <p className="m-0">© 2026 Fantasy Madness. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="hover:text-slate-200 transition no-underline">
                How It Works
              </Link>
              <Link href="/faq" className="hover:text-slate-200 transition no-underline">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
