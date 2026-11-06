// Grid cell (combined component): one digit of the puzzle, as a Button in one of five states
// (spec-003 FR-316; data model "Grid cell model"; docs/contracts/component-library.md).

import type { ButtonProps } from '../simple/button.model';

export interface GridCellProps {
  /** Which cell, as the play screen names it: "Top-left cell". */
  readonly name: string;
  readonly digit: number | null;
  /** Part of the puzzle: shown in ink and cannot be changed. */
  readonly isGiven?: boolean;
  readonly isSelected?: boolean;
  /** In a row or column that reaches its target. */
  readonly isInCorrectLine?: boolean;
}

/** The Button that shows the cell. */
export function gridCellModel({ name, digit, isGiven = false }: GridCellProps): ButtonProps {
  const label = digit === null ? '' : String(digit);
  return { label, name: `${name}, ${heardValue(label, isGiven)}`, style: 'cell', isUnavailable: isGiven, isSelected: false };
}

/** What follows the cell's name (play-screen contract): "given 2", "empty" or the digit. */
function heardValue(label: string, isGiven: boolean): string {
  if (isGiven) {
    return `given ${label}`;
  }
  return label === '' ? 'empty' : label;
}
