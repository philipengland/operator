// The play screen's props, worked out from the session: the only place game state becomes what the
// component library shows (spec-004 research R1). Pure; the library draws it.

import type { PlayScreenProps } from '../ui/screens/play-screen';
import type { Theme } from '../ui/foundations/themes';
import type { Features } from './features';
import { announcement, bubbleLine, cellTitle, pillName, workingName, workingSlot } from './labels';
import { lineOperator, lineSpec, type CellPosition, type LinePosition, type LineWorking } from '../engine';
import type { GridCellProps } from '../ui/combined/grid-cell';
import type { LineWorkingProps } from '../ui/combined/line-working';
import type { TargetPillProps } from '../ui/combined/target-pill';
import { counterText, lineWorkings, type SessionState } from './session';

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

function cell(state: SessionState, position: CellPosition, isKeypadOn: boolean): GridCellProps {
  const { puzzle, entry } = state;
  const given = puzzle.givens[position.row]?.[position.column] ?? null;
  return {
    name: cellTitle(position),
    digit: given ?? entry.cells[position.row]?.[position.column] ?? null,
    isGiven: given !== null,
    isInCorrectLine: given === null && isInLineReachingTarget(state, position),
    isSelected: isKeypadOn && isSamePosition(state.selected, position),
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

export function playScreenProps(state: SessionState, theme: Theme, features: Features): PlayScreenProps {
  return {
    header: { title: TITLE, message: bubbleLine(state.message, theme) },
    counter: { found: state.found.size, total: state.puzzle.solutionCount },
    grid: {
      columnPills: lines(state, 'column').map((working) => pill(state, working)),
      rowPills: lines(state, 'row').map((working) => pill(state, working)),
      cells: state.puzzle.givens.map((_, row) => state.puzzle.givens[row]?.map((__, column) => cell(state, { row, column }, features.keypad)) ?? []),
      rowWorkings: lines(state, 'row').map(workingProps),
      columnWorkings: lines(state, 'column').map(workingProps),
      helper: HELPER_LINE,
    },
    mainButtonLabel: theme.buttonLabel,
    isKeypadShown: features.keypad,
    keysAvailable: state.selected !== null,
    announcement: announcement(state.message, counterText(state)),
  };
}
