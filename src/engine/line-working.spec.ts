import { describe, expect, it } from 'vitest';
import { emptyEntry } from './entry';
import { defaultRules } from './evaluate-line';
import { lineWorking } from './line-working';
import { workedExample } from './puzzles/worked-example';
import type { Digit, Entry, LinePosition, Puzzle } from './types';

const ROW_1: LinePosition = { axis: 'row', index: 0 };

/** The worked example with only the top-right cell filled in. */
function topRight(digit: Digit): Entry {
  return { ...emptyEntry(workedExample), cells: [[null, digit], [null, null]] };
}

describe('lineWorking', () => {
  it('gives Row 1 on opening as 6, an empty cell and +, with no result yet', () => {
    const working = lineWorking(workedExample, emptyEntry(workedExample), ROW_1, defaultRules);

    expect(working).toEqual({ line: ROW_1, digits: [6, null], operator: '+', outcome: { kind: 'incomplete' } });
  });

  it('works out Row 1 as 6 + 2 = 8 once top-right is 2, reaching its target of 8', () => {
    const working = lineWorking(workedExample, topRight(2), ROW_1, defaultRules);

    expect(working.outcome).toEqual({ kind: 'result', value: 8, reachesTarget: true });
  });

  it('works out Row 1 as 6 + 3 = 9 once top-right is 3, missing its target of 8', () => {
    const working = lineWorking(workedExample, topRight(3), ROW_1, defaultRules);

    expect(working.outcome).toEqual({ kind: 'result', value: 9, reachesTarget: false });
  });

  it('reports Column 1 as not whole at step 1 when bottom-left is 4 and Column 1 is ÷: 6 ÷ 4', () => {
    const entry: Entry = { ...emptyEntry(workedExample), cells: [[null, null], [4, null]], columnOperators: ['÷', null] };

    const working = lineWorking(workedExample, entry, { axis: 'column', index: 0 }, defaultRules);

    expect(working.outcome).toEqual({ kind: 'not-whole', step: 1 });
  });

  describe("a negative target (spec-002 AC-12, unit tests only by the owner's option A)", () => {
    // One row, 6 − ?, target −3. F0's puzzle has no negative target, so this test puzzle has one.
    const negativeTarget: Puzzle = {
      rows: 1,
      columns: 2,
      givens: [[6, null]],
      rowLines: [{ target: -3, operator: '−' }],
      columnLines: [
        { target: 6, operator: '+' },
        { target: 9, operator: '+' },
      ],
      solutionCount: 1,
    };
    const secondDigit = (digit: Digit): Entry => ({ cells: [[null, digit]], rowOperators: [null], columnOperators: [null, null] });

    it('reaches −3 with 6 − 9', () => {
      const working = lineWorking(negativeTarget, secondDigit(9), ROW_1, defaultRules);

      expect(working.outcome).toEqual({ kind: 'result', value: -3, reachesTarget: true });
    });

    it('misses −3 with 6 − 8, which gives −2', () => {
      const working = lineWorking(negativeTarget, secondDigit(8), ROW_1, defaultRules);

      expect(working.outcome).toEqual({ kind: 'result', value: -2, reachesTarget: false });
    });
  });
});
