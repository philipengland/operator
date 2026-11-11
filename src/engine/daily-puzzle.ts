// spec-007: a day's puzzle for a preset, made from the date and the preset alone (research R2, R3).
// Every draw comes from one stream seeded by the date and preset, in a fixed order, so the same date
// gives the same puzzle on every phone and in every later v1 build.

import { countUpTo } from './count-solutions';
import { defaultRules, evaluateLine } from './evaluate-line';
import { GENERATOR_VERSION, PRESETS, type Between, type Preset } from './presets';
import { randomFrom, seedNumber, type Random } from './random';
import type { CalendarDate, CellPosition, DailyPuzzle, Digit, LineSpec, Operator, PresetName, Puzzle } from './types';

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
  if (!isCalendarDate(date)) {
    throw new Error(`"${date}" is not a calendar date written YYYY-MM-DD.`);
  }
  const preset = PRESETS[presetName];
  if (preset === undefined) {
    throw new Error(`No preset named ${presetName}.`);
  }
  return puzzleFor(date, presetName, preset);
}

/** The generator's core, with the preset as data, so tests can give it presets no player meets. */
export function puzzleFor(date: CalendarDate, presetName: PresetName, preset: Preset): DailyPuzzle {
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

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS_IN_MONTH: Readonly<Record<string, number>> = {
  '01': 31,
  '02': 28,
  '03': 31,
  '04': 30,
  '05': 31,
  '06': 30,
  '07': 31,
  '08': 31,
  '09': 30,
  '10': 31,
  '11': 30,
  '12': 31,
};
const FEBRUARY = '02';
const LEAP_EVERY = 4;
const NO_LEAP_EVERY = 100;
const LEAP_AFTER_ALL_EVERY = 400;

/** A date that exists, written YYYY-MM-DD (data-model.md, CalendarDate). The engine reads no clock. */
function isCalendarDate(text: string): boolean {
  const [, year = '', month = '', day = ''] = CALENDAR_DATE.exec(text) ?? [];
  const days = (DAYS_IN_MONTH[month] ?? 0) + (month === FEBRUARY && isLeapYear(Number(year)) ? 1 : 0);
  return Number(day) >= 1 && Number(day) <= days;
}

function isLeapYear(year: number): boolean {
  return (year % LEAP_EVERY === 0 && year % NO_LEAP_EVERY !== 0) || year % LEAP_AFTER_ALL_EVERY === 0;
}

/** One candidate, or null when it cannot meet the preset (FR-704). */
function candidateFrom(random: Random, preset: Preset, identity: Identity): DailyPuzzle | null {
  const filling = fill(random, preset);
  const rowLines = filling.map((digits) => lineFor(random, preset, digits));
  const columnLines = columnsOf(filling).map((digits) => lineFor(random, preset, digits));
  if (!isEveryLineMade(rowLines) || !isEveryLineMade(columnLines)) {
    return null;
  }
  const lines = withOpenLines(random, preset, { rowLines, columnLines });
  const given = new Set(chooseSome(random, everyCell(preset), howMany(random, preset.givenCells)).map(({ row, column }) => `${row},${column}`));
  const unsolved: Puzzle = {
    ...identity,
    rows: preset.rows,
    columns: preset.columns,
    givens: filling.map((digits, row) => digits.map((digit, column) => (given.has(`${row},${column}`) ? digit : null))),
    ...lines,
    solutionCount: 0,
  };
  // Step 5: keep it only if its count is within the band, counted within the preset's work (FR-706, FR-707).
  const { count, isWithinBudget } = countUpTo(unsolved, preset.workBudget, preset.band.most + 1);
  if (!isWithinBudget || count < preset.band.fewest || count > preset.band.most) {
    return null;
  }
  const puzzle: Puzzle = { ...unsolved, solutionCount: count };
  return {
    puzzle,
    builtFrom: { cells: filling, rowOperators: operatorsChosen(lines.rowLines, rowLines), columnOperators: operatorsChosen(lines.columnLines, columnLines) },
  };
}

interface Lines {
  readonly rowLines: readonly LineSpec[];
  readonly columnLines: readonly LineSpec[];
}

/** Step 3: as many lines as the preset says, rows then columns counted together, opened for the player to choose (R3). */
function withOpenLines(random: Random, preset: Preset, { rowLines, columnLines }: Lines): Lines {
  const everyLine = Array.from({ length: rowLines.length + columnLines.length }, (_, index) => index);
  const opened = new Set(chooseSome(random, everyLine, howMany(random, preset.openLines)));
  const open = (line: LineSpec, index: number): LineSpec => (opened.has(index) ? { ...line, operator: 'open' } : line);
  return { rowLines: rowLines.map(open), columnLines: columnLines.map((line, index) => open(line, rowLines.length + index)) };
}

/** What the player would choose to match the filling: each open line's operator as drawn; nothing for a shown line. */
function operatorsChosen(shown: readonly LineSpec[], drawn: readonly LineSpec[]): (Operator | null)[] {
  return shown.map((line, index) => {
    const operator = drawn[index]?.operator;
    return line.operator === 'open' && operator !== undefined && operator !== 'open' ? operator : null;
  });
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

/** The filling read down each column, top to bottom. */
function columnsOf(filling: Filling): readonly (readonly Digit[])[] {
  return (filling[0] ?? []).map((_, column) => filling.flatMap((digits) => digits.slice(column, column + 1)));
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
