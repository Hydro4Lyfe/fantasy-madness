"use client";

import { useState, useRef, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Crown,
  Star,
  ChevronRight,
  ArrowRight,
  Clock,
  Users,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  change: "up" | "down" | "same";
  avatar: string;
}

interface Draft {
  id: string;
  name: string;
  type: "private" | "public";
  participants: number;
  maxParticipants: number;
  status: "active" | "draft" | "completed";
  draftDate: string;
  myRank: number | null;
}

interface Contest {
  id: string;
  name: string;
  type: "private" | "public";
  participants: number;
  maxParticipants: number;
  status: "active" | "draft" | "completed";
  startDate: string;
  myRank: number;
}

interface DashboardClientProps {
  user: {
    name: string;
    totalPoints: number;
    rank: number;
    totalPlayers: number;
    activeDrafts: number;
    activeContests: number;
    winRate: number;
    wins: number;
    total: number;
  };
  leaderboard: LeaderboardEntry[];
  drafts: Draft[];
  contests: Contest[];
}

// ---------------------------------------------------------------------------
// SpotlightCard — mouse-tracking radial gradient on card surface
// ---------------------------------------------------------------------------
function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
        "transition-shadow duration-300",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.08)]",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.12), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rank badge helper used in the leaderboard section
// ---------------------------------------------------------------------------
function RankBadge({ rank }: { rank: number }) {
  const base = "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0";
  if (rank === 1)
    return (
      <div className={cn(base, "bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#050506]")}>
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className={cn(base, "bg-gradient-to-br from-slate-300 to-slate-400 text-[#050506]")}>
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className={cn(base, "bg-gradient-to-br from-amber-600 to-amber-700 text-white")}>
        3
      </div>
    );
  return (
    <div className={cn(base, "bg-white/[0.06] text-[#8A8F98]")}>{rank}</div>
  );
}

// ---------------------------------------------------------------------------
// Mini rank indicator (circled number) for the top-players mini card
// ---------------------------------------------------------------------------
function MiniRankCircle({ rank }: { rank: number }) {
  const base =
    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0";
  if (rank === 1)
    return <div className={cn(base, "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30")}>{rank}</div>;
  if (rank === 2)
    return <div className={cn(base, "bg-slate-400/20 text-slate-300 border border-slate-400/30")}>{rank}</div>;
  return (
    <div className={cn(base, "bg-amber-600/20 text-amber-500 border border-amber-600/30")}>{rank}</div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function DashboardClient({
  user,
  leaderboard,
}: DashboardClientProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const percentile = Math.round((user.rank / user.totalPlayers) * 100);
  const top3 = leaderboard.slice(0, 3);

  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const result = await joinDraftByInviteAction(inviteCode.trim());

      if (result.success && result.draftId) {
        setInviteCode("");
        if (result.alreadyJoined) {
          toast.info("You're already a member of this draft");
        } else {
          toast.success("Successfully joined the draft!");
        }
        router.push(`/drafts/${result.draftId}`);
      } else {
        toast.error(result.error ?? "Failed to join draft");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-1">
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight",
            "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
          )}
        >
          Welcome back, {user.name}
        </h1>
        <p className="text-sm text-[#8A8F98]">
          March Madness 2026 &middot; {user.activeDrafts} active{" "}
          {user.activeDrafts === 1 ? "draft" : "drafts"}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bento grid — Row 1–2                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

        {/* Global Championship — hero card (col-span-4, row-span-2) */}
        <SpotlightCard className="md:col-span-4 md:row-span-2 min-h-[420px]">
          {/* Ambient blobs */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(94,106,210,0.22) 0%, transparent 70%)",
              filter: "blur(120px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 w-[320px] h-[320px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />

          <div className="relative h-full flex flex-col p-6 sm:p-8">
            {/* Live pill */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5E6AD2]/40 bg-[#5E6AD2]/10 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E6AD2] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5E6AD2]" />
                </span>
                <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                  Live Now
                </span>
              </div>
            </div>

            {/* Headline */}
            <h2
              className={cn(
                "text-3xl sm:text-4xl font-semibold tracking-tight mb-4",
                "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
              )}
            >
              Global Championship
            </h2>

            {/* Body */}
            <p className="text-[#8A8F98] text-base leading-relaxed max-w-md mb-8">
              Submit your official picks and compete against the best. One bracket. Everyone plays
              the same rules.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">50,234 Entries</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">Closes Mar 17</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#5E6AD2]" />
                <span className="text-sm text-[#8A8F98]">Free to Enter</span>
              </div>
            </div>

            <div className="mt-auto">
              <Link
                href="/global-contest/picks"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
                  "bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-sm font-medium",
                  "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                  "active:scale-[0.98] transition-all duration-200",
                )}
              >
                Enter Your Picks
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Your Standing — col-span-2 */}
        <SpotlightCard className="md:col-span-2">
          <div className="h-full p-6 flex flex-col">
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-[#5E6AD2]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                Your Standing
              </span>
            </div>

            {/* Big rank */}
            <div className="mb-1">
              <span className="text-5xl font-semibold text-[#EDEDEF]">#{user.rank}</span>
            </div>
            <p className="text-sm text-[#8A8F98] mb-6">
              of {user.totalPlayers.toLocaleString()}
            </p>

            {/* Points + percentile row */}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-sm text-[#8A8F98]">
                {user.totalPoints.toLocaleString()} pts
              </span>
              <span className="text-sm font-medium text-[#5E6AD2]">
                Top {percentile}%
              </span>
            </div>

            {/* Footer link */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <Link
                href="/leaderboards"
                className="text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
              >
                View full leaderboard &rarr;
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Leaderboard Mini — col-span-2 */}
        <SpotlightCard className="md:col-span-2">
          <div className="h-full p-6 flex flex-col">
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-[#5E6AD2]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                Top Players
              </span>
            </div>

            {/* Top 3 rows */}
            <div className="space-y-3 flex-1">
              {top3.map((player) => (
                <div key={player.rank} className="flex items-center gap-3">
                  <MiniRankCircle rank={player.rank} />
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/[0.10] flex-shrink-0">
                    <ImageWithFallback
                      src={player.avatar}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-[#EDEDEF] truncate flex-1">{player.name}</span>
                  <span className="text-xs font-mono text-[#8A8F98] flex-shrink-0">
                    {player.points.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer link */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <Link
                href="/leaderboards"
                className="text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
              >
                See all rankings &rarr;
              </Link>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bento grid — Row 3–4                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

        {/* Full Leaderboard — col-span-4, row-span-2 */}
        <SpotlightCard className="md:col-span-4 md:row-span-2 min-h-[420px]">
          <div className="h-full p-6 sm:p-8 flex flex-col">
            {/* Header row */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#EDEDEF]">
                    Global Leaderboard
                  </h2>
                  <p className="text-xs text-[#8A8F98]">Top players this season</p>
                </div>
              </div>
              <Link
                href="/leaderboards"
                className={cn(
                  "inline-flex items-center gap-1 text-xs text-[#8A8F98] hover:text-[#EDEDEF]",
                  "px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.10]",
                  "bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200",
                )}
              >
                View all
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Player rows */}
            <div className="space-y-2 flex-1">
              {leaderboard.map((player) => {
                const isTop3 = player.rank <= 3;
                return (
                  <div
                    key={player.rank}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isTop3
                        ? "bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/10"
                        : "hover:bg-white/[0.04] border border-transparent",
                    )}
                  >
                    <RankBadge rank={player.rank} />

                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/[0.10] flex-shrink-0">
                      <ImageWithFallback
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="text-sm text-[#EDEDEF] truncate flex-1">{player.name}</span>

                    <span className="text-sm font-mono text-[#8A8F98] flex-shrink-0">
                      {player.points.toLocaleString()}
                    </span>

                    <div className="w-4 flex-shrink-0">
                      {player.change === "up" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : player.change === "down" ? (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-[#8A8F98]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "Your position" separator */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/20">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
                    "bg-[#5E6AD2]/20 text-[#5E6AD2] border border-[#5E6AD2]/30",
                  )}
                >
                  {user.rank}
                </div>

                <div className="w-9 h-9 rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-[#5E6AD2]" />
                </div>

                <span className="text-sm text-[#EDEDEF] flex-1">You</span>

                <span className="text-sm font-mono text-[#8A8F98] flex-shrink-0">
                  {user.totalPoints.toLocaleString()}
                </span>

                <div className="w-4 flex-shrink-0" />
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Join Private Draft — col-span-2 */}
        <SpotlightCard className="md:col-span-2">
          <div className="h-full p-6 flex flex-col">
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#5E6AD2]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                Private Draft
              </span>
            </div>

            {/* Input + button row */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinWithCode();
                }}
                disabled={isPending}
                className={cn(
                  "flex-1 font-mono text-sm h-9",
                  "bg-white/[0.04] border-white/[0.10]",
                  "focus-visible:border-[#5E6AD2] focus-visible:ring-0",
                  "placeholder:font-sans placeholder:text-[#8A8F98]",
                  "text-[#EDEDEF]",
                )}
              />
              <button
                onClick={handleJoinWithCode}
                disabled={isPending}
                aria-label="Join draft"
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0",
                  "bg-[#5E6AD2] hover:bg-[#6872D9]",
                  "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                  "active:scale-[0.98] transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {/* Create link */}
            <div className="mt-auto pt-4 border-t border-white/[0.06]">
              <Link
                href="/drafts/new"
                className="text-xs text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
              >
                + Create a new draft
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Browse Public Drafts — col-span-2, full card is a link */}
        <SpotlightCard className="md:col-span-2 group">
          <Link href="/drafts/public" className="block h-full">
            <div className="h-full p-6 flex flex-col">
              {/* Label + live dot */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5E6AD2]" />
                  <span className="text-xs font-mono tracking-widest uppercase text-[#8A8F98]">
                    Public Drafts
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                </div>
              </div>

              {/* Big number */}
              <div className="flex-1">
                <p className="text-3xl font-semibold text-[#EDEDEF]">24</p>
                <p className="text-sm text-[#8A8F98] mt-1">Open drafts</p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-1">
                <span className="text-xs text-[#5E6AD2]">Browse all</span>
                <ChevronRight className="w-3 h-3 text-[#5E6AD2] transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </SpotlightCard>
      </div>
    </div>
  );
}
