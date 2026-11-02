// What the play screen says, as plain functions: visible wording and accessible names
// (contracts/play-screen.md). No DOM access.

import { lineOperator, type CellPosition, type Entry, type LinePosition, type Operator, type Puzzle } from '../engine';
import type { MessageKind } from './session';

const OPERATOR_WORDS: Readonly<Record<Operator, string>> = {
  '+': 'plus',
  '−': 'minus',
  '×': 'times',
  '÷': 'divide',
};

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

const MESSAGES: Partial<Readonly<Record<MessageKind, string>>> = {
  'new-solution': 'New solution found!',
  'all-found': "New solution found! You've found every solution.",
  'already-found': "You've already found this solution.",
  'not-solved': 'Not solved yet.',
  incomplete: 'Fill every cell and choose every operator before checking.',
};

/** What the game says after Check (FR-014). */
export function messageText(kind: MessageKind): string {
  return MESSAGES[kind] ?? '';
}
