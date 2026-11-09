// Layer 3 — drives the play session in-process, with no browser.

import {
  applyAction,
  counterText,
  lineWorkings,
  startSession,
  type MessageKind,
  type SessionAction,
  type SessionState,
} from '../../../../src/app/session';
import { workingText } from '../../../../src/app/labels';
import type { LineOutcome } from '../../../../src/engine';
import { keypadKeys } from '../../../../src/ui/combined/keypad.model';
import { buttonModel } from '../../../../src/ui/simple/button.model';
import type { Cell, CellValue, KeypadKey, Line, OperatorChoice, Result, WorkingMark } from '../../dsl/vocabulary';
import { DEFAULT_VIEW } from '../default-view';
import type { CellView, GameDriver, GameView, KeypadKeyView, OperatorView, WorkingView } from '../game.driver';
import { CELL_POSITIONS, CELLS, LINE_POSITIONS, LINES } from '../positions';

const RESULTS: Readonly<Record<MessageKind, Result>> = {
  'new-solution': 'new solution',
  'all-found': 'new solution, every solution found',
  'already-found': 'already found',
  'not-solved': 'not solved yet',
  incomplete: 'fill everything first',
};

const KEYS_IN_A_ROW = 5;

function readOnlyOnThePhones(): never {
  throw new Error('Scenarios that read the screen are tagged @ui and run only with ACCEPTANCE_DRIVER=ui.');
}

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
      workings: mapEach(LINES, (line) => workingView(session, line)),
    };
  }

  async announcementCount(): Promise<number> {
    return this.announcements;
  }

  // spec-004: the keypad, from the session; what the screen shows is read only on the phones.

  async tapKey(key: KeypadKey): Promise<void> {
    this.dispatch(key === 'Oops' ? { type: 'clear' } : { type: 'key', digit: key });
  }

  async selectedCell(): Promise<Cell | null> {
    const selected = this.session?.selected ?? null;
    return selected === null ? null : (CELLS.find((cell) => CELL_POSITIONS[cell].row === selected.row && CELL_POSITIONS[cell].column === selected.column) ?? null);
  }

  /** The keys in the two rows of five the keypad lays them out in. */
  async keypad(): Promise<readonly (readonly KeypadKeyView[])[]> {
    const keys = keypadKeys((this.session?.selected ?? null) !== null).map(({ button }) => {
      const { name, isUnavailable } = buttonModel(button);
      return { name, isAvailable: !isUnavailable };
    });
    return [keys.slice(0, KEYS_IN_A_ROW), keys.slice(KEYS_IN_A_ROW)];
  }

  bubble = readOnlyOnThePhones;
  announcement = readOnlyOnThePhones;
  counterShown = readOnlyOnThePhones;
  pillShown = readOnlyOnThePhones;
  workingSlot = readOnlyOnThePhones;
  helperLine = readOnlyOnThePhones;
  mainButton = readOnlyOnThePhones;
  tapCounter = readOnlyOnThePhones;
  tapBack = readOnlyOnThePhones;
  tapSolution = readOnlyOnThePhones;
  tapInSolution = readOnlyOnThePhones;
  tapStartAgain = readOnlyOnThePhones;
  doubleTapStartAgain = readOnlyOnThePhones;
  tapPopUpButton = readOnlyOnThePhones;
  screenShowing = readOnlyOnThePhones;
  emptyList = readOnlyOnThePhones;
  solutionsShown = readOnlyOnThePhones;
  solutionsHeard = readOnlyOnThePhones;
  solutionView = readOnlyOnThePhones;
  solutionHeard = readOnlyOnThePhones;
  controlsOnScreen = readOnlyOnThePhones;
  popUp = readOnlyOnThePhones;
  focusedControl = readOnlyOnThePhones;

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

/** A line's working as the session reports it; a line it does not report reads as nothing. */
function workingView(session: SessionState, line: Line): WorkingView {
  const { axis, index } = LINE_POSITIONS[line];
  const working = lineWorkings(session).find((each) => each.line.axis === axis && each.line.index === index);
  if (!working) {
    return DEFAULT_VIEW.workings[line];
  }
  return { working: workingText(working), mark: markOf(working.outcome) };
}

function markOf(outcome: LineOutcome): WorkingMark {
  if (outcome.kind === 'not-whole') {
    return 'not a whole number';
  }
  return outcome.kind === 'result' && outcome.reachesTarget ? 'target reached' : 'none';
}
