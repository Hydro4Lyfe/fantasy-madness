import { createBoss } from "./queue/boss.js";
import { ensureQueues } from "./queue/ensureQueues.js";
import { registerHandlers } from "./queue/registerHandlers.js";
import { startOrchestrator } from "./scheduler/orchestrator.js";
import { initSportradarConfig } from "./sportradar.js";
import { log } from "./logger.js";

async function main() {
  initSportradarConfig();

  const boss = await createBoss();

  // IMPORTANT: handle error events so Node doesn't crash
  boss.on("error", (err: any) => {
    log.error({ err }, "pg-boss error");
  });

  await boss.start();
  await ensureQueues(boss);     // ✅ create queues
  registerHandlers(boss);       // ✅ now safe

  void startOrchestrator(boss);

  log.info("ingest service started (workers + orchestrator)");
}

main().catch((e) => {
  log.error({ err: String(e) }, "fatal");
  process.exit(1);
});
