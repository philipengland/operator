// The solution list's props, worked out from the session (spec-006). Pure; the library draws it.

import type { Theme } from '../ui/foundations/themes';
import type { SolutionListProps } from '../ui/screens/solution-list';
import { emptyListLine } from './labels';
import type { SessionState } from './session';

const HEADING = 'Solutions';
const BACK = 'Back';

export function solutionListProps(_state: SessionState, theme: Theme): SolutionListProps {
  return { heading: HEADING, backLabel: BACK, rows: [], canOpenRows: false, empty: emptyListLine(theme) };
}
