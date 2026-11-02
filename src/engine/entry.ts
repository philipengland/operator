import { lineSpec } from './puzzle';
import type { Entry, LinePosition, Operator, Puzzle } from './types';

/** An entry with every changeable cell empty and every open operator not chosen. */
export function emptyEntry(puzzle: Puzzle): Entry {
  return {
    cells: Array.from({ length: puzzle.rows }, () => Array.from({ length: puzzle.columns }, () => null)),
    rowOperators: puzzle.rowLines.map(() => null),
    columnOperators: puzzle.columnLines.map(() => null),
  };
}

/** The operator a line works with: its shown operator, or the player's choice on an open line. */
export function lineOperator(puzzle: Puzzle, entry: Entry, line: LinePosition): Operator | null {
  const spec = lineSpec(puzzle, line);
  if (spec && spec.operator !== 'open') {
    return spec.operator;
  }
  return (line.axis === 'row' ? entry.rowOperators : entry.columnOperators)[line.index] ?? null;
}
