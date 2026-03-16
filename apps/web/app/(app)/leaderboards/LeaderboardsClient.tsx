"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  User,
  Target,
  Globe,
  ChevronRight,
  Shield,
  BarChart3,
  Plus,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatBlock } from "@/components/shared/StatBlock";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

// ─── Types ───────────────────────────────────────────────────────────────────

type LeaderboardType = "global" | "drafts" | "leagues";

export interface DraftLeaderboardParticipant {
  userId: string;
  userName: string | null;
  userImage: string | null;
  totalScore: number;
  rank: number;
}

export interface DraftLeaderboard {
  id: string;
  name: string;
  participantCount: number;
  yourRank: number | null;
  status: "active" | "draft" | "completed";
  participants: DraftLeaderboardParticipant[];
}

export interface GlobalLeaderboard {
  contestId: string;
  tournamentName: string;
  seasonYear: number;
  totalEntries: number;
  hasEntered: boolean;
  yourRank: number | null;
  yourPoints: number;
  topPlayers: { rank: number; name: string; image: string | null; points: number }[];
}

export interface LeagueLeaderboardParticipant {
  userId: string;
  userName: string | null;
  userImage: string | null;
  totalScore: number;
  rank: number;
}

export interface LeagueLeaderboard {
  id: string;
  name: string;
  participantCount: number;
  yourRank: number | null;
  status: "active" | "open" | "completed";
  isHost: boolean;
  participants: LeagueLeaderboardParticipant[];
}

interface LeaderboardsClientProps {
  draftLeaderboards?: DraftLeaderboard[];
  globalLeaderboard?: GlobalLeaderboard | null;
  leagueLeaderboards?: LeagueLeaderboard[];
}

// ─── Tab Config ──────────────────────────────────────────────────────────────

const tabs: {
  key: LeaderboardType;
  label: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
}[] = [
  {
    key: "global",
    label: "Global",
    icon: Globe,
    color: "text-[#3B82F6]",
    borderColor: "bg-[#3B82F6]",
  },
  {
    key: "drafts",
    label: "Drafts",
    icon: Zap,
    color: "text-[#10B981]",
    borderColor: "bg-[#10B981]",
  },
  {
    key: "leagues",
    label: "Leagues",
    icon: Shield,
    color: "text-[#F59E0B]",
    borderColor: "bg-[#F59E0B]",
  },
];

// ─── Rank Badge ──────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0";
  if (rank === 1)
    return (
      <div
        className={cn(
          base,
          "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
        )}
      >
        1
      </div>
    );
  if (rank === 2)
    return (
      <div
        className={cn(
          base,
          "bg-gradient-to-br from-slate-300 to-slate-400 text-black"
        )}
      >
        2
      </div>
    );
  if (rank === 3)
    return (
      <div
        className={cn(
          base,
          "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
        )}
      >
        3
      </div>
    );
  return (
    <div className={cn(base, "bg-secondary text-muted-foreground")}>
      {rank}
    </div>
  );
}

// ─── Status Badges ──────────────────────────────────────────────────────────

function DraftStatusBadge({ status }: { status: DraftLeaderboard["status"] }) {
  const config = {
    active: {
      label: "LIVE",
      classes: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
      pulse: true,
      dotColor: "bg-[#10B981]",
    },
    draft: {
      label: "UPCOMING",
      classes: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
      pulse: false,
      dotColor: "",
    },
    completed: {
      label: "ENDED",
      classes: "bg-[#8B949E]/15 text-[#8B949E] border-[#8B949E]/30",
      pulse: false,
      dotColor: "",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
        config.classes
      )}
    >
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              config.dotColor
            )}
            style={{ animation: "pulse-live 2s ease-in-out infinite" }}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              config.dotColor
            )}
          />
        </span>
      )}
      {config.label}
    </span>
  );
}

function LeagueStatusBadge({ status }: { status: LeagueLeaderboard["status"] }) {
  const config = {
    active: {
      label: "LOCKED",
      classes: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
      pulse: true,
      dotColor: "bg-[#F59E0B]",
    },
    open: {
      label: "OPEN",
      classes: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
      pulse: false,
      dotColor: "",
    },
    completed: {
      label: "ENDED",
      classes: "bg-[#8B949E]/15 text-[#8B949E] border-[#8B949E]/30",
      pulse: false,
      dotColor: "",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
        config.classes
      )}
    >
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              config.dotColor
            )}
            style={{ animation: "pulse-live 2s ease-in-out infinite" }}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              config.dotColor
            )}
          />
        </span>
      )}
      {config.label}
    </span>
  );
}

// ─── Participant Avatar ──────────────────────────────────────────────────────

function ParticipantAvatar({
  image,
  name,
  size = 28,
}: {
  image: string | null;
  name: string | null;
  size?: number;
}) {
  if (image) {
    return (
      <ImageWithFallback
        src={image}
        alt={name ?? "User"}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <User className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}

// ─── Draft Card ──────────────────────────────────────────────────────────────

function DraftCard({ draft }: { draft: DraftLeaderboard }) {
  return (
    <Link href={`/drafts/${draft.id}`} className="block group">
      <div
        className={cn(
          "bg-card border border-border rounded-lg border-l-2 border-l-[#10B981]",
          "hover:border-border/60 transition-all duration-200"
        )}
      >
        <div className="p-4">
          {/* Header: name + status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-[#10B981] transition-colors duration-200">
              {draft.name}
            </h3>
            <DraftStatusBadge status={draft.status} />
          </div>

          {/* Participants */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>
              {draft.participantCount} player{draft.participantCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Participant Rankings */}
          {draft.participants.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {draft.participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-2 py-1"
                >
                  <RankBadge rank={p.rank} />
                  <ParticipantAvatar image={p.userImage} name={p.userName} />
                  <span className="text-xs font-medium text-foreground truncate flex-1">
                    {p.userName ?? "Anonymous"}
                  </span>
                  <span className="text-xs font-mono font-semibold text-muted-foreground tabular-nums">
                    {p.totalScore} pts
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Your Rank + View Details */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {draft.yourRank !== null ? (
                <>
                  <RankBadge rank={draft.yourRank} />
                  <div>
                    <div
                      className={cn(
                        "font-display text-lg font-bold uppercase tracking-tight leading-none",
                        draft.yourRank === 1 && "text-yellow-400",
                        draft.yourRank === 2 && "text-slate-300",
                        draft.yourRank === 3 && "text-amber-500",
                        draft.yourRank > 3 && "text-foreground"
                      )}
                    >
                      #{draft.yourRank}
                    </div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                      Your Rank
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Rank not available
                </span>
              )}
            </div>

            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#10B981]/10 border border-[#10B981]/20 group-hover:bg-[#10B981]/20 transition-colors duration-200">
              <ChevronRight className="w-4 h-4 text-[#10B981]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── League Card ─────────────────────────────────────────────────────────────

function LeagueCard({ league }: { league: LeagueLeaderboard }) {
  return (
    <Link href={`/leagues/${league.id}`} className="block group">
      <div
        className={cn(
          "bg-card border border-border rounded-lg border-l-2 border-l-[#F59E0B]",
          "hover:border-border/60 transition-all duration-200"
        )}
      >
        <div className="p-4">
          {/* Header: name + status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-[#F59E0B] transition-colors duration-200">
                {league.name}
              </h3>
              {league.isHost && (
                <Crown className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
              )}
            </div>
            <LeagueStatusBadge status={league.status} />
          </div>

          {/* Participants */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>
              {league.participantCount} player{league.participantCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Participant Rankings */}
          {league.participants.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {league.participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-2 py-1"
                >
                  <RankBadge rank={p.rank} />
                  <ParticipantAvatar image={p.userImage} name={p.userName} />
                  <span className="text-xs font-medium text-foreground truncate flex-1">
                    {p.userName ?? "Anonymous"}
                  </span>
                  <span className="text-xs font-mono font-semibold text-muted-foreground tabular-nums">
                    {p.totalScore} pts
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Your Rank + View Details */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {league.yourRank !== null ? (
                <>
                  <RankBadge rank={league.yourRank} />
                  <div>
                    <div
                      className={cn(
                        "font-display text-lg font-bold uppercase tracking-tight leading-none",
                        league.yourRank === 1 && "text-yellow-400",
                        league.yourRank === 2 && "text-slate-300",
                        league.yourRank === 3 && "text-amber-500",
                        league.yourRank > 3 && "text-foreground"
                      )}
                    >
                      #{league.yourRank}
                    </div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                      Your Rank
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Rank not available
                </span>
              )}
            </div>

            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#F59E0B]/10 border border-[#F59E0B]/20 group-hover:bg-[#F59E0B]/20 transition-colors duration-200">
              <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Global Leaderboard Table ────────────────────────────────────────────────

function GlobalLeaderboardContent({
  leaderboard,
}: {
  leaderboard: GlobalLeaderboard;
}) {
  return (
    <div className="space-y-4">
      {/* Contest Info Header */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground font-display uppercase tracking-wide">
                {leaderboard.tournamentName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {leaderboard.seasonYear} Season
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <StatBlock
              value={leaderboard.totalEntries}
              label="Entries"
            />
            <div className="w-px h-8 bg-border" />
            <StatBlock
              value={leaderboard.yourRank !== null ? `#${leaderboard.yourRank}` : "—"}
              label="Your Rank"
              valueClassName={
                leaderboard.yourRank === 1
                  ? "text-yellow-400"
                  : leaderboard.yourRank !== null && leaderboard.yourRank <= 3
                    ? "text-[#3B82F6]"
                    : undefined
              }
            />
            <div className="w-px h-8 bg-border" />
            <StatBlock
              value={leaderboard.yourPoints}
              label="Your Points"
              valueClassName="text-[#3B82F6]"
            />
          </div>
        </div>
      </div>

      {/* Top Players Table */}
      {leaderboard.topPlayers.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground font-display uppercase tracking-wide flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#3B82F6]" />
              Top Players
            </h3>
          </div>
          <div className="divide-y divide-border">
            {leaderboard.topPlayers.map((player, i) => (
              <div
                key={`${player.rank}-${player.name}-${i}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <RankBadge rank={player.rank} />
                <ParticipantAvatar image={player.image} name={player.name} />
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {player.name}
                </span>
                <span className="text-sm font-mono font-semibold text-muted-foreground tabular-nums">
                  {player.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg">
          <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No Scores Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Scores will appear once the tournament begins
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enter CTA if not entered */}
      {!leaderboard.hasEntered && (
        <Link
          href="/global-contest/picks"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-lg text-sm font-medium text-white bg-[#3B82F6] hover:bg-[#3B82F6]/90 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Enter Global Contest
        </Link>
      )}
    </div>
  );
}

// ─── No Contest Placeholder ──────────────────────────────────────────────────

function NoGlobalContestCard() {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
          <Globe className="w-6 h-6 text-[#3B82F6]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            No Active Contest
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            The global championship will be available once a tournament is active
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LeaderboardsClient({
  draftLeaderboards = [],
  globalLeaderboard = null,
  leagueLeaderboards = [],
}: LeaderboardsClientProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("global");

  // Compute summary stats across all contest types
  const totalContests =
    draftLeaderboards.length +
    leagueLeaderboards.length +
    (globalLeaderboard?.hasEntered ? 1 : 0);

  const activeDrafts = draftLeaderboards.filter(
    (d) => d.status === "active"
  ).length;
  const activeLeagues = leagueLeaderboards.filter(
    (l) => l.status === "active"
  ).length;
  const activeCount = activeDrafts + activeLeagues;

  const allRanks = [
    ...draftLeaderboards.map((d) => d.yourRank),
    ...leagueLeaderboards.map((l) => l.yourRank),
    globalLeaderboard?.yourRank ?? null,
  ].filter((r): r is number => r !== null);

  const bestRank = allRanks.length > 0 ? Math.min(...allRanks) : null;

  return (
    <div className="space-y-6">
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg px-5 sm:px-7 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground">
                Standings
              </h1>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Track your performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <StatBlock
              value={totalContests}
              label="Contests"
            />
            <div className="w-px h-8 bg-border" />
            <StatBlock
              value={activeCount}
              label="Active"
              valueClassName={activeCount > 0 ? "text-[#10B981]" : undefined}
            />
            <div className="w-px h-8 bg-border" />
            <StatBlock
              value={bestRank !== null ? `#${bestRank}` : "—"}
              label="Best Rank"
              valueClassName={
                bestRank === 1
                  ? "text-yellow-400"
                  : bestRank !== null && bestRank <= 3
                    ? "text-[#10B981]"
                    : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg px-2">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 relative",
                  isActive
                    ? tab.color
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <div
                    className={cn(
                      "absolute bottom-0 left-2 right-2 h-0.5 rounded-full",
                      tab.borderColor
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}

      {/* Global Tab */}
      {activeTab === "global" && (
        globalLeaderboard ? (
          <GlobalLeaderboardContent leaderboard={globalLeaderboard} />
        ) : (
          <NoGlobalContestCard />
        )
      )}

      {/* Drafts Tab */}
      {activeTab === "drafts" && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-sm font-semibold text-foreground font-display uppercase tracking-wide">
              My Draft Standings
            </h2>
            <span className="bg-secondary/50 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-mono">
              {draftLeaderboards.length}
            </span>
          </div>

          {draftLeaderboards.length === 0 ? (
            /* Empty State */
            <div className="bg-card border border-border rounded-lg">
              <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    No Drafts Yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Join or create a draft to see your standings here
                  </p>
                </div>
                <Link
                  href="/drafts/new"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#10B981] hover:bg-[#10B981]/90 active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Draft
                </Link>
              </div>
            </div>
          ) : (
            /* Draft Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftLeaderboards.map((draft) => (
                <DraftCard key={draft.id} draft={draft} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leagues Tab */}
      {activeTab === "leagues" && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-semibold text-foreground font-display uppercase tracking-wide">
              My League Standings
            </h2>
            <span className="bg-secondary/50 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-mono">
              {leagueLeaderboards.length}
            </span>
          </div>

          {leagueLeaderboards.length === 0 ? (
            /* Empty State */
            <div className="bg-card border border-border rounded-lg">
              <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    No Leagues Yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Join or create a league to see your standings here
                  </p>
                </div>
                <Link
                  href="/leagues/new"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#F59E0B] hover:bg-[#F59E0B]/90 active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create a League
                </Link>
              </div>
            </div>
          ) : (
            /* League Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagueLeaderboards.map((league) => (
                <LeagueCard key={league.id} league={league} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
