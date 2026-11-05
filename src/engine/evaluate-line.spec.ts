import { describe, expect, it } from 'vitest';
import { defaultRules, evaluateLine } from './evaluate-line';

describe('evaluateLine', () => {
  it('adds the digits of a + line: 6 + 2 is 8', () => {
    expect(evaluateLine([6, 2], '+', defaultRules)).toEqual({ ok: true, value: 8 });
  });

  it.each([
    { digits: [6, 3], operator: '−', value: 3 },
    { digits: [2, 3], operator: '×', value: 6 },
    { digits: [6, 2], operator: '÷', value: 3 },
  ] as const)('works out $digits.0 $operator $digits.1 as $value', ({ digits, operator, value }) => {
    expect(evaluateLine(digits, operator, defaultRules)).toEqual({ ok: true, value });
  });

  it('works out a line that goes below zero: 6 − 9 is −3 (spec-002 FR-208)', () => {
    expect(evaluateLine([6, 9], '−', defaultRules)).toEqual({ ok: true, value: -3 });
  });

  it('fails a line at the step that does not divide exactly: 6 ÷ 4', () => {
    expect(evaluateLine([6, 4], '÷', defaultRules)).toEqual({ ok: false, reason: 'inexact-division', step: 1 });
  });
});
