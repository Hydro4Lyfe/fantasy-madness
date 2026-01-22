import { prisma } from "@fantasy-madness/db";
import { SyncFeedType } from "@prisma/client";
import { DateTime } from "luxon";
import { sha256Hex } from "../hash.js";
import { log } from "../logger.js";
import { fetchDailyChangeLog } from "../sportradar.js";
import { JOB } from "../queue/names.js";
import type { Boss } from "../queue/types.js";

const TZ = "UTC";

function computeChangeLogDateISO(now = DateTime.now().setZone(TZ)): string {
  const effective = now.hour < 5 ? now.minus({ days: 1 }) : now;
  return effective.toFormat("yyyy-LL-dd");
}

export function makeDailyChangeLogHandler(boss: Boss) {
  return async function dailyChangeLogHandler(job: any) {
    const startedAt = new Date();
    const dateISO = computeChangeLogDateISO();

    try {
      const payload = await fetchDailyChangeLog(dateISO);

      // Make the hash deterministic
      const payloadJson = JSON.stringify(payload);
      const payloadHash = sha256Hex(payloadJson);

      await prisma.syncLog.create({
        data: {
          feedType: SyncFeedType.DAILY_CHANGE_LOG,
          tournamentId: null,
          entityId: dateISO,
          fetchedAt: startedAt,
          httpStatus: 200,
          payload: payload as any, // Json is fine; Prisma accepts plain objects
          payloadHash,
        },
      });

      const changeCount = Array.isArray(payload?.changes)
        ? payload.changes.length
        : Array.isArray(payload)
          ? payload.length
          : 0;

      log.info({ jobId: job?.id, dateISO, changeCount }, "daily change log fetched");

      if (changeCount > 0) {
        const bucketKey = String(job?.data?.bucketKey ?? dateISO);

        await boss.send(
          JOB.TOURNAMENT_SCHEDULE,
          { reason: "change_log_trigger", bucketKey, dateISO },
          {
            singletonKey: `trigger:schedule:${bucketKey}`,
            singletonSeconds: 10 * 60,
            retryLimit: 2,
            retryDelay: 30,
          },
        );
      }

      return { ok: true, dateISO, changeCount };
    } catch (e: any) {
      const err = String(e?.message ?? e);
      log.error({ err, jobId: job?.id, dateISO }, "daily change log job failed");

      // Best effort logging
      await prisma.syncLog
        .create({
          data: {
            feedType: SyncFeedType.DAILY_CHANGE_LOG,
            tournamentId: null,
            entityId: dateISO,
            fetchedAt: startedAt,
            httpStatus: guessHttpStatus(e),
            error: err,
          },
        })
        .catch(() => undefined);

      throw e;
    }
  };
}

function guessHttpStatus(e: any): number {
  const msg = String(e?.message ?? "");
  const m = msg.match(/HTTP_(\d{3})/);
  if (m) return Number(m[1]);
  if (msg.includes("RATE_LIMIT") || msg.includes("429")) return 429;
  return 500;
}
