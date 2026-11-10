// spec-007: a day's puzzle for a preset, made from the date and the preset alone (research R2, R3).
// Every draw comes from one stream seeded by the date and preset, in a fixed order, so the same date
// gives the same puzzle on every phone and in every later v1 build.

import { countSolutions } from './count-solutions';
import { defaultRules, evaluateLine } from './evaluate-line';
import { GENERATOR_VERSION, PRESETS, type Between, type Preset } from './presets';
import { randomFrom, seedNumber, type Random } from './random';
import type { CalendarDate, CellPosition, DailyPuzzle, Digit, LineSpec, PresetName, Puzzle } from './types';

/** No date tested needs anywhere near this many; the sweep of 2027 proves it (research R3, R12). */
const MOST_CANDIDATES = 2_000;
const LARGEST_DIGIT = 9;

type Filling = readonly (readonly Digit[])[];

/** What names a daily puzzle: its version, date and preset (research R2). */
interface Identity {
  readonly id: string;
  readonly seed: string;
  readonly preset: PresetName;
}

export function dailyPuzzle(date: CalendarDate, presetName: PresetName): DailyPuzzle {
  const preset = PRESETS[presetName];
  if (preset === undefined) {
    throw new Error(`No preset named ${presetName}.`);
  }
  const identity: Identity = { id: `daily-${GENERATOR_VERSION}-${date}-${presetName}`, seed: `${GENERATOR_VERSION}:${date}:${presetName}`, preset: presetName };
  const random = randomFrom(seedNumber(identity.seed));
  for (let candidate = 0; candidate < MOST_CANDIDATES; candidate++) {
    const made = candidateFrom(random, preset, identity);
    if (made !== null) {
      return made;
    }
  }
  throw new Error(`No ${presetName} puzzle for ${date} within ${MOST_CANDIDATES} candidates.`);
}

/** One candidate, or null when it cannot meet the preset (FR-704). */
function candidateFrom(random: Random, preset: Preset, identity: Identity): DailyPuzzle | null {
  const filling = fill(random, preset);
  const rowLines = filling.map((digits) => lineFor(random, preset, digits));
  const columnLines = Array.from({ length: preset.columns }, (_, column) => lineFor(random, preset, filling.map((digits) => digits[column] ?? 1)));
  if (!isEveryLineMade(rowLines) || !isEveryLineMade(columnLines)) {
    return null;
  }
  const given = new Set(chooseSome(random, everyCell(preset), howMany(random, preset.givenCells)).map(({ row, column }) => `${row},${column}`));
  const unsolved: Puzzle = {
    ...identity,
    rows: preset.rows,
    columns: preset.columns,
    givens: filling.map((digits, row) => digits.map((digit, column) => (given.has(`${row},${column}`) ? digit : null))),
    rowLines,
    columnLines,
    solutionCount: 0,
  };
  // Step 5: keep it only if its count is within the band, counted within the preset's work (FR-706, FR-707).
  const { count, isWithinBudget } = countSolutions(unsolved, preset.workBudget);
  if (!isWithinBudget || count < preset.band.fewest || count > preset.band.most) {
    return null;
  }
  const puzzle: Puzzle = { ...unsolved, solutionCount: count };
  const noOperatorsChosen = (lines: readonly LineSpec[]) => lines.map(() => null);
  return { puzzle, builtFrom: { cells: filling, rowOperators: noOperatorsChosen(rowLines), columnOperators: noOperatorsChosen(columnLines) } };
}

/** Step 1: every cell a digit from 1 to 9, row by row. */
function fill(random: Random, { rows, columns }: Preset): Filling {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => (random.whole(LARGEST_DIGIT) + 1) as Digit));
}

/** Step 2: one of the preset's operators whose result is whole, not 0 and within its targets; null if none is. */
function lineFor(random: Random, { operators, targets }: Preset, digits: readonly Digit[]): LineSpec | null {
  const possible = operators.flatMap((operator) => {
    const result = evaluateLine(digits, operator, defaultRules);
    return result.ok && result.value !== 0 && result.value >= targets.lowest && result.value <= targets.highest ? [{ target: result.value, operator }] : [];
  });
  return possible.length === 0 ? null : (possible[random.whole(possible.length)] ?? null);
}

function everyCell({ rows, columns }: Preset): CellPosition[] {
  return Array.from({ length: rows * columns }, (_, index) => ({ row: Math.floor(index / columns), column: index % columns }));
}

/**
 * A number in the range. It draws nothing when the range holds one number, so a later step added to
 * the generator can never change a preset whose range it does not use (research R13).
 */
function howMany(random: Random, { fewest, most }: Between): number {
  return fewest === most ? fewest : fewest + random.whole(most - fewest + 1);
}

/** `count` of the items, each chosen in turn from those left: one draw each, none when `count` is 0. */
function chooseSome<Item>(random: Random, items: readonly Item[], count: number): Item[] {
  const left = [...items];
  return Array.from({ length: count }, () => left.splice(random.whole(left.length), 1)[0]).filter((item): item is Item => item !== undefined);
}

function isEveryLineMade(lines: readonly (LineSpec | null)[]): lines is readonly LineSpec[] {
  return lines.every((line) => line !== null);
}
