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

function slotKey(quadrant: number, seed: number): string {
  return `${quadrant}:${seed}`;
}

const FINAL_STATUSES = new Set(["complete", "closed", "forfeited"]);

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
 * This does NOT rebuild slots/candidates; it only fills in assignedTeamId for
 * play-in slots once the play-in game is final.
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
    const tt = await db.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId, teamId: winnerTeamId } },
      select: { seed: true, quadrant: true },
    });

    if (!tt?.seed || !tt?.quadrant) continue;

    const res = await db.bracketSlot.updateMany({
      where: {
        tournamentId,
        quadrant: tt.quadrant,
        seed: tt.seed,
        assignedTeamId: null,
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
