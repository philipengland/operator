import { describe, expect, it } from 'vitest';
import { puzzleGridPlaces } from './puzzle-grid.model';

describe('puzzleGridPlaces', () => {
  const places = puzzleGridPlaces();

  it('puts the cells below the row of column pills and right of the column of row pills', () => {
    expect([places.cell(0, 0), places.cell(1, 1)]).toEqual([
      { row: 2, column: 2 },
      { row: 3, column: 3 },
    ]);
  });
});
