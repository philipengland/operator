// Layer 2 — the words the scenarios use, taken from spec-001's "The Puzzle" section.

export type Cell = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type Line = 'Row 1' | 'Row 2' | 'Column 1' | 'Column 2';

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CellValue = Digit | 'empty';

export type Operator = '+' | '−' | '×' | '÷';

export type OperatorChoice = Operator | 'not chosen';

/** What the game says after the player checks the grid (spec FR-014). */
export type Result =
  | 'new solution'
  | 'new solution, every solution found'
  | 'already found'
  | 'not solved yet'
  | 'fill everything first';

/** Everything the player can change: the three empty cells and the two open operators. */
export interface Entry {
  readonly topRight: CellValue;
  readonly bottomLeft: CellValue;
  readonly bottomRight: CellValue;
  readonly row2: OperatorChoice;
  readonly column1: OperatorChoice;
}
