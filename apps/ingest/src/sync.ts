// apps/ingest/src/sync.ts
// BallDontLie NCAAB sync implementation
import { SyncFeedType } from "@prisma/client";
import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { log } from "./logger.js";
import { sha256Hex } from "./hash.js";
import {
  fetchAllBracketGames,
  type BDLBracketGame,
  type BDLBracketTeam,
} from "./balldontlie.js";
import {
  createSyncLog,
  upsertTournamentFromSummary,
  upsertTeamAndTournamentTeam,
  maybeMaterializeBracketSlotsOnce,
  resolvePlayInSlots,
  findExistingGamesLite,
  upsertGame,
  recomputeTeamTournamentStats,
  ensureGlobalContestForTournament,
  type ExistingGameLite,
} from "./dal/index.js";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(fn: () => Promise<T>, tries = 5): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (String(e).includes("HTTP_404")) throw e;
      if (String(e).includes("UNAUTHORIZED")) throw e;

      lastErr = e;
      const hinted = (e as any)?.retryAfterMs;
      const backoff =
        typeof hinted === "number" && hinted > 0
          ? hinted
          : Math.min(30_000, 500 * Math.pow(2, i)) + Math.floor(Math.random() * 250);

      log.warn({ err: String(e), backoff }, "retrying");
      await sleep(backoff);
    }
  }
  throw lastErr;
}

function parseDateMaybe(s: any): Date | null {
  if (!s) return null;
  const d = new Date(String(s));
  return Number.isNaN(d.getTime()) ? null : d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Status Mapping
// ─────────────────────────────────────────────────────────────────────────────

type CanonGameStatus = "scheduled" | "inprogress" | "complete" | "postponed" | "cancelled";

function mapBDLStatus(raw: string): CanonGameStatus {
  const s = String(raw ?? "").toLowerCase().trim();
  if (s === "pre") return "scheduled";
  if (s === "in") return "inprogress";
  if (s === "post") return "complete";
  if (s === "postponed") return "postponed";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  return "scheduled";
}

function isFinalStatus(status: CanonGameStatus): boolean {
  return status === "complete";
}

function didScoringRelevantChange(
  prev: ExistingGameLite | undefined,
  next: {
    status: CanonGameStatus;
    isPlayIn: boolean;
    winnerTeamId: number | null;
    homeScore: number | null;
    awayScore: number | null;
  },
): boolean {
  if (!prev) {
    return isFinalStatus(next.status) && !!next.winnerTeamId && !next.isPlayIn;
  }

  const prevFinal = isFinalStatus(mapBDLStatus(prev.status));
  const nextFinal = isFinalStatus(next.status);

  if (prev.winnerTeamId !== next.winnerTeamId) return true;
  if (prev.isPlayIn !== next.isPlayIn) return true;
  if (prevFinal !== nextFinal) return true;

  if (nextFinal) {
    if (prev.homeScore !== next.homeScore) return true;
    if (prev.awayScore !== next.awayScore) return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quadrant Derivation from bracket_location
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive quadrant (1-4) from BallDontLie bracket_location.
 * BallDontLie uses 1..32 for first-round game locations.
 * Each quadrant contains 8 first-round game locations.
 *
 * Mapping:
 * - 1..8   => quadrant 1
 * - 9..16  => quadrant 2
 * - 17..24 => quadrant 3
 * - 25..32 => quadrant 4
 */
function deriveQuadrantFromBracketLocation(bracketLocation: number): number | null {
  if (bracketLocation <= 0) return null;

  if (bracketLocation <= 32) {
    return Math.floor((bracketLocation - 1) / 8) + 1;
  }

  // Later rounds are cross-region, so preserve null there.
  return null;
}

/**
 * Determine winner team ID from BallDontLie bracket game.
 */
function determineWinner(game: BDLBracketGame): number | null {
  if (game.home_team.winner === true) return game.home_team.id;
  if (game.away_team.winner === true) return game.away_team.id;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Upsert from Bracket
// ─────────────────────────────────────────────────────────────────────────────

async function upsertTeamFromBracket(
  db: DbClient,
  tournamentId: string,
  team: BDLBracketTeam,
  bracketLocation: number,
): Promise<void> {
  if (team.id == null) return; // TBD placeholder — skip

  const seed = team.seed ? parseInt(team.seed, 10) : null;
  const quadrant = deriveQuadrantFromBracketLocation(bracketLocation);

  await upsertTeamAndTournamentTeam({
    db,
    tournamentId,
    teamId: team.id,
    name: team.name,
    fullName: team.full_name,
    college: team.college ?? null,
    abbreviation: team.abbreviation ?? null,
    conferenceId: team.conference_id ?? null,
    payloadRaw: team as any,
    seed: Number.isFinite(seed) ? seed : null,
    region: quadrant ? `Region ${quadrant}` : null,
    quadrant,
    tournamentPayloadRaw: { bracket_location: bracketLocation, seed: team.seed },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Sync Logic
// ─────────────────────────────────────────────────────────────────────────────

export type SyncMode = "full" | "bracket";

export async function runSyncOnce(params: {
  tournamentId: string;
  seasonYear: number;
  mode?: SyncMode;
}) {
  const mode: SyncMode = params.mode ?? "full";
  const stats = {
    teamsUpserted: 0,
    gamesUpserted: 0,
    gamesSeen: 0,
  };

  log.info(
    { tournamentId: params.tournamentId, seasonYear: params.seasonYear, mode },
    "starting sync",
  );

  // A) Fetch all bracket games from BallDontLie
  let bracketGames: BDLBracketGame[] = [];
  try {
    bracketGames = await retry(() => fetchAllBracketGames(params.seasonYear));
  } catch (e: any) {
    const errText = String(e ?? "");
    const isNotFound = errText.includes("HTTP_404");

    if (!isNotFound) throw e;

    log.warn(
      { tournamentId: params.tournamentId, seasonYear: params.seasonYear, err: errText },
      "bracket not published yet; continuing with placeholder tournament",
    );
    bracketGames = [];
  }
  const bracketHash = sha256Hex(bracketGames);

  log.info(
    {
      tournamentId: params.tournamentId,
      seasonYear: params.seasonYear,
      gamesFound: bracketGames.length,
    },
    "bracket data fetched",
  );

  stats.gamesSeen = bracketGames.length;

  // Derive tournament dates from games
  const gameDates = bracketGames
    .map((g) => parseDateMaybe(g.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const startDate = gameDates[0] ?? null;
  const endDate = gameDates[gameDates.length - 1] ?? null;

  // Round 1+ start date (excludes First Four / play-in round 0).
  // This is when picks lock — users can pick from Selection Sunday until Round 1 tips off.
  const round1Dates = bracketGames
    .filter((g) => g.round >= 1)
    .map((g) => parseDateMaybe(g.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const round1StartDate = round1Dates[0] ?? null;

  log.info(
    {
      startDate: startDate?.toISOString() ?? null,
      endDate: endDate?.toISOString() ?? null,
      round1StartDate: round1StartDate?.toISOString() ?? null,
      firstFourGames: bracketGames.filter((g) => g.round === 0).length,
      round1Games: bracketGames.filter((g) => g.round === 1).length,
    },
    "tournament dates derived",
  );

  // B) Upsert tournament record
  await upsertTournamentFromSummary({
    db: prisma,
    tournamentId: params.tournamentId,
    seasonYear: params.seasonYear,
    name: `NCAA Tournament ${params.seasonYear}`,
    startDate,
    endDate,
    picksLockAt: round1StartDate,
    payloadRaw: { source: "balldontlie", games_count: bracketGames.length },
  });

  const globalContestResult = await ensureGlobalContestForTournament({
    db: prisma,
    tournamentId: params.tournamentId,
    lockAt: round1StartDate,
  });
  log.info(
    {
      tournamentId: params.tournamentId,
      contestId: globalContestResult.contestId,
      created: globalContestResult.created,
      lockedNow: globalContestResult.lockedNow,
      status: globalContestResult.status,
      lockAt: globalContestResult.lockAt,
    },
    "global contest ensured",
  );

  await createSyncLog({
    db: prisma,
    feedType: SyncFeedType.BRACKET,
    tournamentId: params.tournamentId,
    entityId: params.tournamentId,
    fetchedAt: new Date(),
    httpStatus: 200,
    payload: bracketGames as any,
    payloadHash: bracketHash,
  });

  // C) Upsert all teams from bracket games
  // Note: BallDontLie returns TBD placeholder teams with null IDs for
  // unresolved play-in matchups. Skip these — they'll be filled in once
  // the play-in games complete.
  //
  // Play-in fix: BallDontLie bracket_location for round-0 (First Four) games
  // uses 1..4, which naively maps to quadrant 1. But play-in winners feed into
  // round-1 games across different quadrants. We build a lookup from the
  // round-1 games that have a null/TBD team slot (the play-in destination)
  // to derive the correct bracket_location for quadrant assignment.
  const playInSeedToR1Location = new Map<string, number>();
  for (const game of bracketGames) {
    if (game.round !== 1) continue;
    // A round-1 game with a null-id team is waiting for a play-in winner.
    // The TBD placeholder still carries the seed value we can match on.
    if (game.home_team.id == null && game.home_team.seed) {
      playInSeedToR1Location.set(`${game.bracket_location}:${game.home_team.seed}`, game.bracket_location);
    }
    if (game.away_team.id == null && game.away_team.seed) {
      playInSeedToR1Location.set(`${game.bracket_location}:${game.away_team.seed}`, game.bracket_location);
    }
  }

  // Build a mapping from play-in game bracket_location to the correct round-1
  // bracket_location by matching the seed of the play-in teams.
  const playInLocationOverride = new Map<number, number>();
  for (const game of bracketGames) {
    if (game.round !== 0) continue;
    const seed = game.home_team.seed ?? game.away_team.seed;
    if (!seed) continue;
    // Find the round-1 game that has a TBD slot with the same seed
    for (const [key, r1Location] of playInSeedToR1Location) {
      if (key.endsWith(`:${seed}`) && !playInLocationOverride.has(game.bracket_location)) {
        playInLocationOverride.set(game.bracket_location, r1Location);
        // Remove from candidates so next play-in with same seed picks a different R1 game
        playInSeedToR1Location.delete(key);
        break;
      }
    }
  }

  const seenTeamIds = new Set<number>();

  for (const game of bracketGames) {
    // For play-in games, use the round-1 destination bracket_location for quadrant derivation
    const effectiveLocation = game.round === 0
      ? (playInLocationOverride.get(game.bracket_location) ?? game.bracket_location)
      : game.bracket_location;

    if (game.home_team.id != null && !seenTeamIds.has(game.home_team.id)) {
      await upsertTeamFromBracket(prisma, params.tournamentId, game.home_team, effectiveLocation);
      seenTeamIds.add(game.home_team.id);
      stats.teamsUpserted++;
    }

    if (game.away_team.id != null && !seenTeamIds.has(game.away_team.id)) {
      await upsertTeamFromBracket(prisma, params.tournamentId, game.away_team, effectiveLocation);
      seenTeamIds.add(game.away_team.id);
      stats.teamsUpserted++;
    }
  }

  log.info({ teamsUpserted: stats.teamsUpserted }, "teams synced");

  // D) Materialize canonical bracket slots
  const slotResult = await maybeMaterializeBracketSlotsOnce({
    db: prisma,
    tournamentId: params.tournamentId,
  });
  log.info({ slotResult }, "bracket slots materialization");

  if (mode === "bracket") {
    log.info({ tournamentId: params.tournamentId }, "sync ok (bracket-only mode)");
    return;
  }

  // E) Build lookup of existing games
  // BallDontLie returns game_id as a number, but our DB column is text.
  const gameIds = bracketGames.map((g) => String(g.game_id));
  const existing = await findExistingGamesLite({ db: prisma, ids: gameIds });
  const existingById = new Map<string, ExistingGameLite>(existing.map((g) => [g.id, g]));

  let shouldRecalcStats = false;

  // F) Upsert all games
  for (const game of bracketGames) {
    const status = mapBDLStatus(game.status);
    const isPlayIn = game.round === 0;
    const winnerId = determineWinner(game);

    const prev = existingById.get(String(game.game_id));

    const scoringChanged = didScoringRelevantChange(prev, {
      status,
      isPlayIn,
      winnerTeamId: winnerId,
      homeScore: game.home_team.score,
      awayScore: game.away_team.score,
    });

    if (scoringChanged) shouldRecalcStats = true;

    const finalLike = isFinalStatus(status) && winnerId != null;
    const now = new Date();
    const finalizedAt = finalLike && !prev?.finalizedAt ? now : (prev?.finalizedAt ?? null);

    await upsertGame({
      db: prisma,
      gameId: String(game.game_id),
      tournamentId: params.tournamentId,
      round: game.round,
      bracketLocation: game.bracket_location,
      isPlayIn,
      scheduledAt: parseDateMaybe(game.date),
      status,
      periodDetail: game.period_detail,
      homeTeamId: game.home_team.id,
      awayTeamId: game.away_team.id,
      homeScore: game.home_team.score,
      awayScore: game.away_team.score,
      winnerTeamId: winnerId,
      finalizedAt,
      payloadRaw: game as any,
    });

    stats.gamesUpserted++;
  }

  log.info({ gamesUpserted: stats.gamesUpserted }, "games synced");

  // F.1) Advance tournament sync state when warranted.
  // LIVE triggers when Round 1 starts (not First Four), since picks lock at Round 1.
  const now = new Date();
  const round1HasStarted = !!round1StartDate && now.getTime() >= round1StartDate.getTime();
  const hasGames = bracketGames.length > 0;
  const allGamesTerminal =
    hasGames &&
    bracketGames.every((g) => {
      const s = mapBDLStatus(g.status);
      return s === "complete" || s === "cancelled";
    });
  const isPastEnd = !!endDate && now.getTime() >= endDate.getTime();

  if (allGamesTerminal && (isPastEnd || !endDate)) {
    await prisma.tournament.updateMany({
      where: {
        id: params.tournamentId,
        syncState: { not: "COMPLETED" as any },
      },
      data: { syncState: "COMPLETED" as any },
    });
  } else if (round1HasStarted) {
    await prisma.tournament.updateMany({
      where: {
        id: params.tournamentId,
        syncState: { in: ["DISCOVERED", "MONITORING", "BRACKET_LOCKED"] as any },
      },
      data: { syncState: "LIVE" as any },
    });
  }

  // G) Resolve play-in winners into canonical slots
  await resolvePlayInSlots({ db: prisma, tournamentId: params.tournamentId });

  // H) Recompute stats if needed
  if (shouldRecalcStats) {
    await recomputeTeamTournamentStats({ db: prisma, tournamentId: params.tournamentId });
    log.info({ tournamentId: params.tournamentId }, "stats recomputed");
  }

  log.info({ tournamentId: params.tournamentId, stats }, "sync ok");
}
