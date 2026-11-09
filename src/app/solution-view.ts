// A found solution's read-only view, worked out from the session (spec-006 FR-606). Pure; the library draws it.

import type { TargetPillProps } from '../ui/combined/target-pill';
import type { SolutionViewProps } from '../ui/screens/solution-view';
import { solutionName } from './labels';
import { puzzleGridProps } from './screen';
import type { SessionState } from './session';
import { BACK } from './solution-list';

export function solutionViewProps(state: SessionState, number: number): SolutionViewProps {
  const solved = puzzleGridProps({ ...state, entry: state.solutions[number - 1] ?? state.entry, selected: null });
  return {
    heading: solutionName(number),
    backLabel: BACK,
    grid: {
      ...solved,
      columnPills: solved.columnPills.map(shownPill),
      rowPills: solved.rowPills.map(shownPill),
      cells: solved.cells.map((row) => row.map((cell) => ({ ...cell, isReadOnly: true }))),
    },
  };
}

function shownPill(pill: TargetPillProps): TargetPillProps {
  return { ...pill, isOpen: false };
}
