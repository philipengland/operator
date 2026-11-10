import { describe, expect, it } from 'vitest';
import { countSolutions } from './count-solutions';
import { workedExample } from './puzzles/worked-example';
import { countEveryFilling } from './test-support/count-every-filling';
import type { Puzzle } from './types';

const PLENTY_OF_WORK = 1_000_000;

/**
 * An Easy-sized puzzle made from the filling 2 7 4 / 5 1 8 / 9 3 6, with four cells given and every
 * operator shown: rows + 13, + 14, + 18; columns + 16, − 3, + 18.
 */
const EASY_SIZED: Puzzle = {
  id: 'easy-sized',
  rows: 3,
  columns: 3,
  givens: [
    [2, null, 4],
    [null, 1, null],
    [null, null, 6],
  ],
  rowLines: [
    { target: 13, operator: '+' },
    { target: 14, operator: '+' },
    { target: 18, operator: '+' },
  ],
  columnLines: [
    { target: 16, operator: '+' },
    { target: 3, operator: '−' },
    { target: 18, operator: '+' },
  ],
  solutionCount: 0,
};

/** A 2 × 2 puzzle with every line open and one cell given, so ÷ and − are in play. */
const ALL_OPEN: Puzzle = {
  id: 'all-open',
  rows: 2,
  columns: 2,
  givens: [
    [8, null],
    [null, null],
  ],
  rowLines: [
    { target: 4, operator: 'open' },
    { target: 6, operator: 'open' },
  ],
  columnLines: [
    { target: 2, operator: 'open' },
    { target: 3, operator: 'open' },
  ],
  solutionCount: 0,
};

describe('countSolutions', () => {
  it("counts the worked example's two solutions, within its budget", () => {
    expect(countSolutions(workedExample, PLENTY_OF_WORK)).toEqual({ count: 2, isWithinBudget: true });
  });

  it('gives up on a line as soon as it cannot reach its target, so an Easy-sized puzzle needs little work', () => {
    const everyFilling = countSolutions(EASY_SIZED, PLENTY_OF_WORK);

    expect(countSolutions(EASY_SIZED, 2_000)).toEqual(everyFilling);
  });

  it.each([workedExample, EASY_SIZED, ALL_OPEN])('agrees with trying every filling and every open operator: $id', (puzzle) => {
    expect(countSolutions(puzzle, PLENTY_OF_WORK).count).toBe(Math.min(countEveryFilling(puzzle), 101));
  });
});
