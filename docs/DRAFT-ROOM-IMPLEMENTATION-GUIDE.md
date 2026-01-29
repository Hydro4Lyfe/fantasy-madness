# Draft Room Implementation Guide

This guide provides step-by-step implementation instructions for the Draft Room MVP architecture defined in ADR-001.

---

## Prerequisites

Before starting implementation:

1. Review and approve ADR-001-DRAFT-ROOM-ARCHITECTURE.md
2. Ensure development environment is set up (npm install, DB running)
3. Create feature branch: `git checkout -b feature/draft-room-mvp`
4. Set up Redis locally or in staging environment

---

## Phase 1: Database & DAL Changes

### Step 1.1: Update Prisma Schema

**File:** `/home/matchy/coding-projects/fantasy-madness/packages/db/prisma/schema.prisma`

Add these models after the `Draft` model:

```prisma
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
  @@index([deadlineAt], map: "ix_draft_turn_timers_deadline", where: timerPausedAt == null)
}

model DraftPick {
  // ... existing fields ...

  isAutoPick Boolean @default(false) @map("is_auto_pick")

  // ... rest of model ...
}

model Draft {
  // ... existing fields ...

  timer DraftTurnTimer?

  // ... rest of model ...
}
```

### Step 1.2: Create Migration

```bash
cd /home/matchy/coding-projects/fantasy-madness
npm run migrate:dev -w @fantasy-madness/db
# When prompted: "add_draft_timer_and_autopick"
```

**Expected Migration File:** `packages/db/prisma/migrations/XXXXXX_add_draft_timer_and_autopick/migration.sql`

Verify contents:

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

CREATE INDEX ix_draft_turn_timers_deadline
  ON draft_turn_timers(deadline_at)
  WHERE timer_paused_at IS NULL;
```

### Step 1.3: Regenerate Prisma Client

```bash
npm run generate -w @fantasy-madness/db
npm run build:db
```

### Step 1.4: Update DAL - makePick Mutation

**File:** `/home/matchy/coding-projects/fantasy-madness/packages/dal/src/mutations/drafts.makePick.ts`

Replace the entire file with:

```typescript
import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";
import { mapPrismaError } from "../errors/mapPrismaError.js";

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

export async function makePick(args: {
  db: DbClient;
  input: MakePickInput;
}): Promise<MakePickResult> {
  const { db, input } = args;

  try {
    return await (db as any).$transaction(async (tx: any) => {
      // 1. Fetch draft with participants and current picks
      const draft = await tx.draft.findUnique({
        where: { id: input.draftId },
        select: {
          id: true,
          status: true,
          draftType: true,
          rosterSize: true,
          pickTimerSec: true,
          participants: {
            select: { userId: true, pickOrder: true },
            orderBy: { pickOrder: "asc" },
          },
          _count: { select: { picks: true } },
        },
      });

      if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");
      if (draft.status !== "DRAFTING") {
        throw new DomainError("INVALID_STATE", "Draft is not in progress");
      }

      // 2. Check if user is a participant
      const participant = draft.participants.find((p: any) => p.userId === input.userId);
      if (!participant) {
        throw new DomainError("UNAUTHORIZED", "You are not a participant in this draft");
      }

      // 3. Check if slot is already picked
      const existingPick = await tx.draftPick.findFirst({
        where: { draftId: input.draftId, slotId: input.slotId },
      });
      if (existingPick) {
        throw new DomainError("CONFLICT", "This slot has already been drafted");
      }

      // 4. Calculate whose turn it is (snake draft)
      const totalPicks = draft._count.picks;
      const numParticipants = draft.participants.length;
      const round = Math.floor(totalPicks / numParticipants);
      const positionInRound = totalPicks % numParticipants;

      const isReverseRound = round % 2 === 1;
      const expectedPickOrder = isReverseRound
        ? numParticipants - positionInRound
        : positionInRound + 1;

      // Allow auto-picks to bypass turn validation
      if (!input.isAutoPick && participant.pickOrder !== expectedPickOrder) {
        throw new DomainError("INVALID_STATE", "It's not your turn to pick");
      }

      // 5. Create the pick
      const overallPickNo = totalPicks + 1;
      const rosterSlot = Math.floor((overallPickNo - 1) / numParticipants) + 1;

      const pick = await tx.draftPick.create({
        data: {
          draftId: input.draftId,
          userId: input.userId,
          slotId: input.slotId,
          overallPickNo,
          rosterSlot,
          isAutoPick: input.isAutoPick ?? false,
        },
        select: { id: true, overallPickNo: true },
      });

      // 6. Check if draft is complete
      const totalExpectedPicks = numParticipants * draft.rosterSize;
      const isDraftComplete = overallPickNo >= totalExpectedPicks;

      if (isDraftComplete) {
        await tx.draft.update({
          where: { id: input.draftId },
          data: { status: "COMPLETE" },
        });
        // Delete timer
        await tx.draftTurnTimer.deleteMany({ where: { draftId: input.draftId } });

        return {
          pickId: pick.id,
          overallPickNo: pick.overallPickNo,
          nextPickerUserId: null,
          nextDeadlineAt: null,
          isDraftComplete: true,
        };
      }

      // 7. Calculate next picker and update timer
      let nextPickerUserId: string | null = null;
      let nextDeadlineAt: Date | null = null;

      const nextPickNumber = overallPickNo + 1;
      const nextRound = Math.floor(nextPickNumber - 1 / numParticipants);
      const nextPositionInRound = (nextPickNumber - 1) % numParticipants;
      const nextIsReverseRound = nextRound % 2 === 1;
      const nextPickOrder = nextIsReverseRound
        ? numParticipants - nextPositionInRound
        : nextPositionInRound + 1;

      const nextPicker = draft.participants.find((p: any) => p.pickOrder === nextPickOrder);
      nextPickerUserId = nextPicker?.userId ?? null;

      if (draft.pickTimerSec && nextPickerUserId) {
        const now = new Date();
        nextDeadlineAt = new Date(now.getTime() + draft.pickTimerSec * 1000);

        await tx.draftTurnTimer.upsert({
          where: { draftId: input.draftId },
          create: {
            draftId: input.draftId,
            turnStartedAt: now,
            currentPickNumber: nextPickNumber,
            deadlineAt: nextDeadlineAt,
          },
          update: {
            turnStartedAt: now,
            currentPickNumber: nextPickNumber,
            deadlineAt: nextDeadlineAt,
            timerPausedAt: null, // Clear any pause
          },
        });
      } else {
        // No timer or draft complete - delete timer if exists
        await tx.draftTurnTimer.deleteMany({ where: { draftId: input.draftId } });
      }

      return {
        pickId: pick.id,
        overallPickNo: pick.overallPickNo,
        nextPickerUserId,
        nextDeadlineAt,
        isDraftComplete: false,
      };
    });
  } catch (e) {
    throw mapPrismaError(e);
  }
}
```

### Step 1.5: Update DAL - startDraft Mutation

**File:** `/home/matchy/coding-projects/fantasy-madness/packages/dal/src/mutations/drafts.start.ts`

Replace with:

```typescript
import type { DbClient } from "@fantasy-madness/db";
import { prisma } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type StartDraftInput = {
  draftId: string;
  userId: string; // must be host
};

export type StartDraftResult = {
  success: boolean;
  firstPickerUserId: string;
  firstDeadlineAt: Date | null;
};

export async function startDraft(args: {
  db?: DbClient;
  input: StartDraftInput;
}): Promise<StartDraftResult> {
  const db = (args.db ?? prisma) as any;
  const { draftId, userId } = args.input;

  return await db.$transaction(async (tx: any) => {
    // 1. Verify user is host
    const participant = await tx.draftParticipant.findFirst({
      where: { draftId, userId, isHost: true },
    });

    if (!participant) {
      throw new DomainError("UNAUTHORIZED", "Only the host can start the draft");
    }

    // 2. Get draft with participants
    const draft = await tx.draft.findUnique({
      where: { id: draftId },
      include: {
        participants: {
          orderBy: { pickOrder: "asc" },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!draft) {
      throw new DomainError("NOT_FOUND", "Draft not found");
    }

    if (draft.status !== "OPEN") {
      throw new DomainError("INVALID_STATE", "Draft has already started or completed");
    }

    if (draft._count.participants < 2) {
      throw new DomainError("INVALID_STATE", "Need at least 2 participants to start");
    }

    // 3. Update draft status
    await tx.draft.update({
      where: { id: draftId },
      data: { status: "DRAFTING" },
    });

    // 4. Initialize timer if enabled
    let firstDeadlineAt: Date | null = null;
    const firstPicker = draft.participants.find((p: any) => p.pickOrder === 1);

    if (draft.pickTimerSec && firstPicker) {
      const now = new Date();
      firstDeadlineAt = new Date(now.getTime() + draft.pickTimerSec * 1000);

      await tx.draftTurnTimer.create({
        data: {
          draftId,
          turnStartedAt: now,
          currentPickNumber: 1,
          deadlineAt: firstDeadlineAt,
        },
      });
    }

    return {
      success: true,
      firstPickerUserId: firstPicker?.userId ?? draft.participants[0].userId,
      firstDeadlineAt,
    };
  });
}
```

### Step 1.6: Create Auto-Pick Algorithm

**New File:** `/home/matchy/coding-projects/fantasy-madness/packages/dal/src/queries/drafts.selectOptimalSlot.ts`

```typescript
import type { DbClient } from "@fantasy-madness/db";
import { DomainError } from "@fantasy-madness/domain";

export type SlotCandidate = {
  slotId: string;
  seed: number;
  quadrant: number;
  hasPlayIn: boolean;
};

/**
 * Selects the optimal BracketSlot for auto-pick.
 *
 * Strategy:
 * 1. Prioritize highest seed (most points per win)
 * 2. Among same seed, prefer non-play-in (certainty)
 * 3. Among same seed+play-in status, pick first by quadrant order
 */
export async function selectOptimalSlot(args: {
  db: DbClient;
  draftId: string;
}): Promise<string> {
  const { db, draftId } = args;

  // Get draft and available slots
  const draft = await (db as any).draft.findUnique({
    where: { id: draftId },
    select: {
      tournamentId: true,
      picks: { select: { slotId: true } },
    },
  });

  if (!draft) throw new DomainError("NOT_FOUND", "Draft not found");

  const pickedSlotIds = new Set(draft.picks.map((p: any) => p.slotId));

  const allSlots = await (db as any).bracketSlot.findMany({
    where: { tournamentId: draft.tournamentId },
    select: {
      id: true,
      seed: true,
      quadrant: true,
      playInGameId: true,
    },
    orderBy: [
      { seed: "desc" },      // Highest seed first
      { quadrant: "asc" },   // Then by quadrant
    ],
  });

  const availableSlots = allSlots.filter((s: any) => !pickedSlotIds.has(s.id));

  if (availableSlots.length === 0) {
    throw new DomainError("INVALID_STATE", "No available slots to pick");
  }

  // Find max seed among available
  const maxSeed = Math.max(...availableSlots.map((s: any) => s.seed));
  const topSeedSlots = availableSlots.filter((s: any) => s.seed === maxSeed);

  // Prefer non-play-in
  const nonPlayInSlots = topSeedSlots.filter((s: any) => !s.playInGameId);
  if (nonPlayInSlots.length > 0) {
    return nonPlayInSlots[0].id;
  }

  // Otherwise return first play-in slot
  return topSeedSlots[0].id;
}
```

### Step 1.7: Export New Functions

**File:** `/home/matchy/coding-projects/fantasy-madness/packages/dal/src/index.ts`

Add exports:

```typescript
// ... existing exports ...

export { selectOptimalSlot } from "./queries/drafts.selectOptimalSlot.js";
```

### Step 1.8: Update getDraftRoomState to Include Timer

**File:** `/home/matchy/coding-projects/fantasy-madness/packages/dal/src/queries/drafts.getRoomState.ts`

Update the return type and query:

```typescript
export type DraftRoomStateDTO = {
  // ... existing fields ...
  timerDeadlineAt: string | null;
  timerSecondsRemaining: number | null;
};

// In the function, add timer query:
const timer = await db.draftTurnTimer.findUnique({
  where: { draftId: args.draftId },
  select: {
    deadlineAt: true,
    currentPickNumber: true,
  },
});

let timerDeadlineAt: string | null = null;
let timerSecondsRemaining: number | null = null;

if (timer && draft.status === "DRAFTING") {
  timerDeadlineAt = timer.deadlineAt.toISOString();
  const now = new Date();
  const remaining = timer.deadlineAt.getTime() - now.getTime();
  timerSecondsRemaining = Math.max(0, Math.floor(remaining / 1000));
}

// Return with timer fields
return {
  // ... existing fields ...
  timerDeadlineAt,
  timerSecondsRemaining,
};
```

### Step 1.9: Test DAL Changes

Create test file: `/home/matchy/coding-projects/fantasy-madness/packages/dal/src/__tests__/drafts.timer.test.ts`

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@fantasy-madness/db';
import { startDraft, makePick, selectOptimalSlot } from '../index.js';

describe('Draft Timer Functionality', () => {
  // Add tests for:
  // - startDraft creates timer
  // - makePick updates timer
  // - selectOptimalSlot picks highest seed
  // - Timer deleted on draft complete
});
```

Run tests:

```bash
npm run test -w @fantasy-madness/dal
```

### Phase 1 Completion Checklist

- [ ] Prisma schema updated with DraftTurnTimer and isAutoPick
- [ ] Migration created and applied
- [ ] Prisma client regenerated
- [ ] makePick mutation updated with timer logic
- [ ] startDraft mutation updated to initialize timer
- [ ] selectOptimalSlot algorithm implemented
- [ ] getDraftRoomState includes timer info
- [ ] DAL exports updated
- [ ] Unit tests written and passing
- [ ] Build succeeds: `npm run build:dal`

---

## Phase 2: Redis + Background Worker

### Step 2.1: Add Dependencies

**File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/package.json`

```bash
cd /home/matchy/coding-projects/fantasy-madness/apps/web
npm install ioredis
npm install --save-dev @types/ioredis
```

### Step 2.2: Create Redis Client

**New File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/lib/redis/client.ts`

```typescript
import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected');
  });

  return redisClient;
}

export const redis = getRedisClient();
```

### Step 2.3: Create Pub/Sub Wrapper

**New File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/lib/redis/pubsub.ts`

```typescript
import Redis from 'ioredis';
import { getRedisClient } from './client.js';

export class RedisPubSubClient {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, Set<(msg: any) => void>>();

  constructor() {
    // Use separate connections for pub and sub
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.subscriber.on('message', (channel, message) => {
      const callbacks = this.handlers.get(channel);
      if (callbacks) {
        try {
          const parsed = JSON.parse(message);
          callbacks.forEach(cb => {
            try {
              cb(parsed);
            } catch (err) {
              console.error('Pub/sub callback error:', err);
            }
          });
        } catch (err) {
          console.error('Failed to parse Redis message:', err);
        }
      }
    });
  }

  async subscribe(channel: string, callback: (msg: any) => void): Promise<void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
      console.log(`Subscribed to channel: ${channel}`);
    }
    this.handlers.get(channel)!.add(callback);
  }

  async unsubscribe(channel: string, callback: (msg: any) => void): Promise<void> {
    const callbacks = this.handlers.get(channel);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        await this.subscriber.unsubscribe(channel);
        this.handlers.delete(channel);
        console.log(`Unsubscribed from channel: ${channel}`);
      }
    }
  }

  async publish(channel: string, message: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }
}

let pubsubClient: RedisPubSubClient | null = null;

export function getRedisPubSub(): RedisPubSubClient {
  if (!pubsubClient) {
    pubsubClient = new RedisPubSubClient();
  }
  return pubsubClient;
}
```

### Step 2.4: Create Timer Worker

**New File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/lib/draft/timer-worker.ts`

```typescript
import { prisma } from '@fantasy-madness/db';
import { withAdvisoryLock } from '@fantasy-madness/dal/ingest/lock';
import { makePick, selectOptimalSlot, getDraftRoomState } from '@fantasy-madness/dal';
import { getRedisPubSub } from '../redis/pubsub.js';

const redis = getRedisPubSub();

export async function processExpiredTimers(): Promise<{ processed: number }> {
  const { ran, result } = await withAdvisoryLock('draft:timer-worker', async () => {
    const now = new Date();
    let processedCount = 0;

    // Find all drafts with expired timers
    const expiredTimers = await prisma.draftTurnTimer.findMany({
      where: {
        deadlineAt: { lte: now },
        timerPausedAt: null,
        draft: { status: 'DRAFTING' },
      },
      select: {
        draftId: true,
        currentPickNumber: true,
        deadlineAt: true,
      },
      take: 10, // Process max 10 at a time to avoid long-running transactions
    });

    console.log(`[Timer Worker] Found ${expiredTimers.length} expired timers`);

    for (const timer of expiredTimers) {
      try {
        await executeAutoPick(timer.draftId, timer.currentPickNumber);
        processedCount++;
      } catch (err: any) {
        console.error(`[Timer Worker] Failed to auto-pick for draft ${timer.draftId}:`, err.message);
      }
    }

    return processedCount;
  });

  return { processed: ran ? (result ?? 0) : 0 };
}

async function executeAutoPick(draftId: string, expectedPickNumber: number): Promise<void> {
  console.log(`[Auto-Pick] Executing for draft ${draftId}, pick ${expectedPickNumber}`);

  // 1. Get current draft state
  const state = await getDraftRoomState({ db: prisma, draftId });

  // 2. Verify still waiting for this pick (race condition check)
  if (state.currentPickNumber !== expectedPickNumber) {
    console.log(`[Auto-Pick] Skipping - pick number mismatch (expected ${expectedPickNumber}, current ${state.currentPickNumber})`);
    return;
  }

  if (!state.currentPickerUserId) {
    console.log(`[Auto-Pick] Skipping - no current picker`);
    return;
  }

  // 3. Select optimal slot
  const optimalSlotId = await selectOptimalSlot({ db: prisma, draftId });

  // 4. Make auto-pick
  try {
    const result = await makePick({
      db: prisma,
      input: {
        draftId,
        userId: state.currentPickerUserId,
        slotId: optimalSlotId,
        isAutoPick: true,
      },
    });

    console.log(`[Auto-Pick] Success - pick ${result.overallPickNo} for user ${state.currentPickerUserId}`);

    // 5. Broadcast via Redis
    await redis.publish(`draft:${draftId}`, {
      type: 'pick:made',
      payload: {
        pickId: result.pickId,
        userId: state.currentPickerUserId,
        slotId: optimalSlotId,
        overallPickNo: result.overallPickNo,
        isAutoPick: true,
      },
    });

    // 6. If draft not complete, send turn change event
    if (!result.isDraftComplete && result.nextPickerUserId) {
      await redis.publish(`draft:${draftId}`, {
        type: 'turn:changed',
        payload: {
          currentPickerUserId: result.nextPickerUserId,
          deadlineAt: result.nextDeadlineAt?.toISOString() ?? null,
        },
      });
    } else if (result.isDraftComplete) {
      await redis.publish(`draft:${draftId}`, {
        type: 'draft:completed',
        payload: {},
      });
    }
  } catch (err: any) {
    console.error('[Auto-Pick] Failed:', err.message);
    throw err;
  }
}
```

### Step 2.5: Create Cron Job Setup

**New File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/lib/draft/cron.ts`

```typescript
import { processExpiredTimers } from './timer-worker.js';

let timerInterval: NodeJS.Timeout | null = null;

export function startTimerWorker(intervalMs: number = 5000): void {
  if (timerInterval) {
    console.warn('[Cron] Timer worker already running');
    return;
  }

  console.log(`[Cron] Starting timer worker (interval: ${intervalMs}ms)`);

  timerInterval = setInterval(async () => {
    try {
      const { processed } = await processExpiredTimers();
      if (processed > 0) {
        console.log(`[Cron] Processed ${processed} expired timers`);
      }
    } catch (err) {
      console.error('[Cron] Timer worker error:', err);
    }
  }, intervalMs);
}

export function stopTimerWorker(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    console.log('[Cron] Timer worker stopped');
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Cron] SIGTERM received, stopping timer worker');
  stopTimerWorker();
});

process.on('SIGINT', () => {
  console.log('[Cron] SIGINT received, stopping timer worker');
  stopTimerWorker();
});
```

### Step 2.6: Start Cron in Next.js App

**File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/lib/draft/index.ts`

```typescript
import { startTimerWorker } from './cron.js';

// Auto-start timer worker when module is imported
if (process.env.NODE_ENV !== 'test') {
  startTimerWorker();
}

export { processExpiredTimers } from './timer-worker.js';
export { startTimerWorker, stopTimerWorker } from './cron.js';
```

**File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/app/layout.tsx`

Add import at top (side-effect import to start cron):

```typescript
import '@/lib/draft'; // Starts timer worker
```

### Step 2.7: Update Server Actions to Broadcast Events

**File:** `/home/matchy/coding-projects/fantasy-madness/apps/web/server/actions/makePick.ts`

Update to broadcast via Redis:

```typescript
"use server";

import { prisma } from "@fantasy-madness/db";
import { makePick } from "@fantasy-madness/dal";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/server/auth/guards";
import { getRedisPubSub } from "@/lib/redis/pubsub";

const redis = getRedisPubSub();

export type MakePickResult = {
  success: boolean;
  error?: string;
  pickId?: string;
};

export async function makePickAction(
  draftId: string,
  slotId: string
): Promise<MakePickResult> {
  const userId = await requireUserId();

  try {
    const result = await makePick({
      db: prisma,
      input: { draftId, userId, slotId, isAutoPick: false },
    });

    // Broadcast to all clients via Redis
    await redis.publish(`draft:${draftId}`, {
      type: 'pick:made',
      payload: {
        pickId: result.pickId,
        userId,
        slotId,
        overallPickNo: result.overallPickNo,
        isAutoPick: false,
      },
    });

    // If not complete, send turn change
    if (!result.isDraftComplete && result.nextPickerUserId) {
      await redis.publish(`draft:${draftId}`, {
        type: 'turn:changed',
        payload: {
          currentPickerUserId: result.nextPickerUserId,
          deadlineAt: result.nextDeadlineAt?.toISOString() ?? null,
        },
      });
    } else if (result.isDraftComplete) {
      await redis.publish(`draft:${draftId}`, {
        type: 'draft:completed',
        payload: {},
      });
    }

    revalidatePath(`/drafts/${draftId}/room`);

    return { success: true, pickId: result.pickId };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Failed to make pick" };
  }
}
```

### Phase 2 Completion Checklist

- [ ] ioredis dependency added
- [ ] Redis client created
- [ ] Pub/sub wrapper implemented
- [ ] Timer worker implemented with advisory lock
- [ ] Cron job setup created
- [ ] Timer worker auto-starts with Next.js app
- [ ] Server actions broadcast events via Redis
- [ ] Redis running locally or in staging (docker-compose or K8s)
- [ ] Test: Create draft with timer, wait for auto-pick
- [ ] Verify auto-pick shows in database
- [ ] Verify Redis events published (check logs)

---

## Testing Phase 1 & 2

### Manual Test Script

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Start web app
npm run dev:web

# 3. In browser:
# - Create a draft with 2 participants (for faster testing)
# - Set pick timer to 10 seconds
# - Start the draft
# - Make 1 pick manually
# - Wait 10 seconds - verify auto-pick happens
# - Check database: SELECT * FROM draft_picks WHERE is_auto_pick = true;

# 4. Check logs for:
# - "[Auto-Pick] Executing for draft..."
# - "[Auto-Pick] Success - pick X for user..."
# - Redis pub/sub messages
```

---

## Next Steps

Once Phase 1 & 2 are complete and tested:

1. **Phase 3:** Implement WebSocket/SSE server (see ADR-001 Section 4.1)
2. **Phase 4:** Update React client component for real-time updates
3. **Phase 5:** E2E testing, load testing, deployment

---

## Troubleshooting

### Issue: Timer worker not running

**Check:**
```bash
# Verify Redis connection
redis-cli ping
# Should return: PONG

# Check app logs for:
grep "Starting timer worker" logs
grep "Timer Worker" logs
```

### Issue: Auto-picks not happening

**Debug:**
```sql
-- Check for expired timers
SELECT * FROM draft_turn_timers
WHERE deadline_at < NOW() AND timer_paused_at IS NULL;

-- Check drafts in DRAFTING status
SELECT * FROM drafts WHERE status = 'DRAFTING';

-- Check last picks
SELECT * FROM draft_picks ORDER BY created_at DESC LIMIT 10;
```

### Issue: Build fails after Prisma changes

**Fix:**
```bash
npm run generate -w @fantasy-madness/db
npm run build:db
npm run build:dal
```

---

## Environment Variables

Add to `/home/matchy/coding-projects/fantasy-madness/.env`:

```bash
# Redis (local development)
REDIS_URL=redis://localhost:6379

# Redis (production/staging - K8s service name)
REDIS_URL=redis://fm-redis:6379
```

Add to `/home/matchy/coding-projects/fantasy-madness/apps/web/.env.local`:

```bash
REDIS_URL=redis://localhost:6379
```

---

## Docker Compose Update

**File:** `/home/matchy/coding-projects/fantasy-madness/infra/compose/docker-compose.yml`

Add Redis service:

```yaml
services:
  # ... existing services ...

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  web:
    # ... existing config ...
    environment:
      # ... existing env vars ...
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis

volumes:
  redis-data:
```

---

## Contact

Questions or issues during implementation? Reference ADR-001 or consult with FM-Architect.
