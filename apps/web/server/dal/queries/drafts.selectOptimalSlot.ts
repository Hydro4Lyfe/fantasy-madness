import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type SlotCandidate = {
  slotId: string;
  seed: number;
  quadrant: number;
  hasPlayIn: boolean;
};

/**
 * Selects the optimal BracketSlot for auto-pick.
 *
 * Strategy:
 * 1. Prioritize highest seed (most points per win)
 * 2. Among same seed, prefer non-play-in (certainty)
 * 3. Among same seed+play-in status, pick first by quadrant order
 */
export async function selectOptimalSlot(args: {
  db: DbClient;
  draftId: string;
}): Promise<string> {
  const { db, draftId } = args;

  // Get draft and available slots
  const draft = await (db as any).draft.findUnique({
    where: { id: draftId },
    select: {
      tournamentId: true,
      picks: { select: { slotId: true } },
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");

  const pickedSlotIds = new Set(draft.picks.map((p: any) => p.slotId));

  const allSlots = await (db as any).bracketSlot.findMany({
    where: { tournamentId: draft.tournamentId },
    select: {
      id: true,
      seed: true,
      quadrant: true,
      playInGameId: true,
    },
    orderBy: [
      { seed: "desc" },      // Highest seed first
      { quadrant: "asc" },   // Then by quadrant
    ],
  });

  const availableSlots = allSlots.filter((s: any) => !pickedSlotIds.has(s.id));

  if (availableSlots.length === 0) {
    throw new DomainError("INVALID_STATE", "No available slots to pick");
  }

  // Find max seed among available
  const maxSeed = Math.max(...availableSlots.map((s: any) => s.seed));
  const topSeedSlots = availableSlots.filter((s: any) => s.seed === maxSeed);

  // Prefer non-play-in
  const nonPlayInSlots = topSeedSlots.filter((s: any) => !s.playInGameId);
  if (nonPlayInSlots.length > 0) {
    return nonPlayInSlots[0].id;
  }

  // Otherwise return first play-in slot
  return topSeedSlots[0].id;
}
