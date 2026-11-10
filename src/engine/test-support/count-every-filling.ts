// For tests only (spec-007 AC-5): a puzzle's solutions counted the slow, obvious way, by trying every
// filling of its empty cells and every operator on its open lines. The search in count-solutions.ts
// must always agree with it.

import { checkEntry } from '../check-entry';
import { emptyEntry } from '../entry';
import { defaultRules } from '../evaluate-line';
import type { Digit, Entry, Operator, Puzzle } from '../types';

const OPERATORS: readonly Operator[] = ['+', '−', '×', '÷'];
const LARGEST_DIGIT = 9;
const DIGITS = Array.from({ length: LARGEST_DIGIT }, (_, index) => (index + 1) as Digit);

export function countEveryFilling(puzzle: Puzzle): number {
  const empties = puzzle.givens.flatMap((row, rowIndex) => row.flatMap((digit, column) => (digit === null ? [{ row: rowIndex, column }] : [])));
  const fillings = empties.reduce<Digit[][]>((sofar) => sofar.flatMap((digits) => DIGITS.map((digit) => [...digits, digit])), [[]]);
  const openLines = (lines: Puzzle['rowLines']) => lines.map((line) => line.operator === 'open');
  const rowChoices = choicesFor(openLines(puzzle.rowLines));
  const columnChoices = choicesFor(openLines(puzzle.columnLines));
  let count = 0;
  for (const digits of fillings) {
    const cells = puzzle.givens.map((row) => [...row]);
    empties.forEach(({ row, column }, index) => {
      (cells[row] ?? [])[column] = digits[index] ?? null;
    });
    for (const rowOperators of rowChoices) {
      for (const columnOperators of columnChoices) {
        const entry: Entry = { ...emptyEntry(puzzle), cells, rowOperators, columnOperators };
        count += checkEntry(puzzle, entry, defaultRules).kind === 'solved' ? 1 : 0;
      }
    }
  }
  return count;
}

/** Every choice of operators for lines that are open; a shown line's place holds null. */
function choicesFor(isOpen: readonly boolean[]): (Operator | null)[][] {
  return isOpen.reduce<(Operator | null)[][]>((sofar, open) => sofar.flatMap((choice) => (open ? OPERATORS : [null]).map((operator) => [...choice, operator])), [[]]);
}
