import type { DbClient } from "@fantasy-madness/db";

export type MaterializeBracketSlotsResult =
  | {
      ran: false;
      reason: "already_locked";
      seededCount: number;
      quadrants: number[];
    }
  | {
      ran: false;
      reason: "not_ready";
      seededCount: number;
      quadrants: number[];
    }
  | {
      ran: true;
      seededCount: number;
      quadrants: number[];
      slots: number;
    };

export type ResolvePlayInSlotsResult =
  | { ran: false; reason: "not_locked" }
  | { ran: true; gamesSeen: number; slotsUpdated: number };

export type RepairSlotAssignmentsResult =
  | { ran: false; reason: "not_locked" }
  | { ran: true; slotsRepaired: number; candidatesRebuilt: number };

function slotKey(quadrant: number, seed: number): string {
  return `${quadrant}:${seed}`;
}

const FINAL_STATUSES = new Set(["complete", "closed", "forfeited"]);

/**
 * Derive quadrant (1-4) from a round-1 bracket location (1-32).
 * Each quadrant spans 8 consecutive locations.
 */
function deriveQuadrant(bracketLocation: number): number | null {
  if (bracketLocation <= 0 || bracketLocation > 32) return null;
  return Math.floor((bracketLocation - 1) / 8) + 1;
}

/**
 * Create the canonical 64 bracket slots (quadrant x seed) exactly once.
 *
 * IMPORTANT:
 * - Runs ONLY after we have seeded TournamentTeams (seed+quadrant present).
 * - Uses Tournament.bracketLockedAt as the one-way latch.
 */
export async function maybeMaterializeBracketSlotsOnce(
  args: { db: DbClient; tournamentId: string },
): Promise<MaterializeBracketSlotsResult> {
  const { db, tournamentId } = args;

  const t = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { bracketLockedAt: true },
  });

  if (t?.bracketLockedAt) {
    return {
      ran: false,
      reason: "already_locked",
      seededCount: 0,
      quadrants: [],
    };
  }

  const seeded = await db.tournamentTeam.findMany({
    where: {
      tournamentId,
      seed: { not: null },
      quadrant: { not: null },
    },
    select: { teamId: true, seed: true, quadrant: true },
  });

  const quadrantsSet = new Set<number>();
  for (const r of seeded) {
    if (typeof r.quadrant === "number") quadrantsSet.add(r.quadrant);
  }
  const quadrants = Array.from(quadrantsSet).sort((a, b) => a - b);

  // Gate: don't build until we have a complete bracket's worth of seeded teams.
  if (seeded.length < 64 || quadrants.length !== 4) {
    return { ran: false, reason: "not_ready", seededCount: seeded.length, quadrants };
  }

  // Map (quadrant, seed) -> teamIds[] (usually 1; 2 for play-in seeds)
  const bySlot = new Map<string, number[]>();
  for (const r of seeded) {
    if (r.seed == null || r.quadrant == null) continue;
    const k = slotKey(r.quadrant, r.seed);
    bySlot.set(k, [...(bySlot.get(k) ?? []), r.teamId]);
  }

  let slots = 0;

  for (const q of quadrants) {
    for (let seed = 1; seed <= 16; seed++) {
      const teamIds = bySlot.get(slotKey(q, seed)) ?? [];

      const slot = await db.bracketSlot.upsert({
        where: {
          tournamentId_quadrant_seed: {
            tournamentId,
            quadrant: q,
            seed,
          },
        },
        create: {
          tournamentId,
          quadrant: q,
          seed,
          assignedTeamId: teamIds.length === 1 ? teamIds[0] : null,
          playInGameId: null,
        },
        update: {
          assignedTeamId: teamIds.length === 1 ? teamIds[0] : null,
          playInGameId: null,
        },
      });

      // During the one-time build, ensure candidates reflect the current reality
      await db.bracketSlotCandidate.deleteMany({ where: { slotId: slot.id } });

      if (teamIds.length === 2) {
        await db.bracketSlotCandidate.createMany({
          data: teamIds.map((teamId) => ({ slotId: slot.id, teamId })),
          skipDuplicates: true,
        });
      }

      slots++;
    }
  }

  // One-way latch: mark tournament as bracket-locked/materialized.
  await db.tournament.update({
    where: { id: tournamentId },
    data: {
      bracketLockedAt: new Date(),
      syncState: "BRACKET_LOCKED",
    },
  });

  return { ran: true, seededCount: seeded.length, quadrants, slots };
}

/**
 * After games are ingested, resolve play-in winners into their canonical slot.
 *
 * This is idempotent: it first RESETS all play-in slot assignments, then
 * re-resolves from the current game data. This handles both fresh resolution
 * and repair of previously-incorrect assignments.
 *
 * To derive the correct quadrant we look at the round-1 game where the winner
 * appears (its bracketLocation reliably maps to quadrant 1-4).  This avoids
 * depending on TournamentTeam.quadrant which may have been stored incorrectly
 * when BDL's play-in bracket_location (1-4) was naively mapped to quadrant 1.
 */
export async function resolvePlayInSlots(
  args: { db: DbClient; tournamentId: string },
): Promise<ResolvePlayInSlotsResult> {
  const { db, tournamentId } = args;

  const t = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { bracketLockedAt: true },
  });

  if (!t?.bracketLockedAt) return { ran: false, reason: "not_locked" };

  // Step 1: Reset ALL play-in slot assignments so we can re-resolve cleanly.
  // This covers slots with wrong assignedTeamId or stale playInGameId.
  // We identify play-in slots as those that have a playInGameId OR have
  // BracketSlotCandidates (meaning they were materialized as play-in slots).
  const candidateSlotIds = await db.bracketSlotCandidate.findMany({
    where: { slot: { tournamentId } },
    select: { slotId: true },
    distinct: ["slotId"],
  });
  const playInSlotIds = new Set(candidateSlotIds.map((c) => c.slotId));

  // Also include any slot that already has a playInGameId (from a prior run)
  const slotsWithPlayInGame = await db.bracketSlot.findMany({
    where: { tournamentId, playInGameId: { not: null } },
    select: { id: true },
  });
  for (const s of slotsWithPlayInGame) playInSlotIds.add(s.id);

  if (playInSlotIds.size > 0) {
    await db.bracketSlot.updateMany({
      where: { id: { in: Array.from(playInSlotIds) } },
      data: { assignedTeamId: null, playInGameId: null },
    });
  }

  // Step 2: Find all completed play-in games with winners
  const playins = await db.game.findMany({
    where: {
      tournamentId,
      isPlayIn: true,
      status: { in: Array.from(FINAL_STATUSES) },
      winnerTeamId: { not: null },
    },
    select: { id: true, winnerTeamId: true },
  });

  let slotsUpdated = 0;

  for (const g of playins) {
    const winnerTeamId = g.winnerTeamId!;

    // Get the team's seed from TournamentTeam
    const tt = await db.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId, teamId: winnerTeamId } },
      select: { seed: true, quadrant: true },
    });

    if (!tt?.seed) continue;

    // Primary: derive quadrant from the round-1 game this winner feeds into.
    // Round-1 bracketLocation (1-32) reliably maps to the correct quadrant.
    let quadrant: number | null = null;

    const r1Game = await db.game.findFirst({
      where: {
        tournamentId,
        round: 1,
        OR: [
          { homeTeamId: winnerTeamId },
          { awayTeamId: winnerTeamId },
        ],
      },
      select: { bracketLocation: true },
    });

    if (r1Game?.bracketLocation != null) {
      quadrant = deriveQuadrant(r1Game.bracketLocation);
    }

    // Fallback: use TournamentTeam.quadrant
    if (!quadrant) {
      quadrant = tt.quadrant;
    }

    if (!quadrant) continue;

    // Fix the TournamentTeam quadrant if it was wrong
    if (tt.quadrant !== quadrant) {
      await db.tournamentTeam.update({
        where: { tournamentId_teamId: { tournamentId, teamId: winnerTeamId } },
        data: { quadrant },
      });
    }

    const res = await db.bracketSlot.updateMany({
      where: {
        tournamentId,
        quadrant,
        seed: tt.seed,
      },
      data: {
        assignedTeamId: winnerTeamId,
        playInGameId: g.id,
      },
    });

    slotsUpdated += res.count;
  }

  return { ran: true, gamesSeen: playins.length, slotsUpdated };
}

/**
 * Repair ALL bracket slot assignments from TournamentTeam data.
 *
 * For non-play-in slots (exactly 1 team per quadrant+seed): sets assignedTeamId.
 * For play-in slots (2 teams per quadrant+seed): rebuilds candidates, leaves
 * assignedTeamId to be handled by resolvePlayInSlots.
 *
 * This fixes slots that were materialized when TournamentTeam quadrants were
 * incorrect (e.g. play-in teams all mapped to quadrant 1).
 */
export async function repairSlotAssignments(
  args: { db: DbClient; tournamentId: string },
): Promise<RepairSlotAssignmentsResult> {
  const { db, tournamentId } = args;

  const t = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { bracketLockedAt: true },
  });

  if (!t?.bracketLockedAt) return { ran: false, reason: "not_locked" };

  // Load all seeded teams grouped by (quadrant, seed)
  const seeded = await db.tournamentTeam.findMany({
    where: {
      tournamentId,
      seed: { not: null },
      quadrant: { not: null },
    },
    select: { teamId: true, seed: true, quadrant: true },
  });

  const bySlot = new Map<string, number[]>();
  for (const r of seeded) {
    if (r.seed == null || r.quadrant == null) continue;
    const k = slotKey(r.quadrant, r.seed);
    bySlot.set(k, [...(bySlot.get(k) ?? []), r.teamId]);
  }

  // Load all existing slots
  const slots = await db.bracketSlot.findMany({
    where: { tournamentId },
    select: { id: true, quadrant: true, seed: true, assignedTeamId: true, playInGameId: true },
  });

  let slotsRepaired = 0;
  let candidatesRebuilt = 0;

  for (const slot of slots) {
    const teamIds = bySlot.get(slotKey(slot.quadrant, slot.seed)) ?? [];

    if (teamIds.length === 1) {
      // Non-play-in slot: should have exactly this team assigned
      if (slot.assignedTeamId !== teamIds[0]) {
        await db.bracketSlot.update({
          where: { id: slot.id },
          data: { assignedTeamId: teamIds[0], playInGameId: null },
        });
        slotsRepaired++;
      }
    } else if (teamIds.length === 2) {
      // Play-in slot: rebuild candidates (resolvePlayInSlots handles assignment)
      await db.bracketSlotCandidate.deleteMany({ where: { slotId: slot.id } });
      await db.bracketSlotCandidate.createMany({
        data: teamIds.map((teamId) => ({ slotId: slot.id, teamId })),
        skipDuplicates: true,
      });
      candidatesRebuilt++;
    }
    // teamIds.length === 0: orphaned slot, nothing we can do
  }

  return { ran: true, slotsRepaired, candidatesRebuilt };
}
