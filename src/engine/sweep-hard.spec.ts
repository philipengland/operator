// spec-007 research R12: every date of 2027 with Hard, against its preset (AC-15, and AC-3's checks).

import { describe, expect, it } from 'vitest';
import { problemsOverYear } from './test-support/preset-sweep';

// A sweep takes seconds, not milliseconds; research R12 allows up to a minute.
const SWEEP_TIME_LIMIT_MS = 60_000;

describe('Hard on every date of 2027', () => {
  it('matches the Hard preset, has solutions within its band, every target whole and not 0, and its filling solves it (spec-007 AC-15)', () => {
    expect(problemsOverYear(2027, 'hard')).toEqual([]);
  }, SWEEP_TIME_LIMIT_MS);
});
