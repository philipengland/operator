import type { CellPosition, LinePosition, LineSpec, Puzzle } from './types';

/** True when the cell holds a given digit and cannot change. */
export function isGiven(puzzle: Puzzle, position: CellPosition): boolean {
  return (puzzle.givens[position.row]?.[position.column] ?? null) !== null;
}

/** The target and operator of a row or column. */
export function lineSpec(puzzle: Puzzle, line: LinePosition): LineSpec | undefined {
  return (line.axis === 'row' ? puzzle.rowLines : puzzle.columnLines)[line.index];
}
