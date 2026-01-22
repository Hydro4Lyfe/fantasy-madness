import { CADENCES } from "./cadences.js";
import { bucketKey } from "./buckets.js";
import { computePhase, Phase } from "./phase.js";
import { withAdvisoryLock } from "../lock.js";
import type { Boss } from "../queue/types.js";
import { JOB } from "../queue/names.js";
import { prisma } from "@fantasy-madness/db";
import { log } from "../logger.js";

// Cache latch decision briefly to avoid hammering DB every spec every minute
let latchCache: { value: boolean; expiresAt: number } | null = null;

export async function startOrchestrator(boss: Boss) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const phase = await getPhaseCached();

      if (phase !== "OFFSEASON") {
        await withAdvisoryLock("ingest:orchestrator", async () => {
          await enqueueCadencedJobs(boss, phase);
        });
      }
    } catch (err) {
      log.error({ err }, "orchestrator tick failed");
    }

    await sleep(60_000);
  }
}

async function enqueueCadencedJobs(boss: Boss, phase: Phase) {
  // Latch: once we have an active-ish tournament, we stop polling Tournament List.
  const shouldRunTournamentList = await shouldRunTournamentListLatch();

  log.info({ phase, shouldRunTournamentList }, "orchestrator tick (leader)");

  for (const spec of CADENCES) {
    if (!spec.phases.includes(phase)) continue;

    // LATCH RULE
    if (spec.name === JOB.TOURNAMENT_LIST && !shouldRunTournamentList) {
      log.info({ phase }, "skipping tournament list (latched)");
      continue;
    }

    const bKey = bucketKey(spec.every);
    const singletonKey = `${spec.name}:${phase}:${bKey}`;

    const jitter = spec.jitterSeconds
      ? Math.floor(Math.random() * spec.jitterSeconds)
      : 0;

    const payload = spec.payload?.({ phase, bucketKey: bKey }) ?? {
      phase,
      bucketKey: bKey,
    };

    // inside enqueueCadencedJobs
    const id = await boss.send(spec.name, payload, {
      singletonKey,
      singletonSeconds: singletonSeconds(spec.every),
      startAfter: jitter ? `${jitter} seconds` : undefined,
      retryLimit: 3,
      retryDelay: 30,
    });

    if (id) {
      log.info(
        { job: spec.name, phase, bucketKey: bKey, singletonKey, id },
        "job enqueued",
      );
    } else {
      log.debug(
        { job: spec.name, phase, bucketKey: bKey, singletonKey },
        "job deduped",
      );
    }
  }
}

let phaseCache: { value: Phase; expiresAt: number } | null = null;

async function getPhaseCached(): Promise<Phase> {
  const now = Date.now();
  if (phaseCache && phaseCache.expiresAt > now) return phaseCache.value;
  const phase = await computePhase();
  phaseCache = { value: phase, expiresAt: now + 60_000 };
  return phase;
}

/**
 * Returns true when we should keep polling Tournament List.
 * Once we have an "active-ish" tournament (DISCOVERED/MONITORING/BRACKET_LOCKED/LIVE),
 * we consider ourselves latched and stop calling tournament list.
 *
 * Cache result for 5 minutes to reduce DB chatter.
 */
async function shouldRunTournamentListLatch(): Promise<boolean> {
  const now = Date.now();
  if (latchCache && latchCache.expiresAt > now) return latchCache.value;

  const t = await prisma.tournament.findFirst({
    where: {
      syncState: {
        in: ["DISCOVERED", "MONITORING", "BRACKET_LOCKED", "LIVE"] as any,
      },
    },
    select: { id: true },
  });

  // If no active-ish tournament exists, keep polling tournament list.
  const shouldRun = !t;

  latchCache = { value: shouldRun, expiresAt: now + 5 * 60_000 };
  return shouldRun;
}

function singletonSeconds(every: "10m" | "1h" | "3h" | "1d" | "1w") {
  if (every === "10m") return 12 * 60;
  if (every === "1h") return 70 * 60;
  if (every === "3h") return 4 * 3600;
  if (every === "1d") return 26 * 3600;
  return 8 * 24 * 3600;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
