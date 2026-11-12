// The record of the day and preset last played, `operator.today` (docs/contracts/saved-solutions.md;
// spec-007 FR-715, research R10). Pure: the browser is reached only through the store it is given.

import { GENERATOR_VERSION, type CalendarDate, type PresetName } from '../engine';
import type { SolutionStore } from './solution-store';

export interface TodayRecord {
  readonly date: CalendarDate;
  readonly preset: PresetName;
}

/** What the phone says was last played: a record, none (a phone that has never played), or one that cannot be read. */
export type LastPlayed = TodayRecord | 'none' | 'unreadable';

const KEY = 'operator.today';
const FORMAT = 1;
// A calendar date as the engine takes it, "2026-11-10".
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EVERY_PRESET: readonly PresetName[] = ['easy', 'medium', 'hard', 'collector'];

export function writeTodayRecord(store: SolutionStore, { date, preset }: TodayRecord): void {
  store.write(KEY, JSON.stringify({ format: FORMAT, date, preset }));
}

export function readTodayRecord(store: SolutionStore): LastPlayed {
  const raw = store.read(KEY);
  if (raw === null) {
    return 'none';
  }
  try {
    const record: unknown = JSON.parse(raw);
    return isTodayRecord(record) ? { date: record.date, preset: record.preset } : 'unreadable';
  } catch {
    return 'unreadable';
  }
}

/** Read as untrusted (spec-006 research R3): this format, a calendar date and one of the four presets. */
function isTodayRecord(record: unknown): record is TodayRecord & { readonly format: number } {
  const { format, date, preset } = (record ?? {}) as Partial<Record<'format' | 'date' | 'preset', unknown>>;
  return format === FORMAT && CALENDAR_DATE.test(String(date)) && EVERY_PRESET.includes(preset as PresetName);
}

/** On a new day: the last day's found solutions are removed, as they cannot be reached again (FR-714). */
export function clearEarlierDay(store: SolutionStore, lastPlayed: LastPlayed, today: CalendarDate): void {
  if (typeof lastPlayed === 'string' || lastPlayed.date === today) {
    return;
  }
  for (const preset of EVERY_PRESET) {
    // The same key spec-006 saves a daily puzzle's solutions under (docs/contracts/saved-solutions.md).
    store.write(`operator.solutions.daily-${GENERATOR_VERSION}-${lastPlayed.date}-${preset}`, null);
  }
  writeTodayRecord(store, { date: today, preset: lastPlayed.preset });
}
