// Layer 3 — the accessible names on the play screen (docs/contracts/play-screen.md), and how to
// read the scenarios' values back out of them.

import type { Locator } from '@playwright/test';
import type { GameScreen } from './game-reading';
import type { Cell, CellValue, Digit, Line, Operator, OperatorChoice, Result, Working, WorkingMark } from '../../dsl/vocabulary';

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

/** spec-004: what a line's pill says, from its name; a pill that is not there reads as nothing valid. */
export function readPill(line: Line, screen: GameScreen): { target: number; choice: OperatorChoice; isOpen: boolean } {
  const pattern = new RegExp(`${line} target (\\d+), (.*?)(?:, target reached)?$`);
  const button = screen.buttons.find((name) => pattern.test(name));
  const text = screen.texts.find((name) => pattern.test(name));
  const [, target = 'NaN', word = 'no pill'] = pattern.exec(button ?? text ?? '') ?? [];
  const choice = word === 'operator not chosen' ? 'not chosen' : (OPERATOR_WORDS[word] ?? (word as unknown as OperatorChoice));
  return { target: Number(target), choice, isOpen: button !== undefined };
}

/** spec-002: a line's working is the text named "Row 1 working, …". */
export function workingNamePattern(line: Line): RegExp {
  return new RegExp(`^${line} working, `);
}

// How a working's name ends when the line is marked (docs/contracts/play-screen.md).
const WORKING_MARKS: readonly (readonly [string, WorkingMark])[] = [
  [', target reached', 'target reached'],
  [', not a whole number', 'not a whole number'],
];

/** "Row 1 working, 6 + 2 = 8, target reached" → { working: "6 + 2 = 8", mark: "target reached" }. */
export function readWorkingName(line: Line, name: string): { working: Working; mark: WorkingMark } {
  const described = name.slice(`${line} working, `.length);
  const marked = WORKING_MARKS.find(([ending]) => described.endsWith(ending));
  if (!marked) {
    return { working: asShown(described), mark: 'none' };
  }
  return { working: asShown(described.slice(0, -marked[0].length)), mark: marked[1] };
}

/** The name speaks a negative result, "= minus 1"; the player sees "= −1" (U+2212). */
function asShown(spoken: string): Working {
  return spoken.replace(/= minus (\d+)$/, '= −$1');
}

/**
 * The counter's heard name, alone in its element: "Found 1 of 2", or "Found 3" when a puzzle has more than 100
 * (spec-007 FR-710). The status can hold the same words after others.
 */
export const COUNTER_PATTERN = /^Found \d+( of \d+)?$/;

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

/**
 * spec-004: a line's target pill. An open pill is a button whose name starts with what it shows
 * ("? 6, Row 2 target 6, operator not chosen"); a shown pill is the element around its heard name.
 */
export function pillIn(puzzle: Locator, line: Line): Locator {
  return puzzle
    .getByRole('button', { name: new RegExp(`${line} target \\d+`) })
    .or(puzzle.getByText(new RegExp(`^${line} target \\d+, `)).locator('xpath=..'));
}
