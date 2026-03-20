"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { BracketSlotWithTeamDTO } from "@/server/dal";
import type { TeamInfo, BracketGame, BracketPicks } from "@/lib/bracket/types";
import {
  buildInitialGames,
  deriveGameState,
  applyCascade,
  calculateBest8,
} from "@/lib/bracket/engine";

function slotsToInitialData(slots: BracketSlotWithTeamDTO[]) {
  return slots.map((slot) => {
    let team: TeamInfo | null = null;

    if (slot.assignedTeam) {
      team = {
        teamId: slot.assignedTeam.id,
        fullName: slot.assignedTeam.fullName,
        abbreviation: slot.assignedTeam.abbreviation,
        seed: slot.seed,
        slotId: slot.id,
      };
    } else if (slot.candidates.length === 1) {
      const c = slot.candidates[0];
      team = {
        teamId: c.team.id,
        fullName: c.team.fullName,
        abbreviation: c.team.abbreviation,
        seed: slot.seed,
        slotId: slot.id,
      };
    } else if (slot.candidates.length > 1) {
      // Play-in: composite display
      const names = slot.candidates.map((c) => c.team.abbreviation).join(" / ");
      team = {
        teamId: slot.candidates[0].team.id, // use first candidate as ID
        fullName: names,
        abbreviation: names,
        seed: slot.seed,
        slotId: slot.id,
      };
    }

    return { quadrant: slot.quadrant, seed: slot.seed, team };
  });
}

const STORAGE_KEY_PREFIX = "bracket-picks-";

function loadPicks(tournamentId: string): BracketPicks {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + tournamentId);
    if (!raw) return new Map();
    const entries: [number, number][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

function savePicks(tournamentId: string, picks: BracketPicks) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY_PREFIX + tournamentId,
      JSON.stringify(Array.from(picks.entries()))
    );
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export function useBracketState(
  tournamentId: string,
  slots: BracketSlotWithTeamDTO[]
) {
  const baseGames = useMemo(() => {
    const data = slotsToInitialData(slots);
    return buildInitialGames(data);
  }, [slots]);

  const [picks, setPicks] = useState<BracketPicks>(() => new Map());
  const [hydrated, setHydrated] = useState(false);

  // Load picks from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = loadPicks(tournamentId);
    if (saved.size > 0) setPicks(saved);
    setHydrated(true);
  }, [tournamentId]);

  // Persist picks to localStorage on change (only after hydration)
  useEffect(() => {
    if (hydrated) savePicks(tournamentId, picks);
  }, [tournamentId, picks, hydrated]);

  const games = useMemo(
    () => deriveGameState(baseGames, picks),
    [baseGames, picks]
  );

  const best8 = useMemo(() => calculateBest8(games, picks), [games, picks]);

  const makePick = useCallback(
    (gameIndex: number, teamId: number) => {
      setPicks((prev) => applyCascade(prev, gameIndex, teamId));
    },
    []
  );

  const totalPicks = picks.size;
  const isComplete = totalPicks === 63;

  return { games, picks, best8, makePick, totalPicks, isComplete };
}
