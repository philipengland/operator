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
  const grid: Grid = puzzle.givens.map((row) => [...row]);
  const lines = linesOf(puzzle);
  const empties = grid.flatMap((row, rowIndex) => row.flatMap((digit, column) => (digit === null ? [{ row: rowIndex, column }] : [])));
  let count = 0;
  let steps = 0;
  const visit = (next: number): void => {
    const cell = empties[next];
    if (cell === undefined) {
      count = Math.min(MORE_THAN_100, count + waysToReachEveryTarget(grid, lines));
      return;
    }
    for (const digit of DIGITS) {
      if (count >= MORE_THAN_100 || ++steps > workBudget) {
        break;
      }
      setDigit(grid, cell, digit);
      visit(next + 1);
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
