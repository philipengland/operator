// Layer 3 — the accessible names on the play screen (contracts/play-screen.md), and how to
// read the scenarios' values back out of them.

import type { Cell, CellValue, Digit, Line, Operator, OperatorChoice, Result } from '../../dsl/vocabulary';

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

/**
 * "Top-left cell, given 6" → { value: 6, isGiven: true }; "Top-right cell, empty" → empty.
 * Anything else is reported exactly as shown, so a wrong value such as "10" fails the
 * scenario instead of being read as a valid one.
 */
export function readCellName(cell: Cell, name: string): { value: CellValue; isGiven: boolean } {
  const description = name.slice(CELL_NAME_PREFIX[cell].length);
  const isGiven = description.startsWith('given ');
  const shown = isGiven ? description.slice('given '.length) : description;
  return { value: readCellValue(shown), isGiven };
}

function readCellValue(shown: string): CellValue {
  if (shown === 'empty') {
    return 'empty';
  }
  const digit = Number(shown);
  return Number.isInteger(digit) && digit >= 1 && digit <= 9 ? (digit as Digit) : (shown as unknown as CellValue);
}

/** "Row 2 operator, not chosen" → "not chosen"; "Row 1 operator, plus" → "+"; anything else as shown. */
export function readOperatorName(line: Line, name: string): OperatorChoice {
  const word = name.slice(`${line} operator, `.length);
  if (word === 'not chosen') {
    return 'not chosen';
  }
  return OPERATOR_WORDS[word] ?? (word as unknown as OperatorChoice);
}

/** "Row 1 target 8" → 8. */
export function readTargetText(text: string): number {
  return Number(text.match(/(\d+)\s*$/)?.[1] ?? Number.NaN);
}

export const COUNTER_PATTERN = /Found \d+ of \d+/;

// The visible messages (labels.ts), longest first so "every solution" wins over "new solution".
const MESSAGES: readonly (readonly [string, Result])[] = [
  ["New solution found! You've found every solution.", 'new solution, every solution found'],
  ['New solution found!', 'new solution'],
  ["You've already found this solution.", 'already found'],
  ['Not solved yet.', 'not solved yet'],
  ['Fill every cell and choose every operator before checking.', 'fill everything first'],
];

/** Which result the status region is showing, or null when it shows no message. */
export function readResult(statusText: string): Result | null {
  const shown = MESSAGES.find(([text]) => statusText.includes(text));
  return shown ? shown[1] : null;
}
