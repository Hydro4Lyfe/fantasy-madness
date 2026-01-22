import { JOB, JobName } from "../queue/names.js";
import type { Phase } from "./phase.js";

type CadenceSpec = {
  name: JobName;
  phases: Phase[];
  // how to bucket dedupe keys
  every: "10m" | "1h" | "3h" | "1d" | "1w";
  // jitter avoids “top-of-hour stampede”
  jitterSeconds?: number;
  // additional data passed to job
  payload?: (ctx: { phase: Phase; bucketKey: string }) => any;
};

export const CADENCES: CadenceSpec[] = [
  { name: JOB.TOURNAMENT_LIST, phases: ["DISCOVERY"], every: "1d", jitterSeconds: 60,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },

  // PRE_TOURNAMENT: light schedule refresh so we eventually populate without spamming
  { name: JOB.TOURNAMENT_SCHEDULE, phases: ["PRE_TOURNAMENT"], every: "1d", jitterSeconds: 90,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },

  // SELECTION_WINDOW: moderate
  { name: JOB.TOURNAMENT_SCHEDULE, phases: ["SELECTION_WINDOW"], every: "3h", jitterSeconds: 60,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },
  { name: JOB.DAILY_CHANGE_LOG, phases: ["SELECTION_WINDOW"], every: "1d", jitterSeconds: 60,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },

  // LIVE: schedule more often, change log less often unless you parse it into targeted pulls
  { name: JOB.TOURNAMENT_SCHEDULE, phases: ["TOURNAMENT_GAMEDAY"], every: "1h", jitterSeconds: 30,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },
  { name: JOB.DAILY_CHANGE_LOG, phases: ["TOURNAMENT_GAMEDAY"], every: "3h", jitterSeconds: 30,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },

  // Gap days + cooldown: very light
  { name: JOB.TOURNAMENT_SCHEDULE, phases: ["TOURNAMENT_GAPDAY"], every: "1d", jitterSeconds: 120,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },
  { name: JOB.DAILY_CHANGE_LOG, phases: ["TOURNAMENT_GAPDAY", "COOLDOWN"], every: "1d", jitterSeconds: 120,
    payload: ({ phase, bucketKey }) => ({ reason: phase, bucketKey }) },
];


