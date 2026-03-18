"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatShortDate as _formatShortDate } from "@/lib/date";
import { TeamLogo } from "@/components/team/TeamLogo";
import { RegionPickerGrid } from "@/components/picks/RegionPickerGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveGlobalContestPicksAction } from "@/server/actions/globalContests";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronUp,
  Search,
  Trophy,
  X,
} from "lucide-react";

type SlotOption = {
  slotId: string;
  displayName: string;
  abbreviation: string | null;
  logoTeamIds: number[];
  seed: number;
  quadrant: number;
  region: "East" | "West" | "South" | "Midwest";
  isPlayIn: boolean;
};

type PicksState = {
  contestId: string;
  tournamentName: string;
  seasonYear: number;
  lockAt: string | null;
  isOpen: boolean;
  selectedSlotIds: string[];
  slotOptions: SlotOption[];
};

type GlobalPicksClientProps = {
  picksState: PicksState;
};

function formatShortDate(value: string | null): string {
  if (!value) return "tournament start";
  return _formatShortDate(value);
}

export function GlobalPicksClient({ picksState }: GlobalPicksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(
    picksState.selectedSlotIds
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mobilePicksExpanded, setMobilePicksExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const optionsById = useMemo(
    () => new Map(picksState.slotOptions.map((slot) => [slot.slotId, slot])),
    [picksState.slotOptions]
  );

  const selectedSlots = useMemo(
    () => selectedSlotIds.map((id) => optionsById.get(id)).filter(Boolean) as SlotOption[],
    [optionsById, selectedSlotIds]
  );

  // Auto-collapse mobile picks panel when scrolling down
  useEffect(() => {
    if (!mobilePicksExpanded) return;
    const onScroll = () => setMobilePicksExpanded(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobilePicksExpanded]);

  const toggleSlotSelection = (slotId: string) => {
    if (!picksState.isOpen) return;

    if (selectedSlotIds.includes(slotId)) {
      setSelectedSlotIds(selectedSlotIds.filter((id) => id !== slotId));
      return;
    }

    if (selectedSlotIds.length < 8) {
      setSelectedSlotIds([...selectedSlotIds, slotId]);
    }
  };

  const clearAllSelections = () => {
    if (!picksState.isOpen) return;
    setSelectedSlotIds([]);
  };

  const handleSubmit = () => {
    if (!picksState.isOpen) {
      toast.error("Picks are locked for this contest");
      return;
    }

    if (selectedSlotIds.length !== 8) {
      toast.error("Select exactly 8 teams before submitting");
      return;
    }

    startTransition(async () => {
      const result = await saveGlobalContestPicksAction(
        picksState.contestId,
        selectedSlotIds
      );

      if (result.success) {
        toast.success("Global contest picks saved");
        router.push("/global-contest");
      } else {
        toast.error(result.error ?? "Failed to save picks");
      }
    });
  };

  const lockLabel = formatShortDate(picksState.lockAt);
  const seedTotal = selectedSlots.reduce((sum, s) => sum + s.seed, 0);

  return (
    <div className="pb-24 md:pb-8">
      {/* ── Desktop: original layout (hidden on mobile) ─────────── */}
      <div className="hidden md:block space-y-8">
        {/* Back link */}
        <div>
          <Link
            href="/global-contest"
            className="inline-flex items-center gap-1.5 text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Global Contest
          </Link>
        </div>

        {/* Page heading */}
        <div>
          <h1
            className={cn(
              "text-3xl sm:text-4xl font-semibold tracking-tight mb-2",
              "bg-gradient-to-b from-[#EDEDEF] to-[#EDEDEF]/70 bg-clip-text text-transparent",
            )}
          >
            Pick Your 8 Teams
          </h1>
          <p className="text-sm text-[#8A8F98]">
            Select 8 teams for {picksState.tournamentName}. You
            can edit until {lockLabel}.
          </p>
        </div>

        {/* Contest locked warning */}
        {!picksState.isOpen && (
          <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-300">
                Contest is locked. Picks can no longer be edited.
              </span>
            </div>
          </div>
        )}

        {/* Sticky picks panel — desktop */}
        <div className="sticky top-20 z-30">
          <div
            className={cn(
              "rounded-2xl border border-white/[0.06] p-4",
              "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
              "backdrop-blur-md",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#5E6AD2]" />
                <span className="font-semibold text-[#EDEDEF]">
                  Your Picks ({selectedSlotIds.length}/8)
                </span>
              </div>
              {selectedSlotIds.length > 0 && picksState.isOpen && (
                <button
                  onClick={clearAllSelections}
                  className="inline-flex items-center gap-1 text-sm text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] px-2 py-1 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {selectedSlotIds.length === 0 ? (
              <div className="text-center py-6 text-[#8A8F98]">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No teams selected yet. Choose 8 teams below.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSlots.map((slot) => {
                  const isPlayInPick = slot.isPlayIn && slot.logoTeamIds.length >= 2;
                  const pickNames = isPlayInPick ? slot.displayName.split(" / ") : [];
                  const pickAbbrs = isPlayInPick && slot.abbreviation ? slot.abbreviation.split(" / ") : [];

                  return (
                    <div
                      key={slot.slotId}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/30"
                    >
                      {isPlayInPick ? (
                        <div className="relative w-7 h-7 rounded overflow-hidden border border-white/[0.10] bg-white/[0.12] flex-shrink-0">
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                          >
                            <TeamLogo
                              teamId={slot.logoTeamIds[0]}
                              label={pickNames[0] ?? "TBD"}
                              className="w-5 h-5 -translate-x-px -translate-y-px"
                            />
                          </div>
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                          >
                            <TeamLogo
                              teamId={slot.logoTeamIds[1]}
                              label={pickNames[1] ?? "TBD"}
                              className="w-5 h-5 translate-x-px translate-y-px"
                            />
                          </div>
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: "linear-gradient(135deg, transparent calc(50% - 0.5px), rgba(255,255,255,0.15) calc(50% - 0.5px), rgba(255,255,255,0.15) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
                            }}
                          />
                        </div>
                      ) : (
                        <TeamLogo
                          teamId={slot.logoTeamIds[0]}
                          label={slot.displayName}
                          className="w-7 h-7 border border-white/[0.10] bg-white/[0.12]"
                        />
                      )}
                      <span className="text-xs font-mono text-[#8A8F98]">#{slot.seed}</span>
                      <span className="text-sm font-medium text-[#EDEDEF]">
                        {isPlayInPick
                          ? `${pickAbbrs[0] ?? pickNames[0]} / ${pickAbbrs[1] ?? pickNames[1]}`
                          : (slot.abbreviation ?? slot.displayName)
                        }
                      </span>
                      {picksState.isOpen && (
                        <button
                          onClick={() => toggleSlotSelection(slot.slotId)}
                          className="ml-1 text-[#8A8F98] hover:text-[#EDEDEF] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {picksState.isOpen && selectedSlotIds.length === 8 && (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className={cn(
                  "w-full bg-[#5E6AD2] hover:bg-[#6872D9] text-white",
                  "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                  "active:scale-[0.99] transition-all duration-200",
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isPending ? "Saving..." : "Save My 8 Picks"}
              </Button>
            )}

            {picksState.isOpen && selectedSlotIds.length > 0 && selectedSlotIds.length < 8 && (
              <div className="text-sm text-center text-[#8A8F98]">
                Select {8 - selectedSlotIds.length} more team
                {8 - selectedSlotIds.length !== 1 ? "s" : ""} to submit
              </div>
            )}
          </div>
        </div>

        {/* Search bar — desktop */}
        <div
          className={cn(
            "rounded-2xl border border-white/[0.06] p-4",
            "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)]",
          )}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8A8F98]" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10",
                "bg-[#0a0a0c] border-white/[0.10]",
                "focus-visible:border-[#5E6AD2] focus-visible:ring-0",
                "text-[#EDEDEF] placeholder:text-[#8A8F98]",
              )}
            />
          </div>
        </div>

        {/* Region grid — desktop */}
        <RegionPickerGrid
          slots={picksState.slotOptions}
          selectedSlotIds={selectedSlotIds}
          onToggle={toggleSlotSelection}
          disabled={!picksState.isOpen}
          maxPicks={8}
          searchQuery={searchQuery}
        />
      </div>

      {/* ── Mobile layout ───────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/global-contest"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-card active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground">
              Pick Your 8
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              Locks {lockLabel}
            </p>
          </div>
          <div className="flex items-baseline gap-1 flex-shrink-0">
            <span
              className="text-2xl font-bold tabular-nums font-mono"
              style={{ color: selectedSlotIds.length === 8 ? "#5E6AD2" : "#8A8F98" }}
            >
              {selectedSlotIds.length}
            </span>
            <span className="text-sm text-muted-foreground/50">/8</span>
          </div>
        </div>

        {/* Contest locked warning */}
        {!picksState.isOpen && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5 mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-300">
                Contest is locked. Picks can no longer be edited.
              </span>
            </div>
          </div>
        )}

        {/* Mobile: compact picks bar (tappable to expand) */}
        {selectedSlotIds.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setMobilePicksExpanded(!mobilePicksExpanded)}
              className="w-full"
            >
              <div
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: "rgba(94,106,210,0.06)",
                  border: "1px solid rgba(94,106,210,0.18)",
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Stacked team logos */}
                  <div className="flex -space-x-2 flex-shrink-0">
                    {selectedSlots.slice(0, 5).map((slot, i) => (
                      <div
                        key={slot.slotId}
                        className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(255,255,255,0.10)",
                          border: "2px solid rgba(22,27,34,1)",
                          zIndex: 10 - i,
                        }}
                      >
                        <TeamLogo
                          teamId={slot.logoTeamIds[0]}
                          label={slot.displayName}
                          className="w-5 h-5"
                        />
                      </div>
                    ))}
                    {selectedSlots.length > 5 && (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[9px] font-bold font-mono"
                        style={{
                          background: "rgba(94,106,210,0.15)",
                          border: "2px solid rgba(22,27,34,1)",
                          color: "#5E6AD2",
                          zIndex: 4,
                        }}
                      >
                        +{selectedSlots.length - 5}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-xs font-medium text-foreground">
                      {selectedSlotIds.length} selected
                    </span>
                    {seedTotal > 0 && (
                      <span className="text-[10px] text-muted-foreground/50 ml-1.5">
                        {seedTotal} pts/w
                      </span>
                    )}
                  </div>

                  <ChevronUp
                    className={cn(
                      "w-4 h-4 text-muted-foreground/40 transition-transform duration-200",
                      !mobilePicksExpanded && "rotate-180",
                    )}
                  />
                </div>
              </div>
            </button>

            {/* Expanded picks panel */}
            {mobilePicksExpanded && (
              <div
                className="mt-1.5 rounded-xl p-3"
                style={{
                  background: "rgba(22,27,34,0.8)",
                  border: "1px solid rgba(48,54,61,0.8)",
                }}
              >
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedSlots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg"
                      style={{
                        background: "rgba(94,106,210,0.08)",
                        border: "1px solid rgba(94,106,210,0.20)",
                      }}
                    >
                      <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.10)" }}
                      >
                        <TeamLogo
                          teamId={slot.logoTeamIds[0]}
                          label={slot.displayName}
                          className="w-4 h-4"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-foreground">
                        {slot.abbreviation ?? slot.displayName.split(" ")[0]}
                      </span>
                      {picksState.isOpen && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSlotSelection(slot.slotId);
                          }}
                          className="text-muted-foreground/40 active:text-foreground ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {picksState.isOpen && (
                  <button
                    onClick={clearAllSelections}
                    className="text-xs text-muted-foreground/50 active:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile: inline search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            ref={searchInputRef}
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9 pr-9 h-9 text-sm rounded-xl",
              "bg-card border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus-visible:border-[#5E6AD2] focus-visible:ring-0",
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile: region grid */}
        <RegionPickerGrid
          slots={picksState.slotOptions}
          selectedSlotIds={selectedSlotIds}
          onToggle={toggleSlotSelection}
          disabled={!picksState.isOpen}
          maxPicks={8}
          searchQuery={searchQuery}
        />
      </div>

      {/* ── Mobile: fixed bottom bar ────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div
          className="px-4 py-3 safe-area-pb"
          style={{
            background: "rgba(10,10,12,0.92)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            borderTop: "1px solid rgba(48,54,61,0.6)",
          }}
        >
          {picksState.isOpen && selectedSlotIds.length === 8 ? (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className={cn(
                "w-full h-11 bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-sm font-semibold",
                "shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_16px_rgba(94,106,210,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                "active:scale-[0.98] transition-all duration-200 rounded-xl",
              )}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isPending ? "Saving..." : "Save My 8 Picks"}
            </Button>
          ) : picksState.isOpen ? (
            <div
              className="w-full h-11 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: "rgba(94,106,210,0.08)",
                border: "1px solid rgba(94,106,210,0.15)",
              }}
            >
              {selectedSlotIds.length === 0 ? (
                <span className="text-muted-foreground/60">
                  Select 8 teams to continue
                </span>
              ) : (
                <span className="text-[#5E6AD2]">
                  {8 - selectedSlotIds.length} more to go
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
