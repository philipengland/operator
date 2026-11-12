// The record of the day and preset last played, `operator.today` (docs/contracts/saved-solutions.md;
// spec-007 FR-715, research R10). Pure: the browser is reached only through the store it is given.

import type { CalendarDate, PresetName } from '../engine';
import type { SolutionStore } from './solution-store';

export interface TodayRecord {
  readonly date: CalendarDate;
  readonly preset: PresetName;
}

/** What the phone says was last played: a record, none (a phone that has never played), or one that cannot be read. */
export type LastPlayed = TodayRecord | 'none' | 'unreadable';

const KEY = 'operator.today';
const FORMAT = 1;

export function writeTodayRecord(store: SolutionStore, { date, preset }: TodayRecord): void {
  store.write(KEY, JSON.stringify({ format: FORMAT, date, preset }));
}

export function readTodayRecord(store: SolutionStore): LastPlayed {
  const raw = store.read(KEY);
  if (raw === null) {
    return 'none';
  }
  const { date, preset } = JSON.parse(raw) as TodayRecord;
  return { date, preset };
}
