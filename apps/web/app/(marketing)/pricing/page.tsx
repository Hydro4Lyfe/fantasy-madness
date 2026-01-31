import Link from "next/link";
import { getOptionalUser } from "@/server/auth/guards";

export default async function Pricing() {
  const user = await getOptionalUser();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Pricing</h1>
        <p className="text-xl text-slate-300">
          Simple, transparent, and free forever
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="glass-card rounded-2xl p-8 border border-slate-700/50 text-center">
          <div className="mb-6">
            <div className="text-5xl font-bold text-white mb-2">Free</div>
            <p className="text-slate-300">Forever and always</p>
          </div>

          <ul className="space-y-3 text-left mb-8">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">✓</span>
              <span className="text-slate-300">Unlimited draft participation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">✓</span>
              <span className="text-slate-300">Global contest entries</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">✓</span>
              <span className="text-slate-300">Real-time scoring and leaderboards</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">✓</span>
              <span className="text-slate-300">Create private leagues</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">✓</span>
              <span className="text-slate-300">Historical tournament data</span>
            </li>
          </ul>

          {user ? (
            <Link
              href="/drafts"
              className="inline-block px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline w-full"
            >
              Go to Drafts
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all no-underline w-full"
            >
              Get Started Free
            </Link>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          No credit card required. No hidden fees. Just March Madness fun.
        </p>
      </div>
    </main>
  );
}
