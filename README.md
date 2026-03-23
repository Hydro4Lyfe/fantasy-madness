# Fantasy Madness

A March Madness fantasy basketball platform where users compete by drafting NCAA tournament bracket slots, joining leagues, and climbing leaderboards. Built as an npm workspaces monorepo with Next.js, PostgreSQL, and real-time draft capabilities.

---

## How It Works

**Scoring** — Seed x Wins (excluding play-in games). A 16-seed with one win earns 16 points. A 1-seed with one win earns 1 point. Upsets are rewarded.

**Draft Mode** — Eight participants snake-draft from 64 bracket slots. Timed picks with auto-draft fallback. Real-time via WebSocket.

**Global Contest** — Pick any 8 bracket slots freely, no competition for picks. Theoretically allows higher scores than drafts.

**Leagues** — User-created contests with configurable size, invite codes, host controls (kick, ban), and independent 8-slot picks per participant.

**Availability** — Opens after Selection Sunday, closes when play-in games end. Play-in results don't count toward scoring.

---

## Architecture

```
apps/
  web/         Next.js 15 App Router — Supabase Auth, Tailwind CSS 4, shadcn/ui
  ingest/      Data ingestion — Sportradar API, pg-boss job queue

packages/
  domain/      Shared types, enums, Zod schemas, errors (zero DB deps)
  db/          Prisma 7 schema, migrations, client factory
  dal/         Data Access Layer — all queries and mutations

infra/
  compose/     Docker Compose for local development
```

**Dependency flow:** `domain` → `db` → `dal` → `apps`

Every DAL function takes `db: DbClient` as its first argument, enabling transaction support across all database operations.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Supabase project (for auth)
- Sportradar API credentials (for ingest)

### Install

```bash
npm install
```

### Environment

Both services require:
- `DATABASE_URL` — PostgreSQL connection string (pooled)
- `DIRECT_URL` — PostgreSQL direct connection (for migrations)

Web additionally requires Supabase env vars and `ADMIN_EMAILS`.
Ingest additionally requires Sportradar API credentials.

### Database

```bash
npm run generate -w @fantasy-madness/db        # Generate Prisma client
npm run migrate:dev -w @fantasy-madness/db      # Run migrations (dev)
npm run migrate:deploy -w @fantasy-madness/db   # Run migrations (prod)
```

### Development

```bash
npm run dev:web       # Next.js dev server + WebSocket
npm run dev:ingest    # Ingest service with pg-boss workers
```

### Build

```bash
npm run build         # All packages in dependency order
```

Or individually:

```bash
npm run build:db
npm run build:domain
npm run build:web
npm run build:ingest
```

### Docker

```bash
cd infra/compose
docker-compose up --build             # Both services
docker-compose up --build web         # Web only
docker-compose up --build ingest      # Ingest only
```

### Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

---

## Ingest CLI

The ingest service doubles as a CLI for one-shot operations:

```bash
node dist/index.js sync --tournamentId=<id> --seasonYear=2025
node dist/index.js backfill --years=2018,2019,2020
node dist/index.js backfill --fromYear=2018 --toYear=2025
node dist/index.js status --tournamentId=<id>
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| BracketSlot | One of 64 canonical pick positions per tournament (quadrant + seed). Users pick slots, not teams, to handle play-in ambiguity. |
| Draft | Snake, linear, or auction format. 8 participants, 64 slots distributed. |
| League | Host-created contest with invite codes, participant limits, and moderation tools. |
| Global Contest | Open contest — any user picks 8 slots independently. |
| Tournament Sync State | DISCOVERED → MONITORING → BRACKET_LOCKED → LIVE → COMPLETED |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS 4, shadcn/ui |
| Auth | Supabase Auth with SSR |
| Database | PostgreSQL, Prisma 7 |
| Job Queue | pg-boss |
| Real-time | WebSocket + Redis pub/sub (planned) |
| Data Source | Sportradar API |
| Monorepo | npm workspaces |
| Testing | Vitest |
