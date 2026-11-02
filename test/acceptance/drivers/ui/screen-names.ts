// Layer 3 — the accessible names on the play screen (contracts/play-screen.md), and how to
// read the scenarios' values back out of them.

import type { Cell, CellValue, Digit, Line, Operator, OperatorChoice } from '../../dsl/vocabulary';

const CELL_NAME_PREFIX: Readonly<Record<Cell, string>> = {
  'top-left': 'Top-left cell, ',
  'top-right': 'Top-right cell, ',
  'bottom-left': 'Bottom-left cell, ',
  'bottom-right': 'Bottom-right cell, ',
};

const OPERATOR_WORDS: Readonly<Record<string, Operator>> = {
  plus: '+',
  minus: '−',
  times: '×',
  divide: '÷',
};

export function cellNamePattern(cell: Cell): RegExp {
  return new RegExp(`^${CELL_NAME_PREFIX[cell]}`);
}

export function operatorNamePattern(line: Line): RegExp {
  return new RegExp(`^${line} operator, `);
}

export function targetTextPattern(line: Line): RegExp {
  return new RegExp(`^${line} target \\d+$`);
}

/** "Top-left cell, given 6" → { value: 6, isGiven: true }; "Top-right cell, empty" → empty. */
export function readCellName(cell: Cell, name: string): { value: CellValue; isGiven: boolean } {
  const description = name.slice(CELL_NAME_PREFIX[cell].length);
  const isGiven = description.startsWith('given ');
  const shown = isGiven ? description.slice('given '.length) : description;
  const digit = Number(shown);
  const value: CellValue = Number.isInteger(digit) && digit >= 1 && digit <= 9 ? (digit as Digit) : 'empty';
  return { value, isGiven };
}

/** "Row 2 operator, not chosen" → "not chosen"; "Row 1 operator, plus" → "+". */
export function readOperatorName(line: Line, name: string): OperatorChoice {
  const word = name.slice(`${line} operator, `.length);
  return OPERATOR_WORDS[word] ?? 'not chosen';
}

/** "Row 1 target 8" → 8. */
export function readTargetText(text: string): number {
  return Number(text.trim().split(' ').at(-1));
}

export const COUNTER_PATTERN = /Found \d+ of \d+/;
