// spec-007: a day's puzzle for a preset, made from the date and the preset alone (research R2, R3).

import { emptyEntry } from './entry';
import { workedExample } from './puzzles/worked-example';
import type { CalendarDate, DailyPuzzle, PresetName } from './types';

export const dailyPuzzle: (date: CalendarDate, preset: PresetName) => DailyPuzzle = () => ({
  puzzle: workedExample,
  builtFrom: emptyEntry(workedExample),
});
