// Layer 3 — one game played in-process, shared by the engine's game and daily drivers, as one phone
// shares one game between what the scenarios do through each (spec-007 AC-22).

import { startDaily, type DailyState } from '../../../../src/app/daily';
import { startSession, type SessionState } from '../../../../src/app/session';

// A scenario that never sets the phone's date still plays on some day.
const ANY_DAY = '2026-11-10';

export class EngineGame {
  /** The phone's date, as the game's date text. */
  date = ANY_DAY;
  daily: DailyState | null = null;

  open(): void {
    this.daily = startDaily(this.date, startSession());
  }

  /** The puzzle on the play screen. */
  get session(): SessionState | null {
    return this.daily?.session ?? null;
  }

  set session(session: SessionState | null) {
    if (this.daily !== null && session !== null) {
      this.daily = { ...this.daily, session };
    }
  }
}
