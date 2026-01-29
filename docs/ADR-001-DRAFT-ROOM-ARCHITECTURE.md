# ADR-001: Draft Room MVP Architecture

**Status:** Proposed
**Date:** 2026-01-28
**Author:** FM-Architect
**Context:** Real-time draft room feature for Fantasy Madness

---

## Executive Summary

This document defines the MVP architecture for the Fantasy Madness Draft Room feature - a real-time, horizontally-scalable web application where 8 participants draft NCAA bracket slots in a snake-draft format with WebSocket-based live updates, timer-based auto-picks, and full Kubernetes multi-pod safety.

---

## 1. Problem Statement

### Goals
- Enable 8-participant real-time snake drafts with live pick updates
- Support multiple concurrent drafts across horizontally-scaled web pods
- Ensure draft integrity during pod restarts, network partitions, and user disconnections
- Provide seamless reconnection experience for users
- Auto-pick optimal slots when pick timer expires
- Maintain transaction safety and data consistency in distributed environment

### Constraints
- Must use existing stack: Next.js 15 App Router, PostgreSQL, Prisma 7, Supabase Auth
- Must be Kubernetes-safe (no in-memory state that can't be recovered)
- Must support horizontal pod autoscaling
- Must integrate with existing DAL pattern (all DB access via packages/dal)
- Must work with existing BracketSlot-based domain model

### Non-Goals (Future Iterations)
- Auction drafts (MVP focuses on snake/linear only)
- Draft pause/resume controls
- Draft clock synchronization across timezones (uses server time)
- Spectator mode for non-participants
- Advanced analytics/draft grade during draft

---

## 2. Architecture Overview

### 2.1 System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                       │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │   Web Pod 1    │  │   Web Pod 2    │  │   Web Pod N    │ │
│  │                │  │                │  │                │ │
│  │  Next.js App   │  │  Next.js App   │  │  Next.js App   │ │
│  │  + WS Handler  │  │  + WS Handler  │  │  + WS Handler  │ │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘ │
│           │                   │                   │         │
│           └───────────────────┼───────────────────┘         │
│                               │                             │
│                    ┌──────────▼──────────┐                  │
│                    │   Redis Pub/Sub     │                  │
│                    │  (Cross-Pod Events) │                  │
│                    └──────────┬──────────┘                  │
│                               │                             │
│                    ┌──────────▼──────────┐                  │
│                    │   PostgreSQL        │                  │
│                    │  (Source of Truth)  │                  │
│                    │  + Advisory Locks   │                  │
│                    └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

User Clients (WebSocket)
     │
     └──> Load Balancer (sticky sessions OR stateless reconnect)
              │
              └──> Any Web Pod
```

### 2.2 Component Responsibilities

| Component | Responsibility | Stateless? |
|-----------|---------------|------------|
| **Next.js Web App** | Server-side rendering, API routes, WebSocket endpoint, draft business logic | Yes (after refactor) |
| **Redis Pub/Sub** | Cross-pod event broadcast for draft state changes | Yes (ephemeral) |
| **PostgreSQL** | Single source of truth for draft state, timer deadlines, pick history | Yes |
| **DAL (packages/dal)** | All database queries/mutations, draft validation logic | Yes (pure functions) |

---

## 3. Design Decisions

### 3.1 Real-Time Communication: WebSocket Strategy

**Decision:** Use WebSocket connections with Redis pub/sub for cross-pod coordination.

**Rationale:**
- WebSockets provide low-latency bi-directional communication needed for live draft updates
- Redis pub/sub allows any web pod to broadcast events to all connected clients across all pods
- Avoids polling overhead while maintaining horizontal scalability
- Well-supported in Next.js via custom server or API route upgrade

**Alternatives Considered:**
1. **Server-Sent Events (SSE):** Simpler than WebSockets but one-way only; requires separate HTTP endpoint for user actions
2. **HTTP Polling:** Works everywhere but high latency (2-5s) and server load
3. **WebSocket without Redis:** Doesn't scale horizontally; clients must connect to specific pod

**Implementation Path:** Start with **WebSocket + Redis pub/sub** for MVP.

---

### 3.2 State Management: Database as Source of Truth

**Decision:** PostgreSQL is the single source of truth. No in-memory draft state on web pods.

**Rationale:**
- Pod restarts don't lose draft state
- Enables horizontal scaling without state synchronization complexity
- Leverages existing Prisma/DAL infrastructure
- Supports ACID transactions for pick validation (double-pick prevention)
- Advisory locks prevent race conditions across pods

**State Storage Schema:**

```typescript
// Already exists in schema.prisma
Draft {
  id: uuid
  status: OPEN | DRAFTING | COMPLETE
  currentPickDeadline: timestamp?  // NEW FIELD NEEDED
  pickTimerSec: int?
  // ... existing fields
}

DraftPick {
  draftId: uuid
  userId: string
  slotId: uuid
  overallPickNo: int
  createdAt: timestamp
  isAutoPick: boolean  // NEW FIELD NEEDED (optional)
}

// NEW TABLE NEEDED
DraftTurnTimer {
  draftId: uuid (PK)
  turnStartedAt: timestamp
  currentPickNumber: int
  deadlineAt: timestamp
  timerPausedAt: timestamp?
}
```

**Constraints to Add:**
- Index on `DraftTurnTimer(draftId, deadlineAt)` for timer queries
- Unique constraint on `DraftPick(draftId, overallPickNo)` (already exists)

---

### 3.3 Timer Management: Database-Backed Deadline System

**Decision:** Store pick deadlines in PostgreSQL; use background job to trigger auto-picks.

**Why not in-memory timers?**
- Pod restart clears timers
- Scaling up/down disrupts active timers
- Hard to query "which drafts have expired timers" across pods

**Architecture:**

```typescript
// Timer workflow
1. User makes pick → Clear current timer → Calculate next deadline → Store in DB
2. Background worker (every 5s) → Query drafts with deadline < now() → Trigger auto-pick
3. Auto-pick → Insert DraftPick with isAutoPick=true → Broadcast to WebSocket clients
```

**Background Worker Options:**
- **Option A:** Cron job in web pod (one pod wins via advisory lock) - 5s latency
- **Option B:** Dedicated timer service pod with pg-boss queue (like ingest)
- **Option C:** PostgreSQL NOTIFY/LISTEN + pg-boss scheduled jobs - sub-second latency

**MVP Choice:** Option C (PostgreSQL NOTIFY/LISTEN + pg-boss) for low-latency timer triggers.

**Low-Latency Timer Architecture:**
```
1. User makes pick → Calculate next deadline → Schedule pg-boss job for exact deadline time
2. pg-boss job fires at deadline → PostgreSQL NOTIFY 'draft_timer_expired' with draftId
3. All web pods LISTEN on 'draft_timer_expired' channel
4. First pod to acquire advisory lock executes auto-pick
5. Auto-pick result broadcasts via Redis pub/sub to all WebSocket clients
```

This provides sub-second latency while remaining multi-pod safe. The pg-boss job scheduler
ensures timers survive pod restarts and are executed at the precise deadline time.

---

### 3.4 Auto-Pick Algorithm

**Decision:** Implement "optimal slot" algorithm based on expected value.

**Algorithm (MVP):**
```typescript
function selectOptimalSlot(availableSlots: BracketSlot[]): BracketSlot {
  // 1. Filter to highest seed value (16-seeds worth most per win)
  const maxSeed = Math.max(...availableSlots.map(s => s.seed));
  const topSeeds = availableSlots.filter(s => s.seed === maxSeed);

  // 2. Prefer non-play-in over play-in (certainty)
  const nonPlayIn = topSeeds.filter(s => !s.playInGameId);
  if (nonPlayIn.length > 0) return nonPlayIn[0];

  // 3. Return first available high-seed play-in
  return topSeeds[0];
}
```

**Future Enhancement:** Use historical tournament data to calculate expected wins per slot.

---

### 3.5 WebSocket Event Protocol

**Decision:** Define typed event schema for client-server communication.

**Server → Client Events:**
```typescript
type ServerEvent =
  | { type: 'draft:state', payload: DraftRoomStateDTO }
  | { type: 'pick:made', payload: {
      pickId: string,
      userId: string,
      slotId: string,
      overallPickNo: number,
      isAutoPick: boolean
    }}
  | { type: 'turn:changed', payload: {
      currentPickerUserId: string,
      deadlineAt: string
    }}
  | { type: 'participant:joined', payload: { userId: string, userName: string }}
  | { type: 'participant:left', payload: { userId: string }}
  | { type: 'draft:completed', payload: { finalStandings: ... }}
  | { type: 'error', payload: { message: string }}
```

**Client → Server Events:**
```typescript
type ClientEvent =
  | { type: 'pick:submit', payload: { slotId: string }}
  | { type: 'ping' }
```

**Heartbeat:** Client sends `ping` every 30s; server responds with `pong`. Detect disconnections.

---

### 3.6 Reconnection Strategy

**Decision:** Stateless reconnection with full state hydration.

**Flow:**
1. Client disconnects (network issue, tab close, pod restart)
2. Client reconnects to any web pod via WebSocket
3. Server authenticates user via Supabase token
4. Server queries current draft state from DB
5. Server sends full `draft:state` event to client
6. Client resumes from current state (no data loss)

**Session Affinity:** Not required. Any pod can serve any client.

**Race Condition Handling:**
- If user submits pick during reconnection, transaction-level unique constraint prevents double-picks
- Client receives error event and re-hydrates state

---

## 4. Detailed Component Design

### 4.1 WebSocket Handler (`apps/web/lib/websocket/`)

**File Structure:**
```
apps/web/lib/websocket/
├── server.ts              # WebSocket server setup (custom Node.js server or API route)
├── handler.ts             # Connection handler, message routing
├── events.ts              # Event type definitions
├── redis.ts               # Redis pub/sub client
└── rooms.ts               # Room-based message broadcast logic
```

**Key Functions:**

```typescript
// handler.ts
export class DraftWebSocketHandler {
  constructor(
    private redis: RedisPubSubClient,
    private prisma: PrismaClient
  ) {}

  async handleConnection(ws: WebSocket, userId: string, draftId: string) {
    // 1. Join room (subscribe to Redis channel)
    await this.redis.subscribe(`draft:${draftId}`, (event) => {
      ws.send(JSON.stringify(event));
    });

    // 2. Send current state
    const state = await getDraftRoomState({ db: this.prisma, draftId });
    ws.send(JSON.stringify({ type: 'draft:state', payload: state }));

    // 3. Set up message handler
    ws.on('message', (msg) => this.handleMessage(ws, userId, draftId, msg));
  }

  async handleMessage(ws: WebSocket, userId: string, draftId: string, msg: string) {
    const event = JSON.parse(msg) as ClientEvent;

    if (event.type === 'pick:submit') {
      try {
        const result = await makePick({
          db: this.prisma,
          input: { draftId, userId, slotId: event.payload.slotId }
        });

        // Broadcast to all clients in this draft
        await this.redis.publish(`draft:${draftId}`, {
          type: 'pick:made',
          payload: { ...result, userId, slotId: event.payload.slotId }
        });
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', payload: { message: err.message }}));
      }
    }
  }
}
```

---

### 4.2 Redis Pub/Sub Client (`apps/web/lib/redis/`)

**File Structure:**
```
apps/web/lib/redis/
├── client.ts              # Redis client factory (ioredis)
└── pubsub.ts              # Pub/sub wrapper
```

**Implementation:**

```typescript
// pubsub.ts
import Redis from 'ioredis';

export class RedisPubSubClient {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, Set<(msg: any) => void>>();

  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.subscriber.on('message', (channel, message) => {
      const callbacks = this.handlers.get(channel);
      if (callbacks) {
        const parsed = JSON.parse(message);
        callbacks.forEach(cb => cb(parsed));
      }
    });
  }

  async subscribe(channel: string, callback: (msg: any) => void) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.add(callback);
  }

  async unsubscribe(channel: string, callback: (msg: any) => void) {
    const callbacks = this.handlers.get(channel);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        await this.subscriber.unsubscribe(channel);
        this.handlers.delete(channel);
      }
    }
  }

  async publish(channel: string, message: any) {
    await this.publisher.publish(channel, JSON.stringify(message));
  }
}
```

---

### 4.3 Timer Background Worker (`apps/web/lib/draft/timer-worker.ts`)

**Implementation:**

```typescript
// timer-worker.ts
import { prisma } from '@fantasy-madness/db';
import { withAdvisoryLock } from '@fantasy-madness/dal/ingest/lock';

export async function processExpiredTimers() {
  // Acquire lock to prevent multiple pods from running this simultaneously
  const { ran } = await withAdvisoryLock('draft:timer-worker', async () => {
    const now = new Date();

    // Find all drafts with expired timers
    const expiredDrafts = await prisma.draftTurnTimer.findMany({
      where: {
        deadlineAt: { lte: now },
        draft: { status: 'DRAFTING' }
      },
      include: { draft: { include: { participants: true }}}
    });

    for (const timer of expiredDrafts) {
      await executeAutoPick(timer.draftId, timer.currentPickNumber);
    }
  });

  return { processed: ran };
}

async function executeAutoPick(draftId: string, expectedPickNumber: number) {
  // 1. Get current draft state
  const state = await getDraftRoomState({ db: prisma, draftId });

  // 2. Verify still waiting for this pick (race condition check)
  if (state.currentPickNumber !== expectedPickNumber) {
    return; // User picked manually in the meantime
  }

  // 3. Select optimal slot
  const optimalSlot = selectOptimalSlot(state.availableSlots);

  // 4. Make auto-pick
  try {
    await makePick({
      db: prisma,
      input: {
        draftId,
        userId: state.currentPickerUserId!,
        slotId: optimalSlot.slotId,
        isAutoPick: true  // NEW FIELD
      }
    });

    // 5. Broadcast via Redis
    await redis.publish(`draft:${draftId}`, {
      type: 'pick:made',
      payload: {
        userId: state.currentPickerUserId,
        slotId: optimalSlot.slotId,
        isAutoPick: true
      }
    });
  } catch (err) {
    console.error('Auto-pick failed:', err);
  }
}

// Cron setup (called from apps/web/lib/draft/cron.ts)
setInterval(processExpiredTimers, 5000); // Every 5 seconds
```

---

### 4.4 DAL Mutations (packages/dal/src/mutations/)

**New/Updated Functions:**

```typescript
// drafts.makePick.ts (UPDATE EXISTING)
export async function makePick(args: {
  db: DbClient;
  input: MakePickInput & { isAutoPick?: boolean };
}): Promise<MakePickResult> {
  // ... existing validation ...

  return await args.db.$transaction(async (tx) => {
    // 1. Create pick
    const pick = await tx.draftPick.create({
      data: {
        draftId: input.draftId,
        userId: input.userId,
        slotId: input.slotId,
        overallPickNo,
        rosterSlot,
        isAutoPick: input.isAutoPick ?? false
      }
    });

    // 2. Update timer (if pick timer is enabled)
    if (draft.pickTimerSec) {
      const nextDeadline = new Date(Date.now() + draft.pickTimerSec * 1000);
      await tx.draftTurnTimer.upsert({
        where: { draftId: input.draftId },
        create: {
          draftId: input.draftId,
          turnStartedAt: new Date(),
          currentPickNumber: overallPickNo + 1,
          deadlineAt: nextDeadline
        },
        update: {
          turnStartedAt: new Date(),
          currentPickNumber: overallPickNo + 1,
          deadlineAt: nextDeadline
        }
      });
    }

    // 3. Check if draft complete
    const totalExpectedPicks = numParticipants * draft.rosterSize;
    if (overallPickNo >= totalExpectedPicks) {
      await tx.draft.update({
        where: { id: input.draftId },
        data: { status: 'COMPLETE' }
      });
      // Delete timer
      await tx.draftTurnTimer.deleteMany({ where: { draftId: input.draftId }});
    }

    return { pickId: pick.id, overallPickNo: pick.overallPickNo };
  });
}
```

```typescript
// drafts.start.ts (UPDATE EXISTING)
export async function startDraft(args: {
  db: DbClient;
  input: StartDraftInput;
}): Promise<{ success: boolean }> {
  // ... existing validation ...

  await db.$transaction(async (tx) => {
    await tx.draft.update({
      where: { id: draftId },
      data: { status: 'DRAFTING' }
    });

    // Initialize timer if enabled
    if (draft.pickTimerSec) {
      const firstDeadline = new Date(Date.now() + draft.pickTimerSec * 1000);
      await tx.draftTurnTimer.create({
        data: {
          draftId,
          turnStartedAt: new Date(),
          currentPickNumber: 1,
          deadlineAt: firstDeadline
        }
      });
    }
  });

  return { success: true };
}
```

---

### 4.5 Client React Component (`apps/web/components/features/drafts/DraftRoom.tsx`)

**Update Strategy:**

Current implementation uses server actions + page reload. Refactor to WebSocket-based live updates.

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import type { DraftRoomStateDTO } from '@fantasy-madness/dal';
import type { ServerEvent, ClientEvent } from '@/lib/websocket/events';

type Props = {
  initialState: DraftRoomStateDTO;
  currentUserId: string;
};

export function DraftRoom({ initialState, currentUserId }: Props) {
  const [state, setState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/draft/${state.id}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const msg: ServerEvent = JSON.parse(event.data);

      switch (msg.type) {
        case 'draft:state':
          setState(msg.payload);
          break;

        case 'pick:made':
          // Optimistic update or refetch state
          // For MVP: request full state update
          ws.send(JSON.stringify({ type: 'state:request' }));
          break;

        case 'turn:changed':
          // Update timer
          const deadline = new Date(msg.payload.deadlineAt);
          const remaining = Math.max(0, deadline.getTime() - Date.now());
          setTimeRemaining(remaining);
          break;

        case 'error':
          setError(msg.payload.message);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Reconnecting...');
    };

    ws.onclose = () => {
      // Auto-reconnect after 2 seconds
      setTimeout(() => {
        window.location.reload(); // Simple MVP reconnect strategy
      }, 2000);
    };

    // 2. Set up heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      ws.close();
    };
  }, [state.id]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) return null;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handlePick = async (slotId: string) => {
    if (!wsRef.current || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const msg: ClientEvent = {
      type: 'pick:submit',
      payload: { slotId }
    };

    wsRef.current.send(JSON.stringify(msg));

    // Server will respond with pick:made or error event
    // Reset submitting state after timeout or response
    setTimeout(() => setIsSubmitting(false), 3000);
  };

  // ... rest of component (render logic from existing implementation)
  // Add timer display: {timeRemaining && formatTime(timeRemaining)}
}
```

---

### 4.6 WebSocket API Route (`apps/web/app/api/draft/[draftId]/ws/route.ts`)

**Implementation:**

This requires Next.js custom server or API route upgrade. For MVP, use API route with streaming:

```typescript
// Note: WebSocket in Next.js API routes requires custom server setup
// Alternative MVP approach: Use Server-Sent Events (SSE) for server→client, HTTP POST for client→server

// apps/web/app/api/draft/[draftId]/events/route.ts
import { NextRequest } from 'next/server';
import { getDraftRoomState } from '@fantasy-madness/dal';
import { requireUserId } from '@/server/auth/guards';
import { redis } from '@/lib/redis/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { draftId: string }}
) {
  const userId = await requireUserId();
  const { draftId } = params;

  // Verify user is participant
  const state = await getDraftRoomState({ draftId });
  if (!state.participants.some(p => p.oduserId === userId)) {
    return new Response('Unauthorized', { status: 403 });
  }

  // Set up SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state
      const initialEvent = `data: ${JSON.stringify({ type: 'draft:state', payload: state })}\n\n`;
      controller.enqueue(encoder.encode(initialEvent));

      // Subscribe to Redis updates
      await redis.subscribe(`draft:${draftId}`, (event) => {
        const sseEvent = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(sseEvent));
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Production Recommendation:** Implement true WebSocket server using custom Next.js server or separate WebSocket service.

---

## 5. Database Schema Changes

### 5.1 Migration: Add Timer and Auto-Pick Fields

**File:** `packages/db/prisma/migrations/XXX_add_draft_timer/migration.sql`

```sql
-- Add auto-pick tracking to DraftPick
ALTER TABLE draft_picks
ADD COLUMN is_auto_pick BOOLEAN NOT NULL DEFAULT false;

-- Create DraftTurnTimer table
CREATE TABLE draft_turn_timers (
  draft_id UUID PRIMARY KEY REFERENCES drafts(draft_id) ON DELETE CASCADE,
  turn_started_at TIMESTAMPTZ(6) NOT NULL,
  current_pick_number INT NOT NULL,
  deadline_at TIMESTAMPTZ(6) NOT NULL,
  timer_paused_at TIMESTAMPTZ(6),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_draft_turn_timers_deadline ON draft_turn_timers(deadline_at) WHERE timer_paused_at IS NULL;

-- Add to schema.prisma
```

**Prisma Schema Updates:**

```prisma
model DraftPick {
  // ... existing fields ...
  isAutoPick Boolean @default(false) @map("is_auto_pick")
}

model DraftTurnTimer {
  draftId          String    @id @db.Uuid @map("draft_id")
  turnStartedAt    DateTime  @db.Timestamptz(6) @map("turn_started_at")
  currentPickNumber Int      @map("current_pick_number")
  deadlineAt       DateTime  @db.Timestamptz(6) @map("deadline_at")
  timerPausedAt    DateTime? @db.Timestamptz(6) @map("timer_paused_at")

  createdAt        DateTime  @default(now()) @db.Timestamptz(6) @map("created_at")
  updatedAt        DateTime  @updatedAt @db.Timestamptz(6) @map("updated_at")

  draft            Draft     @relation(fields: [draftId], references: [id], onDelete: Cascade)

  @@map("draft_turn_timers")
  @@index([deadlineAt], map: "ix_draft_turn_timers_deadline")
}

model Draft {
  // ... existing fields ...
  timer DraftTurnTimer?
}
```

---

## 6. Deployment & Infrastructure

### 6.1 Kubernetes Resources

**New Services Required:**

1. **Redis Deployment** (if not already deployed)

```yaml
# infra/k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fm-redis
spec:
  replicas: 1  # Can scale to HA cluster later
  selector:
    matchLabels:
      app: fm-redis
  template:
    metadata:
      labels:
        app: fm-redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: fm-redis
spec:
  selector:
    app: fm-redis
  ports:
    - port: 6379
      targetPort: 6379
```

2. **Update Web Deployment** (add Redis connection)

```yaml
# infra/k8s/web-deployment.yaml (UPDATE)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fm-web
spec:
  replicas: 3  # Horizontal scaling
  selector:
    matchLabels:
      app: fm-web
  template:
    metadata:
      labels:
        app: fm-web
    spec:
      containers:
        - name: web
          image: your-registry/fm-web:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: fm-secrets
                  key: database_url
            - name: DIRECT_DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: fm-secrets
                  key: direct_database_url
            - name: REDIS_URL
              value: "redis://fm-redis:6379"
            - name: SUPABASE_URL
              valueFrom:
                secretKeyRef:
                  name: fm-secrets
                  key: supabase_url
            - name: SUPABASE_ANON_KEY
              valueFrom:
                secretKeyRef:
                  name: fm-secrets
                  key: supabase_anon_key
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
```

### 6.2 Horizontal Pod Autoscaler

```yaml
# infra/k8s/web-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fm-web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fm-web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 6.3 Health Check Endpoint

**File:** `apps/web/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@fantasy-madness/db';
import { redis } from '@/lib/redis/client';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis
    await redis.ping();

    return NextResponse.json({ status: 'healthy' });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

---

## 7. Failure Handling

### 7.1 User Disconnection

**Scenario:** User loses network connection during active draft.

**Handling:**
1. WebSocket connection closes (client-side `onclose` event)
2. Client attempts reconnection after 2 seconds
3. On reconnect, client authenticates and receives full `draft:state` event
4. User resumes from current state (no picks lost)

**Edge Case:** User submits pick right before disconnection
- Pick is committed to DB via transaction
- Reconnection shows updated state with pick already made
- No double-pick possible (unique constraint on `DraftPick.overallPickNo`)

### 7.2 Pod Restart

**Scenario:** Kubernetes restarts web pod during active draft.

**Handling:**
1. All WebSocket connections to that pod are closed
2. Clients reconnect to different pod (load balancer routing)
3. New pod queries current state from PostgreSQL
4. Draft continues seamlessly (state in DB, events via Redis)

**Timer Safety:**
- Timers stored in DB (not in-memory)
- Background worker (with advisory lock) continues running on remaining pods
- Auto-picks trigger even if pod that started the timer is gone

### 7.3 Redis Failure

**Scenario:** Redis pod crashes or becomes unreachable.

**Impact:**
- Cross-pod event broadcast stops working
- Clients only see updates when they poll/reconnect
- Picks still work (DB is source of truth)

**Mitigation (Future):**
- Redis HA cluster (sentinel or cluster mode)
- Fallback to database-driven polling if Redis unavailable
- Alert monitoring on Redis health

**MVP Acceptance:** Brief degradation to polling behavior acceptable for MVP.

### 7.4 Race Conditions

**Scenario 1:** Two users try to pick same slot simultaneously.

**Handling:**
- Both submit via WebSocket
- Both DAL `makePick` calls hit database
- First transaction commits successfully
- Second transaction fails (unique constraint on `DraftPick(draftId, slotId)`)
- Second user receives error event, client shows "Slot already picked"

**Scenario 2:** User picks manually right as auto-pick timer expires.

**Handling:**
- Both picks attempt to insert same `overallPickNo`
- Transaction-level unique constraint prevents double-insert
- Winner (first to commit) succeeds
- Loser receives error, state re-syncs

**Database Constraints Critical for Safety:**
```sql
-- Prevent double-picks
UNIQUE (draft_id, overall_pick_no)
UNIQUE (draft_id, slot_id)

-- Prevent timer conflicts (single timer per draft)
PRIMARY KEY (draft_id) ON draft_turn_timers
```

---

## 8. Observability & Monitoring

### 8.1 Logging

**Structured Logs (JSON format):**

```typescript
// Example log entries
{
  "timestamp": "2026-01-28T12:34:56Z",
  "level": "info",
  "event": "draft.pick.made",
  "draftId": "abc-123",
  "userId": "user-456",
  "slotId": "slot-789",
  "overallPickNo": 12,
  "isAutoPick": false,
  "durationMs": 45
}

{
  "timestamp": "2026-01-28T12:35:10Z",
  "level": "info",
  "event": "draft.autopick.triggered",
  "draftId": "abc-123",
  "userId": "user-999",
  "reason": "timer_expired",
  "selectedSlotId": "slot-321"
}

{
  "timestamp": "2026-01-28T12:35:15Z",
  "level": "warn",
  "event": "websocket.disconnected",
  "userId": "user-456",
  "draftId": "abc-123",
  "reason": "network_error",
  "connectionDurationSec": 123
}
```

### 8.2 Metrics (Prometheus/Datadog)

**Key Metrics:**
- `draft.active.count` (gauge): Number of drafts in DRAFTING status
- `draft.websocket.connections` (gauge): Active WebSocket connections per pod
- `draft.pick.latency` (histogram): Time from pick submit to DB commit
- `draft.autopick.count` (counter): Total auto-picks triggered
- `draft.error.count` (counter): Errors by type (validation, db, network)
- `draft.timer.lag` (gauge): Time between deadline and actual auto-pick execution

### 8.3 Alerts

**Critical Alerts:**
1. `draft.timer.lag > 10s` (auto-picks delayed)
2. `redis.connection.error` (pub/sub failing)
3. `draft.error.rate > 5/min` (system issues)
4. `websocket.disconnect.rate > 50/min` (network issues)

---

## 9. Testing Strategy

### 9.1 Unit Tests

**DAL Functions:**
- `makePick`: Validate turn order, double-pick prevention, completion detection
- `startDraft`: Timer initialization, state transitions
- `selectOptimalSlot`: Algorithm correctness

**WebSocket Handler:**
- Message routing, error handling, room subscriptions

### 9.2 Integration Tests

**Database Transactions:**
- Concurrent pick attempts (race conditions)
- Timer upsert logic
- Draft completion state transitions

**Redis Pub/Sub:**
- Event broadcast across subscribers
- Subscription cleanup on disconnect

### 9.3 End-to-End Tests

**Full Draft Simulation:**
```typescript
// Simulate 8 users completing full draft
test('8-user snake draft completes successfully', async () => {
  const draft = await createDraft({ rosterSize: 8, participants: 8 });
  await startDraft(draft.id);

  for (let pick = 1; pick <= 64; pick++) {
    const state = await getDraftRoomState({ draftId: draft.id });
    const currentUser = state.currentPickerUserId;
    const randomSlot = state.availableSlots[0];

    await makePick({ draftId: draft.id, userId: currentUser, slotId: randomSlot.slotId });
  }

  const finalState = await getDraftRoomState({ draftId: draft.id });
  expect(finalState.status).toBe('COMPLETE');
  expect(finalState.totalPicks).toBe(64);
});
```

**Auto-Pick Test:**
```typescript
test('auto-pick triggers when timer expires', async () => {
  const draft = await createDraft({ pickTimerSec: 5 });
  await startDraft(draft.id);

  // Wait for timer to expire
  await sleep(6000);
  await processExpiredTimers();

  const state = await getDraftRoomState({ draftId: draft.id });
  expect(state.totalPicks).toBe(1);
  expect(state.participants[0].picks[0].isAutoPick).toBe(true);
});
```

---

## 10. Phased Implementation Plan

### Phase 1: Database & DAL (Week 1)

**Tasks:**
1. Add Prisma schema changes (`DraftTurnTimer`, `isAutoPick` field)
2. Run migration
3. Update `makePick` DAL function (timer logic, transaction)
4. Update `startDraft` DAL function (initialize timer)
5. Implement `selectOptimalSlot` algorithm
6. Write unit tests for DAL functions

**Deliverable:** Draft picks work with timer stored in DB (no WebSocket yet).

### Phase 2: Redis + Background Worker (Week 1-2)

**Tasks:**
1. Set up Redis deployment (K8s or local Docker)
2. Implement Redis pub/sub client (`apps/web/lib/redis/`)
3. Implement timer background worker (`lib/draft/timer-worker.ts`)
4. Add cron job to web app startup
5. Test auto-pick triggers correctly
6. Add structured logging for timer events

**Deliverable:** Auto-picks trigger when timer expires (verified via DB queries).

### Phase 3: WebSocket Server (Week 2-3)

**Tasks:**
1. Decide: Custom Next.js server vs SSE approach
2. Implement WebSocket handler (or SSE route)
3. Integrate Redis pub/sub with WebSocket broadcast
4. Define event protocol types
5. Add WebSocket connection health checks
6. Test cross-pod event broadcast (2+ pods)

**Deliverable:** Server broadcasts events to connected clients.

### Phase 4: Client Integration (Week 3)

**Tasks:**
1. Refactor `DraftRoom.tsx` component (remove page reload)
2. Implement WebSocket client connection
3. Add event handlers (pick:made, turn:changed, error)
4. Add timer countdown UI
5. Implement reconnection logic
6. Add optimistic UI updates (optional)

**Deliverable:** End-to-end live draft experience in browser.

### Phase 5: Testing & Polish (Week 4)

**Tasks:**
1. Write E2E tests (full draft simulation)
2. Load testing (simulate 10 concurrent drafts, 80 users)
3. Failure scenario testing (pod restarts, network partitions)
4. Add monitoring dashboards (Grafana/Datadog)
5. Document operational runbooks
6. Security review (WebSocket auth, rate limiting)

**Deliverable:** Production-ready MVP.

---

## 11. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **WebSocket connection limits** | Users can't connect to drafts | Medium | Monitor connection counts, set limits per pod, scale horizontally |
| **Redis single point of failure** | Cross-pod events stop working | Medium | Redis HA cluster, fallback to polling |
| **Timer drift (clock skew across pods)** | Auto-picks trigger at wrong time | Low | Use DB server time (`NOW()`), not pod local time |
| **Database connection pool exhaustion** | Requests hang/timeout | Medium | Configure Prisma pool size, monitor active connections |
| **Race condition: double auto-pick** | Two pods trigger same auto-pick | Low | Advisory lock on timer worker, DB constraints |
| **Client reconnection storm** | All clients reconnect simultaneously after pod restart | Medium | Exponential backoff, jittered reconnection delay |

---

## 12. Future Enhancements (Post-MVP)

### 12.1 Advanced Features
- Auction draft support (bidding system, currency management)
- Draft pause/resume by host
- Spectator mode (non-participants can watch)
- Draft trade offers during draft
- Mobile app support (React Native WebSocket client)

### 12.2 Performance Optimizations
- WebSocket connection pooling
- Optimistic UI updates (client predicts state changes)
- Client-side state caching (reduce full state queries)
- Delta-based state updates (send only changes, not full state)

### 12.3 Operational Improvements
- Dedicated WebSocket service (separate from Next.js app)
- PostgreSQL NOTIFY/LISTEN for instant timer triggers
- Multi-region deployment (geo-distributed drafts)
- Advanced monitoring (distributed tracing, real user monitoring)

---

## 13. Alternatives Considered

### 13.1 Alternative: Long Polling Instead of WebSocket

**Pros:**
- Simpler to implement (standard HTTP)
- Works through restrictive firewalls
- No WebSocket library dependencies

**Cons:**
- Higher latency (2-5 second delay per update)
- Higher server load (constant HTTP requests)
- Poor UX for real-time draft (feels sluggish)

**Verdict:** Rejected. User experience requires sub-second updates.

---

### 13.2 Alternative: In-Memory Draft State (No DB Writes Until End)

**Pros:**
- Faster pick processing (no DB write per pick)
- Lower database load

**Cons:**
- Pod restart loses entire draft state
- Can't scale horizontally (state pinned to specific pod)
- Requires complex state replication across pods
- Higher risk of data loss

**Verdict:** Rejected. Violates Kubernetes safety requirement.

---

### 13.3 Alternative: Firebase Realtime Database Instead of Redis

**Pros:**
- Managed service (less operational burden)
- Built-in real-time sync
- Client SDKs for WebSocket-like behavior

**Cons:**
- Adds external dependency (vendor lock-in)
- Data duplication (Postgres + Firebase)
- Additional cost
- Not self-hostable

**Verdict:** Rejected for MVP. Redis is simpler and self-hostable.

---

## 14. Success Criteria

**MVP is considered successful when:**

1. 8 users can complete a full snake draft from start to finish
2. Live updates appear in all clients within 500ms of pick submission
3. Auto-pick triggers within 1 second of timer expiration (sub-second target)
4. Users can disconnect/reconnect without losing draft state
5. System handles 10 concurrent drafts (80 users) without degradation
6. Pod restart during active draft causes <5 second disruption (reconnection time)
7. No data loss or corruption in failure scenarios
8. 99.9% uptime during draft season (March)

**Key Metrics:**
- Pick latency (submit → DB → broadcast): p95 < 200ms
- Auto-pick accuracy: 100% (correct slot selection)
- Reconnection success rate: >99%
- Draft completion rate: >95% (started drafts that finish)

---

## 15. Resolved Decisions

1. **WebSocket vs SSE for MVP?**
   - **Decision: WebSocket** - Bi-directional communication provides better UX for real-time drafts

2. **Timer latency requirements?**
   - **Decision: Sub-second** - Using PostgreSQL NOTIFY/LISTEN + pg-boss scheduled jobs

3. **Load balancer session affinity needed?**
   - Recommendation: Not required with stateless design, but may reduce reconnection overhead

4. **Max concurrent drafts per cluster?**
   - MVP target: 10 concurrent drafts (80 users)
   - Architecture supports horizontal scaling beyond this

5. **Redis persistence mode?**
   - Recommendation: No persistence needed (ephemeral pub/sub only)

---

## 16. Appendix: File Change Checklist

### New Files

```
apps/web/lib/
├── websocket/
│   ├── server.ts              # WebSocket server setup
│   ├── handler.ts             # Connection handler
│   ├── events.ts              # Event type definitions
│   └── rooms.ts               # Room broadcast logic
├── redis/
│   ├── client.ts              # Redis client factory
│   └── pubsub.ts              # Pub/sub wrapper
└── draft/
    ├── timer-worker.ts        # Background worker for auto-picks
    ├── cron.ts                # Cron job setup
    └── auto-pick.ts           # Optimal slot selection algorithm

apps/web/app/api/
├── health/route.ts            # Health check endpoint
└── draft/[draftId]/
    └── ws/route.ts            # WebSocket endpoint

infra/k8s/
├── redis-deployment.yaml      # Redis pod
└── web-hpa.yaml               # Horizontal autoscaler
```

### Modified Files

```
packages/db/prisma/schema.prisma
  - Add DraftTurnTimer model
  - Add isAutoPick field to DraftPick
  - Add timer relation to Draft

packages/dal/src/mutations/
  - drafts.makePick.ts         # Add timer logic
  - drafts.start.ts            # Initialize timer

packages/dal/src/queries/
  - drafts.getRoomState.ts     # Include timer info

apps/web/components/features/drafts/
  - DraftRoom.tsx              # WebSocket integration

apps/web/package.json
  - Add ioredis dependency
  - Add ws dependency (if WebSocket route)

infra/k8s/web-deployment.yaml
  - Add REDIS_URL env var
  - Update resource limits
  - Add health check probes
```

---

## 17. Conclusion

This architecture provides a robust, scalable foundation for the Fantasy Madness Draft Room MVP while adhering to existing patterns (DAL-first, Kubernetes-safe, PostgreSQL source of truth).

The design prioritizes:
- **Correctness**: Transaction-level safety, distributed locks, race condition prevention
- **Scalability**: Stateless pods, horizontal scaling, Redis pub/sub
- **Resilience**: Graceful reconnection, failure recovery, no data loss
- **Maintainability**: Clear boundaries, typed events, structured logging

Implementation can proceed in 4-week phased approach with clear success criteria at each milestone.

---

**Next Steps:**
1. Review and approve this ADR with engineering team
2. Create GitHub project with tasks from Phase 1-5
3. Set up staging environment with Redis
4. Begin Phase 1 implementation (Database & DAL changes)

**Questions? Contact:** FM-Architect
