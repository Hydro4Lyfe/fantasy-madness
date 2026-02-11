import { prisma } from "@fantasy-madness/db";
import { getTournamentSnapshot, maybeMaterializeBracketSlotsOnce } from "./dal/index.js";

import { log } from "./logger.js";
import { initBallDontLieConfig } from "./balldontlie.js";
import { runSyncOnce, type SyncMode } from "./sync.js";
import { syncSportradarTeamLogos } from "./sportradarLogos.js";

import { createBoss } from "./queue/boss.js";
import { ensureQueues } from "./queue/ensureQueues.js";
import { registerHandlers } from "./queue/registerHandlers.js";
import { startOrchestrator } from "./scheduler/orchestrator.js";

type Cli =
  | { cmd: "service" }
  | {
      cmd: "sync";
      tournamentId: string;
      seasonYear: number;
      mode: SyncMode;
      print?: boolean;
    }
  | {
      cmd: "backfill";
      years: number[];
      mode: SyncMode;
      print?: boolean;
    }
  | {
      cmd: "sync-logos";
      endpoint?: string;
      provider: "sportradar" | "espn";
      outputDir?: string;
      dryRun: boolean;
    }
  | { cmd: "status"; tournamentId: string }
  | { cmd: "materialize-slots"; tournamentId: string; print?: boolean };

function parseBool(v: string | boolean | undefined): boolean {
  if (v === true) return true;
  if (v === undefined) return false;
  const s = String(v).toLowerCase().trim();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}

function parseIntStrict(v: string | undefined, name: string): number {
  if (!v) throw new Error(`Missing --${name}`);
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid --${name}: ${v}`);
  return Math.trunc(n);
}

function getFlag(argv: string[], name: string): string | boolean | undefined {
  const long = `--${name}`;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === long) {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) return true;
      return next;
    }
    if (a.startsWith(long + "=")) return a.slice(long.length + 1);
  }
  return undefined;
}

function parseYears(argv: string[]): number[] {
  const years = getFlag(argv, "years");
  if (typeof years === "string" && years.trim()) {
    return years
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n))
      .map((n) => Math.trunc(n));
  }

  const fromYearRaw = getFlag(argv, "fromYear");
  const toYearRaw = getFlag(argv, "toYear");

  if (typeof fromYearRaw === "string" || typeof toYearRaw === "string") {
    const fromYear = parseIntStrict(
      typeof fromYearRaw === "string" ? fromYearRaw : undefined,
      "fromYear",
    );
    const toYear = parseIntStrict(
      typeof toYearRaw === "string" ? toYearRaw : undefined,
      "toYear",
    );
    const out: number[] = [];
    const step = fromYear <= toYear ? 1 : -1;
    for (let y = fromYear; step > 0 ? y <= toYear : y >= toYear; y += step) {
      out.push(y);
    }
    return out;
  }

  const seasonYearRaw = getFlag(argv, "seasonYear");
  if (typeof seasonYearRaw === "string") return [parseIntStrict(seasonYearRaw, "seasonYear")];

  return [];
}

function parseSyncMode(argv: string[]): SyncMode {
  const modeRaw = getFlag(argv, "mode");
  if (typeof modeRaw === "string") {
    const m = modeRaw.toLowerCase().trim();
    if (m === "bracket") return "bracket";
    return "full";
  }
  if (parseBool(getFlag(argv, "bracketOnly"))) return "bracket";
  return "full";
}

function parseCli(argv: string[]): Cli {
  const cmd = (argv.find((a) => !a.startsWith("--")) ?? "service") as string;
  const print = parseBool(getFlag(argv, "print"));

  if (cmd === "service") return { cmd: "service" };

  if (cmd === "status") {
    const tournamentId = String(getFlag(argv, "tournamentId") ?? "").trim();
    if (!tournamentId) throw new Error("status requires --tournamentId");
    return { cmd: "status", tournamentId };
  }

  if (cmd === "materialize-slots") {
    const tournamentIdRaw = getFlag(argv, "tournamentId");
    const seasonYearRaw = getFlag(argv, "seasonYear");
    let tournamentId = "";

    if (typeof tournamentIdRaw === "string" && tournamentIdRaw.trim()) {
      tournamentId = tournamentIdRaw.trim();
    } else if (typeof seasonYearRaw === "string" && seasonYearRaw.trim()) {
      tournamentId = String(parseIntStrict(seasonYearRaw, "seasonYear"));
    }

    if (!tournamentId) {
      throw new Error("materialize-slots requires --tournamentId or --seasonYear");
    }

    return { cmd: "materialize-slots", tournamentId, print };
  }

  if (cmd === "sync") {
    const tournamentId = String(getFlag(argv, "tournamentId") ?? "").trim();
    if (!tournamentId) throw new Error("sync requires --tournamentId");
    const seasonYear = parseIntStrict(
      typeof getFlag(argv, "seasonYear") === "string"
        ? (getFlag(argv, "seasonYear") as string)
        : undefined,
      "seasonYear",
    );
    return { cmd: "sync", tournamentId, seasonYear, mode: parseSyncMode(argv), print };
  }

  if (cmd === "sync-logos") {
    const providerRaw = String(getFlag(argv, "provider") ?? "espn").trim().toLowerCase();
    const provider: "sportradar" | "espn" = providerRaw === "sportradar" ? "sportradar" : "espn";

    const endpointRaw = getFlag(argv, "endpoint");
    let endpoint: string | undefined =
      typeof endpointRaw === "string" && endpointRaw.trim() ? endpointRaw.trim() : undefined;

    if (!endpoint && provider === "sportradar") {
      const fromEnv = String(process.env.SPORTRADAR_LOGOS_ENDPOINT ?? "").trim();
      endpoint = fromEnv || undefined;
    }

    if (provider === "sportradar" && !endpoint) {
      throw new Error("sync-logos with sportradar requires --endpoint or SPORTRADAR_LOGOS_ENDPOINT");
    }

    const outputDirRaw = getFlag(argv, "outputDir");
    const outputDir =
      typeof outputDirRaw === "string" && outputDirRaw.trim()
        ? outputDirRaw.trim()
        : undefined;

    return {
      cmd: "sync-logos",
      endpoint,
      provider,
      outputDir,
      dryRun: parseBool(getFlag(argv, "dryRun")),
    };
  }

  if (cmd === "backfill") {
    const years = parseYears(argv);
    if (!years.length) {
      throw new Error(
        "backfill requires one of: --years 2018,2019 OR --fromYear 2018 --toYear 2025 OR --seasonYear 2024",
      );
    }
    return { cmd: "backfill", years, mode: parseSyncMode(argv), print };
  }

  throw new Error(`Unknown command: ${cmd}`);
}

async function printTournamentSnapshot(tournamentId: string) {
  const snapshot = await getTournamentSnapshot({ db: prisma, tournamentId });
  log.info(snapshot, "tournament snapshot");
}

async function startService() {
  initBallDontLieConfig();

  const boss = await createBoss();

  boss.on("error", (err: any) => {
    log.error({ err }, "pg-boss error");
  });

  await boss.start();
  await ensureQueues(boss);
  registerHandlers(boss);

  void startOrchestrator(boss);
  log.info("ingest service started (workers + orchestrator)");
}

async function runMaterializeSlots(params: { tournamentId: string; print?: boolean }) {
  const { tournamentId } = params;

  const result = await maybeMaterializeBracketSlotsOnce({ db: prisma, tournamentId });
  log.info({ tournamentId, result }, "bracket slots materialization (manual)");

  if (params.print) {
    await printTournamentSnapshot(tournamentId);
  }
}

/**
 * Backfill multiple seasons using BallDontLie API.
 * Tournament ID is derived from season year (e.g., "2024" for 2024 season).
 */
async function runBackfillYears(params: {
  years: number[];
  mode: SyncMode;
  print?: boolean;
}) {
  initBallDontLieConfig();

  for (const seasonYear of params.years) {
    const tournamentId = String(seasonYear);

    log.info(
      { seasonYear, tournamentId, mode: params.mode },
      "backfill: syncing season",
    );

    await runSyncOnce({
      tournamentId,
      seasonYear,
      mode: params.mode,
    });

    if (params.print) {
      await printTournamentSnapshot(tournamentId);
    }
  }
}

async function runOneSync(params: {
  tournamentId: string;
  seasonYear: number;
  mode: SyncMode;
  print?: boolean;
}) {
  initBallDontLieConfig();
  await runSyncOnce({
    tournamentId: params.tournamentId,
    seasonYear: params.seasonYear,
    mode: params.mode,
  });
  if (params.print) await printTournamentSnapshot(params.tournamentId);
}

async function main() {
  const argv = process.argv.slice(2);
  const cli = parseCli(argv);

  if (cli.cmd === "service") {
    await startService();
    return;
  }

  try {
    if (cli.cmd === "status") {
      await printTournamentSnapshot(cli.tournamentId);
      return;
    }
    if (cli.cmd === "sync") {
      await runOneSync(cli);
      return;
    }
    if (cli.cmd === "backfill") {
      await runBackfillYears(cli);
      return;
    }
    if (cli.cmd === "materialize-slots") {
      await runMaterializeSlots(cli);
      return;
    }
    if (cli.cmd === "sync-logos") {
      await syncSportradarTeamLogos(cli);
      return;
    }
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

main().catch((e) => {
  log.error({ err: String(e) }, "fatal");
  process.exit(1);
});
