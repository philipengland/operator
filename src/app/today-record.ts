// The record of the day and preset last played, `operator.today` (docs/contracts/saved-solutions.md;
// spec-007 FR-715, research R10). Pure: the browser is reached only through the store it is given.

import type { CalendarDate, PresetName } from '../engine';
import type { SolutionStore } from './solution-store';

export interface TodayRecord {
  readonly date: CalendarDate;
  readonly preset: PresetName;
}

const KEY = 'operator.today';
const FORMAT = 1;

export function writeTodayRecord(store: SolutionStore, { date, preset }: TodayRecord): void {
  store.write(KEY, JSON.stringify({ format: FORMAT, date, preset }));
}
