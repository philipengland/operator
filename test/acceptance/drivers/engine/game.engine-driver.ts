// Layer 3 — drives the play session in-process, with no browser.

import {
  applyAction,
  counterText,
  startSession,
  type MessageKind,
  type SessionAction,
  type SessionState,
} from '../../../../src/app/session';
import type { Cell, CellValue, Line, OperatorChoice, Result } from '../../dsl/vocabulary';
import { DEFAULT_VIEW } from '../default-view';
import type { CellView, GameDriver, GameView, OperatorView } from '../game.driver';
import { CELL_POSITIONS, CELLS, LINE_POSITIONS, LINES } from '../positions';

const RESULTS: Readonly<Record<MessageKind, Result>> = {
  'new-solution': 'new solution',
  'all-found': 'new solution, every solution found',
  'already-found': 'already found',
  'not-solved': 'not solved yet',
  incomplete: 'fill everything first',
};

export class EngineGameDriver implements GameDriver {
  private session: SessionState | null = null;
  private announcements = 0;

  async open(): Promise<void> {
    this.session = startSession();
  }

  async tapCell(cell: Cell): Promise<void> {
    this.dispatch({ type: 'tapCell', ...CELL_POSITIONS[cell] });
  }

  async tapOperator(line: Line): Promise<void> {
    this.dispatch({ type: 'tapOperator', line: LINE_POSITIONS[line] });
  }

  async check(): Promise<void> {
    this.dispatch({ type: 'submit' });
    // Screen readers hear the status region whenever a message appears in it.
    if (this.session?.message) {
      this.announcements++;
    }
  }

  async view(): Promise<GameView> {
    const session = this.session;
    if (!session) {
      return DEFAULT_VIEW;
    }
    return {
      cells: mapEach(CELLS, (cell) => cellView(session, cell)),
      targets: mapEach(LINES, (line) => lineSpec(session, line)?.target ?? 0),
      operators: mapEach(LINES, (line) => operatorView(session, line)),
      counter: counterText(session),
      result: session.message ? RESULTS[session.message] : null,
    };
  }

  async announcementCount(): Promise<number> {
    return this.announcements;
  }

  private dispatch(action: SessionAction): void {
    if (this.session) {
      this.session = applyAction(this.session, action);
    }
  }
}

function mapEach<K extends string, V>(keys: readonly K[], read: (key: K) => V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, read(key)])) as Record<K, V>;
}

function cellView(session: SessionState, cell: Cell): CellView {
  const { row, column } = CELL_POSITIONS[cell];
  const given = session.puzzle.givens[row]?.[column] ?? null;
  const entered = session.entry.cells[row]?.[column] ?? null;
  const value: CellValue = given ?? entered ?? 'empty';
  return { value, isGiven: given !== null };
}

function lineSpec(session: SessionState, line: Line) {
  const { axis, index } = LINE_POSITIONS[line];
  return (axis === 'row' ? session.puzzle.rowLines : session.puzzle.columnLines)[index];
}

function operatorView(session: SessionState, line: Line): OperatorView {
  const spec = lineSpec(session, line);
  if (!spec) {
    return { choice: 'not chosen', isOpen: false };
  }
  if (spec.operator !== 'open') {
    return { choice: spec.operator, isOpen: false };
  }
  const { axis, index } = LINE_POSITIONS[line];
  const chosen = (axis === 'row' ? session.entry.rowOperators : session.entry.columnOperators)[index] ?? null;
  const choice: OperatorChoice = chosen ?? 'not chosen';
  return { choice, isOpen: true };
}
