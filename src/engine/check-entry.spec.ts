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

  it('is incomplete, naming the cell, when a changeable cell is empty', () => {
    const bottomRightEmpty: Entry = { ...solutionA, cells: [[null, 2], [2, null]] };

    expect(checkEntry(workedExample, bottomRightEmpty, defaultRules)).toEqual({
      kind: 'incomplete',
      missingCells: [{ row: 1, column: 1 }],
      missingOperators: [],
    });
  });

  it('is incomplete, naming the line, when an open operator is not chosen', () => {
    const column1NotChosen: Entry = { ...solutionA, columnOperators: [null, null] };

    expect(checkEntry(workedExample, column1NotChosen, defaultRules)).toEqual({
      kind: 'incomplete',
      missingCells: [],
      missingOperators: [{ axis: 'column', index: 0 }],
    });
  });
});
