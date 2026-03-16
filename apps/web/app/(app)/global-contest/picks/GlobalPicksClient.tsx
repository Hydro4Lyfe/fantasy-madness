"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
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

  const optionsById = useMemo(
    () => new Map(picksState.slotOptions.map((slot) => [slot.slotId, slot])),
    [picksState.slotOptions]
  );

  const selectedSlots = useMemo(
    () => selectedSlotIds.map((id) => optionsById.get(id)).filter(Boolean) as SlotOption[],
    [optionsById, selectedSlotIds]
  );

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

  return (
    <div className="space-y-8">
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

      {/* Sticky picks panel */}
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

      {/* Search bar */}
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

      {/* Region grid */}
      <RegionPickerGrid
        slots={picksState.slotOptions}
        selectedSlotIds={selectedSlotIds}
        onToggle={toggleSlotSelection}
        disabled={!picksState.isOpen}
        maxPicks={8}
        searchQuery={searchQuery}
      />
    </div>
  );
}
