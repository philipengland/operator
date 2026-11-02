import { lineOperator } from './entry';
import { evaluateLine } from './evaluate-line';
import { isGiven, lineSpec } from './puzzle';
import type { CheckResult, Digit, Entry, LinePosition, Puzzle, Rules, SolutionKey } from './types';

/** Checks an entry by working out every line against its target (FR-008, FR-009). */
export function checkEntry(puzzle: Puzzle, entry: Entry, rules: Rules): CheckResult {
  const everyLineReachesTarget = allLines(puzzle).every((line) => reachesTarget(puzzle, entry, line, rules));
  return everyLineReachesTarget ? { kind: 'solved', key: solutionKey(puzzle, entry) } : { kind: 'not-solved' };
}

function allLines(puzzle: Puzzle): LinePosition[] {
  return [
    ...puzzle.rowLines.map((_, index): LinePosition => ({ axis: 'row', index })),
    ...puzzle.columnLines.map((_, index): LinePosition => ({ axis: 'column', index })),
  ];
}

function reachesTarget(puzzle: Puzzle, entry: Entry, line: LinePosition, rules: Rules): boolean {
  const digits = lineDigits(puzzle, entry, line);
  const operator = lineOperator(puzzle, entry, line);
  // A gap is treated as missing the target here; AC-11 makes it its own result.
  if (operator === null || digits.some((digit) => digit === null)) {
    return false;
  }
  const result = evaluateLine(digits as Digit[], operator, rules);
  return result.ok && result.value === lineSpec(puzzle, line)?.target;
}

/** A line's digits in reading order: rows left to right, columns top to bottom. */
function lineDigits(puzzle: Puzzle, entry: Entry, line: LinePosition): (Digit | null)[] {
  const length = line.axis === 'row' ? puzzle.columns : puzzle.rows;
  return Array.from({ length }, (_, step) => {
    const [row, column] = line.axis === 'row' ? [line.index, step] : [step, line.index];
    return puzzle.givens[row]?.[column] ?? entry.cells[row]?.[column] ?? null;
  });
}

/**
 * The entered digits in reading order, then the open rows' operators, then the open columns'
 * (data-model "SolutionKey"). Given digits and shown operators are the same in every entry.
 */
function solutionKey(puzzle: Puzzle, entry: Entry): SolutionKey {
  const enteredDigits = entry.cells.flatMap((cellsInRow, row) =>
    cellsInRow.filter((_, column) => !isGiven(puzzle, { row, column })),
  );
  const openChoices = (axis: LinePosition['axis'], operators: Entry['rowOperators']) =>
    operators.filter((_, index) => lineSpec(puzzle, { axis, index })?.operator === 'open');
  return [
    enteredDigits.join(','),
    openChoices('row', entry.rowOperators).join(','),
    openChoices('column', entry.columnOperators).join(','),
  ].join('|') as SolutionKey;
}
