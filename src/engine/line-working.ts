import { lineOperator } from './entry';
import type { Digit, Entry, LinePosition, LineWorking, Puzzle, Rules } from './types';

/** What one line works out to now (spec-002 FR-201, data-model "LineWorking"). */
export function lineWorking(puzzle: Puzzle, entry: Entry, line: LinePosition, rules: Rules): LineWorking {
  void rules;
  return {
    line,
    digits: lineDigits(puzzle, entry, line),
    operator: lineOperator(puzzle, entry, line),
    outcome: { kind: 'incomplete' },
  };
}

/** A line's digits in reading order: rows left to right, columns top to bottom. */
export function lineDigits(puzzle: Puzzle, entry: Entry, line: LinePosition): (Digit | null)[] {
  const length = line.axis === 'row' ? puzzle.columns : puzzle.rows;
  return Array.from({ length }, (_, step) => {
    const [row, column] = line.axis === 'row' ? [line.index, step] : [step, line.index];
    return puzzle.givens[row]?.[column] ?? entry.cells[row]?.[column] ?? null;
  });
}
