import { JOB } from "./names.js";
import { bracketSyncHandler } from "../jobs/bracketSync.js";
import type { Boss } from "./types.js";

export function registerHandlers(boss: Boss) {
  boss.work(JOB.BRACKET, { teamSize: 1 }, bracketSyncHandler);
}
