// Layer 3 — a daily puzzle as the scenarios compare it, from the engine's own puzzle (spec-007).

import type { Digit, Entry, LineSpec, Puzzle } from '../../../src/engine';
import type { DailyLine, DailyPuzzle } from '../dsl/daily-vocabulary';

/** A puzzle as the player sees it; with no entry, every cell the player fills is empty. */
export function puzzleView(puzzle: Puzzle, entry: Entry | null, heardAs: string): DailyPuzzle {
  return {
    heardAs,
    rows: puzzle.rows,
    columns: puzzle.columns,
    cells: puzzle.givens.map((givens, row) => givens.map((given, column) => ({ given, value: given ?? entered(entry, row, column) ?? 'empty' }))),
    rowLines: puzzle.rowLines.map(lineView),
    columnLines: puzzle.columnLines.map(lineView),
  };
}

function entered(entry: Entry | null, row: number, column: number): Digit | null {
  return entry?.cells[row]?.[column] ?? null;
}

function lineView({ target, operator }: LineSpec): DailyLine {
  return { target, operator };
}
