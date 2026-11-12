// The play screen's props, worked out from the session: the only place game state becomes what the
// component library shows (spec-004 research R1). Pure; the library draws it.

import type { PlayScreenProps } from '../ui/screens/play-screen';
import { themeForSeed, type Theme } from '../ui/foundations/themes';
import { announcement, bubbleLine, cellTitleIn, pillName, puzzleName, TAP_A_CELL, workingName, workingSlot } from './labels';
import { lineOperator, lineSpec, type CellPosition, type LinePosition, type LineWorking } from '../engine';
import type { GridCellProps } from '../ui/combined/grid-cell';
import type { PuzzleGridProps } from '../ui/combined/puzzle-grid';
import type { LineWorkingProps } from '../ui/combined/line-working';
import type { TargetPillProps } from '../ui/combined/target-pill';
import { counterText, lineWorkings, totalToShow, type SessionState } from './session';

const TITLE = 'Hello, Operator!';
const HELPER_LINE = 'Tap a dashed bubble to swap its operator.';

function lines(state: SessionState, axis: LinePosition['axis']): readonly LineWorking[] {
  return lineWorkings(state).filter((working) => working.line.axis === axis);
}

function workingProps(working: LineWorking): LineWorkingProps {
  return { ...workingSlot(working), name: workingName(working) };
}

function isInLineReachingTarget(state: SessionState, { row, column }: CellPosition): boolean {
  return lineWorkings(state).some(
    (working) => reachesTarget(working) && (working.line.axis === 'row' ? working.line.index === row : working.line.index === column),
  );
}

function isSamePosition(first: CellPosition | null, second: CellPosition): boolean {
  return first?.row === second.row && first.column === second.column;
}

function cell(state: SessionState, position: CellPosition): GridCellProps {
  const { puzzle, entry } = state;
  const given = puzzle.givens[position.row]?.[position.column] ?? null;
  return {
    name: cellTitleIn(puzzle, position),
    digit: given ?? entry.cells[position.row]?.[position.column] ?? null,
    isGiven: given !== null,
    isInCorrectLine: given === null && isInLineReachingTarget(state, position),
    isSelected: isSamePosition(state.selected, position),
  };
}

function reachesTarget({ outcome }: LineWorking): boolean {
  return outcome.kind === 'result' && outcome.reachesTarget;
}

function pill({ puzzle, entry }: SessionState, working: LineWorking): TargetPillProps {
  return {
    target: lineSpec(puzzle, working.line)?.target ?? 0,
    operator: lineOperator(puzzle, entry, working.line),
    isOpen: lineSpec(puzzle, working.line)?.operator === 'open',
    name: pillName(puzzle, entry, working.line),
    reachesTarget: reachesTarget(working),
  };
}

const EASY_SIZE = 3;

/** spec-007 FR-713 (owner, 2026-11-10): a 3 × 3 grid has slightly smaller cells on short phones, to fit with the Today button. */
function isThreeByThree({ rows, columns }: SessionState['puzzle']): boolean {
  return rows === EASY_SIZE && columns === EASY_SIZE;
}

/** spec-007 FR-719: a grid bigger than 3 × 3 (Medium, Hard, Collector) has the compact screen. */
function isBiggerThanThreeByThree({ rows, columns }: SessionState['puzzle']): boolean {
  return rows * columns > EASY_SIZE * EASY_SIZE;
}

/** spec-007 FR-718: a grid wider than 3 columns shows its workings in the strip, not beside each line. */
function isWiderThanThreeColumns({ columns }: SessionState['puzzle']): boolean {
  return columns > EASY_SIZE;
}

/** The helper line is about swapping an operator; a puzzle with none to swap, or on the compact screen (FR-719), has none. */
function hasOpenLine({ rowLines, columnLines }: SessionState['puzzle']): boolean {
  return [...rowLines, ...columnLines].some((line) => line.operator === 'open');
}

/** The whole puzzle as the session has it. */
export function puzzleGridProps(state: SessionState): PuzzleGridProps {
  return {
    name: puzzleName(state.puzzle),
    columnPills: lines(state, 'column').map((working) => pill(state, working)),
    rowPills: lines(state, 'row').map((working) => pill(state, working)),
    cells: state.puzzle.givens.map((_, row) => state.puzzle.givens[row]?.map((__, column) => cell(state, { row, column })) ?? []),
    rowWorkings: lines(state, 'row').map(workingProps),
    columnWorkings: lines(state, 'column').map(workingProps),
    helper: hasOpenLine(state.puzzle) && !isBiggerThanThreeByThree(state.puzzle) ? HELPER_LINE : '',
  };
}

function counterProps(state: SessionState): PlayScreenProps['counter'] {
  const total = totalToShow(state);
  return total === undefined ? { found: state.found.size } : { found: state.found.size, total };
}

/** spec-007 FR-712: a daily puzzle in the theme worked out from its seed; the worked example in Classic. */
export function puzzleTheme({ puzzle }: SessionState): Theme {
  return themeForSeed(puzzle.seed);
}

/**
 * The compact screen's strip: the operator's line after a Check, until a cell is tapped (FR-719); otherwise, on a
 * grid wider than 3 columns, the selected cell's row and column workings, or a prompt to tap one (FR-718).
 */
function stripOf(state: SessionState, theme: Theme): Pick<PlayScreenProps, 'strip'> {
  if (state.message !== null && isBiggerThanThreeByThree(state.puzzle)) {
    return { strip: { text: bubbleLine(state.message, theme) } };
  }
  if (!isWiderThanThreeColumns(state.puzzle)) {
    return {};
  }
  const { selected } = state;
  if (selected === null) {
    return { strip: { text: TAP_A_CELL } };
  }
  const workingOf = (axis: LinePosition['axis'], index: number) => lines(state, axis).filter((working) => working.line.index === index).map(workingProps);
  return { strip: { workings: [...workingOf('row', selected.row), ...workingOf('column', selected.column)] } };
}

export function playScreenProps(state: SessionState, theme: Theme): PlayScreenProps {
  return {
    header: { title: TITLE, message: bubbleLine(state.message, theme) },
    counter: counterProps(state),
    grid: puzzleGridProps(state),
    mainButtonLabel: theme.buttonLabel,
    keysAvailable: state.selected !== null,
    announcement: announcement(state.message, theme, counterText(state)),
    isSnug: isThreeByThree(state.puzzle),
    isCompact: isBiggerThanThreeByThree(state.puzzle),
    ...stripOf(state, theme),
  };
}
