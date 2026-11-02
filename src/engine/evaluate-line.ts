import type { Digit, LineResult, Operator, Rules } from './types';

export const defaultRules: Rules = { operatorOrder: 'left-to-right' };

const APPLY: Readonly<Record<Operator, (left: number, right: number) => number>> = {
  '+': (left, right) => left + right,
  '−': (left, right) => left - right,
  '×': (left, right) => left * right,
  '÷': (left, right) => left / right,
};

/** Works out a line in reading order: rows left to right, columns top to bottom (FR-008). */
export function evaluateLine(digits: readonly Digit[], operator: Operator, rules: Rules): LineResult {
  void rules;
  const [first = 0, ...rest] = digits;
  return { ok: true, value: rest.reduce((total, digit) => APPLY[operator](total, digit), first) };
}
