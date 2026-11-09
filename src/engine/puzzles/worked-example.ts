import type { Puzzle } from '../types';

/** The worked example from the project brief: the only puzzle in F0 (spec "The Puzzle"). */
export const workedExample: Puzzle = {
  id: 'worked-example',
  rows: 2,
  columns: 2,
  givens: [
    [6, null],
    [null, null],
  ],
  rowLines: [
    { target: 8, operator: '+' },
    { target: 6, operator: 'open' },
  ],
  columnLines: [
    { target: 3, operator: 'open' },
    { target: 6, operator: '×' },
  ],
  solutionCount: 2,
};
