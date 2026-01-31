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

## Product Requirements

### Data Source

- **SportRadar API** is the source of truth for all tournament data and scoring
- The ingest service pulls data and stores it in PostgreSQL
- Game results trigger score recalculations

### Scoring System

- **Formula**: Seed × Wins (excluding play-in games)
- Example: 16-seed with 1 win = 16 pts, 1-seed with 1 win = 1 pt
- This rewards picking upsets (higher seeds are worth more per win)

### Game Modes

#### Draft Mode
- **Participants**: Exactly 8 required to start (configurable to 2 for testing)
- **Picks**: Users draft BracketSlots (not teams directly) to handle pre-play-in picks
- **Host Controls**:
  - Pick timer (optional - no time limit if not set)
  - Draft start date/time
- **Real-time**: WebSocket connections for live draft updates
- **Auto-pick**: When timer expires, system auto-picks optimal available slot
- **Reconnection**: Users can rejoin active drafts after disconnection/crash
- **Authentication**: Required to participate

#### Global Mode
- Users pick 8 BracketSlots they believe will score highest
- No draft constraints - pick any slots you want
- Theoretically allows higher scores than Draft mode since no competition for picks

### Availability Windows

- Both modes **open** after Selection Sunday (when bracket is announced)
- Both modes **close** when Play-ins end (Thursday after Selection Sunday, Round 1 starts)
- Play-in games (Tuesday & Wednesday after Selection Sunday) do not count for scoring

### Leaderboards

1. **Global Leaderboard**: Scores from Global mode participants
2. **Draft Leaderboard**: Scores from all drafts in that tournament year

### Historical Page

- View past tournament results
- Display:
  - Highest possible score (theoretical max given tournament outcomes)
  - Highest draft score achieved
  - Highest global score achieved

### Algorithms

#### Theoretical Maximum Points
- Calculate highest possible remaining points at any point during tournament
- Recalculate after each game concludes
- Used for historical comparisons and live "best possible" tracking

#### Optimal Pick (Auto-draft)
- Determines best available BracketSlot when draft timer expires
- Prevents drafts from stalling on absent participants

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

## Draft Room Architecture (MVP)

> Full documentation: `/docs/ADR-001-DRAFT-ROOM-ARCHITECTURE.md`

### System Topology

```
┌─────────────────────────────────────────────────┐
│             Kubernetes Cluster                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Web Pod 1 │ │Web Pod 2 │ │Web Pod N │        │
│  │+ WS + PG │ │+ WS + PG │ │+ WS + PG │        │
│  │ LISTEN   │ │ LISTEN   │ │ LISTEN   │        │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘        │
│       └────────────┼────────────┘               │
│              ┌─────▼─────┐                      │
│              │   Redis   │ (cross-pod pub/sub)  │
│              └─────┬─────┘                      │
│              ┌─────▼─────┐                      │
│              │PostgreSQL │ (source of truth)    │
│              │+ pg-boss  │ (timer scheduling)   │
│              └───────────┘                      │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Real-time | **WebSocket** | Bi-directional, low-latency |
| State | **PostgreSQL** | Pod-safe, ACID transactions |
| Cross-pod events | **Redis pub/sub** | Horizontal scaling |
| Timer triggers | **pg-boss + PG NOTIFY** | Sub-second latency |
| Auto-pick | **Highest seed first** | Maximizes expected value |

### New Components

```
apps/web/lib/
├── websocket/           # WebSocket server + handlers
│   ├── server.ts
│   ├── handler.ts
│   └── events.ts
├── redis/               # Redis pub/sub client
│   ├── client.ts
│   └── pubsub.ts
└── draft/               # Timer worker + auto-pick
    ├── timer-worker.ts
    └── cron.ts

packages/dal/src/
├── mutations/
│   ├── drafts.makePick.ts    # Timer logic added
│   └── drafts.start.ts       # Timer initialization
└── queries/
    └── drafts.selectOptimalSlot.ts  # Auto-pick algorithm
```

### Database Additions

```prisma
model DraftTurnTimer {
  draftId           String   @id @db.Uuid
  turnStartedAt     DateTime
  currentPickNumber Int
  deadlineAt        DateTime
  timerPausedAt     DateTime?
  draft             Draft    @relation(...)
}

model DraftPick {
  // ... existing fields
  isAutoPick Boolean @default(false)
}
```

### Event Protocol

**Server → Client:**
- `draft:state` - Full room state on connect/reconnect
- `pick:made` - Someone made a pick
- `turn:changed` - Next picker + deadline
- `draft:completed` - Draft finished
- `error` - Validation/system error

**Client → Server:**
- `pick:submit` - User submits pick
- `ping` - Heartbeat

### Implementation Phases

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Database & DAL | Timer schema, makePick updates |
| 2 | Redis + Timer | Pub/sub, pg-boss timer jobs |
| 3 | WebSocket Server | Real-time event broadcasting |
| 4 | Client Integration | Live React draft room |
| 5 | Testing & Deploy | E2E tests, K8s configs |

### Success Criteria

- 8 users complete full 64-pick draft
- Picks broadcast to all clients within 500ms
- Auto-pick triggers within 1 second of deadline
- Graceful reconnection after disconnect
- Handles 10+ concurrent drafts (scales horizontally)
