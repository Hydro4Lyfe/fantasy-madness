# Draft Room MVP - Quick Start Guide

Fast reference for implementing the Fantasy Madness Draft Room feature.

---

## Overview

Real-time snake draft for 8 participants with WebSocket updates, auto-pick timers, and Kubernetes-safe architecture.

**Core Stack:**
- WebSocket/SSE for real-time updates
- Redis pub/sub for cross-pod communication
- PostgreSQL as single source of truth
- Background worker for timer-based auto-picks

**Key Documents:**
1. `ADR-001-DRAFT-ROOM-ARCHITECTURE.md` - Full architecture decision record
2. `DRAFT-ROOM-IMPLEMENTATION-GUIDE.md` - Step-by-step implementation
3. This document - Quick reference

---

## Architecture At A Glance

```
User Browser (WebSocket)
        ↓
Load Balancer
        ↓
Web Pod 1 | Web Pod 2 | Web Pod N
        ↓         ↓         ↓
    Redis Pub/Sub (cross-pod events)
        ↓
    PostgreSQL (source of truth)
```

**Key Principles:**
- No in-memory state on web pods (stateless)
- Database-backed timers (survive pod restarts)
- Advisory locks prevent race conditions
- Redis broadcasts events to all connected clients

---

## Database Schema Changes

### New Tables

**DraftTurnTimer**
```sql
CREATE TABLE draft_turn_timers (
  draft_id UUID PRIMARY KEY,
  turn_started_at TIMESTAMPTZ NOT NULL,
  current_pick_number INT NOT NULL,
  deadline_at TIMESTAMPTZ NOT NULL,
  timer_paused_at TIMESTAMPTZ
);
```

### Modified Tables

**DraftPick** - Add `is_auto_pick BOOLEAN DEFAULT false`

---

## Key Files to Create

```
apps/web/lib/
├── redis/
│   ├── client.ts              # Redis connection
│   └── pubsub.ts              # Pub/sub wrapper
├── draft/
│   ├── timer-worker.ts        # Auto-pick background job
│   ├── cron.ts                # Timer worker scheduler
│   └── index.ts               # Module exports + auto-start
└── websocket/                 # Phase 3
    ├── server.ts
    └── handler.ts

packages/dal/src/
├── mutations/
│   ├── drafts.makePick.ts     # UPDATE: Add timer logic
│   └── drafts.start.ts        # UPDATE: Initialize timer
└── queries/
    └── drafts.selectOptimalSlot.ts  # NEW: Auto-pick algorithm
```

---

## Phase 1: Database & DAL (Week 1)

### Checklist

- [ ] Update `schema.prisma`: Add `DraftTurnTimer` model
- [ ] Update `schema.prisma`: Add `isAutoPick` to `DraftPick`
- [ ] Run migration: `npm run migrate:dev -w @fantasy-madness/db`
- [ ] Update `drafts.makePick.ts`: Add timer create/update logic
- [ ] Update `drafts.start.ts`: Initialize timer on draft start
- [ ] Create `drafts.selectOptimalSlot.ts`: Auto-pick algorithm
- [ ] Update `drafts.getRoomState.ts`: Include timer info
- [ ] Build DAL: `npm run build:dal`
- [ ] Test: Create draft, make picks, verify timer updates

### Test Commands

```bash
# Generate Prisma client
npm run generate -w @fantasy-madness/db

# Run migration
npm run migrate:dev -w @fantasy-madness/db

# Build packages
npm run build:db
npm run build:dal

# Verify schema
psql $DATABASE_URL -c "\d draft_turn_timers"
```

---

## Phase 2: Redis + Timer Worker (Week 1-2)

### Checklist

- [ ] Install dependencies: `npm install ioredis -w @fantasy-madness/web`
- [ ] Create `lib/redis/client.ts`
- [ ] Create `lib/redis/pubsub.ts`
- [ ] Create `lib/draft/timer-worker.ts`
- [ ] Create `lib/draft/cron.ts`
- [ ] Update `app/layout.tsx`: Import `@/lib/draft` (auto-start)
- [ ] Update `server/actions/makePick.ts`: Broadcast via Redis
- [ ] Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`
- [ ] Test: Create draft with 10s timer, wait for auto-pick

### Environment Variables

```bash
# .env
REDIS_URL=redis://localhost:6379

# K8s production
REDIS_URL=redis://fm-redis:6379
```

### Test Auto-Pick

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Start app
npm run dev:web

# 3. Create draft with 2 participants, 10s timer
# 4. Start draft, make 1 pick
# 5. Wait 10 seconds
# 6. Verify auto-pick in DB:

psql $DATABASE_URL -c "SELECT * FROM draft_picks WHERE is_auto_pick = true ORDER BY created_at DESC LIMIT 5;"
```

---

## Phase 3: WebSocket Server (Week 2-3)

### WebSocket Implementation

**Decision:** Use WebSocket for bi-directional, low-latency communication.

**Pros:** Bi-directional, lower latency, better UX for real-time drafts
**Implementation:** Custom Next.js server with `ws` package

**File:** `apps/web/lib/websocket/server.ts`

### Event Protocol

**Server → Client:**
```typescript
type ServerEvent =
  | { type: 'draft:state', payload: DraftRoomStateDTO }
  | { type: 'pick:made', payload: { userId, slotId, overallPickNo, isAutoPick }}
  | { type: 'turn:changed', payload: { currentPickerUserId, deadlineAt }}
  | { type: 'draft:completed', payload: {}}
  | { type: 'error', payload: { message }}
```

**Client → Server:**
```typescript
type ClientEvent =
  | { type: 'pick:submit', payload: { slotId }}
  | { type: 'ping' }
```

---

## Phase 4: Client Integration (Week 3)

### Update DraftRoom Component

**File:** `apps/web/components/features/drafts/DraftRoom.tsx`

**Changes:**
1. Connect to WebSocket/SSE endpoint
2. Listen for events, update state
3. Remove `window.location.reload()` after pick
4. Add timer countdown UI
5. Add reconnection logic

**Key Hooks:**
```typescript
useEffect(() => {
  // Connect to events endpoint
  const eventSource = new EventSource(`/api/draft/${draftId}/events`);

  eventSource.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    handleServerEvent(msg);
  };

  return () => eventSource.close();
}, [draftId]);
```

---

## Phase 5: Testing & Deployment (Week 4)

### E2E Test Scenarios

1. **Full Draft:** 8 users complete all 64 picks
2. **Auto-Pick:** Timer expires, system picks optimal slot
3. **Reconnection:** User disconnects mid-draft, reconnects, continues
4. **Pod Restart:** Restart web pod during draft, verify no data loss
5. **Concurrent Picks:** Two users try same slot, verify one fails
6. **Draft Completion:** Verify timer deleted, status set to COMPLETE

### Load Testing

**Target:** 10 concurrent drafts (80 simultaneous users)

```bash
# Use k6, Artillery, or similar
# Simulate:
# - 10 drafts starting within 1 minute
# - Each user makes picks every 5-10 seconds
# - Measure: pick latency, WebSocket message delay, error rate
```

### Deployment Checklist

- [ ] Redis deployed to K8s (`infra/k8s/redis-deployment.yaml`)
- [ ] Web deployment updated with REDIS_URL env var
- [ ] Horizontal pod autoscaler configured (2-10 pods)
- [ ] Health check endpoint implemented (`/api/health`)
- [ ] Monitoring dashboards created (Grafana/Datadog)
- [ ] Alerts configured (timer lag, Redis errors, high error rate)
- [ ] Runbook documented (how to handle pod restarts, Redis failure)

---

## Critical Safety Mechanisms

### 1. Race Condition Prevention

**Database Constraints:**
```sql
-- Prevent same slot picked twice
UNIQUE (draft_id, slot_id)

-- Prevent same pick number used twice
UNIQUE (draft_id, overall_pick_no)
```

### 2. Multi-Pod Safety

**Advisory Lock Usage:**
```typescript
// Only one pod processes timers at a time
await withAdvisoryLock('draft:timer-worker', async () => {
  await processExpiredTimers();
});
```

### 3. Timer Consistency

**Always use DB server time:**
```typescript
// ❌ DON'T: const now = new Date(); (pod clock)
// ✅ DO: await prisma.$queryRaw`SELECT NOW()` (DB clock)
```

---

## Monitoring & Alerts

### Key Metrics

```
draft.active.count              # Number of live drafts
draft.websocket.connections     # Active WS connections per pod
draft.pick.latency              # Pick submit → DB commit time
draft.autopick.count            # Total auto-picks
draft.timer.lag                 # Deadline → actual autopick delay
draft.error.rate                # Errors per minute
```

### Critical Alerts

```
draft.timer.lag > 10s           → Auto-picks delayed (investigate worker)
redis.connection.error          → Pub/sub failing (check Redis health)
draft.error.rate > 5/min        → System issues (check logs)
websocket.disconnect.rate > 50/min → Network issues
```

---

## Troubleshooting

### Auto-pick not triggering

```bash
# 1. Check timer worker is running
grep "Starting timer worker" logs

# 2. Check for expired timers
psql $DATABASE_URL -c "SELECT * FROM draft_turn_timers WHERE deadline_at < NOW();"

# 3. Check draft status
psql $DATABASE_URL -c "SELECT id, status FROM drafts WHERE status = 'DRAFTING';"

# 4. Manually trigger worker
# In Next.js console: import { processExpiredTimers } from '@/lib/draft';
```

### Redis not connecting

```bash
# 1. Verify Redis is running
redis-cli ping
# Should return: PONG

# 2. Check Redis URL
echo $REDIS_URL

# 3. Test connection from app
# In Next.js console: import { redis } from '@/lib/redis/client'; await redis.ping();
```

### Pick failing with "not your turn"

```bash
# Check current state
psql $DATABASE_URL -c "
  SELECT
    dp.overall_pick_no,
    dp.user_id,
    part.pick_order
  FROM draft_picks dp
  JOIN draft_participants part ON part.draft_id = dp.draft_id AND part.user_id = dp.user_id
  WHERE dp.draft_id = 'YOUR_DRAFT_ID'
  ORDER BY dp.overall_pick_no DESC
  LIMIT 5;
"

# Verify snake draft logic
# Round 0 (picks 1-8): order 1,2,3,4,5,6,7,8
# Round 1 (picks 9-16): order 8,7,6,5,4,3,2,1 (reversed)
```

---

## Quick Reference: DAL Functions

```typescript
// Start a draft
await startDraft({
  db: prisma,
  input: { draftId, userId }
});

// Make a pick (manual)
await makePick({
  db: prisma,
  input: { draftId, userId, slotId, isAutoPick: false }
});

// Make a pick (auto)
const slotId = await selectOptimalSlot({ db: prisma, draftId });
await makePick({
  db: prisma,
  input: { draftId, userId, slotId, isAutoPick: true }
});

// Get draft room state
const state = await getDraftRoomState({ db: prisma, draftId });
```

---

## Quick Reference: Redis Events

```typescript
import { getRedisPubSub } from '@/lib/redis/pubsub';
const redis = getRedisPubSub();

// Publish event
await redis.publish(`draft:${draftId}`, {
  type: 'pick:made',
  payload: { userId, slotId, overallPickNo, isAutoPick }
});

// Subscribe to events
await redis.subscribe(`draft:${draftId}`, (event) => {
  console.log('Received event:', event);
});

// Unsubscribe
await redis.unsubscribe(`draft:${draftId}`, callbackFn);
```

---

## Kubernetes Quick Reference

```bash
# Deploy Redis
kubectl apply -f infra/k8s/redis-deployment.yaml

# Update web deployment
kubectl apply -f infra/k8s/web-deployment.yaml

# Scale web pods
kubectl scale deployment fm-web --replicas=5

# Check pod logs (timer worker output)
kubectl logs -f deployment/fm-web | grep "Timer Worker"

# Check Redis connection
kubectl exec -it deployment/fm-web -- sh
> redis-cli -h fm-redis ping

# Restart deployment (test failure recovery)
kubectl rollout restart deployment/fm-web
```

---

## Success Criteria

MVP is ready when:

- [x] 8 users can complete full 64-pick draft
- [x] Picks appear in all clients within 500ms
- [x] Auto-pick triggers within 1s of timer expiration (sub-second target)
- [x] Users can disconnect/reconnect without losing state
- [x] System handles 10 concurrent drafts (80 users)
- [x] Pod restart causes <5s disruption
- [x] No data loss in failure scenarios
- [x] 99.9% uptime during testing

---

## Next Steps After MVP

1. **Auction Draft Support:** Bidding system, currency management
2. **Draft Pause/Resume:** Host controls
3. **Spectator Mode:** Watch without participating
4. **Mobile App:** React Native client
5. **Advanced Analytics:** Draft grade, pick value charts
6. **Trade System:** Mid-draft trading
7. **Multi-Region:** Geo-distributed deployments

---

## Resources

- **Full Architecture:** `/docs/ADR-001-DRAFT-ROOM-ARCHITECTURE.md`
- **Implementation Guide:** `/docs/DRAFT-ROOM-IMPLEMENTATION-GUIDE.md`
- **CLAUDE.md:** Project-wide conventions and commands
- **Prisma Schema:** `/packages/db/prisma/schema.prisma`
- **DAL Mutations:** `/packages/dal/src/mutations/`

---

**Last Updated:** 2026-01-28
**Version:** 1.0 (MVP)
