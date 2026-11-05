import { describe, expect, it } from 'vitest';
import { isGiven } from './puzzle';
import { workedExample } from './puzzles/worked-example';

describe('isGiven', () => {
  it.each([
    { cell: 'top-left', row: 0, column: 0, given: true },
    { cell: 'top-right', row: 0, column: 1, given: false },
    { cell: 'bottom-left', row: 1, column: 0, given: false },
    { cell: 'bottom-right', row: 1, column: 1, given: false },
  ])('is $given for the $cell cell of the worked example', ({ row, column, given }) => {
    expect(isGiven(workedExample, { row, column })).toBe(given);
  });
});
