import { prisma } from "@fantasy-madness/db";
import { SyncFeedType } from "@prisma/client";
import { createSyncLogBestEffort, findLatestTournamentInStates, withAdvisoryLock } from "@fantasy-madness/dal";
import { discoverTournament } from "../discovery.js";
import { log } from "../logger.js";
import { runSyncOnce } from "../sync.js";
/**
 * Job: pull:tournament_schedule
 *
 * Refreshes schedule/outcomes for the most recent active-ish tournament.
 * Falls back to discovery if the DB is empty.
 */
export async function tournamentScheduleHandler(job: any) {
  log.info({ jobId: job?.id, data: job?.data }, "job start: tournament schedule");
  
  const startedAt = new Date();
  // Prefer an existing tournament id (cheaper than discovery).
  const existing = await findLatestTournamentInStates({
    db: prisma,
    states: ["DISCOVERED", "MONITORING", "BRACKET_LOCKED", "LIVE"] as any,
  });

  let tournamentId = existing?.id ?? null;
  let seasonYear = existing?.seasonYear ?? null;

  if (!tournamentId || !seasonYear) {
    const discovered = await discoverTournament();
    tournamentId = discovered.tournamentId;
    seasonYear = discovered.seasonYear;
  }

  log.info(
    { jobId: job?.id, tournamentId, seasonYear },
    "running schedule sync (summary + schedule)",
  );

  const lockName = `ingest:sync:tournament:${tournamentId}`;
  const { ran } = await withAdvisoryLock(lockName, async () => {
    await runSyncOnce({ tournamentId, seasonYear });
  });

  // Observability: record that we attempted a schedule sync (even if lock prevented it).
  await createSyncLogBestEffort({
    db: prisma,
    feedType: SyncFeedType.TOURNAMENT_SCHEDULE,
    tournamentId,
    entityId: tournamentId,
    fetchedAt: startedAt,
    httpStatus: ran ? 200 : 204,
    payload: { ran, reason: job?.data?.reason ?? null } as any,
  });

  return { ok: true, tournamentId };
}
