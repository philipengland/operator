import type { CellPosition, Puzzle } from './types';

/** True when the cell holds a given digit and cannot change. */
export function isGiven(puzzle: Puzzle, position: CellPosition): boolean {
  return (puzzle.givens[position.row]?.[position.column] ?? null) !== null;
}
