import { lineOperator } from './entry';
import { evaluateLine } from './evaluate-line';
import type { Digit, Entry, LineOutcome, LinePosition, LineWorking, Operator, Puzzle, Rules } from './types';

/** What one line works out to now (spec-002 FR-201, data-model "LineWorking"). */
export function lineWorking(puzzle: Puzzle, entry: Entry, line: LinePosition, rules: Rules): LineWorking {
  const digits = lineDigits(puzzle, entry, line);
  const operator = lineOperator(puzzle, entry, line);
  return { line, digits, operator, outcome: outcomeOf(digits, operator, rules) };
}

function outcomeOf(digits: readonly (Digit | null)[], operator: Operator | null, rules: Rules): LineOutcome {
  if (operator === null || !isComplete(digits)) {
    return { kind: 'incomplete' };
  }
  const result = evaluateLine(digits, operator, rules);
  return result.ok ? { kind: 'result', value: result.value, reachesTarget: true } : { kind: 'incomplete' };
}

function isComplete(digits: readonly (Digit | null)[]): digits is readonly Digit[] {
  return digits.every((digit) => digit !== null);
}

/** A line's digits in reading order: rows left to right, columns top to bottom. */
export function lineDigits(puzzle: Puzzle, entry: Entry, line: LinePosition): (Digit | null)[] {
  const length = line.axis === 'row' ? puzzle.columns : puzzle.rows;
  return Array.from({ length }, (_, step) => {
    const [row, column] = line.axis === 'row' ? [line.index, step] : [step, line.index];
    return puzzle.givens[row]?.[column] ?? entry.cells[row]?.[column] ?? null;
  });
}
