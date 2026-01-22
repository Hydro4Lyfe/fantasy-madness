import { prisma } from "@fantasy-madness/db";

import { discoverTournamentForSeason } from "./discovery.js";
import { log } from "./logger.js";
import { initSportradarConfig } from "./sportradar.js";
import { runSyncOnce, type SyncMode } from "./sync.js";

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
      seasonType?: string;
      mode: SyncMode;
      print?: boolean;
    }
  | { cmd: "status"; tournamentId: string };

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
    if (m === "summary") return "summary";
    return "full";
  }
  // convenience flag
  if (parseBool(getFlag(argv, "summaryOnly"))) return "summary";
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

  if (cmd === "sync") {
    const tournamentId = String(getFlag(argv, "tournamentId") ?? "").trim();
    if (!tournamentId) throw new Error("sync requires --tournamentId");
    const seasonYear = parseIntStrict(
      typeof getFlag(argv, "seasonYear") === "string" ? (getFlag(argv, "seasonYear") as string) : undefined,
      "seasonYear",
    );
    return { cmd: "sync", tournamentId, seasonYear, mode: parseSyncMode(argv), print };
  }

  if (cmd === "backfill") {
    const years = parseYears(argv);
    if (!years.length) {
      throw new Error(
        "backfill requires one of: --years 2018,2019 OR --fromYear 2018 --toYear 2025 OR --seasonYear 2024",
      );
    }
    const seasonTypeRaw = getFlag(argv, "seasonType");
    const seasonType = typeof seasonTypeRaw === "string" ? seasonTypeRaw : undefined;
    return { cmd: "backfill", years, seasonType, mode: parseSyncMode(argv), print };
  }

  throw new Error(`Unknown command: ${cmd}`);
}

async function printTournamentSnapshot(tournamentId: string) {
  const [t, ttTotal, ttSeeded, slotsTotal, slotsAssigned, candTotal] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        seasonYear: true,
        name: true,
        syncState: true,
        bracketLockedAt: true,
        startDate: true,
        endDate: true,
      },
    }),
    prisma.tournamentTeam.count({ where: { tournamentId } }),
    prisma.tournamentTeam.count({
      where: { tournamentId, seed: { not: null }, quadrant: { not: null } },
    }),
    prisma.bracketSlot.count({ where: { tournamentId } }),
    prisma.bracketSlot.count({ where: { tournamentId, assignedTeamId: { not: null } } }),
    prisma.bracketSlotCandidate.count({ where: { slot: { tournamentId } } }),
  ]);

  const slotsUnassigned = slotsTotal - slotsAssigned;
  log.info(
    {
      tournament: t,
      tournamentTeams: { total: ttTotal, seeded: ttSeeded },
      bracket: {
        slotsTotal,
        slotsAssigned,
        slotsUnassigned,
        candidatesTotal: candTotal,
      },
    },
    "tournament snapshot",
  );
}

async function startService() {
  initSportradarConfig();

  const boss = await createBoss();

  // IMPORTANT: handle error events so Node doesn't crash
  boss.on("error", (err: any) => {
    log.error({ err }, "pg-boss error");
  });

  await boss.start();
  await ensureQueues(boss);
  registerHandlers(boss);

  void startOrchestrator(boss);
  log.info("ingest service started (workers + orchestrator)");
}

async function runBackfillYears(params: {
  years: number[];
  seasonType?: string;
  mode: SyncMode;
  print?: boolean;
}) {
  initSportradarConfig();

  for (const seasonYear of params.years) {
    const discovered = await discoverTournamentForSeason({
      seasonYear,
      seasonType: params.seasonType,
    });

    log.info(
      { seasonYear, tournamentId: discovered.tournamentId, mode: params.mode },
      "backfill: syncing season",
    );

    await runSyncOnce({
      tournamentId: discovered.tournamentId,
      seasonYear,
      mode: params.mode,
    });

    if (params.print) {
      await printTournamentSnapshot(discovered.tournamentId);
    }
  }
}

async function runOneSync(params: {
  tournamentId: string;
  seasonYear: number;
  mode: SyncMode;
  print?: boolean;
}) {
  initSportradarConfig();
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

  // For one-shot commands, we want deterministic exit codes.
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
  } finally {
    // Ensure Node can exit (pg pool will keep event loop alive otherwise)
    await prisma.$disconnect().catch(() => undefined);
  }
}

main().catch((e) => {
  log.error({ err: String(e) }, "fatal");
  process.exit(1);
});
