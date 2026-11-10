// For tests only (spec-007 AC-5): a puzzle's solutions counted the slow, obvious way, by trying every
// filling of its empty cells and, for each, every operator on each open line. No bounds and no early
// stop: the search in count-solutions.ts must always agree with it.

import { defaultRules, evaluateLine } from '../evaluate-line';
import type { Digit, LineSpec, Operator, Puzzle } from '../types';

const OPERATORS: readonly Operator[] = ['+', '−', '×', '÷'];
const LARGEST_DIGIT = 9;
const DIGITS = Array.from({ length: LARGEST_DIGIT }, (_, index) => (index + 1) as Digit);

export function countEveryFilling(puzzle: Puzzle): number {
  const grid = puzzle.givens.map((row) => [...row]);
  const empties = grid.flatMap((row, rowIndex) => row.flatMap((digit, column) => (digit === null ? [{ row: rowIndex, column }] : [])));
  const tryEvery = (next: number): number => {
    const cell = empties[next];
    if (cell === undefined) {
      return solutionsWith(puzzle, grid as Digit[][]);
    }
    let count = 0;
    for (const digit of DIGITS) {
      (grid[cell.row] ?? [])[cell.column] = digit;
      count += tryEvery(next + 1);
    }
    return count;
  };
  return tryEvery(0);
}

/** For a full grid: each line's operators that reach its target, multiplied together. */
function solutionsWith(puzzle: Puzzle, grid: Digit[][]): number {
  const rows = puzzle.rowLines.map((spec, row) => reaching(grid[row] ?? [], spec));
  const columns = puzzle.columnLines.map((spec, column) => reaching(grid.map((digits) => digits[column] ?? 1), spec));
  return [...rows, ...columns].reduce((ways, each) => ways * each, 1);
}

function reaching(digits: readonly Digit[], { target, operator }: LineSpec): number {
  return (operator === 'open' ? OPERATORS : [operator]).filter((each) => {
    const result = evaluateLine(digits, each, defaultRules);
    return result.ok && result.value === target;
  }).length;
}
