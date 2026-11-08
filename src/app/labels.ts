// What the play screen says, as plain functions: visible wording and accessible names
// (docs/contracts/play-screen.md). No DOM access.

import {
  lineOperator,
  type CellPosition,
  type Entry,
  type LineOutcome,
  type LinePosition,
  type LineWorking,
  type Operator,
  type Puzzle,
} from '../engine';
import type { Theme } from '../ui/foundations/themes';
import type { MessageKind } from './session';

const OPERATOR_WORDS: Readonly<Record<Operator, string>> = {
  '+': 'plus',
  '−': 'minus',
  '×': 'times',
  '÷': 'divide',
};

// Stands for an empty cell or an operator not yet chosen, in a working.
const GAP_MARK = '?';

const MINUS_SIGN = '−';

// Shown after a result that reaches its target (spec-002 FR-204).
const TARGET_REACHED_MARK = '✓';

// Shown instead of a result when a division is not whole (spec-002 FR-205).
const NOT_WHOLE_MARK = '✗';

// F0's grid is 2 × 2, so each cell is a corner (spec "The Puzzle").
const CORNER_NAMES: readonly (readonly string[])[] = [
  ['Top-left', 'Top-right'],
  ['Bottom-left', 'Bottom-right'],
];

export function cellName(puzzle: Puzzle, entry: Entry, position: CellPosition): string {
  const corner = CORNER_NAMES[position.row]?.[position.column];
  const given = puzzle.givens[position.row]?.[position.column] ?? null;
  if (given !== null) {
    return `${corner} cell, given ${given}`;
  }
  const entered = entry.cells[position.row]?.[position.column] ?? null;
  return `${corner} cell, ${entered ?? 'empty'}`;
}

export function lineName(line: LinePosition): string {
  return `${line.axis === 'row' ? 'Row' : 'Column'} ${line.index + 1}`;
}

export function operatorName(puzzle: Puzzle, entry: Entry, line: LinePosition): string {
  const operator = lineOperator(puzzle, entry, line);
  return `${lineName(line)} operator, ${operator === null ? 'not chosen' : OPERATOR_WORDS[operator]}`;
}

/** A line's working as the player reads it: "6 + ?", "6 + 2 = 8" (spec-002 FR-201). */
export function workingText(working: LineWorking): string {
  return describeWorking(working, shownNumber);
}

function describeWorking({ digits, operator, outcome }: LineWorking, writeNumber: (value: number) => string): string {
  const between = ` ${operator ?? GAP_MARK} `;
  const calculation = digits.map((digit) => digit ?? GAP_MARK).join(between);
  return outcome.kind === 'result' ? `${calculation} = ${writeNumber(outcome.value)}` : calculation;
}

/** A number as the player sees it: below zero with the minus sign U+2212, never a hyphen (spec-002). */
function shownNumber(value: number): string {
  return value < 0 ? `${MINUS_SIGN}${-value}` : String(value);
}

/** The working's accessible name, read by screen readers: "Row 1 working, 6 + ?" (spec-002 FR-206). */
export function workingName(working: LineWorking): string {
  return `${lineName(working.line)} working, ${describeWorking(working, spokenNumber)}${spokenMark(working.outcome)}`;
}

/** How a screen reader hears the ✓ or the ✗ (spec-002 FR-204, FR-205). */
function spokenMark(outcome: LineOutcome): string {
  if (outcome.kind === 'not-whole') {
    return ', not a whole number';
  }
  return outcome.kind === 'result' && outcome.reachesTarget ? ', target reached' : '';
}

/** A number as a screen reader should say it: "minus 3". Some skip or misread U+2212 before a number (research R2). */
function spokenNumber(value: number): string {
  return value < 0 ? `minus ${-value}` : String(value);
}

/** What the result slot beside or below a line shows: "= ?" (spec-002, research R2). */
export function resultText({ outcome }: LineWorking): string {
  if (outcome.kind === 'not-whole') {
    return NOT_WHOLE_MARK;
  }
  if (outcome.kind !== 'result') {
    return `= ${GAP_MARK}`;
  }
  const result = `= ${shownNumber(outcome.value)}`;
  return outcome.reachesTarget ? `${result} ${TARGET_REACHED_MARK}` : result;
}

// Every message kind must have wording; the compiler enforces it.
const MESSAGES: Readonly<Record<MessageKind, string>> = {
  'new-solution': 'New solution found!',
  'all-found': "New solution found! You've found every solution.",
  'already-found': "You've already found this solution.",
  'not-solved': 'Not solved yet.',
  incomplete: 'Fill every cell and choose every operator before checking.',
};

/** What the game says after Check (FR-014). */
export function messageText(kind: MessageKind): string {
  return MESSAGES[kind];
}

/** The line in the speech bubble (spec-004 FR-408). */
export function bubbleLine(_kind: MessageKind | null, { address }: Theme): string {
  return `Fill the grid, ${address}.`;
}
