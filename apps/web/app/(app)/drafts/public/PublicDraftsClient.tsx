"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import {
  Users,
  Globe,
  Search,
  X,
  Clock,
  Star,
  Timer,
  Zap,
  ArrowLeft,
  ChevronRight,
  ArrowRight,
  Flame,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicDraft {
  id: string;
  name: string;
  status: string;
  draftType: string;
  tournamentName: string;
  tournamentYear: number;
  rosterSize: number;
  isFeatured: boolean;
  pickTimerSec: number | null;
  startAt: string | null;
  participantCount: number;
  hostName: string | null;
  createdAt: string;
}

interface PublicDraftsClientProps {
  drafts: PublicDraft[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not scheduled";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimer(seconds: number | null): string {
  if (!seconds) return "No limit";
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m${seconds % 60 ? ` ${seconds % 60}s` : ""}`;
  return `${seconds}s`;
}

function getDraftTypeLabel(type: string): string {
  switch (type) {
    case "SNAKE": return "Snake";
    case "LINEAR": return "Linear";
    case "AUCTION": return "Auction";
    default: return type;
  }
}

const draftTypeStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  SNAKE: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "border-[#3B82F6]/25", dot: "bg-[#3B82F6]" },
  LINEAR: { bg: "bg-[#10B981]/10", text: "text-[#10B981]", border: "border-[#10B981]/25", dot: "bg-[#10B981]" },
  AUCTION: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/25", dot: "bg-[#F59E0B]" },
};

function DraftTypeBadge({ type }: { type: string }) {
  const style = draftTypeStyles[type] ?? { bg: "bg-[#8B949E]/10", text: "text-[#8B949E]", border: "border-[#8B949E]/25", dot: "bg-[#8B949E]" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border", style.bg, style.text, style.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
      {getDraftTypeLabel(type)}
    </span>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150 flex-shrink-0",
        active
          ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
          : "bg-[#21262D] text-muted-foreground border border-transparent hover:text-foreground hover:border-border",
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "rounded px-1 py-px text-[10px] font-mono",
          active ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#30363D] text-muted-foreground",
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Featured Draft Card ──────────────────────────────────────────────────────

function FeaturedDraftCard({ draft }: { draft: PublicDraft }) {
  const spotsLeft = draft.rosterSize - draft.participantCount;
  const fillPercent = Math.round((draft.participantCount / draft.rosterSize) * 100);
  const isAlmostFull = spotsLeft <= 2;

  return (
    <Link href={`/drafts/${draft.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl border border-[#F59E0B]/30 bg-card hover:border-[#F59E0B]/60 transition-all duration-300">
        {/* Gold accent top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F59E0B]/0 via-[#F59E0B] to-[#F59E0B]/0" />

        {/* Featured badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
            <Star className="w-3 h-3 fill-[#F59E0B]" />
            Featured
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3 pr-20">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground leading-tight truncate">
                {draft.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {draft.tournamentName}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Type</p>
              <div className="mt-1">
                <DraftTypeBadge type={draft.draftType} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Timer</p>
              <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1">
                <Timer className="w-3 h-3 text-muted-foreground" />
                {formatTimer(draft.pickTimerSec)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Start</p>
              <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                {formatDate(draft.startAt)}
              </p>
            </div>
          </div>

          {/* Host */}
          {draft.hostName && (
            <p className="text-xs text-muted-foreground">
              Hosted by <span className="text-foreground font-medium">{draft.hostName}</span>
            </p>
          )}

          {/* Fill bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {draft.participantCount}/{draft.rosterSize} joined
              </span>
              <span className={cn(
                "font-semibold",
                isAlmostFull ? "text-[#F59E0B]" : "text-muted-foreground",
              )}>
                {isAlmostFull
                  ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left!`
                  : `${spotsLeft} open`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#21262D] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-sm font-semibold text-[#F59E0B] group-hover:text-[#FBBF24] transition-colors">
              View &amp; Join
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center group-hover:bg-[#F59E0B]/20 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Regular Draft Card ───────────────────────────────────────────────────────

function PublicDraftCard({ draft, index }: { draft: PublicDraft; index: number }) {
  const spotsLeft = draft.rosterSize - draft.participantCount;
  const fillPercent = Math.round((draft.participantCount / draft.rosterSize) * 100);
  const isAlmostFull = spotsLeft <= 2;

  return (
    <Link
      href={`/drafts/${draft.id}`}
      className="block group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-card hover:border-[#10B981]/30 transition-all duration-300 h-full">
        <div className="p-4 sm:p-5 flex flex-col h-full space-y-3.5">
          {/* Top: Type + urgency */}
          <div className="flex items-center justify-between gap-2">
            <DraftTypeBadge type={draft.draftType} />
            {isAlmostFull && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#F59E0B]">
                <Flame className="w-3 h-3" />
                Filling fast
              </span>
            )}
          </div>

          {/* Name + host */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-[15px] leading-tight truncate">
              {draft.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span>{draft.tournamentName}</span>
            </div>
            {draft.hostName && (
              <p className="text-[11px] text-muted-foreground mt-1">
                by <span className="text-foreground/70">{draft.hostName}</span>
              </p>
            )}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {draft.pickTimerSec && (
              <span className="inline-flex items-center gap-1 bg-[#21262D] rounded px-1.5 py-0.5">
                <Timer className="w-3 h-3" />
                {formatTimer(draft.pickTimerSec)}/pick
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-[#21262D] rounded px-1.5 py-0.5">
              <Clock className="w-3 h-3" />
              {formatDate(draft.startAt)}
            </span>
          </div>

          {/* Fill bar */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                {draft.participantCount}/{draft.rosterSize}
              </span>
              <span className={cn(
                "font-mono text-[11px]",
                isAlmostFull ? "text-[#F59E0B] font-semibold" : "text-muted-foreground",
              )}>
                {spotsLeft} open
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

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-xs font-medium text-[#10B981] group-hover:text-[#34D399] transition-colors">
              View Details
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#10B981] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PublicDraftsClient({ drafts }: PublicDraftsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [availFilter, setAvailFilter] = useState<string>("all");

  // Compute filtered list
  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch = draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (draft.hostName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesType = typeFilter === "all" || draft.draftType === typeFilter;

    const percentFilled = (draft.participantCount / draft.rosterSize) * 100;
    const matchesAvail =
      availFilter === "all" ||
      (availFilter === "filling" && percentFilled >= 50) ||
      (availFilter === "open" && percentFilled < 50);

    return matchesSearch && matchesType && matchesAvail;
  });

  const featuredDrafts = filteredDrafts.filter((d) => d.isFeatured);
  const regularDrafts = filteredDrafts.filter((d) => !d.isFeatured);

  // Counts for filter pills
  const snakeCount = drafts.filter((d) => d.draftType === "SNAKE").length;
  const linearCount = drafts.filter((d) => d.draftType === "LINEAR").length;
  const auctionCount = drafts.filter((d) => d.draftType === "AUCTION").length;

  const hasActiveFilters = typeFilter !== "all" || availFilter !== "all" || searchQuery.length > 0;

  const clearAll = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setAvailFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/drafts"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to My Drafts
        </Link>
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-[#10B981]" />
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground leading-none">
            Public Drafts
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {drafts.length} draft{drafts.length !== 1 ? "s" : ""} open to join
        </p>
      </div>

      {/* ── Search + Filters ────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-card border-border focus-visible:border-[#10B981] focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-sm rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground flex-shrink-0 mr-1">
            Type
          </span>
          <FilterPill label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} count={drafts.length} />
          {snakeCount > 0 && (
            <FilterPill label="Snake" active={typeFilter === "SNAKE"} onClick={() => setTypeFilter("SNAKE")} count={snakeCount} />
          )}
          {linearCount > 0 && (
            <FilterPill label="Linear" active={typeFilter === "LINEAR"} onClick={() => setTypeFilter("LINEAR")} count={linearCount} />
          )}
          {auctionCount > 0 && (
            <FilterPill label="Auction" active={typeFilter === "AUCTION"} onClick={() => setTypeFilter("AUCTION")} count={auctionCount} />
          )}

          <div className="w-px h-5 bg-border flex-shrink-0 mx-1" />

          <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground flex-shrink-0 mr-1">
            Spots
          </span>
          <FilterPill label="Any" active={availFilter === "all"} onClick={() => setAvailFilter("all")} />
          <FilterPill label="Plenty open" active={availFilter === "open"} onClick={() => setAvailFilter("open")} />
          <FilterPill label="Filling fast" active={availFilter === "filling"} onClick={() => setAvailFilter("filling")} />
        </div>
      </div>

      {/* ── Results info ────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {filteredDrafts.length} of {drafts.length} drafts
          </p>
          <button
            onClick={clearAll}
            className="text-xs text-[#10B981] hover:text-[#34D399] font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Featured Drafts ─────────────────────────────────────────── */}
      {featuredDrafts.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Featured
            </h2>
            <span className="bg-[#21262D] text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold">
              {featuredDrafts.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {featuredDrafts.map((draft) => (
              <FeaturedDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </section>
      )}

      {/* ── All Drafts Grid ─────────────────────────────────────────── */}
      {regularDrafts.length > 0 && (
        <section>
          {featuredDrafts.length > 0 && (
            <div className="flex items-center gap-2.5 mb-4">
              <Zap className="w-4 h-4 text-[#10B981]" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                All Drafts
              </h2>
              <span className="bg-[#21262D] text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold">
                {regularDrafts.length}
              </span>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularDrafts.map((draft, i) => (
              <PublicDraftCard key={draft.id} draft={draft} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {filteredDrafts.length === 0 && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          {/* Faint court lines */}
          <div className="absolute inset-0 opacity-[0.015]">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white" />
          </div>

          <div className="relative py-16 px-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#21262D] border border-border flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-1">
                {drafts.length === 0 ? "No Public Drafts" : "No Matches"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {drafts.length === 0
                  ? "There are no public drafts open right now. Create your own and others can join!"
                  : "No drafts match your current filters. Try broadening your search."}
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              {drafts.length === 0 ? (
                <Link
                  href="/drafts/new"
                  className="inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#10B981]/90 transition-colors"
                >
                  Create a Draft
                </Link>
              ) : (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
