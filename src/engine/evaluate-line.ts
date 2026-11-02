import type { Digit, LineResult, Operator, Rules } from './types';

export const defaultRules: Rules = { operatorOrder: 'left-to-right' };

export function evaluateLine(digits: readonly Digit[], operator: Operator, rules: Rules): LineResult {
  void operator;
  void rules;
  return { ok: true, value: digits.reduce((total, digit) => total + digit, 0) };
}
