# Fantasy Madness Ingest Service

Node/TypeScript ingestion worker for Sportradar NCAAMB that:

- Discovers the NCAA tournament (Tournament List)
- Syncs tournament summary + schedule into Postgres via Prisma
- Uses **pg-boss** (Postgres-backed queue) + an **orchestrator** loop for phase-based scheduling
- Uses a **Postgres advisory lock** so only one orchestrator enqueues jobs in Kubernetes
- Writes a `SyncLog` row for each feed pull (observability)

## Runtime requirements

- Node 20+ (Node 24 is fine)
- Environment variables:
  - `DATABASE_URL` (or `DIRECT_DATABASE_URL`) – Postgres connection string (Supabase recommended: direct)
  - `SPORTRADAR_BASE_URL` – base path like `https://api.sportradar.com/ncaamb/{access_level}/v8/{lang}`
  - `SPORTRADAR_API_KEY`
  - Optional:
    - `LOG_LEVEL` (default `info`)
    - `SEASON_TYPE` (default `PST`)
    - `TOURNAMENT_ID_OVERRIDE`, `SEASON_YEAR_OVERRIDE`

## One-time DB setup

1) Ensure pg-boss can create its schema/tables (defaults to `pgboss` schema).
2) If you use the Daily Change Log job, add `DAILY_CHANGE_LOG` to your Prisma `SyncFeedType` enum and regenerate/migrate.

## Local run

```bash
npm -w @fantasy-madness/ingest run build
node apps/ingest/dist/index.js
```

## Kubernetes notes

- You can run multiple replicas safely:
  - The orchestrator uses an advisory lock (`ingest:orchestrator`) so only one instance enqueues jobs.
  - Workers can run in all replicas and will share work from the pg-boss queue.
- If you want to strictly limit concurrent Sportradar calls, keep `teamSize: 1` (current default) and avoid adding high-concurrency workers.
