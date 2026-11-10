import { describe, expect, it } from 'vitest';
import { puzzleGridPlaces } from './puzzle-grid.model';

describe('puzzleGridPlaces', () => {
  const places = puzzleGridPlaces({ rows: 2, columns: 2 });

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

  it("puts each row's working at the far right of its row, and each column's working below its column", () => {
    expect([places.rowWorking(0), places.columnWorking(1)]).toEqual([
      { row: 2, column: 4 },
      { row: 4, column: 3 },
    ]);
  });
});

describe('puzzleGridPlaces with the workings shown elsewhere (spec-007 FR-718)', () => {
  const places = puzzleGridPlaces({ rows: 5, columns: 4 }, 'elsewhere');

  it('gives the workings no place in the grid, so the grid has no column or row for them', () => {
    expect([places.rowWorking(0), places.columnWorking(3)]).toEqual([null, null]);
  });
});
