import { processExpiredTimers } from './timer-worker';
import { processScheduledDrafts } from './auto-start-worker';

let timerInterval: NodeJS.Timeout | null = null;
let autoStartInterval: NodeJS.Timeout | null = null;

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

  // Auto-start worker: polls every 5s for drafts that need countdown or start
  if (!autoStartInterval) {
    console.log('[Cron] Starting auto-start worker (interval: 5000ms)');

    autoStartInterval = setInterval(async () => {
      try {
        const { countdownsStarted, draftsStarted } = await processScheduledDrafts();
        if (countdownsStarted > 0 || draftsStarted > 0) {
          console.log(`[Cron] Auto-start: ${countdownsStarted} countdowns started, ${draftsStarted} drafts started`);
        }
      } catch (err) {
        console.error('[Cron] Auto-start worker error:', err);
      }
    }, 5000);
  }
}

export function stopTimerWorker(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    console.log('[Cron] Timer worker stopped');
  }
  if (autoStartInterval) {
    clearInterval(autoStartInterval);
    autoStartInterval = null;
    console.log('[Cron] Auto-start worker stopped');
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
