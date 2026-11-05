import { lineOperator } from './entry';
import { evaluateLine } from './evaluate-line';
import { lineSpec } from './puzzle';
import type { Digit, Entry, LineOutcome, LinePosition, LineWorking, Operator, Puzzle, Rules } from './types';

/** What one line works out to now (spec-002 FR-201, data-model "LineWorking"). */
export function lineWorking(puzzle: Puzzle, entry: Entry, line: LinePosition, rules: Rules): LineWorking {
  const digits = lineDigits(puzzle, entry, line);
  const operator = lineOperator(puzzle, entry, line);
  const target = lineSpec(puzzle, line)?.target;
  return { line, digits, operator, outcome: outcomeOf({ digits, operator, target }, rules) };
}

interface LineParts {
  readonly digits: readonly (Digit | null)[];
  readonly operator: Operator | null;
  readonly target: number | undefined;
}

function outcomeOf({ digits, operator, target }: LineParts, rules: Rules): LineOutcome {
  if (operator === null || !isComplete(digits)) {
    return { kind: 'incomplete' };
  }
  const result = evaluateLine(digits, operator, rules);
  if (!result.ok) {
    return { kind: 'not-whole', step: result.step };
  }
  return { kind: 'result', value: result.value, reachesTarget: result.value === target };
}

function isComplete(digits: readonly (Digit | null)[]): digits is readonly Digit[] {
  return digits.every((digit) => digit !== null);
}

/** A line's digits in reading order: rows left to right, columns top to bottom. */
function lineDigits(puzzle: Puzzle, entry: Entry, line: LinePosition): (Digit | null)[] {
  const length = line.axis === 'row' ? puzzle.columns : puzzle.rows;
  return Array.from({ length }, (_, step) => {
    const [row, column] = line.axis === 'row' ? [line.index, step] : [step, line.index];
    return puzzle.givens[row]?.[column] ?? entry.cells[row]?.[column] ?? null;
  });
}
