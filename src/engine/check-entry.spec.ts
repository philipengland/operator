import { describe, expect, it } from 'vitest';
import { checkEntry } from './check-entry';
import { defaultRules } from './evaluate-line';
import { workedExample } from './puzzles/worked-example';
import type { Entry } from './types';

// Solution A from spec-001's examples: top-right 2, bottom-left 2, bottom-right 3, Row 2 ×, Column 1 ÷.
const solutionA: Entry = {
  cells: [
    [null, 2],
    [2, 3],
  ],
  rowOperators: [null, '×'],
  columnOperators: ['÷', null],
};

describe('checkEntry', () => {
  it('finds Solution A solved, keyed by its entered digits and chosen operators', () => {
    expect(checkEntry(workedExample, solutionA, defaultRules)).toEqual({ kind: 'solved', key: '2,2,3|×|÷' });
  });
});
