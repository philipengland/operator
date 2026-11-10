// spec-007: a day's puzzle for a preset, made from the date and the preset alone (research R2, R3).

import { emptyEntry } from './entry';
import { GENERATOR_VERSION, PRESETS } from './presets';
import type { CalendarDate, DailyPuzzle, PresetName, Puzzle } from './types';

export function dailyPuzzle(date: CalendarDate, preset: PresetName): DailyPuzzle {
  const { rows = 0, columns = 0 } = PRESETS[preset] ?? {};
  const puzzle: Puzzle = {
    id: `daily-${GENERATOR_VERSION}-${date}-${preset}`,
    seed: `${GENERATOR_VERSION}:${date}:${preset}`,
    preset,
    rows,
    columns,
    givens: Array.from({ length: rows }, () => Array.from({ length: columns }, () => null)),
    rowLines: [],
    columnLines: [],
    solutionCount: 0,
  };
  return { puzzle, builtFrom: emptyEntry(puzzle) };
}
