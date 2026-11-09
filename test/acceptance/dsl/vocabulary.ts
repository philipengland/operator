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

/**
 * A line's working (spec-002): its digits and operator in reading order, with ? for anything
 * not filled in, then "= " and the result once there is one. For example "6 + ?", "6 + 2 = 8",
 * "6 − 9 = −3", or "6 ÷ 4" when the division is not whole.
 */
export type Working = string;

/** How a line's working is marked (spec-002 FR-204, FR-205). */
export type WorkingMark = 'target reached' | 'not a whole number' | 'none';

/** A key on the keypad (spec-004): a digit, or Oops, which empties the selected cell. */
export type KeypadKey = Digit | 'Oops';

/** A found solution's name in the list and on its view (spec-006). */
export type SolutionName = `Solution ${number}`;

/** Text on the play screen whose typeface a scenario checks (spec-004 AC-7). */
export type TypefacedText = 'speech bubble title' | 'helper line';
