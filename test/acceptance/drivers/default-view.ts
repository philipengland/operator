// Layer 3 — what a driver reports before it can read anything: every cell empty, every
// operator not chosen, no targets, no counter and no message.

import type { Cell, Line } from '../dsl/vocabulary';
import type { CellView, GameView, OperatorView } from './game.driver';

const CELLS: readonly Cell[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const LINES: readonly Line[] = ['Row 1', 'Row 2', 'Column 1', 'Column 2'];

function forEach<K extends string, V>(keys: readonly K[], value: V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, value])) as Record<K, V>;
}

export const DEFAULT_VIEW: GameView = {
  cells: forEach<Cell, CellView>(CELLS, { value: 'empty', isGiven: false }),
  targets: forEach<Line, number>(LINES, 0),
  operators: forEach<Line, OperatorView>(LINES, { choice: 'not chosen', isOpen: false }),
  counter: '',
  result: null,
};
