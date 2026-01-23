import { prisma } from "@fantasy-madness/db";
import { SyncFeedType } from "@prisma/client";
import { createSyncLog, createSyncLogBestEffort, withAdvisoryLock } from "@fantasy-madness/dal";
import { discoverTournament } from "../discovery.js";
import { sha256Hex } from "../hash.js";
import { log } from "../logger.js";
import { runSyncOnce } from "../sync.js";

/**
 * Job: pull:tournament_list
 *
 * Discovers the NCAA tournament (via Tournament List) and then runs a sync.
 * This is idempotent: runSyncOnce uses upserts, and discovery is safe.
 */
export async function tournamentListHandler(job: any) {
  const startedAt = new Date();

  try {
    const discovered = await discoverTournament();
    const payloadHash = sha256Hex(discovered);

    await createSyncLog({
      db: prisma,
      feedType: SyncFeedType.TOURNAMENT_LIST,
      tournamentId: discovered.tournamentId,
      entityId: String(discovered.seasonYear),
      fetchedAt: startedAt,
      httpStatus: 200,
      payload: discovered as any,
      payloadHash,
    });

    log.info(
      {
        jobId: job?.id,
        tournamentId: discovered.tournamentId,
        seasonYear: discovered.seasonYear,
      },
      "tournament discovered; running sync",
    );

    const lockName = `ingest:sync:tournament:${discovered.tournamentId}`;
    const { ran } = await withAdvisoryLock(lockName, async () => {
      await runSyncOnce({
        tournamentId: discovered.tournamentId,
        seasonYear: discovered.seasonYear,
      });
    });

    if (!ran) {
      log.info(
        { tournamentId: discovered.tournamentId, jobId: job?.id },
        "sync skipped (lock held)",
      );
    }

    return { ok: true, tournamentId: discovered.tournamentId };
  } catch (e: any) {
    const err = String(e?.message ?? e);
    log.error({ err, jobId: job?.id }, "tournament_list job failed");

    // Best-effort log record (no tournamentId if discovery failed)
    await createSyncLogBestEffort({
      db: prisma,
      feedType: SyncFeedType.TOURNAMENT_LIST,
      tournamentId: null,
      entityId: null,
      fetchedAt: startedAt,
      httpStatus: guessHttpStatus(e),
      error: err,
    });

    throw e;
  }
}

function guessHttpStatus(e: any): number {
  const msg = String(e?.message ?? "");
  const m = msg.match(/HTTP_(\d{3})/);
  if (m) return Number(m[1]);
  if (msg.includes("RATE_LIMIT") || msg.includes("429")) return 429;
  return 500;
}
