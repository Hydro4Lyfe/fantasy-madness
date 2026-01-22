export const JOB = {
  DAILY_CHANGE_LOG: "pull.daily_change_log",
  TOURNAMENT_LIST: "pull.tournament_list",
  TOURNAMENT_SCHEDULE: "pull.tournament_schedule",
  TOURNAMENT_SUMMARY: "pull.tournament_summary",
  GAME_SUMMARY: "pull.game_summary",
} as const;

export type JobName = (typeof JOB)[keyof typeof JOB];
