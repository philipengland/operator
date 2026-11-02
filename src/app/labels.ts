// What the play screen says, as plain functions: visible wording and accessible names
// (contracts/play-screen.md). No DOM access.

import { lineSpec, type CellPosition, type Entry, type LinePosition, type Operator, type Puzzle } from '../engine';

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
  void entry;
  const spec = lineSpec(puzzle, line);
  const choice = !spec || spec.operator === 'open' ? 'not chosen' : OPERATOR_WORDS[spec.operator];
  return `${lineName(line)} operator, ${choice}`;
}
