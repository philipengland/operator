// The play session: a pure reducer over the current entry, the found solutions and the last
// message (data-model.md "Session"). No DOM access.

import {
  checkEntry,
  defaultRules,
  emptyEntry,
  isGiven,
  lineSpec,
  lineWorking,
  nextCellValue,
  nextOperator,
  workedExample,
  type CellPosition,
  type Digit,
  type Entry,
  type LinePosition,
  type LineWorking,
  type Operator,
  type Puzzle,
  type SolutionKey,
} from '../engine';

export type MessageKind = 'new-solution' | 'all-found' | 'already-found' | 'not-solved' | 'incomplete';

export interface SessionState {
  readonly puzzle: Puzzle;
  readonly entry: Entry;
  readonly found: ReadonlySet<SolutionKey>;
  readonly message: MessageKind | null;
  /** The cell the keypad sets; none until the player taps one (spec-004 FR-404). */
  readonly selected: CellPosition | null;
}

export type SessionAction =
  | { readonly type: 'tapCell'; readonly row: number; readonly column: number }
  | { readonly type: 'tapOperator'; readonly line: LinePosition }
  | { readonly type: 'submit' }
  | { readonly type: 'key'; readonly digit: Digit }
  | { readonly type: 'clear' };

export function startSession(): SessionState {
  return {
    puzzle: workedExample,
    entry: emptyEntry(workedExample),
    found: new Set(),
    message: null,
    selected: null,
  };
}

/** "Found N of M" (FR-013). */
export function counterText(state: SessionState): string {
  return `Found ${state.found.size} of ${state.puzzle.solutionCount}`;
}

/** What every line works out to now, rows then columns (spec-002 FR-201). */
export function lineWorkings({ puzzle, entry }: SessionState): LineWorking[] {
  const lines: LinePosition[] = [
    ...puzzle.rowLines.map((_, index): LinePosition => ({ axis: 'row', index })),
    ...puzzle.columnLines.map((_, index): LinePosition => ({ axis: 'column', index })),
  ];
  return lines.map((line) => lineWorking(puzzle, entry, line, defaultRules));
}

export function applyAction(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'tapCell':
      return tapCell(state, action);
    case 'tapOperator':
      return tapOperator(state, action.line);
    case 'submit':
      return submit(state);
    case 'key':
      return setSelectedCell(state, action.digit);
    case 'clear':
      return state;
  }
}

function tapCell(state: SessionState, tapped: CellPosition): SessionState {
  if (isGiven(state.puzzle, tapped)) {
    return state;
  }
  const cells = state.entry.cells.map((cellsInRow, row) =>
    cellsInRow.map((value, column) =>
      row === tapped.row && column === tapped.column ? nextCellValue(value) : value,
    ),
  );
  return { ...state, entry: { ...state.entry, cells }, message: null, selected: { row: tapped.row, column: tapped.column } };
}

function setSelectedCell(state: SessionState, value: Digit | null): SessionState {
  const { selected } = state;
  if (selected === null) {
    return state;
  }
  const cells = state.entry.cells.map((cellsInRow, row) =>
    cellsInRow.map((current, column) => (row === selected.row && column === selected.column ? value : current)),
  );
  return { ...state, entry: { ...state.entry, cells } };
}

function tapOperator(state: SessionState, tapped: LinePosition): SessionState {
  if (lineSpec(state.puzzle, tapped)?.operator !== 'open') {
    return state;
  }
  const step = (operators: readonly (Operator | null)[]) =>
    operators.map((operator, index) => (index === tapped.index ? nextOperator(operator) : operator));
  const { entry } = state;
  return {
    ...state,
    entry:
      tapped.axis === 'row'
        ? { ...entry, rowOperators: step(entry.rowOperators) }
        : { ...entry, columnOperators: step(entry.columnOperators) },
    message: null,
  };
}

function submit(state: SessionState): SessionState {
  const result = checkEntry(state.puzzle, state.entry, defaultRules);
  if (result.kind !== 'solved') {
    return { ...state, message: result.kind };
  }
  if (state.found.has(result.key)) {
    return { ...state, message: 'already-found' };
  }
  const found = new Set([...state.found, result.key]);
  const isEverySolutionFound = found.size >= state.puzzle.solutionCount;
  return { ...state, found, message: isEverySolutionFound ? 'all-found' : 'new-solution' };
}
