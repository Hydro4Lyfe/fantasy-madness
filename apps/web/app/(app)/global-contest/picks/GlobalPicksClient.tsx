"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { TeamLogo } from "@/components/team/TeamLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function GlobalPicksClient({ picksState }: GlobalPicksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(
    picksState.selectedSlotIds
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSeed, setSelectedSeed] = useState<string>("all");

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

  const filteredSlots = picksState.slotOptions.filter((slot) => {
    const matchesSearch = slot.displayName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "all" || slot.region === selectedRegion;
    const matchesSeed = selectedSeed === "all" || slot.seed.toString() === selectedSeed;
    return matchesSearch && matchesRegion && matchesSeed;
  });

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
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/global-contest">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Global Contest
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Pick Your 8 Teams</h1>
        <p className="text-muted-foreground">
          Select 8 teams for {picksState.tournamentName} {picksState.seasonYear}. You
          can edit until {lockLabel}.
        </p>
      </div>

      {!picksState.isOpen && (
        <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            Contest is locked. Picks can no longer be edited.
          </div>
        </Card>
      )}

      <div className="sticky top-20 z-30">
        <Card className="p-4 bg-card/95 backdrop-blur-md border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Your Picks ({selectedSlotIds.length}/8)</span>
            </div>
            {selectedSlotIds.length > 0 && picksState.isOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllSelections}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {selectedSlotIds.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No teams selected yet. Choose 8 teams below.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSlots.map((slot) => (
                <div
                  key={slot.slotId}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30"
                >
                  <TeamLogo
                    teamId={slot.logoTeamIds[0]}
                    label={slot.displayName}
                    className="w-7 h-7 border border-border/70 bg-card"
                  />
                  <Badge variant="outline" className="text-xs">
                    #{slot.seed}
                  </Badge>
                  <span className="text-sm font-medium">{slot.displayName}</span>
                  {picksState.isOpen && (
                    <button
                      onClick={() => toggleSlotSelection(slot.slotId)}
                      className="ml-1 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {picksState.isOpen && selectedSlotIds.length === 8 && (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/30"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isPending ? "Saving..." : "Save My 8 Picks"}
            </Button>
          )}

          {picksState.isOpen && selectedSlotIds.length > 0 && selectedSlotIds.length < 8 && (
            <div className="text-sm text-center text-muted-foreground">
              Select {8 - selectedSlotIds.length} more team
              {8 - selectedSlotIds.length !== 1 ? "s" : ""} to submit
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">All Regions</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="South">South</option>
            <option value="Midwest">Midwest</option>
          </select>

          <select
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(e.target.value)}
            className="px-4 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">All Seeds</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
              (seed) => (
                <option key={seed} value={seed.toString()}>
                  #{seed} Seed
                </option>
              )
            )}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSlots.map((slot) => {
          const isSelected = selectedSlotIds.includes(slot.slotId);
          const canSelect = picksState.isOpen && (selectedSlotIds.length < 8 || isSelected);

          return (
            <Card
              key={slot.slotId}
              onClick={() => canSelect && toggleSlotSelection(slot.slotId)}
              className={`p-4 transition-all ${
                isSelected
                  ? "bg-orange-500/20 border-orange-500 ring-2 ring-orange-500 shadow-lg shadow-orange-500/20"
                  : canSelect
                    ? "hover:border-orange-500/50 hover:bg-orange-500/5 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo
                    teamId={slot.logoTeamIds[0]}
                    label={slot.displayName}
                    className="w-10 h-10 border border-border/70 bg-card"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight line-clamp-1">
                      {slot.displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground">{slot.region} Region</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`${
                    slot.seed <= 4
                      ? "border-green-500/50 text-green-400"
                      : slot.seed <= 8
                        ? "border-blue-500/50 text-blue-400"
                        : ""
                  }`}
                >
                  #{slot.seed}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Q{slot.quadrant}
                </Badge>
                {slot.isPlayIn && (
                  <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-300">
                    First Four
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Seed value: {slot.seed}</span>
                {canSelect && !isSelected && <span className="text-orange-400">Click to select</span>}
                {!canSelect && !isSelected && <span className="text-red-400">Max reached</span>}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredSlots.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  );
}
