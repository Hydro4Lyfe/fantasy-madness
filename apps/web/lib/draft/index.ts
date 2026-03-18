import { startTimerWorker } from './cron';

// Only auto-start at runtime, not during build
// Check for Next.js build phase or explicit disable flag
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_RUNTIME === undefined ||
  process.env.DISABLE_TIMER_WORKER === 'true';

if (process.env.NODE_ENV !== 'test' && !isBuildTime && typeof window === 'undefined') {
  // Delay startup to ensure we're fully initialized
  setImmediate(() => {
    startTimerWorker();
  });
}

export { processExpiredTimers } from './timer-worker';
export { processScheduledDrafts } from './auto-start-worker';
export { startTimerWorker, stopTimerWorker } from './cron';
