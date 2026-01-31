import Link from "next/link";
import { getOptionalUser } from "@/server/auth/guards";

export default async function MarketingHome() {
  const user = await getOptionalUser();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full mb-6">
            <span className="text-sm text-slate-300">March Madness Fantasy Basketball</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Draft Your Path to
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Tournament Glory
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Strategic drafts, smart picks, and a scoring system that rewards upsets.
            Compete in private drafts or go head-to-head in the global contest.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {user ? (
            <>
              <Link
                href="/drafts"
                className="px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline shadow-lg"
              >
                Go to Drafts
              </Link>
              <Link
                href="/play"
                className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-all no-underline"
              >
                My Picks
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline shadow-lg"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-all no-underline"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
        {!user && (
          <p className="text-sm text-slate-400">No credit card required. Start playing today.</p>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Two Ways to Play</h2>
          <p className="text-slate-400">Choose your strategy and compete for the top spot</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Draft Mode */}
          <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Draft Mode</h3>
            <p className="text-slate-300 mb-6">
              Create or join 8-player drafts. Snake draft your bracket slots,
              build your roster, and compete against friends in private leagues.
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✓</span>
                <span>8-player snake drafts with live updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✓</span>
                <span>Customizable pick timers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✓</span>
                <span>Private leagues with invite codes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✓</span>
                <span>Real-time draft room experience</span>
              </li>
            </ul>
          </div>

          {/* Global Mode */}
          <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Global Mode</h3>
            <p className="text-slate-300 mb-6">
              Pick your best 8 bracket slots without draft constraints.
              Compete against all players for the highest possible score.
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">✓</span>
                <span>Pick any 8 slots you want</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">✓</span>
                <span>No draft order restrictions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">✓</span>
                <span>Compete on the global leaderboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">✓</span>
                <span>Maximum scoring potential</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Scoring Section */}
        <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Scoring That Rewards Upsets</h3>
              <p className="text-slate-300 mb-4">
                Our unique <strong className="text-white">Seed × Wins</strong> formula means higher seeds score more points per win.
                A 16-seed winning one game scores 16 points, while a 1-seed needs 16 wins to match that.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">16 pts</div>
                  <div className="text-sm text-slate-400">16-seed, 1 win</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">16 pts</div>
                  <div className="text-sm text-slate-400">8-seed, 2 wins</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-2xl font-bold text-purple-400 mb-1">16 pts</div>
                  <div className="text-sm text-slate-400">1-seed, 16 wins</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Play-in games don't count. Scoring starts from Round 1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border border-slate-700">
              1
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Selection Sunday</h3>
            <p className="text-slate-400">
              Wait for the bracket to be announced. Both modes open after Selection Sunday.
            </p>
          </div>
          <div>
            <div className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border border-slate-700">
              2
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Make Your Picks</h3>
            <p className="text-slate-400">
              Draft bracket slots or pick your top 8. Entries close when play-ins end.
            </p>
          </div>
          <div>
            <div className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border border-slate-700">
              3
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Watch & Win</h3>
            <p className="text-slate-400">
              Track your score live as games conclude. Climb the leaderboard and claim glory.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="glass-card rounded-2xl p-12 border border-slate-700/50">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Draft Your Bracket?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players competing in the ultimate March Madness fantasy experience.
          </p>
          {user ? (
            <Link
              href="/drafts"
              className="inline-block px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline shadow-lg"
            >
              Go to Drafts
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline shadow-lg"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
