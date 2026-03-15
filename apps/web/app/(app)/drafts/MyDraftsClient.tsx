"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { joinDraftByInviteAction } from "@/server/actions/drafts";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Plus,
  KeyRound,
  Lock,
  Globe,
  Loader2,
  ChevronRight,
  Users,
  Timer,
  Zap,
  Search,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Draft {
  id: string;
  name: string;
  isPrivate: boolean;
  participants: number;
  maxParticipants: number;
  status: "OPEN" | "DRAFTING" | "LOCKED" | "COMPLETE";
  tournamentName: string;
  tournamentYear: number;
  pickTimerSec: number | null;
  lockAt: string | null;
}

interface MyDraftsClientProps {
  drafts: Draft[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimer(seconds: number | null): string {
  if (!seconds) return "No limit";
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60 ? `${seconds % 60}s` : ""}`;
  return `${seconds}s`;
}

function mapStatusBadge(status: Draft["status"]): "open" | "drafting" | "locked" | "complete" {
  switch (status) {
    case "OPEN": return "open";
    case "DRAFTING": return "drafting";
    case "LOCKED": return "locked";
    case "COMPLETE": return "complete";
  }
}

// ─── Live Draft Card ──────────────────────────────────────────────────────────

function LiveDraftCard({ draft, index }: { draft: Draft; index: number }) {
  const fillPercent = Math.round((draft.participants / draft.maxParticipants) * 100);

  return (
    <Link
      href={`/drafts/${draft.id}/room`}
      className="block group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative overflow-hidden rounded-xl border border-[#10B981]/40 bg-card hover:border-[#10B981]/70 transition-all duration-300">
        {/* Animated top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent" />

        {/* Subtle court-line pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white" />
        </div>

        <div className="relative p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status="drafting" />
                {draft.isPrivate ? (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Private
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" /> Public
                  </span>
                )}
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground leading-tight truncate">
                {draft.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {draft.tournamentName} &middot; {draft.tournamentYear}
              </p>
            </div>

            {/* Participant count */}
            <div className="text-right flex-shrink-0">
              <div className="font-display text-3xl font-extrabold text-[#10B981] leading-none">
                {draft.participants}
                <span className="text-lg text-muted-foreground font-semibold">/{draft.maxParticipants}</span>
              </div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-1">Players</p>
            </div>
          </div>

          {/* Fill bar */}
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-[#21262D] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            {draft.pickTimerSec && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Timer className="w-3 h-3" />
                <span>{formatTimer(draft.pickTimerSec)} per pick</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-[#10B981] group-hover:text-[#34D399] transition-colors">
              Enter Draft Room
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Open Draft Card ──────────────────────────────────────────────────────────

function OpenDraftCard({ draft, index }: { draft: Draft; index: number }) {
  const fillPercent = Math.round((draft.participants / draft.maxParticipants) * 100);
  const spotsLeft = draft.maxParticipants - draft.participants;
  const isAlmostFull = spotsLeft <= 2;

  return (
    <Link
      href={`/drafts/${draft.id}`}
      className="block group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-card hover:border-[#10B981]/30 transition-all duration-300">
        <div className="p-5 space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="open" />
                {draft.isPrivate ? (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Globe className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold text-foreground leading-tight truncate text-[15px]">
                {draft.name}
              </h3>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{draft.tournamentName} {draft.tournamentYear}</span>
            {draft.pickTimerSec && (
              <>
                <span className="w-px h-3 bg-border" />
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {formatTimer(draft.pickTimerSec)}
                </span>
              </>
            )}
          </div>

          {/* Roster fill */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {draft.participants}/{draft.maxParticipants} joined
              </span>
              <span className={cn(
                "font-semibold",
                isAlmostFull ? "text-[#F59E0B]" : "text-muted-foreground",
              )}>
                {isAlmostFull ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left!` : `${fillPercent}%`}
              </span>
            </div>
            <div className="h-1 rounded-full bg-[#21262D] overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isAlmostFull
                    ? "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]"
                    : "bg-[#10B981]",
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-[#10B981] font-medium group-hover:text-[#34D399] transition-colors">
              View Details
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#10B981] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Completed Draft Row ──────────────────────────────────────────────────────

function CompletedDraftRow({ draft }: { draft: Draft }) {
  return (
    <Link
      href={`/drafts/${draft.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors group"
    >
      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{draft.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {draft.tournamentName} {draft.tournamentYear}
        </p>
      </div>

      {/* Players */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
        <Users className="w-3 h-3" />
        <span className="font-mono">{draft.participants}/{draft.maxParticipants}</span>
      </div>

      {/* Privacy */}
      <div className="hidden sm:block flex-shrink-0">
        {draft.isPrivate ? (
          <Lock className="w-3 h-3 text-muted-foreground" />
        ) : (
          <Globe className="w-3 h-3 text-muted-foreground" />
        )}
      </div>

      {/* Status */}
      <StatusBadge status="complete" className="flex-shrink-0" />

      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeading({
  title,
  count,
  accent,
  dot,
}: {
  title: string;
  count: number;
  accent: string;
  dot?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      {dot && (
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: accent, animation: "pulse-live 2s ease-in-out infinite" }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: accent }}
          />
        </span>
      )}
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

export function MyDraftsClient({ drafts }: MyDraftsClientProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const result = await joinDraftByInviteAction(joinCode.trim());

      if (result.success && result.draftId) {
        setJoinCode("");
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

  const liveDrafts = drafts.filter((d) => d.status === "DRAFTING");
  const openDrafts = drafts.filter((d) => d.status === "OPEN");
  const lockedDrafts = drafts.filter((d) => d.status === "LOCKED");
  const completedDrafts = [...lockedDrafts, ...drafts.filter((d) => d.status === "COMPLETE")];

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Zap className="w-5 h-5 text-[#10B981]" />
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground leading-none">
              My Drafts
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {drafts.length === 0
              ? "Create or join a draft to start competing"
              : `${liveDrafts.length > 0 ? `${liveDrafts.length} live` : ""}${liveDrafts.length > 0 && openDrafts.length > 0 ? " \u00b7 " : ""}${openDrafts.length > 0 ? `${openDrafts.length} open` : ""}${(liveDrafts.length > 0 || openDrafts.length > 0) && completedDrafts.length > 0 ? " \u00b7 " : ""}${completedDrafts.length > 0 ? `${completedDrafts.length} completed` : ""}`
            }
          </p>
        </div>

        {/* Browse Public link */}
        <Link
          href="/drafts/public"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Browse Public Drafts
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Action Bar ────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Create Draft */}
        <Link
          href="/drafts/new"
          className="group relative overflow-hidden rounded-xl border-2 border-dashed border-[#10B981]/30 bg-[#10B981]/[0.04] hover:border-[#10B981]/60 hover:bg-[#10B981]/[0.08] transition-all duration-300 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
              <Plus className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Create New Draft</p>
              <p className="text-xs text-muted-foreground">Set up a draft and invite friends</p>
            </div>
          </div>
        </Link>

        {/* Join with Code */}
        <div className="relative rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#21262D] border border-border flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Enter invite code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinWithCode();
                }}
                className="flex-1 h-9 bg-[#21262D] border-border focus-visible:border-[#10B981] focus-visible:ring-0 text-foreground placeholder:text-muted-foreground font-mono text-sm"
              />
              <button
                onClick={handleJoinWithCode}
                disabled={isPending}
                className={cn(
                  "h-9 px-4 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-white text-sm font-semibold flex-shrink-0",
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

      {/* ── Empty State ───────────────────────────────────────────────── */}
      {drafts.length === 0 && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          {/* Faint court lines */}
          <div className="absolute inset-0 opacity-[0.015]">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white" />
          </div>

          <div className="relative py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-1">
                No Drafts Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create a new draft and invite friends, or join an existing one with an invite code.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link
                href="/drafts/new"
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold text-white",
                  "bg-[#10B981] hover:bg-[#10B981]/90",
                  "transition-colors duration-150",
                )}
              >
                <Plus className="w-4 h-4" />
                Create Draft
              </Link>
              <Link
                href="/drafts/public"
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold",
                  "border border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                  "transition-colors duration-150",
                )}
              >
                Browse Public
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Now ──────────────────────────────────────────────────── */}
      {liveDrafts.length > 0 && (
        <section>
          <SectionHeading title="Live Now" count={liveDrafts.length} accent="#10B981" dot />
          <div className="grid sm:grid-cols-2 gap-4">
            {liveDrafts.map((draft, i) => (
              <LiveDraftCard key={draft.id} draft={draft} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Open & Waiting ────────────────────────────────────────────── */}
      {openDrafts.length > 0 && (
        <section>
          <SectionHeading title="Open &amp; Waiting" count={openDrafts.length} accent="#10B981" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openDrafts.map((draft, i) => (
              <OpenDraftCard key={draft.id} draft={draft} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Completed ─────────────────────────────────────────────────── */}
      {completedDrafts.length > 0 && (
        <section>
          <SectionHeading title="Completed" count={completedDrafts.length} accent="#8B949E" />
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {completedDrafts.map((draft) => (
              <CompletedDraftRow key={draft.id} draft={draft} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
