import { JOB } from "./names.js";
import { makeDailyChangeLogHandler } from "../jobs/dailyChangeLog.js";
import { tournamentListHandler } from "../jobs/tournamentList.js";
import { tournamentScheduleHandler } from "../jobs/tournamentSchedule.js";
import type { Boss } from "./types.js";

export function registerHandlers(boss: Boss) {
  // Factory is fine: it closes over boss so it can enqueue follow-up jobs.
  boss.work(JOB.DAILY_CHANGE_LOG, { teamSize: 1 }, makeDailyChangeLogHandler(boss));

  boss.work(JOB.TOURNAMENT_LIST, { teamSize: 1 }, tournamentListHandler);

  boss.work(JOB.TOURNAMENT_SCHEDULE, { teamSize: 1 }, tournamentScheduleHandler);
}
