// The solution list's props, worked out from the session (spec-006). Pure; the library draws it.

import type { Theme } from '../ui/foundations/themes';
import type { Features } from './features';
import type { SolutionListProps } from '../ui/screens/solution-list';
import { emptyListLine, solutionName } from './labels';
import type { SessionState } from './session';

const HEADING = 'Solutions';
export const BACK = 'Back';
const START_AGAIN = 'Start again';
// What the build allows; rows are text and nothing can be cleared unless it says so.
type ListFeatures = Partial<Pick<Features, 'reopen' | 'startAgain'>>;

export function solutionListProps({ solutions }: SessionState, theme: Theme, { reopen = false, startAgain = false }: ListFeatures = {}): SolutionListProps {
  return { heading: HEADING, backLabel: BACK, rows: solutions.map((_, index) => solutionName(index + 1)), canOpenRows: reopen, empty: emptyListLine(theme), ...(startAgain ? { startAgainLabel: START_AGAIN } : {}) };
}
