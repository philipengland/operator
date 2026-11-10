// Layer 3 — the scenarios' calendar days ("10 November 2026") as the game's date text ("2026-11-10").

import type { CalendarDay } from '../dsl/daily-vocabulary';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface DayParts {
  readonly year: number;
  /** 1 for January. */
  readonly month: number;
  readonly date: number;
}

export function dayParts(day: CalendarDay): DayParts {
  const [date = '', month = '', year = ''] = day.split(' ');
  return { year: Number(year), month: MONTHS.indexOf(month) + 1, date: Number(date) };
}

/** "10 November 2026" → "2026-11-10". */
export function dateText(day: CalendarDay): string {
  const { year, month, date } = dayParts(day);
  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}
