import { existsSync } from "node:fs";
import path from "node:path";

import { config as loadDotenv } from "dotenv";

function loadEnvFiles() {
  const explicitEnvFile = String(process.env.INGEST_ENV_FILE ?? "").trim();

  const candidates = [
    explicitEnvFile,
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "apps/ingest/.env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(new URL("../.env", import.meta.url).pathname),
    path.resolve(new URL("../../../.env", import.meta.url).pathname),
  ].filter(Boolean);

  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    if (!existsSync(candidate)) continue;
    loadDotenv({ path: candidate, override: false });
  }
}

loadEnvFiles();
await import("./index.js");
