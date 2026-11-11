// spec-007 AC-3 and AC-11: what every daily puzzle of a preset must be, checked date by date (research R12).

import { checkEntry } from '../check-entry';
import { dailyPuzzle } from '../daily-puzzle';
import { defaultRules } from '../evaluate-line';
import { PRESETS } from '../presets';
import type { PresetName } from '../types';
import { everyDateOf } from './dates';

/** Each date of the year that breaks its preset, with the check it fails, e.g. "2027-03-01: open lines". */
export function problemsOverYear(year: number, presetName: PresetName): readonly string[] {
  const preset = PRESETS[presetName];
  if (preset === undefined) {
    return [`no preset named ${presetName}`];
  }
  return everyDateOf(year).flatMap((date) => {
    const { puzzle, builtFrom } = dailyPuzzle(date, presetName);
    const lines = [...puzzle.rowLines, ...puzzle.columnLines];
    const open = lines.filter((line) => line.operator === 'open').length;
    const given = puzzle.givens.flat().filter((digit) => digit !== null).length;
    const isBetween = (value: number, { fewest, most }: { fewest: number; most: number }) => value >= fewest && value <= most;
    const checks = {
      size: puzzle.rows === preset.rows && puzzle.columns === preset.columns,
      operators: lines.every(({ operator }) => operator === 'open' || preset.operators.includes(operator)),
      'open lines': isBetween(open, preset.openLines),
      'given cells': isBetween(given, preset.givenCells),
      'targets whole, in range and not 0': lines.every(
        ({ target }) => Number.isInteger(target) && target !== 0 && target >= preset.targets.lowest && target <= preset.targets.highest,
      ),
      'solutions within the band': isBetween(puzzle.solutionCount, preset.band),
      'solved by its filling': checkEntry(puzzle, builtFrom, defaultRules).kind === 'solved',
    };
    return Object.entries(checks).flatMap(([check, passes]) => (passes ? [] : [`${date}: ${check}`]));
  });
}
