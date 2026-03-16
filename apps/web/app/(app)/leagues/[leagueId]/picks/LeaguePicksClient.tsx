"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  Shield,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date";
import { SportCard } from "@/components/shared/SportCard";
import { RegionPickerGrid } from "@/components/picks/RegionPickerGrid";
import { TeamLogo } from "@/components/team/TeamLogo";
import { saveLeaguePicksDirectAction } from "@/server/actions/leagues";

type LeagueSlot = {
  slotId: string;
  displayName: string;
  abbreviation: string | null;
  logoTeamIds: number[];
  seed: number;
  quadrant: number;
  isPlayIn: boolean;
};

type LeaguePicksClientProps = {
  leagueId: string;
  leagueName: string;
  tournamentName: string;
  leagueStatus: string;
  picksLockAt: string | null;
  isPicksOpen: boolean;
  allSlots: LeagueSlot[];
  selectedSlotIds: string[];
};

export function LeaguePicksClient({
  leagueId,
  leagueName,
  tournamentName,
  leagueStatus,
  picksLockAt,
  isPicksOpen: initialIsPicksOpen,
  allSlots,
  selectedSlotIds,
}: LeaguePicksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedSlotIds);
  const [search, setSearch] = useState("");

  // Re-check time lock on the client in case server-rendered state is stale
  const isOpen = useMemo(() => {
    if (!initialIsPicksOpen) return false;
    if (picksLockAt && new Date(picksLockAt).getTime() <= Date.now()) return false;
    return true;
  }, [initialIsPicksOpen, picksLockAt]);

  const slotMap = useMemo(
    () => new Map(allSlots.map((slot) => [slot.slotId, slot])),
    [allSlots]
  );

  const selectedSlots = useMemo(
    () =>
      selectedIds
        .map((id) => slotMap.get(id))
        .filter(Boolean) as LeagueSlot[],
    [selectedIds, slotMap]
  );

  const toggleSlot = (slotId: string) => {
    if (!isOpen) return;

    if (selectedIds.includes(slotId)) {
      setSelectedIds(selectedIds.filter((id) => id !== slotId));
      return;
    }

    if (selectedIds.length >= 8) {
      toast.error("You can only select 8 picks");
      return;
    }

    setSelectedIds([...selectedIds, slotId]);
  };

  const clearPicks = () => {
    if (!isOpen) return;
    setSelectedIds([]);
  };

  const savePicks = () => {
    if (!isOpen) {
      toast.error("League picks are locked");
      return;
    }

    if (selectedIds.length !== 8) {
      toast.error("Select exactly 8 teams before saving");
      return;
    }

    startTransition(async () => {
      const result = await saveLeaguePicksDirectAction(leagueId, selectedIds);
      if (!result.success) {
        toast.error(result.error ?? "Failed to save picks");
        return;
      }

      toast.success("League picks saved");
      router.push(`/leagues/${leagueId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/leagues/${leagueId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to League
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-lg px-5 sm:px-7 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground">
                Make Your 8 Picks
              </h1>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                {leagueName} · {tournamentName}
              </p>
              {isOpen && picksLockAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Picks lock at {formatDateTime(picksLockAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-mono font-bold",
                selectedIds.length === 8
                  ? "text-[#10B981]"
                  : "text-muted-foreground"
              )}
            >
              {selectedIds.length}/8
            </span>
          </div>
        </div>
      </div>

      {/* Locked warning */}
      {!isOpen && (
        <div className="rounded-lg border border-[#D29922]/30 bg-[#D29922]/10 px-4 py-3 flex items-center gap-2 text-sm text-[#D29922]">
          {picksLockAt && new Date(picksLockAt).getTime() <= Date.now()
            ? "The first round has started. Picks can no longer be edited."
            : "This league is locked. Picks can no longer be edited."}
        </div>
      )}

      {/* Selected picks summary */}
      <SportCard accent="amber">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Your Picks ({selectedIds.length}/8)
            </h2>
            <button
              onClick={clearPicks}
              disabled={!isOpen || selectedIds.length === 0}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {selectedSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No picks selected yet. Choose 8 teams below.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedSlots.map((slot, index) => (
                <button
                  key={slot.slotId}
                  onClick={() => toggleSlot(slot.slotId)}
                  disabled={!isOpen}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-sm text-foreground hover:bg-[#F59E0B]/15 transition-colors disabled:cursor-not-allowed"
                >
                  {slot.logoTeamIds.length > 0 && (
                    <TeamLogo
                      teamId={slot.logoTeamIds[0]}
                      label={slot.displayName}
                      className="w-5 h-5 rounded border border-white/[0.10] bg-white/[0.12] flex-shrink-0"
                    />
                  )}
                  <span className="text-[#F59E0B] font-bold text-xs font-mono">
                    #{index + 1}
                  </span>
                  <span>{slot.abbreviation ?? slot.displayName}</span>
                </button>
              ))}
            </div>
          )}

          {isOpen && selectedIds.length === 8 && (
            <button
              onClick={savePicks}
              disabled={isPending}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium text-white",
                "bg-[#F59E0B] hover:bg-[#F59E0B]/90",
                "transition-colors duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isPending ? "Saving..." : "Save My 8 Picks"}
            </button>
          )}

          {isOpen && selectedIds.length > 0 && selectedIds.length < 8 && (
            <p className="text-xs text-muted-foreground text-center">
              Select {8 - selectedIds.length} more pick
              {8 - selectedIds.length === 1 ? "" : "s"} to save.
            </p>
          )}
        </div>
      </SportCard>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="pl-9 bg-input border-border h-10 focus-visible:border-[#F59E0B] focus-visible:ring-[#F59E0B]/30"
          />
        </div>
      </div>

      {/* Region grid */}
      <RegionPickerGrid
        slots={allSlots}
        selectedSlotIds={selectedIds}
        onToggle={toggleSlot}
        disabled={!isOpen}
        maxPicks={8}
        searchQuery={search}
      />
    </div>
  );
}
