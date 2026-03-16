"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { joinLeagueByInviteAction } from "@/server/actions/leagues";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Plus,
  KeyRound,
  Lock,
  Globe,
  Loader2,
  ChevronRight,
  Users,
  Shield,
  Crown,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MyLeague {
  id: string;
  name: string;
  status: string;
  tournamentName: string;
  tournamentYear: number;
  isPrivate: boolean;
  maxParticipants: number | null;
  lockAt: string | null;
  participantCount: number;
  isHost: boolean;
  hasCompletedPicks: boolean;
}

export interface PublicLeagueRow {
  id: string;
  name: string;
  tournamentName: string;
  tournamentYear: number;
  maxParticipants: number | null;
  participantCount: number;
  hostName: string | null;
  isFull: boolean;
}

interface LeaguesClientProps {
  myLeagues: MyLeague[];
  publicLeagues: PublicLeagueRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(status: string): "open" | "locked" | "complete" {
  switch (status) {
    case "OPEN": return "open";
    case "LOCKED": return "locked";
    case "COMPLETE": return "complete";
    default: return "open";
  }
}

function formatLockDate(iso: string | null): string {
  if (!iso) return "No deadline";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

// ─── My League Card ───────────────────────────────────────────────────────────

function MyLeagueCard({ league, index }: { league: MyLeague; index: number }) {
  const capacity = league.maxParticipants ?? league.participantCount;
  const fillPercent = capacity > 0 ? Math.round((league.participantCount / capacity) * 100) : 0;
  const isOpen = league.status === "OPEN";
  const needsPicks = isOpen && !league.hasCompletedPicks;

  return (
    <Link
      href={`/leagues/${league.id}`}
      className="block group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl border bg-card transition-all duration-300 h-full",
        needsPicks
          ? "border-[#F59E0B]/40 hover:border-[#F59E0B]/70"
          : "border-border hover:border-[#F59E0B]/30",
      )}>
        {/* Accent top line for leagues needing attention */}
        {needsPicks && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />
        )}

        <div className="p-5 flex flex-col h-full space-y-3.5">
          {/* Header: badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={mapStatus(league.status)} />
              {league.isHost && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#F59E0B]">
                  <Crown className="w-3 h-3" />
                  Host
                </span>
              )}
            </div>
            {league.isPrivate ? (
              <Lock className="w-3 h-3 text-muted-foreground" />
            ) : (
              <Globe className="w-3 h-3 text-muted-foreground" />
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-[15px] leading-tight truncate">
              {league.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {league.tournamentName}
            </p>
          </div>

          {/* Picks alert */}
          {needsPicks && (
            <div className="flex items-center gap-2 bg-[#F59E0B]/[0.06] border border-[#F59E0B]/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
              <span className="text-xs font-medium text-[#F59E0B]">
                Complete your picks
              </span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {league.lockAt && (
              <span className="inline-flex items-center gap-1 bg-[#21262D] rounded px-1.5 py-0.5">
                <Clock className="w-3 h-3" />
                Locks {formatLockDate(league.lockAt)}
              </span>
            )}
          </div>

          {/* Fill bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                {league.participantCount}{league.maxParticipants ? `/${league.maxParticipants}` : ""} players
              </span>
              {league.maxParticipants && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {fillPercent}%
                </span>
              )}
            </div>
            {league.maxParticipants && (
              <div className="h-1 rounded-full bg-[#21262D] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-xs font-medium text-[#F59E0B] group-hover:text-[#FBBF24] transition-colors">
              {needsPicks ? "Make Picks" : "View League"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#F59E0B] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Public League Row ────────────────────────────────────────────────────────

function PublicLeagueRow({ league }: { league: PublicLeagueRow }) {
  const fillPercent = league.maxParticipants
    ? Math.round((league.participantCount / league.maxParticipants) * 100)
    : 0;
  const spotsLeft = league.maxParticipants
    ? league.maxParticipants - league.participantCount
    : null;

  return (
    <Link
      href={`/leagues/${league.id}`}
      className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 hover:bg-accent/50 transition-colors group"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
        <Globe className="w-4 h-4 text-[#F59E0B]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{league.name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {league.hostName && <>by {league.hostName} &middot; </>}
          {league.tournamentName}
        </p>
      </div>

      {/* Capacity bar */}
      <div className="hidden sm:block flex-shrink-0 w-20">
        <p className="text-[11px] font-mono text-muted-foreground text-right">
          {league.participantCount}{league.maxParticipants ? `/${league.maxParticipants}` : ""}
        </p>
        {league.maxParticipants && (
          <div className="mt-1 h-1 rounded-full bg-[#21262D] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Status */}
      {league.isFull ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30 flex-shrink-0">
          Full
        </span>
      ) : spotsLeft !== null && spotsLeft <= 3 ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 flex-shrink-0">
          {spotsLeft} left
        </span>
      ) : (
        <StatusBadge status="open" className="flex-shrink-0" />
      )}

      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      {icon}
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
        {title}
      </h2>
      <span className="bg-[#21262D] text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold">
        {count}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeaguesClient({ myLeagues, publicLeagues }: LeaguesClientProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [publicSearch, setPublicSearch] = useState("");
  const router = useRouter();

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const result = await joinLeagueByInviteAction(joinCode.trim());

      if (result.success) {
        setJoinCode("");
        toast.success("Successfully joined the league!");
      } else {
        toast.error(result.error ?? "Failed to join league");
      }
    });
  };

  // Split my leagues by status
  const openLeagues = myLeagues.filter((l) => l.status === "OPEN");
  const closedLeagues = myLeagues.filter((l) => l.status !== "OPEN");

  // Leagues needing picks first for visibility
  const sortedOpen = [...openLeagues].sort((a, b) => {
    if (a.hasCompletedPicks === b.hasCompletedPicks) return 0;
    return a.hasCompletedPicks ? 1 : -1;
  });

  // Filter public leagues
  const filteredPublic = publicLeagues.filter((l) =>
    l.name.toLowerCase().includes(publicSearch.toLowerCase()) ||
    (l.hostName?.toLowerCase().includes(publicSearch.toLowerCase()) ?? false)
  );

  const openCount = openLeagues.length;
  const closedCount = closedLeagues.length;
  const needsPicksCount = openLeagues.filter((l) => !l.hasCompletedPicks).length;

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Shield className="w-5 h-5 text-[#F59E0B]" />
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground leading-none">
            Leagues
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {myLeagues.length === 0
            ? "Create or join a league to compete with friends"
            : [
                openCount > 0 ? `${openCount} open` : null,
                closedCount > 0 ? `${closedCount} locked` : null,
                needsPicksCount > 0 ? `${needsPicksCount} need picks` : null,
              ].filter(Boolean).join(" \u00b7 ")
          }
        </p>
      </div>

      {/* ── Action Bar ────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Create League */}
        <Link
          href="/leagues/new"
          className="group relative overflow-hidden rounded-xl border-2 border-dashed border-[#F59E0B]/30 bg-[#F59E0B]/[0.04] hover:border-[#F59E0B]/60 hover:bg-[#F59E0B]/[0.08] transition-all duration-300 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center group-hover:bg-[#F59E0B]/20 transition-colors">
              <Plus className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Create New League</p>
              <p className="text-xs text-muted-foreground">Set up a league and invite friends</p>
            </div>
          </div>
        </Link>

        {/* Join with Code */}
        <div className="relative rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#21262D] border border-border flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Enter invite code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinWithCode();
                }}
                className="flex-1 h-9 bg-[#21262D] border-border focus-visible:border-[#F59E0B] focus-visible:ring-0 text-foreground placeholder:text-muted-foreground font-mono text-sm"
              />
              <button
                onClick={handleJoinWithCode}
                disabled={isPending}
                className={cn(
                  "h-9 px-4 rounded-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white text-sm font-semibold flex-shrink-0",
                  "transition-colors duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "inline-flex items-center gap-1.5",
                )}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Join"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empty State (no leagues at all) ────────────────────────────── */}
      {myLeagues.length === 0 && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          {/* Faint court lines */}
          <div className="absolute inset-0 opacity-[0.015]">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white" />
          </div>

          <div className="relative py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-1">
                No Leagues Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create a new league and invite friends, or browse public leagues below to join one.
              </p>
            </div>
            <Link
              href="/leagues/new"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold text-white bg-[#F59E0B] hover:bg-[#F59E0B]/90 transition-colors mt-2"
            >
              <Plus className="w-4 h-4" />
              Create League
            </Link>
          </div>
        </div>
      )}

      {/* ── Open Leagues ──────────────────────────────────────────────── */}
      {sortedOpen.length > 0 && (
        <section>
          <SectionHeading
            title="Open"
            count={sortedOpen.length}
            icon={<Shield className="w-4 h-4 text-[#F59E0B]" />}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOpen.map((league, i) => (
              <MyLeagueCard key={league.id} league={league} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Locked / Completed Leagues ────────────────────────────────── */}
      {closedLeagues.length > 0 && (
        <section>
          <SectionHeading
            title="Locked &amp; Completed"
            count={closedLeagues.length}
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {closedLeagues.map((league) => (
              <Link
                key={league.id}
                href={`/leagues/${league.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{league.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {league.tournamentName}
                    {league.isHost && <> &middot; <span className="text-[#F59E0B]">Host</span></>}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <Users className="w-3 h-3" />
                  <span className="font-mono">{league.participantCount}{league.maxParticipants ? `/${league.maxParticipants}` : ""}</span>
                </div>

                <StatusBadge status={mapStatus(league.status)} className="flex-shrink-0" />

                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Public Leagues ────────────────────────────────────────────── */}
      <section>
        <SectionHeading
          title="Public Leagues"
          count={publicLeagues.length}
          icon={<Globe className="w-4 h-4 text-[#F59E0B]" />}
        />

        {/* Search for public leagues */}
        {publicLeagues.length > 5 && (
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search public leagues..."
              value={publicSearch}
              onChange={(e) => setPublicSearch(e.target.value)}
              className="pl-10 h-9 bg-card border-border focus-visible:border-[#F59E0B] focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-sm rounded-xl"
            />
            {publicSearch && (
              <button
                onClick={() => setPublicSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {filteredPublic.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 px-8 flex flex-col items-center text-center gap-3">
            <Globe className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {publicLeagues.length === 0
                ? "No public leagues are open right now."
                : "No leagues match your search."}
            </p>
            {publicSearch && (
              <button
                onClick={() => setPublicSearch("")}
                className="text-xs text-[#F59E0B] hover:text-[#FBBF24] font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {filteredPublic.map((league) => (
              <PublicLeagueRow key={league.id} league={league} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
