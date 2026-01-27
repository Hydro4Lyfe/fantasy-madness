# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install all dependencies (npm workspaces)
npm install

# Run the Next.js web app in dev mode
npm run dev:web

# Run the ingest service in dev mode
npm run dev:ingest

# Build everything (in correct dependency order)
npm run build

# Build individual packages
npm run build:db         # Generate Prisma client + compile
npm run build:domain     # Compile domain package
npm run build:dal        # Compile DAL package
npm run build:web        # Build Next.js app
npm run build:ingest     # Build ingest service

# Prisma commands (run from root with workspace flag)
npm run prisma -w @fantasy-madness/db -- <command>
npm run generate -w @fantasy-madness/db          # Generate Prisma client
npm run migrate:dev -w @fantasy-madness/db       # Run migrations (dev)
npm run migrate:deploy -w @fantasy-madness/db    # Run migrations (prod)

# Type checking
npm run typecheck -w @fantasy-madness/web
npm run typecheck -w @fantasy-madness/ingest

# Linting (web only)
npm run lint -w @fantasy-madness/web
```

## Architecture Overview

This is an **npm workspaces monorepo** for a March Madness fantasy basketball application.

### Package Structure

```
apps/
  web/       → Next.js 15 App Router (Supabase Auth, Tailwind CSS 4)
  ingest/    → Data ingestion service (Sportradar API → PostgreSQL via pg-boss)

packages/
  db/        → Prisma 7 schema, migrations, client factory (@fantasy-madness/db)
  domain/    → Shared types, enums, Zod schemas, errors (no DB imports)
  dal/       → Data Access Layer - all Prisma queries/mutations
```

### Dependency Flow

```
domain (no deps) → db (Prisma) → dal (queries/mutations) → apps
```

- **domain** has zero database dependencies; it's pure TypeScript types and Zod schemas
- **db** exports `prisma` client and `DbClient` type; uses Prisma 7 with `@prisma/adapter-pg`
- **dal** accepts `db: DbClient` as first argument to all functions for transaction support
- Apps import from dal for all database operations

### Web App (`apps/web`)

- **Authentication**: Supabase Auth with `@supabase/ssr`
- **Auth guards**: `requireUserId()` and `requireAdmin()` in `server/auth/guards.ts`
- **Server actions**: Located in `server/actions/` (drafts, picks, auth)
- **Route groups**: `(app)` for authenticated pages, `(admin)` for admin pages, `(marketing)` for public

### Ingest Service (`apps/ingest`)

CLI commands:
```bash
# Run as background service (pg-boss workers + orchestrator)
npm run dev:ingest

# One-shot sync for a tournament
node dist/index.js sync --tournamentId=<id> --seasonYear=2025

# Backfill historical data
node dist/index.js backfill --years=2018,2019,2020
node dist/index.js backfill --fromYear=2018 --toYear=2025

# Check tournament status
node dist/index.js status --tournamentId=<id>
```

Uses pg-boss for job queuing with handlers in `src/queue/` and scheduling logic in `src/scheduler/`.

### Key Domain Concepts

- **BracketSlot**: The 64 canonical pick positions per tournament (quadrant + seed). Users pick slots, not teams directly, to handle play-in games.
- **Draft**: Snake/linear/auction drafts where participants pick BracketSlots
- **GlobalContest**: Site-wide contest where users pick 8 teams individually
- **TournamentSyncState**: DISCOVERED → MONITORING → BRACKET_LOCKED → LIVE → COMPLETED

### Docker

```bash
cd infra/compose
docker-compose up --build           # Both services
docker-compose up --build web       # Web only
docker-compose up --build ingest    # Ingest only
```

## Environment Variables

Required for both services:
- `DATABASE_URL` - PostgreSQL connection string (pooled)
- `DIRECT_URL` - PostgreSQL direct connection (for migrations)

Web-specific:
- Supabase environment variables for auth
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

Ingest-specific:
- Sportradar API credentials
