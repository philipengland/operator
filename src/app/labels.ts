// What the play screen says, as plain functions: visible wording and accessible names
// (contracts/play-screen.md). No DOM access.

import type { CellPosition, Entry, LinePosition, Puzzle } from '../engine';

// F0's grid is 2 × 2, so each cell is a corner (spec "The Puzzle").
const CORNER_NAMES: readonly (readonly string[])[] = [
  ['Top-left', 'Top-right'],
  ['Bottom-left', 'Bottom-right'],
];

export function cellName(puzzle: Puzzle, entry: Entry, position: CellPosition): string {
  void entry;
  const corner = CORNER_NAMES[position.row]?.[position.column];
  const given = puzzle.givens[position.row]?.[position.column] ?? null;
  return `${corner} cell, ${given === null ? 'empty' : `given ${given}`}`;
}

export function lineName(line: LinePosition): string {
  return `${line.axis === 'row' ? 'Row' : 'Column'} ${line.index + 1}`;
}
