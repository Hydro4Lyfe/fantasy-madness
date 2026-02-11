import { prisma } from '@fantasy-madness/db';
import { makePick, selectOptimalSlot, getDraftRoomState, withAdvisoryLock } from '@/server/dal';
import { getRedisPubSub } from '../redis/pubsub';

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
