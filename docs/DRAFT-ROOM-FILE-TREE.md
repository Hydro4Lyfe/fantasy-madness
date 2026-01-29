# Draft Room MVP - Complete File Tree

This document shows all files that need to be created or modified for the Draft Room MVP implementation.

---

## Legend

- 🆕 **NEW** - File to be created
- ✏️ **MODIFY** - Existing file to be updated
- 📦 **PACKAGE** - Dependency to install
- 🗄️ **DATABASE** - Migration or schema change

---

## File Tree

```
fantasy-madness/
│
├── docs/                                               # 🆕 Documentation (you are here)
│   ├── ADR-001-DRAFT-ROOM-ARCHITECTURE.md             # 🆕 Main architecture decision record
│   ├── DRAFT-ROOM-IMPLEMENTATION-GUIDE.md             # 🆕 Step-by-step implementation guide
│   ├── DRAFT-ROOM-QUICK-START.md                      # 🆕 Quick reference
│   └── DRAFT-ROOM-FILE-TREE.md                        # 🆕 This file
│
├── packages/
│   │
│   ├── db/                                             # Database package
│   │   └── prisma/
│   │       ├── schema.prisma                          # ✏️ Add DraftTurnTimer model, isAutoPick field
│   │       └── migrations/
│   │           └── XXXXXX_add_draft_timer_and_autopick/  # 🗄️ New migration
│   │               └── migration.sql
│   │
│   ├── domain/                                         # Domain types (no changes needed)
│   │   └── src/
│   │       ├── enums.ts                               # (Existing, no changes)
│   │       └── zod/
│   │           └── drafts.ts                          # (Existing, no changes)
│   │
│   └── dal/                                            # Data Access Layer
│       └── src/
│           ├── index.ts                               # ✏️ Export new functions
│           │
│           ├── mutations/
│           │   ├── drafts.makePick.ts                 # ✏️ Add timer logic, isAutoPick support
│           │   └── drafts.start.ts                    # ✏️ Initialize timer on draft start
│           │
│           ├── queries/
│           │   ├── drafts.getRoomState.ts             # ✏️ Include timer info in response
│           │   └── drafts.selectOptimalSlot.ts        # 🆕 Auto-pick algorithm
│           │
│           └── __tests__/
│               └── drafts.timer.test.ts               # 🆕 Unit tests for timer functionality
│
├── apps/
│   │
│   └── web/                                            # Next.js web application
│       │
│       ├── package.json                               # 📦 Add: ioredis, @types/ioredis
│       │
│       ├── app/
│       │   │
│       │   ├── layout.tsx                             # ✏️ Import '@/lib/draft' to auto-start timer worker
│       │   │
│       │   └── api/
│       │       ├── health/
│       │       │   └── route.ts                       # 🆕 Health check endpoint (DB + Redis)
│       │       │
│       │       └── draft/
│       │           └── [draftId]/
│       │               └── events/
│       │                   └── route.ts               # 🆕 SSE endpoint (Phase 3)
│       │
│       ├── lib/                                        # 🆕 New directory for server utilities
│       │   │
│       │   ├── redis/
│       │   │   ├── client.ts                          # 🆕 Redis client factory
│       │   │   └── pubsub.ts                          # 🆕 Pub/sub wrapper with subscribe/publish
│       │   │
│       │   ├── draft/
│       │   │   ├── index.ts                           # 🆕 Module exports + auto-start timer worker
│       │   │   ├── timer-worker.ts                    # 🆕 Background worker for auto-picks
│       │   │   ├── cron.ts                            # 🆕 Cron job setup (start/stop)
│       │   │   └── auto-pick.ts                       # 🆕 (Optional) Auto-pick logic extraction
│       │   │
│       │   └── websocket/                             # 🆕 (Phase 3) WebSocket server
│       │       ├── server.ts                          # 🆕 WebSocket server setup
│       │       ├── handler.ts                         # 🆕 Connection handler
│       │       ├── events.ts                          # 🆕 Event type definitions
│       │       └── rooms.ts                           # 🆕 Room-based broadcast logic
│       │
│       ├── components/
│       │   └── features/
│       │       └── drafts/
│       │           └── DraftRoom.tsx                  # ✏️ Add WebSocket/SSE connection, live updates
│       │
│       └── server/
│           └── actions/
│               ├── makePick.ts                        # ✏️ Broadcast events via Redis
│               └── startDraft.ts                      # ✏️ (Optional) Broadcast draft:started event
│
├── infra/                                              # Infrastructure configs
│   │
│   ├── compose/
│   │   └── docker-compose.yml                         # ✏️ Add Redis service
│   │
│   └── k8s/
│       ├── redis-deployment.yaml                      # 🆕 Redis deployment + service
│       ├── web-deployment.yaml                        # ✏️ Add REDIS_URL env var
│       ├── web-hpa.yaml                               # 🆕 Horizontal pod autoscaler
│       └── web-service.yaml                           # (Existing, no changes)
│
└── .env                                                # ✏️ Add REDIS_URL
```

---

## Phase-by-Phase File Changes

### Phase 1: Database & DAL

```
✏️ packages/db/prisma/schema.prisma
🗄️ packages/db/prisma/migrations/XXXXXX_add_draft_timer_and_autopick/migration.sql
✏️ packages/dal/src/mutations/drafts.makePick.ts
✏️ packages/dal/src/mutations/drafts.start.ts
🆕 packages/dal/src/queries/drafts.selectOptimalSlot.ts
✏️ packages/dal/src/queries/drafts.getRoomState.ts
✏️ packages/dal/src/index.ts
🆕 packages/dal/src/__tests__/drafts.timer.test.ts
```

### Phase 2: Redis + Timer Worker

```
📦 apps/web/package.json (add ioredis)
🆕 apps/web/lib/redis/client.ts
🆕 apps/web/lib/redis/pubsub.ts
🆕 apps/web/lib/draft/timer-worker.ts
🆕 apps/web/lib/draft/cron.ts
🆕 apps/web/lib/draft/index.ts
✏️ apps/web/app/layout.tsx
✏️ apps/web/server/actions/makePick.ts
✏️ .env (add REDIS_URL)
🆕 infra/k8s/redis-deployment.yaml
✏️ infra/compose/docker-compose.yml
```

### Phase 3: WebSocket/SSE Server

```
🆕 apps/web/app/api/draft/[draftId]/events/route.ts
🆕 apps/web/app/api/health/route.ts
🆕 apps/web/lib/websocket/server.ts (if using WebSocket)
🆕 apps/web/lib/websocket/handler.ts
🆕 apps/web/lib/websocket/events.ts
🆕 apps/web/lib/websocket/rooms.ts
```

### Phase 4: Client Integration

```
✏️ apps/web/components/features/drafts/DraftRoom.tsx
```

### Phase 5: Testing & Deployment

```
🆕 apps/web/__tests__/e2e/draft-room.test.ts
🆕 infra/k8s/web-hpa.yaml
✏️ infra/k8s/web-deployment.yaml (update resource limits)
```

---

## Dependency Summary

### NPM Packages to Install

```bash
# In apps/web
npm install ioredis
npm install --save-dev @types/ioredis

# For testing (optional)
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

### External Services

```bash
# Redis (Docker - local development)
docker run -d -p 6379:6379 redis:7-alpine

# Redis (Kubernetes)
kubectl apply -f infra/k8s/redis-deployment.yaml
```

---

## Environment Variables

### Development (`.env`, `apps/web/.env.local`)

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/fantasy_madness?schema=public"
DIRECT_DATABASE_URL="postgresql://user:pass@localhost:5432/fantasy_madness?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Supabase (existing)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### Kubernetes (ConfigMap/Secret)

```yaml
# fm-secrets (Secret)
apiVersion: v1
kind: Secret
metadata:
  name: fm-secrets
type: Opaque
stringData:
  database_url: "postgresql://..."
  direct_database_url: "postgresql://..."
  supabase_url: "https://..."
  supabase_anon_key: "..."

# fm-config (ConfigMap)
apiVersion: v1
kind: ConfigMap
metadata:
  name: fm-config
data:
  REDIS_URL: "redis://fm-redis:6379"
  NODE_ENV: "production"
```

---

## Database Schema Changes Summary

### New Table: `draft_turn_timers`

```sql
CREATE TABLE draft_turn_timers (
  draft_id UUID PRIMARY KEY REFERENCES drafts(draft_id) ON DELETE CASCADE,
  turn_started_at TIMESTAMPTZ(6) NOT NULL,
  current_pick_number INT NOT NULL,
  deadline_at TIMESTAMPTZ(6) NOT NULL,
  timer_paused_at TIMESTAMPTZ(6),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_draft_turn_timers_deadline
  ON draft_turn_timers(deadline_at)
  WHERE timer_paused_at IS NULL;
```

### Modified Table: `draft_picks`

```sql
ALTER TABLE draft_picks
ADD COLUMN is_auto_pick BOOLEAN NOT NULL DEFAULT false;
```

---

## TypeScript Type Definitions Summary

### New Types (Phase 1)

```typescript
// packages/dal/src/mutations/drafts.makePick.ts
export type MakePickInput = {
  draftId: string;
  userId: string;
  slotId: string;
  isAutoPick?: boolean;
};

export type MakePickResult = {
  pickId: string;
  overallPickNo: number;
  nextPickerUserId: string | null;
  nextDeadlineAt: Date | null;
  isDraftComplete: boolean;
};

// packages/dal/src/queries/drafts.selectOptimalSlot.ts
export type SlotCandidate = {
  slotId: string;
  seed: number;
  quadrant: number;
  hasPlayIn: boolean;
};
```

### New Types (Phase 3 - WebSocket)

```typescript
// apps/web/lib/websocket/events.ts
export type ServerEvent =
  | { type: 'draft:state', payload: DraftRoomStateDTO }
  | { type: 'pick:made', payload: PickMadePayload }
  | { type: 'turn:changed', payload: TurnChangedPayload }
  | { type: 'draft:completed', payload: {} }
  | { type: 'error', payload: { message: string }};

export type ClientEvent =
  | { type: 'pick:submit', payload: { slotId: string }}
  | { type: 'ping' };

export type PickMadePayload = {
  pickId: string;
  userId: string;
  slotId: string;
  overallPickNo: number;
  isAutoPick: boolean;
};

export type TurnChangedPayload = {
  currentPickerUserId: string;
  deadlineAt: string | null;
};
```

---

## Code Owners / Responsibilities

| Component | Package/Directory | Owner/Reviewer |
|-----------|------------------|----------------|
| Database Schema | `packages/db/prisma/` | FM-Architect |
| DAL Mutations | `packages/dal/src/mutations/` | FM-Architect + Backend Team |
| DAL Queries | `packages/dal/src/queries/` | FM-Architect + Backend Team |
| Redis Client | `apps/web/lib/redis/` | Backend Team |
| Timer Worker | `apps/web/lib/draft/` | Backend Team |
| WebSocket Server | `apps/web/lib/websocket/` | Backend Team |
| React Components | `apps/web/components/` | Frontend Team |
| Infrastructure | `infra/k8s/`, `infra/compose/` | DevOps Team |

---

## Testing File Locations

```
packages/dal/src/__tests__/
├── drafts.timer.test.ts                    # 🆕 Unit: Timer logic
└── drafts.makePick.test.ts                 # ✏️ Update: Add timer test cases

apps/web/__tests__/
├── unit/
│   ├── redis-pubsub.test.ts                # 🆕 Unit: Redis pub/sub
│   └── timer-worker.test.ts                # 🆕 Unit: Auto-pick worker
│
├── integration/
│   ├── draft-room-state.test.ts            # 🆕 Integration: Full draft flow with DB
│   └── redis-events.test.ts                # 🆕 Integration: Event broadcast
│
└── e2e/
    ├── draft-room-full-flow.test.ts        # 🆕 E2E: 8 users complete draft
    ├── draft-room-autopick.test.ts         # 🆕 E2E: Timer expires, auto-pick triggers
    └── draft-room-reconnection.test.ts     # 🆕 E2E: User disconnect/reconnect
```

---

## Build & Run Commands Quick Reference

```bash
# Install dependencies (root)
npm install

# Database
npm run generate -w @fantasy-madness/db          # Generate Prisma client
npm run migrate:dev -w @fantasy-madness/db       # Run migration
npm run migrate:deploy -w @fantasy-madness/db    # Deploy migration (prod)

# Build packages (in order)
npm run build:db
npm run build:domain
npm run build:dal

# Build apps
npm run build:web
npm run build:ingest

# Development
npm run dev:web                                   # Start Next.js dev server
npm run dev:ingest                               # Start ingest service

# Docker Compose
cd infra/compose
docker-compose up --build web                    # Web app + Redis
docker-compose up redis                          # Redis only

# Kubernetes
kubectl apply -f infra/k8s/redis-deployment.yaml
kubectl apply -f infra/k8s/web-deployment.yaml
kubectl apply -f infra/k8s/web-hpa.yaml
```

---

## Version Control Strategy

### Branch Naming

```
feature/draft-room-mvp              # Main feature branch
feature/draft-room-phase-1          # Database & DAL
feature/draft-room-phase-2          # Redis + Timer Worker
feature/draft-room-phase-3          # WebSocket/SSE Server
feature/draft-room-phase-4          # Client Integration
```

### Commit Message Convention

```
feat(dal): add timer logic to makePick mutation
feat(redis): implement pub/sub client wrapper
feat(draft): add auto-pick background worker
feat(ui): integrate WebSocket in DraftRoom component
fix(timer): prevent race condition in auto-pick
test(e2e): add full draft flow test
docs(adr): add draft room architecture decision record
chore(deps): add ioredis dependency
```

---

## File Size Estimates

| File | Lines of Code | Complexity |
|------|---------------|------------|
| `drafts.makePick.ts` | ~150 LOC | Medium |
| `timer-worker.ts` | ~120 LOC | Medium |
| `pubsub.ts` | ~80 LOC | Low |
| `DraftRoom.tsx` (updated) | ~250 LOC | High |
| `events/route.ts` (SSE) | ~100 LOC | Medium |
| `selectOptimalSlot.ts` | ~60 LOC | Low |

**Total New/Modified Code:** ~1,200 LOC (excluding tests, docs)

---

## Prisma Client Usage Patterns

### In DAL Functions (packages/dal)

```typescript
// Always accept db as first parameter
export async function makePick(args: {
  db: DbClient;
  input: MakePickInput;
}): Promise<MakePickResult> {
  const { db, input } = args;

  return await (db as any).$transaction(async (tx) => {
    // Use tx for all queries within transaction
    const draft = await tx.draft.findUnique({ ... });
    const pick = await tx.draftPick.create({ ... });
    return { ... };
  });
}
```

### In Web App Server Actions (apps/web/server/actions)

```typescript
import { prisma } from '@fantasy-madness/db';
import { makePick } from '@fantasy-madness/dal';

export async function makePickAction(...) {
  // Pass prisma to DAL
  const result = await makePick({
    db: prisma,
    input: { ... }
  });
  return result;
}
```

### In Timer Worker (apps/web/lib/draft)

```typescript
import { prisma } from '@fantasy-madness/db';
import { makePick, selectOptimalSlot } from '@fantasy-madness/dal';

async function executeAutoPick(draftId: string) {
  const slotId = await selectOptimalSlot({ db: prisma, draftId });

  await makePick({
    db: prisma,
    input: { draftId, userId, slotId, isAutoPick: true }
  });
}
```

---

## Next Steps

1. Review this file tree with the team
2. Assign file creation tasks to developers
3. Set up feature branch: `git checkout -b feature/draft-room-mvp`
4. Begin Phase 1 implementation
5. Track progress in GitHub Project or Linear

---

**Last Updated:** 2026-01-28
**Related Docs:**
- `/docs/ADR-001-DRAFT-ROOM-ARCHITECTURE.md`
- `/docs/DRAFT-ROOM-IMPLEMENTATION-GUIDE.md`
- `/docs/DRAFT-ROOM-QUICK-START.md`
