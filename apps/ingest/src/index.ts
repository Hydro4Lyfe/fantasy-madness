import { log } from "./logger.js";
import { initSportradarConfig } from "./sportradar.js";
import { withAdvisoryLock } from "./lock.js";
import { discoverTournament } from "./discovery.js";
import { runSyncOnce } from "./sync.js";

initSportradarConfig();

async function main() {
  const { tournamentId, seasonYear } = await discoverTournament();

  const lockName = `ingest:tournament:${tournamentId}`;
  const res = await withAdvisoryLock(lockName, async () => {
    await runSyncOnce({ tournamentId, seasonYear });
  });

  if (!res.ran) {
    log.warn({ lockName }, "skipped: lock not acquired (another worker running)");
  }
}

main().catch((e) => {
  log.error({ err: String(e) }, "fatal");
  process.exit(1);
});
