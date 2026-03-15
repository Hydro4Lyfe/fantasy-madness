"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Users,
  Target,
  Globe,
  ChevronRight,
  Shield,
  BarChart3,
  Plus,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatBlock } from "@/components/shared/StatBlock";

// ─── Types ───────────────────────────────────────────────────────────────────

type LeaderboardType = "global" | "drafts" | "leagues";

export interface DraftLeaderboard {
  id: string;
  name: string;
  participants: number;
  yourRank: number | null;
  status: "active" | "draft" | "completed";
}

interface LeaderboardsClientProps {
  draftLeaderboards?: DraftLeaderboard[];
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

// ─── Status Badge ────────────────────────────────────────────────────────────

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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>
              {draft.participants} player{draft.participants !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Rank + View Details */}
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

// ─── Coming Soon Placeholder ─────────────────────────────────────────────────

function ComingSoonCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; badgeBg: string; badgeBorder: string; badgeText: string }> = {
    blue: {
      bg: "bg-[#3B82F6]/10",
      border: "border-[#3B82F6]/20",
      text: "text-[#3B82F6]",
      badgeBg: "bg-[#3B82F6]/15",
      badgeBorder: "border-[#3B82F6]/30",
      badgeText: "text-[#3B82F6]",
    },
    amber: {
      bg: "bg-[#F59E0B]/10",
      border: "border-[#F59E0B]/20",
      text: "text-[#F59E0B]",
      badgeBg: "bg-[#F59E0B]/15",
      badgeBorder: "border-[#F59E0B]/30",
      badgeText: "text-[#F59E0B]",
    },
  };
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="py-16 px-8 flex flex-col items-center text-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border",
            c.bg,
            c.border
          )}
        >
          <Icon className={cn("w-6 h-6", c.text)} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
            c.badgeBg,
            c.badgeBorder,
            c.badgeText
          )}
        >
          Coming Soon
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LeaderboardsClient({
  draftLeaderboards = [],
}: LeaderboardsClientProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("drafts");

  // Compute summary stats
  const activeDrafts = draftLeaderboards.filter(
    (d) => d.status === "active"
  ).length;
  const bestRank = draftLeaderboards.reduce<number | null>((best, d) => {
    if (d.yourRank === null) return best;
    if (best === null) return d.yourRank;
    return d.yourRank < best ? d.yourRank : best;
  }, null);

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
              value={draftLeaderboards.length}
              label="Contests"
            />
            <div className="w-px h-8 bg-border" />
            <StatBlock
              value={activeDrafts}
              label="Active"
              valueClassName={activeDrafts > 0 ? "text-[#10B981]" : undefined}
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
        <ComingSoonCard
          icon={Globe}
          title="Global Championship"
          description="The global leaderboard will be available once the tournament begins. Compete against all players for the top spot."
          color="blue"
        />
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
        <ComingSoonCard
          icon={Shield}
          title="My Leagues"
          description="League standings will appear here once you join or create a league. Compete with friends in private competitions."
          color="amber"
        />
      )}
    </div>
  );
}
