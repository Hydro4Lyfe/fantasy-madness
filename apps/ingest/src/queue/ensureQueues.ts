import { JOB } from "./names.js";
import type { Boss } from "./types.js";

export async function ensureQueues(boss: Boss) {
  // pg-boss v12 expects queues to exist before work() runs
  await boss.createQueue(JOB.BRACKET);
}
