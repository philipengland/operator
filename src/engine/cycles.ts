import type { Digit, Operator } from './types';

const HIGHEST_DIGIT: Digit = 9;

/** Tapping a cell steps it: empty → 1 → 2 → … → 9 → empty (data-model "Cell value cycle"). */
export function nextCellValue(value: Digit | null): Digit | null {
  if (value === HIGHEST_DIGIT) {
    return null;
  }
  return ((value ?? 0) + 1) as Digit;
}

const OPERATOR_CYCLE: readonly Operator[] = ['+', '−', '×', '÷'];

/** Tapping an open operator steps it: not chosen → + → − → × → ÷ → + (FR-006). */
export function nextOperator(operator: Operator | null): Operator {
  if (operator === null) {
    return '+';
  }
  const next = (OPERATOR_CYCLE.indexOf(operator) + 1) % OPERATOR_CYCLE.length;
  return OPERATOR_CYCLE[next] ?? '+';
}
