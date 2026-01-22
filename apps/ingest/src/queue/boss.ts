import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type PgBossCtor = new (connectionString: string, options?: any) => any;

function loadPgBossCtor(): PgBossCtor {
  const mod = require("pg-boss");

  // pg-boss can appear as:
  // - function/class itself (CJS)
  // - { default: class/function } (ESM interop)
  // - { PgBoss: class/function } (some builds)
  const ctor =
    (typeof mod === "function" ? mod : null) ??
    (typeof mod?.default === "function" ? mod.default : null) ??
    (typeof mod?.PgBoss === "function" ? mod.PgBoss : null);

  if (!ctor) {
    throw new Error(
      `pg-boss import did not resolve to a constructor. Keys: ${Object.keys(mod ?? {}).join(",")}`,
    );
  }

  return ctor as PgBossCtor;
}

export async function createBoss(connectionString?: string) {
  const cs = connectionString ?? process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!cs) throw new Error("DATABASE_URL (or DIRECT_DATABASE_URL) is required");

  const PgBoss = loadPgBossCtor();

  const boss = new PgBoss(cs, {
    application_name: "fantasy-madness-ingest",
  });

  return boss;
}
