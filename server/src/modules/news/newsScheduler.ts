// ============================================================
// NEWS SCHEDULER — CABA ONLINE
// ============================================================
import { refreshNews } from './newsService';
import { logger } from '../../lib/logger';
import { GAME_CONFIG } from '../../../../shared/constants';

const INTERVAL_MS =
  (process.env.NEWS_REFRESH_INTERVAL_MINUTES
    ? parseInt(process.env.NEWS_REFRESH_INTERVAL_MINUTES, 10)
    : GAME_CONFIG.newsRefreshMinutes) *
  60_000;

let intervalHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Start the news scheduler.
 * - Runs the first cycle after a 5-second warm-up delay.
 * - Then repeats every INTERVAL_MS (default 30 minutes).
 */
export function startNewsScheduler(): void {
  if (intervalHandle) {
    logger.warn('[NewsScheduler] Already running — ignoring duplicate start');
    return;
  }

  logger.info(
    `[NewsScheduler] Starting — first run in 5s, then every ${INTERVAL_MS / 60_000} minutes`,
  );

  // First run after 5s warm-up
  const warmup = setTimeout(async () => {
    await runCycle();

    // Then run on regular interval
    intervalHandle = setInterval(async () => {
      await runCycle();
    }, INTERVAL_MS);
  }, 5_000);

  // Prevent the warmup from keeping the process alive if server shuts down early
  warmup.unref?.();
}

/**
 * Stop the news scheduler.
 */
export function stopNewsScheduler(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info('[NewsScheduler] Stopped');
  }
}

async function runCycle(): Promise<void> {
  const label = `[NewsScheduler] Cycle ${new Date().toISOString()}`;
  logger.info(label);
  try {
    await refreshNews();
  } catch (err) {
    // refreshNews already handles its own errors; this is a last-resort guard
    logger.error(`[NewsScheduler] Unexpected error in cycle: ${(err as Error).message}`);
  }
}
