// The play screen's props, worked out from the session: the only place game state becomes what the
// component library shows (spec-004 research R1). Pure; the library draws it.

import type { PlayScreenProps } from '../ui/screens/play-screen';
import { themeForSeed, type Theme } from '../ui/foundations/themes';
import { announcement, bubbleLine, cellTitleIn, pillName, puzzleName, workingName, workingSlot } from './labels';
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

/** The whole puzzle as the session has it. */
export function puzzleGridProps(state: SessionState): PuzzleGridProps {
  return {
    name: puzzleName(state.puzzle),
    columnPills: lines(state, 'column').map((working) => pill(state, working)),
    rowPills: lines(state, 'row').map((working) => pill(state, working)),
    cells: state.puzzle.givens.map((_, row) => state.puzzle.givens[row]?.map((__, column) => cell(state, { row, column })) ?? []),
    rowWorkings: lines(state, 'row').map(workingProps),
    columnWorkings: lines(state, 'column').map(workingProps),
    helper: HELPER_LINE,
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

export function playScreenProps(state: SessionState, theme: Theme): PlayScreenProps {
  return {
    header: { title: TITLE, message: bubbleLine(state.message, theme) },
    counter: counterProps(state),
    grid: puzzleGridProps(state),
    mainButtonLabel: theme.buttonLabel,
    keysAvailable: state.selected !== null,
    announcement: announcement(state.message, theme, counterText(state)),
  };
}
