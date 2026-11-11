// Layer 3 — the first solutions of a daily puzzle, found by the drivers' own search from the puzzle as the
// player sees it (spec-007 T038). Never from the engine: a scenario that finds solutions must not depend on
// the code it is checking. The arithmetic is the game's rule (spec-002): left to right, results may go
// below zero, and a division must come out whole.

import type { DailyLine, DailyPuzzle, LineOperator } from '../dsl/daily-vocabulary';
import type { Digit, Operator } from '../dsl/vocabulary';

/** A solution as the player enters it: a digit for each cell they fill, an operator for each open line. */
export interface FoundSolution {
  readonly cells: readonly (readonly (Digit | null)[])[];
  readonly rowOperators: readonly (Operator | null)[];
  readonly columnOperators: readonly (Operator | null)[];
}

const OPERATORS: readonly Operator[] = ['+', '−', '×', '÷'];
const DIGITS: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** A line's value with one operator, or null when a division is not whole. */
function valueOf(digits: readonly Digit[], operator: Operator): number | null {
  let value: number = digits[0] ?? 0;
  for (const digit of digits.slice(1)) {
    if (operator === '÷' && value % digit !== 0) {
      return null;
    }
    value = operator === '+' ? value + digit : operator === '−' ? value - digit : operator === '×' ? value * digit : value / digit;
  }
  return value;
}

/** The operators that take these digits to the line's target: its own, or any of the four when it is open. */
function operatorsReaching(digits: readonly Digit[], { target, operator }: DailyLine): readonly (Operator | null)[] {
  const allowed: readonly Operator[] = operator === 'open' ? OPERATORS : [operator as Exclude<LineOperator, 'open'>];
  const reaching = allowed.filter((each) => valueOf(digits, each) === target);
  return operator === 'open' ? reaching : reaching.map(() => null);
}

/** Every way to fill one row: its given digits kept, its other cells 1 to 9. */
function rowFillings(givens: readonly (Digit | null)[]): Digit[][] {
  return givens.reduce<Digit[][]>(
    (fillings, given) => fillings.flatMap((filling) => (given === null ? DIGITS : [given]).map((digit) => [...filling, digit])),
    [[]],
  );
}

/** Each choice from every list in turn: [[a, b], [c]] gives [a, c] and [b, c]. */
function everyCombination<Item>(lists: readonly (readonly Item[])[]): Item[][] {
  return lists.reduce<Item[][]>((combinations, list) => combinations.flatMap((combination) => list.map((item) => [...combination, item])), [[]]);
}

/** The first `wanted` solutions, in a fixed order: rows filled top to bottom, digits from 1 up. */
export function firstSolutions(puzzle: DailyPuzzle, wanted: number): FoundSolution[] {
  const givens = puzzle.cells.map((row) => row.map((cell) => cell.given));
  const rowChoices = givens.map((row, index) =>
    rowFillings(row).flatMap((digits) => {
      const operators = operatorsReaching(digits, puzzle.rowLines[index] ?? { target: Number.NaN, operator: 'open' });
      return operators.length === 0 ? [] : [{ digits, operators }];
    }),
  );
  const found: FoundSolution[] = [];
  const search = (row: number, chosen: readonly (typeof rowChoices)[number][number][]): void => {
    if (found.length >= wanted) {
      return;
    }
    if (row === puzzle.rows) {
      found.push(...solutionsOf(puzzle, givens, chosen).slice(0, wanted - found.length));
      return;
    }
    for (const choice of rowChoices[row] ?? []) {
      search(row + 1, [...chosen, choice]);
    }
  };
  search(0, []);
  return found;
}

/** Every solution one filling gives: each open line's operators that reach its target, in combination. */
function solutionsOf(
  puzzle: DailyPuzzle,
  givens: readonly (readonly (Digit | null)[])[],
  chosen: readonly { readonly digits: readonly Digit[]; readonly operators: readonly (Operator | null)[] }[],
): FoundSolution[] {
  const columnOperators = puzzle.columnLines.map((line, column) =>
    operatorsReaching(
      chosen.map(({ digits }) => digits[column] ?? 1),
      line,
    ),
  );
  if (columnOperators.some((operators) => operators.length === 0)) {
    return [];
  }
  const cells = chosen.map(({ digits }, row) => digits.map((digit, column) => (givens[row]?.[column] === null ? digit : null)));
  return everyCombination(chosen.map(({ operators }) => operators)).flatMap((rowOperators) =>
    everyCombination(columnOperators).map((columns) => ({ cells, rowOperators, columnOperators: columns })),
  );
}
