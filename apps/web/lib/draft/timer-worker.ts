import { prisma } from '@fantasy-madness/db';
import { makePick, selectOptimalSlot, getDraftRoomState, getPickQueue, withAdvisoryLock } from '@/server/dal';
import { getRedisPubSub } from '../redis/pubsub';

const redis = getRedisPubSub();

async function findAndProcessExpiredTimers(): Promise<number> {
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
    take: 10,
  });

  if (expiredTimers.length > 0) {
    console.log(`[Timer Worker] Found ${expiredTimers.length} expired timer(s)`);
  }

  for (const timer of expiredTimers) {
    try {
      await executeAutoPick(timer.draftId, timer.currentPickNumber);
      processedCount++;
    } catch (err: any) {
      console.error(`[Timer Worker] Failed to auto-pick for draft ${timer.draftId}:`, err.message);
    }
  }

  return processedCount;
}

export async function processExpiredTimers(): Promise<{ processed: number }> {
  try {
    const { ran, result } = await withAdvisoryLock('draft:timer-worker', findAndProcessExpiredTimers);
    return { processed: ran ? (result ?? 0) : 0 };
  } catch (lockErr) {
    // Advisory lock failed (e.g. DB connection issue) — fall back to running without lock.
    // Safe in single-process; in multi-pod, worst case is duplicate auto-pick attempt
    // which makePick's pick-number check will reject.
    console.warn('[Timer Worker] Advisory lock failed, running without lock:', lockErr);
    try {
      const processed = await findAndProcessExpiredTimers();
      return { processed };
    } catch (err) {
      console.error('[Timer Worker] Failed even without lock:', err);
      return { processed: 0 };
    }
  }
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

  const userId = state.currentPickerUserId;

  // 3. Check user's queue for a preferred slot
  let slotId: string | null = null;

  try {
    const queue = await getPickQueue({ db: prisma, draftId, userId });
    if (queue && queue.slotIds.length > 0) {
      const availableIds = new Set(state.availableSlots.map((s) => s.slotId));
      slotId = queue.slotIds.find((id) => availableIds.has(id)) ?? null;
      if (slotId) {
        console.log(`[Auto-Pick] Using queued slot ${slotId} for user ${userId}`);
      }
    }
  } catch (err) {
    console.error('[Auto-Pick] Failed to check queue, falling back to optimal:', err);
  }

  // 4. Fall back to optimal slot if no queue pick available
  if (!slotId) {
    slotId = await selectOptimalSlot({ db: prisma, draftId });
  }

  // 5. Make auto-pick
  try {
    const result = await makePick({
      db: prisma,
      input: {
        draftId,
        userId,
        slotId,
        isAutoPick: true,
      },
    });

    console.log(`[Auto-Pick] Success - pick ${result.overallPickNo} for user ${userId}`);

    // 6. Broadcast via Redis
    await redis.publish(`draft:${draftId}`, {
      type: 'pick:made',
      payload: {
        pickId: result.pickId,
        userId,
        slotId,
        overallPickNo: result.overallPickNo,
        isAutoPick: true,
      },
    });

    // Fetch and broadcast updated full state
    const updatedState = await getDraftRoomState({ db: prisma, draftId });
    await redis.publish(`draft:${draftId}`, {
      type: 'draft:state',
      payload: updatedState,
    });

    // 7. If draft not complete, send turn change event
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
