import { describe, expect, it } from 'vitest';
import { emptyEntry } from './entry';
import { workedExample } from './puzzles/worked-example';

describe('emptyEntry', () => {
  it('has every cell empty and every operator not chosen, in the shape of the puzzle', () => {
    expect(emptyEntry(workedExample)).toEqual({
      cells: [
        [null, null],
        [null, null],
      ],
      rowOperators: [null, null],
      columnOperators: [null, null],
    });
  });
});
