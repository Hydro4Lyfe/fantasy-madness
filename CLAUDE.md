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

- **UI Library**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS 4 with dark theme, CSS variables for design tokens
- **Layout**: `AppShell` component provides fixed navigation wrapper
- **Authentication**: Supabase Auth with `@supabase/ssr`
- **Auth guards**: `requireUserId()` and `requireAdmin()` in `server/auth/guards.ts`
- **Server actions**: Located in `server/actions/`:
  - `drafts.ts` — updateDraft, removeParticipant, startDraft, joinDraftByInvite
  - `createDraft.ts`, `joinDraft.ts`, `makePick.ts`, `joinDraftByInvite.ts` — individual draft actions
  - `leagues.ts` — create, join, joinByInvite, leave, update, savePicks, savePicksDirect, kick, ban, unban (10 actions)
  - `auth.ts` — signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, signOut
- **Server queries**: `server/queries/` — thin wrappers for DAL calls (leagues, drafts, tournaments)
- **Route groups**: `(app)` for authenticated pages, `(marketing)` for public pages

### Route Structure

**Navigation**: Dashboard → Global Contest → Drafts → Leagues → Leaderboards → History

**Marketing routes** (`(marketing)`):
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/signup` | Signup page |

**Authenticated routes** (`(app)`, wrapped by AppShell):
| Route | Status |
|-------|--------|
| `/dashboard` | UI done (mock data) |
| `/global-contest` | Overview done (mock data) |
| `/global-contest/picks` | Stub |
| `/drafts` | Listing works (DAL-connected) |
| `/drafts/new` | Create form exists |
| `/drafts/[draftId]` | Details work (DAL-connected) |
| `/drafts/[draftId]/room` | Stub |
| `/drafts/[draftId]/results` | Stub |
| `/drafts/public` | Mock data |
| `/leagues` | Stub |
| `/leagues/new` | Stub |
| `/leagues/[leagueId]` | Stub |
| `/leaderboards` | Works (DAL-connected) |
| `/history` | UI done (mock data) |
| `/join/[code]` | Stub |
| `/settings` | Stub |

### UI Components

The web app uses **shadcn/ui** components in `components/ui/`:
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS using `class-variance-authority` for variants
- 46+ components: Button, Card, Dialog, Form, Input, Select, Table, etc.

**Key patterns:**
- `cn()` utility for className merging (clsx + tailwind-merge)
- `data-slot` attributes for CSS targeting
- Client/server component split: server pages fetch data, client components handle interactivity

**Layout components** in `components/layout/`:
- `AppShell`: Main wrapper with fixed navigation, background, and content area

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

### Data Access Layer (`packages/dal`)

All database operations are accessed through `packages/dal/src/index.ts`. Every function takes `db: DbClient` as its first argument for transaction support.

**Queries:**
- Tournaments: `listBySeasonYear`, `getBySeasonYear`, `getOpen`
- BracketSlots: `listBySeasonYear`
- Drafts: `getById`, `getByInviteCode`, `listForUser`, `getRoomState`, `getForEdit`, `selectOptimalSlot`, `getResults`
- Leagues: `getById`, `getByInviteCode`, `listForUser`, `getRoomState`, `getLeaderboard`, `getForEdit`, `listPublic`

**Mutations:**
- Drafts: `create`, `join`, `makePick`, `update`, `removeParticipant`, `start`
- Leagues: `create`, `join`, `leave`, `update`, `savePicks`, `kickParticipant`, `banParticipant`, `unbanParticipant`

### Key Domain Concepts

- **BracketSlot**: The 64 canonical pick positions per tournament (quadrant + seed). Users pick slots, not teams directly, to handle play-in games.
- **Draft**: Snake/linear/auction drafts where participants pick BracketSlots
- **DraftStatus**: OPEN → DRAFTING → LOCKED → COMPLETE (Prisma schema; see Known Code Issues below for domain enum mismatch)
- **GlobalContest**: Site-wide contest where users pick 8 teams individually
- **League**: User-created contests with configurable participant limits and host controls
- **LeagueStatus**: OPEN → LOCKED → COMPLETE
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

#### Leagues Mode
- User-created contests with configurable max participants
- **Creator Controls**:
  - Set league name and public/private visibility
  - Configure max participants (minimum 2)
  - Kick or ban participants (host only, ban supports optional reason)
  - Unban previously banned participants
- **Picks**: Each user independently picks 8 BracketSlots (like Global mode)
  - Picks are saved transactionally (delete-all + recreate pattern via `savePicks`)
- **Status Flow**: OPEN → LOCKED → COMPLETE
- **Invite System**: Private leagues use invite codes for joining
- **Authentication**: Required to create or join
- **Database Models**: League, LeagueEntry, LeaguePick, LeagueScore, LeagueBan
  - LeagueEntry tracks `isHost` flag for host privileges
  - LeagueBan records `reason` and `bannedById` for audit trail
  - LeagueScore stores `score` and `breakdown` (JSON) for detailed scoring

### Availability Windows

- Both modes **open** after Selection Sunday (when bracket is announced)
- Both modes **close** when Play-ins end (Thursday after Selection Sunday, Round 1 starts)
- Play-in games (Tuesday & Wednesday after Selection Sunday) do not count for scoring

### Leaderboards

1. **Global Leaderboard**: Scores from Global mode participants
2. **Draft Leaderboard**: Scores from all drafts in that tournament year
3. **League Leaderboards**: Per-league scores and rankings

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

> **Status**: This section describes the **planned architecture** — not yet implemented. The `DraftTurnTimer` model exists in the Prisma schema, but the runtime components (WebSocket server, Redis pub/sub, timer worker) are not yet built.

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

## Implementation Status

### Complete
- Prisma schema (all models for Draft, Global, League modes)
- DAL queries and mutations (all three modes)
- League server actions (10 actions)
- Draft server actions (4 in `drafts.ts` + individual action files: createDraft, joinDraft, makePick, joinDraftByInvite)
- Auth server actions (Google sign-in, email/password sign-in/up, sign-out)
- shadcn/ui component library (46+ components)
- AppShell navigation layout
- Marketing pages (landing, login, signup)
- Drafts listing + details pages (DAL-connected)
- Leaderboards page (DAL-connected)

### Partial (mock data or stubs)
- Dashboard (mock data, needs DAL integration)
- Global Contest overview (mock data, needs DAL integration)
- History page (mock data, needs DAL integration)
- Public drafts browsing (mock data)

### Not Yet Implemented
- League UI pages (all stubs — listing, create, detail)
- Global Contest picks page
- Draft room (WebSocket real-time — see Draft Room Architecture above)
- Draft results page
- Join by invite code page
- Settings page
- Score recalculation triggers
- WebSocket/Redis infrastructure

## Known Code Issues

- **DraftStatus enum mismatch**: Prisma schema defines `OPEN | DRAFTING | LOCKED | COMPLETE` but `packages/domain/src/enums.ts` still has `"LOBBY" | "LIVE" | "COMPLETE"`. These need to be reconciled (separate task).
