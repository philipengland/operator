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

  it('puts each column pill on top, above its column, and each row pill at the left, beside its row', () => {
    expect([places.columnPill(1), places.rowPill(1)]).toEqual([
      { row: 1, column: 3 },
      { row: 3, column: 1 },
    ]);
  });
});
