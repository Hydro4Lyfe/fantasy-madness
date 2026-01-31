import { requireUserId } from "@/server/auth/guards";
import { getDraftResults } from "@fantasy-madness/dal";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default async function DraftResultsPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const userId = await requireUserId();

  const results = await getDraftResults({ draftId });

  const currentUserParticipant = results.participants.find((p) => p.userId === userId);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <Link href="/drafts" className="hover:text-slate-300 transition-colors">
            Drafts
          </Link>
          <span>/</span>
          <Link
            href={`/drafts/${draftId}/room`}
            className="hover:text-slate-300 transition-colors"
          >
            {results.name}
          </Link>
          <span>/</span>
          <span className="text-slate-300">Results</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">{results.name}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{results.tournamentName}</span>
          <span>•</span>
          <span>{results.draftType} Draft</span>
          <span>•</span>
          <span>{results.participants.length} Participants</span>
        </div>
      </div>

      {/* Leaderboard */}
      <GlassCard title="Final Standings" className="mb-8">
        <div className="space-y-3">
          {results.participants.map((participant, index) => {
            const isCurrentUser = participant.userId === userId;
            const totalPicks = participant.picks.length;
            const picksWithWins = participant.picks.filter((p) => p.wins > 0).length;

            return (
              <div
                key={participant.userId}
                className={`rounded-lg p-4 border transition-all ${
                  isCurrentUser
                    ? "bg-indigo-900/30 border-indigo-500/50"
                    : "bg-slate-800/40 border-slate-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {participant.rank === 1 ? (
                        <span className="text-3xl">🥇</span>
                      ) : participant.rank === 2 ? (
                        <span className="text-3xl">🥈</span>
                      ) : participant.rank === 3 ? (
                        <span className="text-3xl">🥉</span>
                      ) : (
                        <span className="text-xl font-bold text-slate-400">
                          #{participant.rank}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {participant.userName || "Unknown User"}
                        </span>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                            You
                          </span>
                        )}
                        {participant.isHost && (
                          <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        Pick Order: {participant.pickOrder} • {picksWithWins}/{totalPicks}{" "}
                        picks scored
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {participant.totalScore}
                    </div>
                    <div className="text-xs text-slate-400">points</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Detailed Pick Breakdown */}
      {results.participants.map((participant) => {
        const isCurrentUser = participant.userId === userId;
        const sortedPicks = [...participant.picks].sort((a, b) => b.pickScore - a.pickScore);

        return (
          <GlassCard
            key={participant.userId}
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>
                    {participant.userName || "Unknown User"}
                    {isCurrentUser ? " (You)" : ""}
                  </span>
                  <span className="text-sm font-normal text-slate-400">
                    Rank #{participant.rank}
                  </span>
                </div>
                <div className="text-2xl font-bold">{participant.totalScore} pts</div>
              </div>
            }
            className="mb-6"
          >
            <div className="grid gap-3">
              {/* Pick Header */}
              <div className="grid grid-cols-[60px_1fr_100px_100px_100px_80px] gap-3 px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700/50">
                <div>Pick #</div>
                <div>Team</div>
                <div>Seed</div>
                <div>Wins</div>
                <div>Score</div>
                <div className="text-right">Type</div>
              </div>

              {/* Pick Rows */}
              {sortedPicks.map((pick) => {
                const hasWins = pick.wins > 0;
                const displayName = pick.teamName || `Q${pick.quadrant}-${pick.seed}`;

                return (
                  <div
                    key={pick.slotId}
                    className={`grid grid-cols-[60px_1fr_100px_100px_100px_80px] gap-3 px-3 py-3 rounded-lg transition-colors ${
                      hasWins
                        ? "bg-emerald-900/20 border border-emerald-700/30"
                        : "bg-slate-800/30 border border-slate-700/30"
                    }`}
                  >
                    <div className="text-slate-400 text-sm">#{pick.overallPickNo}</div>
                    <div className="font-medium text-white truncate" title={displayName}>
                      {displayName}
                    </div>
                    <div className="text-slate-300">
                      <span className="px-2 py-1 bg-slate-700/50 rounded text-sm">
                        {pick.seed}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      {hasWins ? (
                        <span className="px-2 py-1 bg-emerald-700/30 rounded text-sm font-semibold">
                          {pick.wins}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-700/30 rounded text-sm text-slate-500">
                          0
                        </span>
                      )}
                    </div>
                    <div className="font-bold">
                      {hasWins ? (
                        <span className="text-emerald-400">{pick.pickScore}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      {pick.isAutoPick ? (
                        <span className="px-2 py-1 bg-amber-700/20 text-amber-400 rounded border border-amber-700/30">
                          Auto
                        </span>
                      ) : (
                        <span className="text-slate-500">Manual</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Summary Row */}
              <div className="grid grid-cols-[60px_1fr_100px_100px_100px_80px] gap-3 px-3 py-3 border-t border-slate-700/50 font-bold">
                <div></div>
                <div className="text-white">Total</div>
                <div></div>
                <div className="text-slate-300">
                  {participant.picks.reduce((sum, p) => sum + p.wins, 0)}
                </div>
                <div className="text-emerald-400 text-lg">{participant.totalScore}</div>
                <div></div>
              </div>
            </div>
          </GlassCard>
        );
      })}

      {/* Scoring Legend */}
      <GlassCard title="Scoring Formula" className="mb-8">
        <div className="space-y-4">
          <p className="text-slate-300">
            Each pick scores points based on the formula:{" "}
            <span className="font-bold text-white">Seed × Wins</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <p className="text-sm text-slate-400">
            Play-in games do not count toward win totals. Only wins in the main tournament
            bracket are scored.
          </p>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link
          href={`/drafts/${draftId}/room`}
          className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-all no-underline"
        >
          Back to Draft Room
        </Link>
        <Link
          href="/drafts"
          className="px-6 py-3 text-slate-300 font-semibold hover:text-white transition-colors no-underline"
        >
          View All Drafts
        </Link>
      </div>
    </main>
  );
}
