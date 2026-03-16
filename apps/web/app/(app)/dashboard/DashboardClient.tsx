"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Crown,
  ChevronRight,
  ArrowRight,
  Lock,
  Loader2,
  Target,
  Zap,
  Shield,
  Plus,
  Users,
  User,
  Clock,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { SportCard } from "@/components/shared/SportCard";
import { StatBlock } from "@/components/shared/StatBlock";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Pick {
  id: string;
  seed: number;
  teamName: string;
  abbreviation: string | null;
  logoTeamId: number | null;
  quadrant: string;
  status: "alive" | "eliminated" | "pending";
  wins: number;
  points: number;
}

export interface DraftUpdate {
  id: string;
  name: string;
  status: "OPEN" | "DRAFTING" | "LOCKED" | "COMPLETE";
  participantCount: number;
  rosterSize: number;
  isPrivate: boolean;
  picksMade: number;
  totalExpectedPicks: number;
  currentPickerName: string | null;
  isYourTurn: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  image: string | null;
  points: number;
}

interface DashboardClientProps {
  user: {
    name: string;
    totalPoints: number;
    rank: number;
    totalPlayers: number;
    activeDrafts: number;
  };
  picks: Pick[];
  draftUpdates: DraftUpdate[];
  leaderboard: LeaderboardEntry[];
  activeLeagues: number;
  tournamentName: string | null;
  seasonYear: number;
  hasContest: boolean;
  bracketLocked: boolean;
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0";
  if (rank === 1)
    return (
      <div className={cn(base, "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black")}>
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className={cn(base, "bg-gradient-to-br from-slate-300 to-slate-400 text-black")}>
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className={cn(base, "bg-gradient-to-br from-amber-600 to-amber-700 text-white")}>
        3
      </div>
    );
  return <div className={cn(base, "bg-secondary text-muted-foreground")}>{rank}</div>;
}

// ─── Pick Card ────────────────────────────────────────────────────────────────

function PickCard({ pick }: { pick: Pick }) {
  const isEmpty = !pick.teamName;
  const isAlive = pick.status === "alive";
  const isEliminated = pick.status === "eliminated";

  if (isEmpty) {
    return (
      <div className="relative h-full min-h-[140px] rounded-lg border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-2">
        <Plus className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Empty slot
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border transition-all duration-200",
        isAlive && "border-l-2 border-l-[#10B981] border-t-border border-r-border border-b-border bg-card",
        isEliminated && "border-l-2 border-l-[#F85149] border-t-border border-r-border border-b-border bg-card opacity-60",
        pick.status === "pending" && !isEmpty && "border-border bg-card",
      )}
    >
      <div className="p-3 flex flex-col h-full min-h-[140px]">
        {/* Header: seed badge + status */}
        <div className="flex items-start justify-between mb-2">
          <div
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0",
              isAlive
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "bg-secondary text-muted-foreground border border-border",
            )}
          >
            {pick.seed}
          </div>
          {isAlive && <StatusBadge status="live" />}
          {isEliminated && <StatusBadge status="eliminated" />}
        </div>

        {/* Team logo + name + quadrant */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {pick.logoTeamId ? (
              <Image
                src={`/team-logos/${pick.logoTeamId}.png`}
                alt={pick.teamName}
                width={28}
                height={28}
                className={cn(
                  "rounded-sm object-contain flex-shrink-0",
                  isEliminated && "grayscale opacity-60",
                )}
              />
            ) : (
              <div className="w-7 h-7 rounded-sm bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">?</span>
              </div>
            )}
            {pick.abbreviation && (
              <span
                className={cn(
                  "text-sm font-bold tracking-wide",
                  isAlive ? "text-foreground" : "text-muted-foreground",
                  isEliminated && "line-through",
                )}
              >
                {pick.abbreviation}
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs leading-tight",
              isAlive ? "text-muted-foreground" : "text-muted-foreground/70",
              isEliminated && "line-through",
            )}
          >
            {pick.teamName}
          </p>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-1">
            {pick.quadrant}
          </p>
        </div>

        {/* Footer: wins + points */}
        <div className="mt-2 pt-2 border-t border-border flex items-end justify-between">
          <span className="text-xs text-muted-foreground">{pick.wins}W</span>
          <div className="text-right">
            <span
              className={cn(
                "font-display text-lg font-bold",
                isAlive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {pick.points}
            </span>
            <span className="text-xs text-muted-foreground ml-0.5">pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Draft Status Card ───────────────────────────────────────────────────────

function DraftStatusCard({ draft }: { draft: DraftUpdate }) {
  const isDrafting = draft.status === "DRAFTING";
  const isOpen = draft.status === "OPEN";
  const progressPct =
    draft.totalExpectedPicks > 0
      ? Math.round((draft.picksMade / draft.totalExpectedPicks) * 100)
      : 0;
  const fillPct = Math.round((draft.participantCount / draft.rosterSize) * 100);

  return (
    <Link href={isDrafting ? `/drafts/${draft.id}/room` : `/drafts/${draft.id}`} className="block">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:bg-accent/50",
          isDrafting && "border-l-2 border-l-[#10B981] border-t-border border-r-border border-b-border",
          isOpen && "border-l-2 border-l-[#3B82F6] border-t-border border-r-border border-b-border",
        )}
      >
        <div className="p-4">
          {/* Header: name + status badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{draft.name}</p>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">
                {draft.isPrivate ? "Private" : "Public"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              {isDrafting && <StatusBadge status="live" />}
              {isOpen && <StatusBadge status="open" />}
            </div>
          </div>

          {/* DRAFTING: pick progress + current turn */}
          {isDrafting && (
            <>
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{draft.picksMade} / {draft.totalExpectedPicks} picks</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Current turn */}
              <div
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-md text-xs",
                  draft.isYourTurn
                    ? "bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-semibold"
                    : "bg-secondary border border-border text-muted-foreground",
                )}
              >
                <CircleDot className="w-3.5 h-3.5 flex-shrink-0" />
                {draft.isYourTurn ? (
                  <span>Your turn to pick!</span>
                ) : (
                  <span>
                    Waiting on <span className="text-foreground font-medium">{draft.currentPickerName ?? "..."}</span>
                  </span>
                )}
              </div>
            </>
          )}

          {/* OPEN: participant fill */}
          {isOpen && (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {draft.participantCount} / {draft.rosterSize} joined
                  </span>
                  <span>{fillPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3B82F6] transition-all duration-500"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Waiting for players to join</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardClient({
  user,
  picks,
  draftUpdates,
  leaderboard,
  activeLeagues,
  tournamentName,
  seasonYear,
  hasContest,
  bracketLocked,
}: DashboardClientProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  const hasPicks = picks.some((p) => p.teamName);
  const alivePicks = picks.filter((p) => p.status === "alive").length;
  const eliminatedPicks = picks.filter((p) => p.status === "eliminated").length;
  const totalPickPoints = picks.reduce((sum, p) => sum + p.points, 0);

  useEffect(() => {
    const onboarded = localStorage.getItem("fm_onboarded");
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("fm_onboarded", "true");
    setShowOnboarding(false);
  };

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
    <>
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className="space-y-6">
        {/* ── Score Strip ── */}
        <div className="bg-card border border-border rounded-lg px-5 sm:px-7 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
                {tournamentName ?? `March Madness ${seasonYear}`}
              </h1>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">
                {hasContest ? "Global Contest" : "No Active Contest"}
              </p>
            </div>

            {hasContest && user.totalPlayers > 0 && (
              <div className="flex items-center gap-5 sm:gap-8">
                <StatBlock value={user.rank > 0 ? `#${user.rank}` : "\u2014"} label="Rank" />
                <div className="w-px h-8 bg-border" />
                <StatBlock
                  value={user.totalPoints.toLocaleString()}
                  label="Points"
                />
                <div className="w-px h-8 bg-border" />
                <StatBlock
                  value={user.rank > 0 && user.totalPlayers > 0 ? `Top ${Math.max(1, Math.round((user.rank / user.totalPlayers) * 100))}%` : "\u2014"}
                  label={`of ${user.totalPlayers.toLocaleString()}`}
                  valueClassName="text-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── What's Happening (Action Cards) ── */}
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-3">
            What&apos;s Happening
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/drafts" className="block">
              <SportCard accent="emerald" className="h-full hover:bg-accent/50 transition-colors">
                <div className="p-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[#10B981]" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Drafts
                      </span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {user.activeDrafts}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Active {user.activeDrafts === 1 ? "draft" : "drafts"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </SportCard>
            </Link>

            <Link href={bracketLocked ? "/global-contest/picks" : "/global-contest"} className="block">
              <SportCard accent="blue" className="h-full hover:bg-accent/50 transition-colors">
                <div className="p-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Global
                      </span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {picks.filter((p) => p.teamName).length}/8
                    </p>
                    <p className="text-xs text-muted-foreground">Picks made</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </SportCard>
            </Link>

            <Link href="/leagues" className="block">
              <SportCard accent="amber" className="h-full hover:bg-accent/50 transition-colors">
                <div className="p-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Leagues
                      </span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">{activeLeagues}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeLeagues === 1 ? "League" : "Leagues"} joined
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </SportCard>
            </Link>
          </div>
        </div>

        {/* ── Your Drafts ── */}
        {draftUpdates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                Your Drafts
              </h2>
              <Link
                href="/drafts"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                View all
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {draftUpdates.map((draft) => (
                <DraftStatusCard key={draft.id} draft={draft} />
              ))}
            </div>
          </div>
        )}

        {/* ── Main two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6">
          {/* ── Left: Global Contest Picks ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                  Your Global Picks
                </h2>
                {hasPicks && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alivePicks} alive &middot; {eliminatedPicks} eliminated &middot; {totalPickPoints} pts
                  </p>
                )}
              </div>
              <Link
                href={bracketLocked ? "/global-contest/picks" : "/global-contest"}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                {hasPicks ? "Edit picks" : "Make picks"}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {hasPicks ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {picks.map((pick) => (
                  <PickCard key={pick.id} pick={pick} />
                ))}
              </div>
            ) : (
              <SportCard accent="blue">
                <div className="p-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    No picks yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                    {bracketLocked
                      ? "Choose 8 bracket slots for the Global Contest. Picks close when play-ins end."
                      : "The bracket hasn\u2019t been announced yet. Check back after Selection Sunday."}
                  </p>
                  {bracketLocked && (
                    <Link
                      href="/global-contest/picks"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Make your picks
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </SportCard>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">
            {/* Leaderboard */}
            <SportCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-primary" />
                    <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                      Leaderboard
                    </span>
                  </div>
                  <Link
                    href="/leaderboards"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                  >
                    All
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No entries yet
                  </p>
                ) : (
                  <div className="space-y-1">
                    {leaderboard.map((player) => (
                      <div
                        key={player.rank}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                          player.rank <= 3
                            ? "bg-primary/5 border border-primary/10"
                            : "hover:bg-accent border border-transparent",
                        )}
                      >
                        <RankBadge rank={player.rank} />
                        {player.image ? (
                          <ImageWithFallback
                            src={player.image}
                            alt={player.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-sm text-foreground truncate flex-1 min-w-0">
                          {player.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                          {player.points.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Your position */}
                {hasContest && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-primary/20 text-primary border border-primary/30 flex-shrink-0">
                        {user.rank > 0 ? user.rank : "\u2014"}
                      </div>
                      <span className="text-sm text-foreground flex-1">You</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {user.totalPoints.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </SportCard>

            {/* Join Private Draft */}
            <SportCard>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                    Join Draft
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleJoinWithCode();
                    }}
                    disabled={isPending}
                    className="flex-1 font-mono text-sm h-9 bg-input border-border focus-visible:border-primary focus-visible:ring-0 placeholder:font-sans placeholder:text-muted-foreground text-foreground"
                  />
                  <button
                    onClick={handleJoinWithCode}
                    disabled={isPending}
                    aria-label="Join draft"
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-primary-foreground" />
                    )}
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <Link
                    href="/drafts/new"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    + Create a new draft
                  </Link>
                </div>
              </div>
            </SportCard>

            {/* Quick Actions */}
            <SportCard>
              <div className="p-4">
                <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                  Quick Actions
                </span>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/drafts/new"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                    Create Draft
                  </Link>
                  <Link
                    href="/drafts/public"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Browse
                  </Link>
                  <Link
                    href="/leagues/new"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
                    New League
                  </Link>
                  <Link
                    href="/leagues"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
                    My Leagues
                  </Link>
                </div>
              </div>
            </SportCard>
          </div>
        </div>
      </div>
    </>
  );
}
