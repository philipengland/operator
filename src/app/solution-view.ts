// A found solution's read-only view, worked out from the session (spec-006 FR-606). Pure; the library draws it.

import type { SolutionViewProps } from '../ui/screens/solution-view';
import { solutionName } from './labels';
import { puzzleGridProps } from './screen';
import type { SessionState } from './session';
import { BACK } from './solution-list';

export function solutionViewProps(state: SessionState, number: number): SolutionViewProps {
  return { heading: solutionName(number), backLabel: BACK, grid: puzzleGridProps({ ...state, entry: state.solutions[number - 1] ?? state.entry, selected: null }) };
}
