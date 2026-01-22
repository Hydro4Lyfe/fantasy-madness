import { JOB } from "./names.js";
import type { Boss } from "./types.js";

export async function ensureQueues(boss: Boss) {
  // pg-boss v12 expects queues to exist before work() runs
  await boss.createQueue(JOB.DAILY_CHANGE_LOG);
  await boss.createQueue(JOB.TOURNAMENT_LIST);
  await boss.createQueue(JOB.TOURNAMENT_SCHEDULE);
  // add others when you implement them
}
