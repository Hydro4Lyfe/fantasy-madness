import Link from "next/link";
import { getOptionalUser } from "@/server/auth/guards";

export default async function HowItWorksPage() {
  const user = await getOptionalUser();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">How It Works</h1>
        <p className="text-xl text-slate-300">
          Everything you need to know about Fantasy Madness
        </p>
      </div>

      {/* Game Modes */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Game Modes</h2>
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-2">Draft Mode</h3>
            <p className="text-slate-300">
              Create or join 8-player drafts. Snake draft your bracket slots in real-time,
              build your roster strategically, and compete against friends in private leagues.
              Perfect for groups who want a competitive draft experience.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-2">Global Mode</h3>
            <p className="text-slate-300">
              Pick your best 8 bracket slots without any draft constraints. Everyone competes
              in one massive contest. Since there are no roster restrictions, this mode allows
              for the highest possible scores. Great for players who want maximum flexibility.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Tournament Timeline</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Selection Sunday</h3>
              <p className="text-slate-300">
                The bracket is announced. Both Draft and Global modes open immediately.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <span className="text-lg">⏰</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Play-in Games (Tue/Wed)</h3>
              <p className="text-slate-300">
                Play-in games determine final bracket spots. These games DO NOT count for scoring.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <span className="text-lg">🔒</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Entries Close (Thursday)</h3>
              <p className="text-slate-300">
                Both modes close when play-ins end and Round 1 begins. No more picks allowed.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <span className="text-lg">🏆</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Tournament Begins</h3>
              <p className="text-slate-300">
                Round 1 starts and scoring begins. Watch your picks win and climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Scoring System</h2>
        <div className="glass-card rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-white mb-2">Points = Seed × Wins</div>
            <p className="text-slate-300">Higher seeds score more points per win</p>
          </div>

          <div className="space-y-3 text-slate-300">
            <p>
              <strong className="text-white">Why this rewards upsets:</strong> A 16-seed winning just one game
              scores the same as a 1-seed winning 16 games. This creates exciting strategy where
              picking the right upset can be more valuable than picking favorites.
            </p>
            <p>
              <strong className="text-white">Examples:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>16-seed with 1 win = 16 points</li>
              <li>8-seed with 2 wins = 16 points</li>
              <li>4-seed with 4 wins = 16 points</li>
              <li>1-seed with 6 wins = 6 points</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-sm text-amber-200 m-0">
            <strong>Important:</strong> Play-in games do not count toward scoring. Only wins from Round 1 onwards are counted.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="glass-card rounded-xl p-8 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-6">
            Join now and start preparing for the next tournament.
          </p>
          <div className="flex items-center justify-center gap-4">
            {user ? (
              <>
                <Link
                  href="/drafts"
                  className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline"
                >
                  Go to Drafts
                </Link>
                <Link
                  href="/play"
                  className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-all no-underline"
                >
                  Go to Play
                </Link>
              </>
            ) : (
              <Link
                href="/signup"
                className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline"
              >
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
