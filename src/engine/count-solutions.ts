// spec-007 FR-706, research R4: how many distinct solutions a puzzle has, counting each open line's
// operators that reach its target, by a search with exact bounds per operator. It stops at 101 or
// after a fixed amount of work (never of time), so every device makes the same choice.

import { defaultRules, evaluateLine } from './evaluate-line';
import type { CellPosition, Digit, LineSpec, Operator, Puzzle } from './types';

export interface Count {
  /** Distinct solutions, up to 101; 101 means more than 100. */
  readonly count: number;
  /** False when the search ran out of work before it could finish. */
  readonly isWithinBudget: boolean;
}

/** spec-006 FR-616: past 100 the exact total is never shown, so the count stops at 101. */
export const MORE_THAN_100 = 101;

const OPERATORS: readonly Operator[] = ['+', '−', '×', '÷'];
const LARGEST_DIGIT = 9;
const DIGITS = Array.from({ length: LARGEST_DIGIT }, (_, index) => (index + 1) as Digit);

type Grid = (Digit | null)[][];

/** A row or a column: where its cells are, in reading order, and what it must reach. */
interface Line {
  readonly cells: readonly CellPosition[];
  readonly spec: LineSpec;
}

export function countSolutions(puzzle: Puzzle, workBudget: number): Count {
  return countUpTo(puzzle, workBudget, MORE_THAN_100);
}

/**
 * The count, stopping once it reaches `enough` (at most 101). A daily puzzle with more than its band
 * allows is dropped whatever the exact count, so the generator stops at one past the band: within the
 * band the search, its steps and its count are exactly those of `countSolutions` (research R12).
 */
export function countUpTo(puzzle: Puzzle, workBudget: number, enough: number): Count {
  const limit = Math.min(enough, MORE_THAN_100);
  const grid: Grid = puzzle.givens.map((row) => [...row]);
  const lines = linesOf(puzzle);
  const empties = grid.flatMap((row, rowIndex) => row.flatMap((digit, column) => (digit === null ? [{ row: rowIndex, column }] : [])));
  // Worked out once: only the lines through a cell can stop being reachable when it changes.
  const linesThrough = empties.map((cell) => lines.filter((line) => passesThrough(line, cell)));
  let count = 0;
  let steps = 0;
  const visit = (next: number): void => {
    const cell = empties[next];
    if (cell === undefined) {
      count = Math.min(limit, count + waysToReachEveryTarget(grid, lines));
      return;
    }
    const affected = linesThrough[next] ?? [];
    for (const digit of DIGITS) {
      if (count >= limit || ++steps > workBudget) {
        break;
      }
      setDigit(grid, cell, digit);
      if (affected.every((line) => canStillReach(grid, line))) {
        visit(next + 1);
      }
    }
    setDigit(grid, cell, null);
  };
  visit(0);
  return { count, isWithinBudget: steps <= workBudget };
}

function linesOf({ rows, columns, rowLines, columnLines }: Puzzle): readonly Line[] {
  const across = (row: number) => Array.from({ length: columns }, (_, column) => ({ row, column }));
  const down = (column: number) => Array.from({ length: rows }, (_, row) => ({ row, column }));
  return [...rowLines.map((spec, row) => ({ cells: across(row), spec })), ...columnLines.map((spec, column) => ({ cells: down(column), spec }))];
}

function passesThrough({ cells }: Line, { row, column }: CellPosition): boolean {
  return cells.some((cell) => cell.row === row && cell.column === column);
}

/** Whether some allowed operator can still reach the target, whatever digits the empty cells take (research R4). */
function canStillReach(grid: Grid, line: Line): boolean {
  const digits = known(line.cells.map(({ row, column }) => grid[row]?.[column] ?? null));
  if (digits.first !== null && digits.restEmpty === 0) {
    return operatorsReaching(grid, line) > 0;
  }
  const choices = line.spec.operator === 'open' ? OPERATORS : [line.spec.operator];
  return choices.some((operator) => REACH[operator](digits, line.spec.target));
}

/** The line's digits so far: the first (null while empty), and the rest, known and still to come. */
interface Known {
  readonly first: Digit | null;
  readonly restSum: number;
  readonly restProduct: number;
  readonly restEmpty: number;
}

function known(digits: readonly (Digit | null)[]): Known {
  let restSum = 0;
  let restProduct = 1;
  let restEmpty = 0;
  // One pass, with no new arrays: this runs for every line through every digit tried.
  for (let index = 1; index < digits.length; index++) {
    const digit = digits[index] ?? null;
    if (digit === null) {
      restEmpty++;
    } else {
      restSum += digit;
      restProduct *= digit;
    }
  }
  return { first: digits[0] ?? null, restSum, restProduct, restEmpty };
}

/** The largest product of `empty` digits. */
function mostFrom(empty: number): number {
  return LARGEST_DIGIT ** empty;
}

/** Each operator's exact test: can the line still reach the target? */
const REACH: Readonly<Record<Operator, (digits: Known, target: number) => boolean>> = {
  '+': (digits, target) => {
    const { first, restSum, restEmpty } = digits;
    const empty = restEmpty + (first === null ? 1 : 0);
    const sum = restSum + (first ?? 0);
    return target >= sum + empty && target <= sum + LARGEST_DIGIT * empty;
  },
  '−': (digits, target) => {
    const { first, restSum, restEmpty } = digits;
    const lowest = (first ?? 1) - restSum - LARGEST_DIGIT * restEmpty;
    const highest = (first ?? LARGEST_DIGIT) - restSum - restEmpty;
    return target >= lowest && target <= highest;
  },
  '×': (digits, target) => {
    const { first, restProduct, restEmpty } = digits;
    const product = restProduct * (first ?? 1);
    const empty = restEmpty + (first === null ? 1 : 0);
    return target > 0 && target % product === 0 && target / product <= mostFrom(empty);
  },
  '÷': (digits, target) => {
    const { first, restProduct, restEmpty } = digits;
    if (target <= 0) {
      return false;
    }
    if (first === null) {
      return target * restProduct <= LARGEST_DIGIT;
    }
    const quotient = first / (target * restProduct);
    return Number.isInteger(quotient) && quotient >= 1 && quotient <= mostFrom(restEmpty);
  },
};

function setDigit(grid: Grid, { row, column }: CellPosition, digit: Digit | null): void {
  const cells = grid[row];
  if (cells) {
    cells[column] = digit;
  }
}

/** For a full grid: how many choices of open operators make every line reach its target. */
function waysToReachEveryTarget(grid: Grid, lines: readonly Line[]): number {
  return lines.reduce((ways, line) => ways * operatorsReaching(grid, line), 1);
}

function operatorsReaching(grid: Grid, { cells, spec }: Line): number {
  const digits = cells.map(({ row, column }) => grid[row]?.[column] ?? null);
  if (digits.some((digit) => digit === null)) {
    return 0;
  }
  const choices = spec.operator === 'open' ? OPERATORS : [spec.operator];
  return choices.filter((operator) => {
    const result = evaluateLine(digits as Digit[], operator, defaultRules);
    return result.ok && result.value === spec.target;
  }).length;
}
