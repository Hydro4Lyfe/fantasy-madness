export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-slate-300">
          Common questions about Fantasy Madness
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">When do picks lock?</h3>
          <p className="text-slate-300">
            Both Draft and Global modes open immediately after Selection Sunday when the bracket
            is announced. Entries close when the play-in games end (Thursday), right before Round 1 begins.
            The tournament hub will show the exact lock windows.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">How does scoring work?</h3>
          <p className="text-slate-300">
            Points are calculated using the formula: <strong className="text-white">Seed × Wins</strong>.
            This means a 16-seed winning one game scores 16 points, while a 1-seed needs 16 wins to match that.
            Play-in games do not count toward scoring—only wins from Round 1 onwards.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">What's the difference between Draft and Global modes?</h3>
          <p className="text-slate-300 mb-3">
            <strong className="text-white">Draft Mode:</strong> 8-player snake drafts where you take turns
            picking bracket slots. Strategic and competitive, perfect for private leagues with friends.
          </p>
          <p className="text-slate-300">
            <strong className="text-white">Global Mode:</strong> Pick any 8 bracket slots you want without
            constraints. Everyone competes in one massive contest. Higher scoring potential since there are
            no draft restrictions.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">Is this real-time?</h3>
          <p className="text-slate-300">
            Yes! Draft rooms use WebSocket connections for real-time updates. When someone makes a pick,
            everyone in the draft room sees it instantly. Scores are updated live as games conclude throughout
            the tournament.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">How many players can join a draft?</h3>
          <p className="text-slate-300">
            Draft Mode requires exactly 8 players. This ensures a balanced draft where each player
            gets 8 picks (64 total bracket slots divided by 8 players).
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">What happens if someone doesn't pick in time?</h3>
          <p className="text-slate-300">
            If a draft has pick timers enabled and someone doesn't make their pick before time expires,
            the system will automatically pick the highest-seeded available bracket slot for them. This keeps
            the draft moving and prevents delays.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">Can I change my picks after submitting?</h3>
          <p className="text-slate-300">
            No, once picks are made they are final. In Draft Mode, picks are locked immediately when submitted.
            In Global Mode, you can change your picks until entries close (when play-ins end). After that,
            all picks are locked.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2">What are bracket slots?</h3>
          <p className="text-slate-300">
            Instead of picking teams directly, you pick bracket slots (like "East Region, 1-seed" or
            "South Region, 16-seed"). This handles play-in games elegantly—whichever team wins the play-in
            game fills that slot. Your pick automatically follows the winning team.
          </p>
        </div>
      </div>
    </main>
  );
}
