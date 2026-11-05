import type { Digit, LineResult, Operator, Rules } from './types';

export const defaultRules: Rules = { operatorOrder: 'left-to-right' };

const APPLY: Readonly<Record<Operator, (left: number, right: number) => number>> = {
  '+': (left, right) => left + right,
  '−': (left, right) => left - right,
  '×': (left, right) => left * right,
  '÷': (left, right) => left / right,
};

/**
 * Works out a line in reading order: rows left to right, columns top to bottom. The line fails
 * at the first step that does not divide exactly, even if a later step would reach the target
 * (spec-001 FR-008). Results may go below zero (spec-002 FR-208).
 */
export function evaluateLine(digits: readonly Digit[], operator: Operator, rules: Rules): LineResult {
  void rules;
  const [first = 0, ...rest] = digits;
  let value: number = first;
  for (const [index, digit] of rest.entries()) {
    if (operator === '÷' && value % digit !== 0) {
      return { ok: false, reason: 'inexact-division', step: index + 1 };
    }
    value = APPLY[operator](value, digit);
  }
  return { ok: true, value };
}
