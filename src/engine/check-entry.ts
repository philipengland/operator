import { lineOperator } from './entry';
import { evaluateLine } from './evaluate-line';
import { lineDigits } from './line-working';
import { isGiven, lineSpec } from './puzzle';
import type { CellPosition, CheckResult, Digit, Entry, LinePosition, Puzzle, Rules, SolutionKey } from './types';

/**
 * Checks an entry by working out every line against its target (FR-008, FR-009). An entry with
 * a gap is incomplete and no line is worked out (FR-010).
 */
export function checkEntry(puzzle: Puzzle, entry: Entry, rules: Rules): CheckResult {
  const missingCells = emptyCells(puzzle, entry);
  const missingOperators = unchosenOperators(puzzle, entry);
  if (missingCells.length > 0 || missingOperators.length > 0) {
    return { kind: 'incomplete', missingCells, missingOperators };
  }
  const everyLineReachesTarget = allLines(puzzle).every((line) => reachesTarget(puzzle, entry, line, rules));
  return everyLineReachesTarget ? { kind: 'solved', key: solutionKey(puzzle, entry) } : { kind: 'not-solved' };
}

function emptyCells(puzzle: Puzzle, entry: Entry): CellPosition[] {
  return entry.cells.flatMap((cellsInRow, row) =>
    cellsInRow.flatMap((value, column) =>
      value === null && !isGiven(puzzle, { row, column }) ? [{ row, column }] : [],
    ),
  );
}

function unchosenOperators(puzzle: Puzzle, entry: Entry): LinePosition[] {
  return allLines(puzzle).filter((line) => lineOperator(puzzle, entry, line) === null);
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
  // checkEntry has already returned incomplete for any gap; this only narrows the types.
  if (operator === null || digits.some((digit) => digit === null)) {
    return false;
  }
  const result = evaluateLine(digits as Digit[], operator, rules);
  return result.ok && result.value === lineSpec(puzzle, line)?.target;
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
