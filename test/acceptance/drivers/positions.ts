// Layer 3 — where the scenarios' named cells and lines sit in the 2 × 2 grid.

import type { Cell, Line } from '../dsl/vocabulary';

export const CELLS: readonly Cell[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export const LINES: readonly Line[] = ['Row 1', 'Row 2', 'Column 1', 'Column 2'];

export const CELL_POSITIONS: Readonly<Record<Cell, { readonly row: number; readonly column: number }>> = {
  'top-left': { row: 0, column: 0 },
  'top-right': { row: 0, column: 1 },
  'bottom-left': { row: 1, column: 0 },
  'bottom-right': { row: 1, column: 1 },
};

export const LINE_POSITIONS: Readonly<Record<Line, { readonly axis: 'row' | 'column'; readonly index: number }>> = {
  'Row 1': { axis: 'row', index: 0 },
  'Row 2': { axis: 'row', index: 1 },
  'Column 1': { axis: 'column', index: 0 },
  'Column 2': { axis: 'column', index: 1 },
};
