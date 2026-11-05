import { describe, expect, it } from 'vitest';
import { emptyEntry } from './entry';
import { defaultRules } from './evaluate-line';
import { lineWorking } from './line-working';
import { workedExample } from './puzzles/worked-example';
import type { LinePosition } from './types';

const ROW_1: LinePosition = { axis: 'row', index: 0 };

describe('lineWorking', () => {
  it('gives Row 1 on opening as 6, an empty cell and +, with no result yet', () => {
    const working = lineWorking(workedExample, emptyEntry(workedExample), ROW_1, defaultRules);

    expect(working).toEqual({ line: ROW_1, digits: [6, null], operator: '+', outcome: { kind: 'incomplete' } });
  });
});
