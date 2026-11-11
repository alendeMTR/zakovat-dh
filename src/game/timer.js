// The timer is stored as timestamps, never as a counting number, so it survives a reload (D14, plan §3):
//   timer = { startedAt: number | null, accumulatedMs: number }
//   elapsed = accumulatedMs + (now − startedAt) while running.
// The clock keeps running past zero so late hand-ins can be told apart; the display stops at 0:00.

export const NEW_TIMER = Object.freeze({ startedAt: null, accumulatedMs: 0 });

export const isRunning = (timer) => timer.startedAt !== null;

export const hasStarted = (timer) => timer.startedAt !== null || timer.accumulatedMs > 0;

export function elapsedMs(timer, now) {
  const running = timer.startedAt !== null ? Math.max(0, now - timer.startedAt) : 0;
  return timer.accumulatedMs + running;
}

/** Milliseconds left; negative once time is up. */
export function remainingMs(timer, settings, now) {
  return settings.timeSec * 1000 - elapsedMs(timer, now);
}

/**
 * The timer's colour state (brief: three colours).
 * 'extra'   — inside the extra window (green)
 * 'neutral' — after it (navy)
 * 'warn'    — the last warnSec seconds (red-pink)
 * 'done'    — time is up (stays in the warning colour at 0:00)
 * 'idle'    — not started yet
 * When the extra window and the warning overlap, 'extra' wins: the bonus is still on offer.
 */
export function timerPhase(timer, settings, now) {
  if (!hasStarted(timer)) return "idle";
  const elapsed = elapsedMs(timer, now);
  const remaining = settings.timeSec * 1000 - elapsed;
  if (remaining <= 0) return "done";
  if (settings.extraSec > 0 && elapsed <= settings.extraSec * 1000) return "extra";
  if (remaining <= settings.warnSec * 1000) return "warn";
  return "neutral";
}

/**
 * Where a hand-in falls (D6, D7). The boundary is inclusive: exactly extraSec counts as extra.
 * An extra window of 0 seconds turns the bonus off.
 */
export function handInStatus(ms, settings) {
  if (settings.extraSec > 0 && ms <= settings.extraSec * 1000) return "extra";
  if (ms <= settings.timeSec * 1000) return "inTime";
  return "late";
}

/** Remaining time as m:ss, rounded up, so 0:01 shows until the time is truly up. */
export function formatRemaining(ms) {
  return formatSeconds(Math.max(0, Math.ceil(ms / 1000)));
}

/** Elapsed time (a hand-in) as m:ss, rounded down: 18.9 s shows as 0:18. */
export function formatElapsed(ms) {
  return formatSeconds(Math.max(0, Math.floor(ms / 1000)));
}

function formatSeconds(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
