import pino from "pino";

const VALID = new Set([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

function pickLevel(): pino.LevelWithSilent {
  const raw = String(process.env.LOG_LEVEL ?? "info").toLowerCase().trim();
  if (VALID.has(raw)) return raw as pino.LevelWithSilent;

  // If someone sets LOG_LEVEL to something weird, don't crash the worker.
  return "info";
}

export const log = pino({
  level: pickLevel(),
});
