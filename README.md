# Fantasy Madness

A monorepo for **Fantasy Madness**, a March-Madness-style fantasy game.

Right now the repo focuses on the **data layer**:

- `packages/db` – Prisma schema + a shared `prisma` client (Postgres via `@prisma/adapter-pg`).
- `apps/ingest` – CLI + worker/orchestrator that ingests Sportradar NCAA MBB tournament data.
- `apps/fake-sportradar` – (optional) local stub server for testing without hitting Sportradar.

## Quick start (local)

1) Create env files

```bash
cp .env.example .env
cp apps/ingest/.env.example apps/ingest/.env
```

2) Install + generate

```bash
npm install
npm run db:generate
```

3) Run migrations

```bash
npm run db:migrate:dev
```

4) Ingest a tournament

```bash
npm -w @fantasy-madness/ingest run build
node apps/ingest/dist/index.js sync --tournamentId <id> --seasonYear 2024 --mode summary --print
```

## Docker one-shot ingest

```bash
docker build -f apps/ingest/Dockerfile -t fantasy-madness-ingest:dev .

# IMPORTANT: when using --env-file, do NOT wrap values in quotes
#   ✅ SPORTRADAR_BASE_URL=https://...
#   ❌ SPORTRADAR_BASE_URL="https://..."

docker run --rm --env-file apps/ingest/.env fantasy-madness-ingest:dev \
  sync --tournamentId <id> --seasonYear 2024 --mode full --print
```

## Common commands

- Generate Prisma client: `npm run db:generate`
- Dev migration: `npm run db:migrate:dev`
- Deploy migrations (prod): `npm run db:migrate:deploy`
- Prisma Studio: `npm run db:studio`
- Build ingest: `npm -w @fantasy-madness/ingest run build`
- Dev ingest (TypeScript): `npm -w @fantasy-madness/ingest run dev -- sync ...`

## What’s “ready” vs. what’s next?

**Ready now**:
- Schema + migrations workflow
- Ingest CLI for deterministic backfills (summary-only or full)
- Bracket slot materialization (64 canonical slots; play-ins resolved over time)

**Next**:
- The web app UI + game logic screens (draft/global picks, scoring views)
- Job scheduling policy for ongoing “live” tournament updates (cron / k8s)

