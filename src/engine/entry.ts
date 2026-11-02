import type { Entry, Puzzle } from './types';

/** An entry with every changeable cell empty and every open operator not chosen. */
export function emptyEntry(puzzle: Puzzle): Entry {
  return {
    cells: Array.from({ length: puzzle.rows }, () => Array.from({ length: puzzle.columns }, () => null)),
    rowOperators: puzzle.rowLines.map(() => null),
    columnOperators: puzzle.columnLines.map(() => null),
  };
}
