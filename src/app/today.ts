// spec-007 FR-716, research R6: the day is the phone's own calendar date, changing at its local
// midnight. The clock is read here, at the app's edge; the engine is handed the date as text.

import type { CalendarDate } from '../engine';

const TWO_DIGITS = 2;

/** The local calendar date of this moment on the phone, "2026-11-10". */
export function dateOnThePhone(now: Date): CalendarDate {
  const twoDigits = (value: number) => String(value).padStart(TWO_DIGITS, '0');
  return `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`;
}
