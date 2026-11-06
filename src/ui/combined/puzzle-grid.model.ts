// Puzzle grid (combined component): where each part of the puzzle sits (spec-003 FR-318;
// docs/contracts/component-library.md). Column pills along the top, row pills down the left,
// the cells between, each row's working at its right and each column's working below it.

/** A place in the grid, counted from 1 like CSS grid lines. */
export interface GridPlace {
  readonly row: number;
  readonly column: number;
}

export interface PuzzleSize {
  readonly rows: number;
  readonly columns: number;
}

export interface PuzzleGridPlaces {
  cell(row: number, column: number): GridPlace;
  columnPill(column: number): GridPlace;
  rowPill(row: number): GridPlace;
  rowWorking(row: number): GridPlace;
  columnWorking(column: number): GridPlace;
}

// Grid line 1 holds the pills; the cells start on line 2.
const PILL_LINE = 1;
const FIRST_CELL_LINE = 2;

/** Places for a puzzle of this size; rows and columns are counted from 0. */
export function puzzleGridPlaces(size: PuzzleSize): PuzzleGridPlaces {
  return {
    cell: (row, column) => ({ row: row + FIRST_CELL_LINE, column: column + FIRST_CELL_LINE }),
    columnPill: (column) => ({ row: PILL_LINE, column: column + FIRST_CELL_LINE }),
    rowPill: (row) => ({ row: row + FIRST_CELL_LINE, column: PILL_LINE }),
    // The line just past the last cell: right of the last column, below the last row.
    rowWorking: (row) => ({ row: row + FIRST_CELL_LINE, column: size.columns + FIRST_CELL_LINE }),
    columnWorking: (column) => ({ row: size.rows + FIRST_CELL_LINE, column: column + FIRST_CELL_LINE }),
  };
}
