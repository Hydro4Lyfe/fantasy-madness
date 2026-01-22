import Fastify from "fastify";
import sensible from "@fastify/sensible";
import fs from "node:fs";
import path from "node:path";

type Scenario = {
  tournamentId: string;
  base: {
    tournamentList: any;
    summary: any;
    schedule: any;
  };
  ticks: { label: string; patch: any }[];
};

const fastify = Fastify({ logger: true });

const SCENARIO_PATH =
  process.env.SCENARIO_PATH ?? path.join(process.cwd(), "scenarios/demo.json");

const TICK_SECONDS = Number(process.env.TICK_SECONDS ?? "15");
const AUTO = (process.env.AUTO_ADVANCE ?? "true") === "true";

/**
 * If you set SPORTRADAR_API_KEY, the server will require it and return 401 if it doesn't match.
 * If you leave it blank/undefined, it will accept any api_key.
 */
const EXPECTED_API_KEY = process.env.SPORTRADAR_API_KEY;

const scenario: Scenario = JSON.parse(fs.readFileSync(SCENARIO_PATH, "utf8"));

let startMs = Date.now();
let manualTick = 0;

// In-memory request log (so you can see what your ingest called and when)
type ReqLog = {
  ts: string;
  method: string;
  url: string;
  path: string;
  tick: number;
  apiKeyProvided: boolean;
};
const reqLog: ReqLog[] = [];
const MAX_LOG = 500;

// --- helpers ---
function currentTick(): number {
  if (!AUTO) return manualTick;
  const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
  return Math.max(0, Math.floor(elapsedSec / TICK_SECONDS));
}

function deepMerge(base: any, patch: any): any {
  if (patch == null) return base;

  if (Array.isArray(base) && Array.isArray(patch)) {
    const allAreIdObjects =
      base.every((x) => x && typeof x === "object" && "id" in x) &&
      patch.every((x) => x && typeof x === "object" && "id" in x);

    if (allAreIdObjects) {
      const byId = new Map<string, any>();
      for (const item of base) byId.set(String(item.id), structuredClone(item));
      for (const item of patch) {
        const id = String(item.id);
        const existing = byId.get(id) ?? {};
        byId.set(id, deepMerge(existing, item));
      }
      const baseIds = new Set(base.map((x: any) => String(x.id)));
      const merged = base.map((x: any) => byId.get(String(x.id)));
      for (const [id, item] of byId.entries()) {
        if (!baseIds.has(id)) merged.push(item);
      }
      return merged;
    }

    return structuredClone(patch);
  }

  if (base && typeof base === "object" && patch && typeof patch === "object") {
    const out: any = { ...structuredClone(base) };
    for (const k of Object.keys(patch)) out[k] = deepMerge(base?.[k], patch[k]);
    return out;
  }

  return structuredClone(patch);
}

function addSimMeta(out: any) {
  const t = currentTick();
  out._sim = {
    scenario: path.basename(SCENARIO_PATH),
    tick: t,
    applied: Math.min(t, scenario.ticks.length),
    tickSeconds: TICK_SECONDS,
    autoAdvance: AUTO,
  };
  return out;
}

function buildPayload(kind: "tournamentList" | "summary" | "schedule") {
  const t = currentTick();
  const capped = Math.min(t, scenario.ticks.length);
  let out = structuredClone(scenario.base[kind]);

  for (let i = 0; i < capped; i++) {
    const patch = scenario.ticks[i]?.patch?.[kind];
    if (patch) out = deepMerge(out, patch);
  }

  return addSimMeta(out);
}

/**
 * Minimal daily changes feed derived from the tick patches.
 * It emits one "game updated" entry for each game touched by schedule patches up to current tick.
 */
function buildDailyChanges(dateISO: string) {
  const t = currentTick();
  const capped = Math.min(t, scenario.ticks.length);

  const changedGameIds: string[] = [];
  for (let i = 0; i < capped; i++) {
    const gamesPatch: any[] | undefined = scenario.ticks[i]?.patch?.schedule?.games;
    if (Array.isArray(gamesPatch)) {
      for (const g of gamesPatch) {
        if (g?.id) changedGameIds.push(String(g.id));
      }
    }
  }

  // unique, keep order
  const seen = new Set<string>();
  const uniqueChanged = changedGameIds.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const payload = {
    date: dateISO,
    league: "ncaamb",
    changes: uniqueChanged.map((id) => ({
      entity: "game",
      id,
      // simulated "updated" time tied to tick
      updated_at: new Date(startMs + Math.min(t, 10_000) * 1000).toISOString(),
    })),
  };

  return addSimMeta(payload);
}

// --- setup ---
await fastify.register(sensible);

// Validate api_key + capture request log
fastify.addHook("onRequest", async (req, reply) => {
  const t = currentTick();

  // api_key validation (optional)
  const q: any = req.query ?? {};
  const apiKey = typeof q.api_key === "string" ? q.api_key : undefined;

  if (EXPECTED_API_KEY && apiKey !== EXPECTED_API_KEY) {
    // Still log the attempt
    reqLog.unshift({
      ts: new Date().toISOString(),
      method: req.method,
      url: req.url,
      path: req.routerPath ?? req.url.split("?")[0]!,
      tick: t,
      apiKeyProvided: Boolean(apiKey),
    });
    if (reqLog.length > MAX_LOG) reqLog.length = MAX_LOG;

    return reply.code(401).send({ error: "INVALID_API_KEY" });
  }

  reqLog.unshift({
    ts: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.routerPath ?? req.url.split("?")[0]!,
    tick: t,
    apiKeyProvided: Boolean(apiKey),
  });
  if (reqLog.length > MAX_LOG) reqLog.length = MAX_LOG;
});

// --- official-route-compatible endpoints ---
// 1) Tournament list schedule
fastify.get("/tournaments/:seasonYear/:seasonType/schedule.json", async () => {
  return buildPayload("tournamentList");
});

// 2) Tournament summary
fastify.get("/tournaments/:tournamentId/summary.json", async (req) => {
  const { tournamentId } = req.params as any;
  if (tournamentId !== scenario.tournamentId) {
    return fastify.httpErrors.notFound("Unknown tournament");
  }
  return buildPayload("summary");
});

// 3) Tournament schedule
fastify.get("/tournaments/:tournamentId/schedule.json", async (req) => {
  const { tournamentId } = req.params as any;
  if (tournamentId !== scenario.tournamentId) {
    return fastify.httpErrors.notFound("Unknown tournament");
  }
  return buildPayload("schedule");
});

// 4) Daily change log
fastify.get("/league/:year/:month/:day/changes.json", async (req) => {
  const { year, month, day } = req.params as any;
  const dateISO = `${year}-${month}-${day}`;
  return buildDailyChanges(dateISO);
});

// --- simulation control ---
fastify.post("/sim/reset", async () => {
  startMs = Date.now();
  manualTick = 0;
  return { ok: true };
});

fastify.post("/sim/advance", async (req) => {
  const q = (req.query as any) ?? {};
  const n = Number(q.ticks ?? "1");
  manualTick += Math.max(0, n);
  return { ok: true, manualTick };
});

fastify.get("/sim/status", async () => ({
  tick: currentTick(),
  manualTick,
  auto: AUTO,
  tickSeconds: TICK_SECONDS,
  scenario: path.basename(SCENARIO_PATH),
}));

// View last N requests (this answers “did data come in and when?”)
fastify.get("/sim/requests", async (req) => {
  const q = (req.query as any) ?? {};
  const limit = Math.min(200, Math.max(1, Number(q.limit ?? "50")));
  return {
    now: new Date().toISOString(),
    count: reqLog.length,
    items: reqLog.slice(0, limit),
  };
});

// --- start ---
const port = Number(process.env.PORT ?? "4010");
fastify.listen({ port, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
