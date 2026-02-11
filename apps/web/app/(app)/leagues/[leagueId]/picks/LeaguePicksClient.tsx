"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveLeaguePicksDirectAction } from "@/server/actions/leagues";

type LeagueSlot = {
  slotId: string;
  displayName: string;
  seed: number;
  quadrant: number;
  isPlayIn: boolean;
};

type LeaguePicksClientProps = {
  leagueId: string;
  leagueName: string;
  tournamentName: string;
  leagueStatus: string;
  allSlots: LeagueSlot[];
  selectedSlotIds: string[];
};

export function LeaguePicksClient({
  leagueId,
  leagueName,
  tournamentName,
  leagueStatus,
  allSlots,
  selectedSlotIds,
}: LeaguePicksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedSlotIds);
  const [search, setSearch] = useState("");

  const isOpen = leagueStatus === "OPEN";

  const slotMap = useMemo(
    () => new Map(allSlots.map((slot) => [slot.slotId, slot])),
    [allSlots]
  );

  const selectedSlots = useMemo(
    () => selectedIds.map((id) => slotMap.get(id)).filter(Boolean) as LeagueSlot[],
    [selectedIds, slotMap]
  );

  const filteredSlots = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return allSlots;
    return allSlots.filter((slot) =>
      slot.displayName.toLowerCase().includes(normalized)
    );
  }, [allSlots, search]);

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
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href={`/leagues/${leagueId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to League
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Make Your 8 Picks</h1>
        <p className="text-muted-foreground">
          {leagueName} • {tournamentName}
        </p>
      </div>

      {!isOpen && (
        <Card className="p-4 border-yellow-500/30 bg-yellow-500/5 text-yellow-200">
          This league is locked. Picks can no longer be edited.
        </Card>
      )}

      <Card className="p-5 bg-card/80 border-orange-500/25 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Picks ({selectedIds.length}/8)</h2>
          <Button variant="ghost" size="sm" onClick={clearPicks} disabled={!isOpen || selectedIds.length === 0}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        {selectedSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No picks selected yet. Choose 8 teams below.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSlots.map((slot, index) => (
              <button
                key={slot.slotId}
                onClick={() => toggleSlot(slot.slotId)}
                disabled={!isOpen}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-500/30 bg-orange-500/10 text-sm text-foreground hover:bg-orange-500/15 transition-colors disabled:cursor-not-allowed"
              >
                <span className="text-orange-400 font-semibold">#{index + 1}</span>
                <span>{slot.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {isOpen && selectedIds.length === 8 && (
          <Button
            onClick={savePicks}
            disabled={isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isPending ? "Saving..." : "Save My 8 Picks"}
          </Button>
        )}

        {isOpen && selectedIds.length > 0 && selectedIds.length < 8 && (
          <p className="text-sm text-muted-foreground text-center">
            Select {8 - selectedIds.length} more pick{8 - selectedIds.length === 1 ? "" : "s"} to save.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or slots"
            className="pl-9"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSlots.map((slot) => {
          const isSelected = selectedIds.includes(slot.slotId);
          const isAtLimit = selectedIds.length >= 8 && !isSelected;

          return (
            <button
              key={slot.slotId}
              onClick={() => toggleSlot(slot.slotId)}
              disabled={!isOpen || isAtLimit}
              className={`text-left rounded-lg border p-4 transition-colors ${
                isSelected
                  ? "border-orange-500 bg-orange-500/15"
                  : "border-border bg-card/50 hover:border-orange-500/40"
              } ${(!isOpen || isAtLimit) && !isSelected ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-foreground line-clamp-2">{slot.displayName}</p>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline">Seed #{slot.seed}</Badge>
                <Badge variant="outline">Q{slot.quadrant}</Badge>
                {slot.isPlayIn && <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30">Play-In</Badge>}
              </div>
            </button>
          );
        })}
      </div>

      {filteredSlots.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">No teams matched your search.</Card>
      )}
    </div>
  );
}
