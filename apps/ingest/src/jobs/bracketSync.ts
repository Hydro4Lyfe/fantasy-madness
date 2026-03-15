import { prisma } from "@fantasy-madness/db";
import { SyncFeedType } from "@prisma/client";
import {
  createSyncLogBestEffort,
  findLatestTournamentInStates,
  maybeMaterializeBracketSlotsOnce,
  upsertTournamentFromSummary,
  withAdvisoryLock,
} from "../dal/index.js";
import { log } from "../logger.js";
import { runSyncOnce } from "../sync.js";

/**
 * Compute BallDontLie season year for March Madness.
 * BDL uses academic-year start: season 2025 = 2025-26 school year = March 2026 tournament.
 * - Jul-Dec -> current calendar year (e.g., Oct 2025 → season 2025)
 * - Jan-Jun -> previous calendar year (e.g., Mar 2026 → season 2025)
 */
function computeSeasonYear(now = new Date()): number {
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  return month >= 7 ? year : year - 1;
}

/**
 * Job: pull:bracket
 *
 * Syncs March Madness bracket data from BallDontLie API.
 * Creates tournament record if needed, then syncs teams and games.
 */
export async function bracketSyncHandler(job: any) {
  log.info({ jobId: job?.id, data: job?.data }, "job start: bracket sync");

  const startedAt = new Date();

  // Check for existing tournament in active states
  const existing = await findLatestTournamentInStates({
    db: prisma,
    states: ["DISCOVERED", "MONITORING", "BRACKET_LOCKED", "LIVE"] as any,
  });

  let tournamentId = existing?.id ?? null;
  let seasonYear = existing?.seasonYear ?? null;

  // If no tournament exists, create one from current season
  if (!tournamentId || !seasonYear) {
    seasonYear = computeSeasonYear();
    tournamentId = String(seasonYear); // BallDontLie uses season year as ID

    await upsertTournamentFromSummary({
      db: prisma,
      tournamentId,
      seasonYear,
      name: `NCAA Tournament ${seasonYear}`,
      startDate: null,
      endDate: null,
      picksLockAt: null,
      payloadRaw: {
        source: "bootstrap",
        reason: "no-active-tournament",
        bootstrappedAt: new Date().toISOString(),
      } as any,
    });

    log.info({ tournamentId, seasonYear }, "bootstrapped tournament row");
  }

  log.info(
    { jobId: job?.id, tournamentId, seasonYear },
    "running bracket sync",
  );

  const lockName = `ingest:sync:tournament:${tournamentId}`;
  const { ran } = await withAdvisoryLock(lockName, async () => {
    await runSyncOnce({ tournamentId, seasonYear });
  });

  if (!ran) {
    log.info({ tournamentId, jobId: job?.id }, "sync skipped (lock held)");
  }

  if (ran) {
    const slotResult = await maybeMaterializeBracketSlotsOnce({ db: prisma, tournamentId });
    log.info({ tournamentId, slotResult }, "bracket slots materialization (service)");
  }

  // Log the sync attempt
  await createSyncLogBestEffort({
    db: prisma,
    feedType: "BRACKET" as SyncFeedType,
    tournamentId,
    entityId: tournamentId,
    fetchedAt: startedAt,
    httpStatus: ran ? 200 : 204,
    payload: { ran, reason: job?.data?.reason ?? null } as any,
  });

  return { ok: true, tournamentId, ran };
}
