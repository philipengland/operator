import { describe, expect, it } from 'vitest';
import { defaultRules, evaluateLine } from './evaluate-line';

describe('evaluateLine', () => {
  it('adds the digits of a + line: 6 + 2 is 8', () => {
    expect(evaluateLine([6, 2], '+', defaultRules)).toEqual({ ok: true, value: 8 });
  });
});
