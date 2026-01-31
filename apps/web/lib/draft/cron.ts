import { processExpiredTimers } from './timer-worker';

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
