export const JOB = {
  BRACKET: "pull.bracket",
} as const;

export type JobName = (typeof JOB)[keyof typeof JOB];
