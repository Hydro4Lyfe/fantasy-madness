import { prisma } from '@fantasy-madness/db';
import { startCountdown, startDraftSystem, getDraftRoomState, withAdvisoryLock } from '@/server/dal';
import { COUNTDOWN_DURATION_MS } from '@fantasy-madness/domain';
import { getRedisPubSub } from '../redis/pubsub';

const redis = getRedisPubSub();

/**
 * Polls for scheduled drafts that need auto-starting.
 * Two phases:
 * 1. Drafts where startAt has arrived → set countdownStartedAt (begin 30s countdown)
 * 2. Drafts where countdown has expired → transition to DRAFTING
 */
export async function processScheduledDrafts(): Promise<{ countdownsStarted: number; draftsStarted: number }> {
  const { ran, result } = await withAdvisoryLock('draft:auto-start-worker', async () => {
    let countdownsStarted = 0;
    let draftsStarted = 0;

    const now = new Date();

    // Phase 1: Find drafts where startAt has passed but countdown hasn't started yet
    const readyForCountdown = await prisma.draft.findMany({
      where: {
        status: 'OPEN',
        startAt: { lte: now },
        countdownStartedAt: null,
      },
      select: {
        id: true,
        name: true,
        _count: { select: { participants: true } },
      },
      take: 10,
    });

    for (const draft of readyForCountdown) {
      try {
        if (draft._count.participants < 2) {
          console.log(`[Auto-Start] Draft "${draft.name}" (${draft.id}): not enough participants (${draft._count.participants}), broadcasting failure`);
          await redis.publish(`draft:${draft.id}`, {
            type: 'draft:startFailed' as const,
            payload: { reason: 'NOT_ENOUGH_PARTICIPANTS' },
          });
          continue;
        }

        const result = await startCountdown({ db: prisma, input: { draftId: draft.id } });
        countdownsStarted++;

        const countdownEndsAt = new Date(
          result.countdownStartedAt.getTime() + COUNTDOWN_DURATION_MS
        ).toISOString();

        console.log(`[Auto-Start] Draft "${draft.name}" (${draft.id}): countdown started, ends at ${countdownEndsAt}`);

        // Broadcast countdown event to connected clients
        await redis.publish(`draft:${draft.id}`, {
          type: 'draft:countdown' as const,
          payload: { countdownEndsAt },
        });

        // Also send updated state so clients get the new phase
        const updatedState = await getDraftRoomState({ db: prisma, draftId: draft.id });
        await redis.publish(`draft:${draft.id}`, {
          type: 'draft:state' as const,
          payload: updatedState,
        });
      } catch (err: any) {
        console.error(`[Auto-Start] Failed countdown for draft ${draft.id}:`, err.message);
      }
    }

    // Phase 2: Find drafts where countdown has expired (30s passed since countdownStartedAt)
    const countdownExpiredBefore = new Date(now.getTime() - COUNTDOWN_DURATION_MS);

    const readyToStart = await prisma.draft.findMany({
      where: {
        status: 'OPEN',
        countdownStartedAt: { lte: countdownExpiredBefore },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });

    for (const draft of readyToStart) {
      try {
        const startResult = await startDraftSystem({ db: prisma, input: { draftId: draft.id } });
        draftsStarted++;

        console.log(`[Auto-Start] Draft "${draft.name}" (${draft.id}): started! First picker: ${startResult.firstPickerUserId}`);

        // Broadcast updated state
        const updatedState = await getDraftRoomState({ db: prisma, draftId: draft.id });
        await redis.publish(`draft:${draft.id}`, {
          type: 'draft:state' as const,
          payload: updatedState,
        });

        // Send turn changed event
        if (startResult.firstPickerUserId) {
          await redis.publish(`draft:${draft.id}`, {
            type: 'turn:changed' as const,
            payload: {
              currentPickerUserId: startResult.firstPickerUserId,
              deadlineAt: startResult.firstDeadlineAt?.toISOString() ?? null,
            },
          });
        }
      } catch (err: any) {
        console.error(`[Auto-Start] Failed to start draft ${draft.id}:`, err.message);
      }
    }

    return { countdownsStarted, draftsStarted };
  });

  return ran ? (result ?? { countdownsStarted: 0, draftsStarted: 0 }) : { countdownsStarted: 0, draftsStarted: 0 };
}
