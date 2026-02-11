import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@fantasy-madness/db";

import { log } from "./logger.js";

type TeamRow = {
  id: number;
  name: string;
  fullName: string;
  college: string | null;
  abbreviation: string | null;
};

type SyncSportradarLogosArgs = {
  endpoint?: string;
  provider?: "sportradar" | "espn";
  dryRun?: boolean;
  outputDir?: string;
};

const LOGO_EXTENSIONS = [".svg", ".png", ".jpg", ".jpeg", ".webp"];

function normalizeName(v: string | null | undefined): string {
  if (!v) return "";
  return v
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeAlias(v: string | null | undefined): string {
  if (!v) return "";
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

function defaultOutputDir(): string {
  return path.resolve(new URL("../../web/public/team-logos", import.meta.url).pathname);
}

function parseSportradarEndpoint(urlOrPath: string): string {
  const s = String(urlOrPath).trim();
  if (!s) throw new Error("Missing Sportradar logos endpoint");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  const baseUrl = String(process.env.SPORTRADAR_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const cleanedPath = s.startsWith("/") ? s : `/${s}`;
  if (!baseUrl) {
    throw new Error("SPORTRADAR_BASE_URL is required when using a relative endpoint path");
  }
  return `${baseUrl}${cleanedPath}`;
}

function parseEspnEndpoint(urlOrPath: string | undefined): string {
  const raw = String(urlOrPath ?? "").trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const fromEnv = String(process.env.ESPN_LOGOS_ENDPOINT ?? "").trim();
  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) return fromEnv;

  return "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams?limit=500";
}

function getAbsoluteOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function trimQueryAndHash(urlOrPath: string): string {
  const i = urlOrPath.search(/[?#]/);
  return i >= 0 ? urlOrPath.slice(0, i) : urlOrPath;
}

function inferManifestBasePath(endpoint: string): string {
  const clean = trimQueryAndHash(endpoint).replace(/\/+$/, "");

  const match = clean.match(/^(.*\/logos)(?:\/\d{4})?\/manifest(?:\.[a-z0-9]+)?$/i);
  if (match && match[1]) return match[1];

  return clean.replace(/\/manifest(?:\.[a-z0-9]+)?$/i, "");
}

function resolveLogoUrl(raw: string, endpoint: string, basePath: string): string {
  const s = raw.trim();
  if (!s) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  if (s.startsWith("/")) {
    const origin = getAbsoluteOrigin(endpoint);
    if (origin) return `${origin}${s}`;
    return s;
  }

  return `${basePath.replace(/\/+$/, "")}/${s.replace(/^\/+/, "")}`;
}

function candidateArrayFromPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((v): v is Record<string, unknown> => !!v && typeof v === "object");
  }

  if (!payload || typeof payload !== "object") return [];

  const obj = payload as Record<string, unknown>;
  const keys = ["logos", "items", "data", "references", "assets"];

  for (const key of keys) {
    const value = obj[key];
    if (!Array.isArray(value)) continue;
    const items = value.filter((v): v is Record<string, unknown> => !!v && typeof v === "object");
    if (items.length > 0) return items;
  }

  return [];
}

function collectManifestRecords(payload: unknown, endpoint: string): Record<string, unknown>[] {
  const items = candidateArrayFromPayload(payload);
  if (!items.length) return [];

  const basePath = inferManifestBasePath(endpoint);
  const out: Record<string, unknown>[] = [];

  for (const item of items) {
    const record: Record<string, unknown> = {
      name: item.name,
      full_name: item.full_name,
      fullName: item.fullName,
      alias: item.alias,
      abbreviation: item.abbreviation,
      market: item.market,
    };

    const team = item.team;
    if (team && typeof team === "object") {
      const t = team as Record<string, unknown>;
      record.name ??= t.name;
      record.full_name ??= t.full_name;
      record.fullName ??= t.fullName;
      record.alias ??= t.alias;
      record.abbreviation ??= t.abbreviation;
      record.market ??= t.market;
    }

    const competitor = item.competitor;
    if (competitor && typeof competitor === "object") {
      const c = competitor as Record<string, unknown>;
      record.name ??= c.name;
      record.full_name ??= c.full_name;
      record.fullName ??= c.fullName;
      record.alias ??= c.alias;
      record.abbreviation ??= c.abbreviation;
      record.market ??= c.market;
    }

    const logoUrls = new Set<string>();

    const add = (v: unknown) => {
      if (typeof v !== "string") return;
      const resolved = resolveLogoUrl(v, endpoint, basePath);
      if (resolved) logoUrls.add(resolved);
    };

    add(item.logo);
    add(item.logo_url);
    add(item.logoUrl);
    add(item.url);
    add(item.href);
    add(item.path);

    const files = item.files;
    if (Array.isArray(files)) {
      for (const file of files) {
        if (!file || typeof file !== "object") continue;
        const f = file as Record<string, unknown>;
        add(f.url);
        add(f.href);
        add(f.path);
        add(f.file_name);
        add(f.fileName);
      }
    }

    const logos = item.logos;
    if (Array.isArray(logos)) {
      for (const logo of logos) {
        if (!logo || typeof logo !== "object") continue;
        const l = logo as Record<string, unknown>;
        add(l.url);
        add(l.href);
        add(l.path);
        add(l.file_name);
        add(l.fileName);
      }
    }

    const assetId =
      typeof item.asset_id === "string"
        ? item.asset_id
        : typeof item.assetId === "string"
          ? item.assetId
          : typeof item.id === "string"
            ? item.id
            : null;

    const fileName =
      typeof item.file_name === "string"
        ? item.file_name
        : typeof item.fileName === "string"
          ? item.fileName
          : typeof item.filename === "string"
            ? item.filename
            : null;

    if (assetId && fileName) {
      logoUrls.add(`${basePath.replace(/\/+$/, "")}/${assetId}/${fileName.replace(/^\/+/, "")}`);
    }

    if (logoUrls.size > 0) {
      record.logos = Array.from(logoUrls).map((url) => ({ url }));
      out.push(record);
    }
  }

  return out;
}

function collectCandidateRecords(payload: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];

  const walk = (node: unknown) => {
    if (!node) return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;

    const logos = extractLogoUrls(obj);
    if (logos.length > 0) out.push(obj);

    for (const value of Object.values(obj)) {
      walk(value);
    }
  };

  walk(payload);
  return out;
}

function collectLogoRecords(payload: unknown, endpoint: string): Record<string, unknown>[] {
  const manifestRecords = collectManifestRecords(payload, endpoint);
  if (manifestRecords.length > 0) return manifestRecords;

  return collectCandidateRecords(payload);
}

function collectEspnTeamRecords(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const sports = root.sports;
  if (!Array.isArray(sports) || sports.length === 0) return [];

  const sport0 = sports[0] as Record<string, unknown>;
  const leagues = sport0?.leagues;
  if (!Array.isArray(leagues) || leagues.length === 0) return [];

  const league0 = leagues[0] as Record<string, unknown>;
  const teams = league0?.teams;
  if (!Array.isArray(teams)) return [];

  const records: Record<string, unknown>[] = [];

  for (const item of teams) {
    if (!item || typeof item !== "object") continue;
    const team = (item as Record<string, unknown>).team;
    if (!team || typeof team !== "object") continue;

    const t = team as Record<string, unknown>;
    const logos = Array.isArray(t.logos)
      ? t.logos
          .filter((l): l is Record<string, unknown> => !!l && typeof l === "object")
          .map((l) => ({ url: l.href }))
      : [];

    if (!logos.length) continue;

    records.push({
      name: t.name,
      full_name: t.displayName,
      fullName: t.displayName,
      market: t.location,
      alias: t.abbreviation,
      abbreviation: t.abbreviation,
      logos,
    });
  }

  return records;
}

function extractLogoUrls(obj: Record<string, unknown>): string[] {
  const urls: string[] = [];

  const push = (v: unknown) => {
    if (typeof v !== "string") return;
    const s = v.trim();
    if (!s.startsWith("http://") && !s.startsWith("https://")) return;
    if (!/\.svg(\?|$)|\.png(\?|$)|\.jpg(\?|$)|\.jpeg(\?|$)|\.webp(\?|$)/i.test(s) && !s.toLowerCase().includes("logo")) return;
    urls.push(s);
  };

  push(obj.logo);
  push(obj.logo_url);
  push(obj.logoUrl);
  push(obj.team_logo);
  push(obj.teamLogo);
  push(obj.primary_logo);
  push(obj.primaryLogo);

  const logos = obj.logos;
  if (Array.isArray(logos)) {
    for (const logo of logos) {
      if (logo && typeof logo === "object") {
        const l = logo as Record<string, unknown>;
        push(l.href);
        push(l.url);
      }
    }
  }

  return Array.from(new Set(urls));
}

function pickLogoUrl(urls: string[]): string | null {
  const preferred = urls.find((u) => /primary_logo_on_white_color|\/500\//i.test(u));
  if (preferred) return preferred;

  const png = urls.find((u) => /\.png(\?|$)/i.test(u));
  if (png) return png;

  const svg = urls.find((u) => /\.svg(\?|$)/i.test(u));
  if (svg) return svg;

  return urls[0] ?? null;
}

function getRecordKeys(record: Record<string, unknown>): string[] {
  const keys = new Set<string>();

  const addName = (v: unknown) => {
    if (typeof v !== "string") return;
    const n = normalizeName(v);
    if (n) keys.add(`name:${n}`);
  };
  const addAlias = (v: unknown) => {
    if (typeof v !== "string") return;
    const n = normalizeAlias(v);
    if (n) keys.add(`alias:${n}`);
  };

  addAlias(record.alias);
  addAlias(record.abbreviation);

  addName(record.name);
  addName(record.full_name);
  addName(record.fullName);

  const market = typeof record.market === "string" ? record.market : null;
  const name = typeof record.name === "string" ? record.name : null;
  if (market && name) addName(`${market} ${name}`);

  return Array.from(keys);
}

function buildTeamKeyMap(teams: TeamRow[]): Map<string, TeamRow[]> {
  const map = new Map<string, TeamRow[]>();

  const push = (key: string, team: TeamRow) => {
    const next = map.get(key) ?? [];
    next.push(team);
    map.set(key, next);
  };

  for (const team of teams) {
    const keys = [
      `name:${normalizeName(team.name)}`,
      `name:${normalizeName(team.fullName)}`,
      `name:${normalizeName(team.college)}`,
      `alias:${normalizeAlias(team.abbreviation)}`,
    ].filter((k) => !k.endsWith(":") && !k.endsWith(": "));

    for (const key of keys) {
      push(key, team);
    }
  }

  return map;
}

async function fetchJson(endpoint: string, provider: "sportradar" | "espn"): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (provider === "sportradar") {
    const apiKey = String(process.env.SPORTRADAR_API_KEY ?? "").trim();
    if (!apiKey) throw new Error("Missing SPORTRADAR_API_KEY");
    headers["x-api-key"] = apiKey;
  }

  const res = await fetch(endpoint, { headers });

  if (!res.ok) {
    throw new Error(`${provider} request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function inferLogoExtension(url: string, contentType: string): string {
  const ct = contentType.toLowerCase();
  if (ct.includes("image/png")) return ".png";
  if (ct.includes("image/svg")) return ".svg";
  if (ct.includes("image/jpeg")) return ".jpg";
  if (ct.includes("image/webp")) return ".webp";

  const cleanUrl = trimQueryAndHash(url).toLowerCase();
  for (const ext of LOGO_EXTENSIONS) {
    if (cleanUrl.endsWith(ext)) return ext;
  }

  return ".png";
}

async function downloadLogo(
  url: string,
  provider: "sportradar" | "espn",
): Promise<{ bytes: Uint8Array; extension: string }> {
  const headers: Record<string, string> = { Accept: "image/*" };

  if (provider === "sportradar") {
    const apiKey = String(process.env.SPORTRADAR_API_KEY ?? "").trim();
    if (apiKey) headers["x-api-key"] = apiKey;
  }

  const res = await fetch(url, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to download logo: ${res.status} ${res.statusText}`);
  }

  const contentType = String(res.headers.get("content-type") ?? "");
  const extension = inferLogoExtension(url, contentType);

  return { bytes: new Uint8Array(await res.arrayBuffer()), extension };
}

export async function syncSportradarTeamLogos(args: SyncSportradarLogosArgs): Promise<void> {
  const provider = args.provider === "espn" ? "espn" : "sportradar";
  const endpoint =
    provider === "espn"
      ? parseEspnEndpoint(args.endpoint)
      : parseSportradarEndpoint(String(args.endpoint ?? ""));
  const outputDir = args.outputDir ? path.resolve(args.outputDir) : defaultOutputDir();
  const dryRun = args.dryRun === true;

  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      fullName: true,
      college: true,
      abbreviation: true,
    },
    orderBy: { id: "asc" },
  });

  const teamKeyMap = buildTeamKeyMap(teams as TeamRow[]);

  const payload = await fetchJson(endpoint, provider);
  const records = provider === "espn" ? collectEspnTeamRecords(payload) : collectLogoRecords(payload, endpoint);

  if (!records.length) {
    throw new Error(`No logo-bearing team records found in ${provider} payload`);
  }

  log.info({ endpoint, provider, teamsInDb: teams.length, candidateRecords: records.length }, "starting team logo sync");

  if (!dryRun) {
    await mkdir(outputDir, { recursive: true });
  }

  let matched = 0;
  let written = 0;
  let skippedNoMatch = 0;
  let skippedNoLogo = 0;
  let failedDownload = 0;

  for (const record of records) {
    const logoUrls = extractLogoUrls(record);
    const logoUrl = pickLogoUrl(logoUrls);
    if (!logoUrl) {
      skippedNoLogo += 1;
      continue;
    }

    const keys = getRecordKeys(record);
    let team: TeamRow | null = null;

    for (const key of keys) {
      const candidates = teamKeyMap.get(key) ?? [];
      if (candidates.length === 1) {
        team = candidates[0] as TeamRow;
        break;
      }
    }

    if (!team) {
      skippedNoMatch += 1;
      continue;
    }

    matched += 1;

    if (dryRun) continue;

    try {
      const { bytes, extension } = await downloadLogo(logoUrl, provider);
      for (const ext of LOGO_EXTENSIONS) {
        await rm(path.join(outputDir, `${team.id}${ext}`), { force: true });
      }
      await writeFile(path.join(outputDir, `${team.id}${extension}`), bytes);
      written += 1;
    } catch (error) {
      failedDownload += 1;
      log.warn({ teamId: team.id, error: String(error) }, "logo download failed");
    }
  }

  log.info(
    {
      outputDir,
      dryRun,
      matched,
      written,
      skippedNoMatch,
      skippedNoLogo,
      failedDownload,
    },
    "team logo sync complete",
  );
}
