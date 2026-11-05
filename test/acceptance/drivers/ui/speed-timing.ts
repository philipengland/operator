// Layer 3 — timings recorded inside the page for the speed budgets (SC-003, SC-004).
// Installed before the game's own scripts run; times are milliseconds from navigation start.

export interface SpeedTimings {
  /** When the puzzle first appeared, or null if it never did. */
  readyAt: number | null;
  /** For each tap, the time until the first frame after the screen changed; null if it never changed. */
  tapResponses: (number | null)[];
}

export const SPEED_TIMINGS = 'operatorSpeedTimings';

/**
 * Runs in the page. Ready to play is when the puzzle group exists: the game builds the grid
 * and attaches its tap handlers in the same task. A tap is answered when an accessible name
 * or the status text changes and the next frame is drawn.
 */
export function recordSpeedTimings(timingsName: string): void {
  const timings: SpeedTimings = { readyAt: null, tapResponses: [] };
  Object.assign(window, { [timingsName]: timings });
  let waitingTap: { index: number; startedAt: number } | null = null;

  document.addEventListener(
    'click',
    (event) => {
      waitingTap = { index: timings.tapResponses.push(null) - 1, startedAt: event.timeStamp };
    },
    { capture: true },
  );

  new MutationObserver(() => {
    if (timings.readyAt === null && document.querySelector('[role="group"][aria-label="Puzzle"]')) {
      timings.readyAt = performance.now();
    }
    const tap = waitingTap;
    if (tap === null) {
      return;
    }
    waitingTap = null;
    // Not the callback's frame time: Chromium handles input at the start of a frame, so that
    // time can come before the tap's handler ran and would leave the handler's work uncounted.
    requestAnimationFrame(() => {
      timings.tapResponses[tap.index] = performance.now() - tap.startedAt;
    });
  }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] });
}
