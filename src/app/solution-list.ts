// The solution list's props, worked out from the session (spec-006). Pure; the library draws it.

import type { Theme } from '../ui/foundations/themes';
import type { SolutionListProps } from '../ui/screens/solution-list';
import { emptyListLine, solutionName } from './labels';
import type { SessionState } from './session';

const HEADING = 'Solutions';
const BACK = 'Back';

export function solutionListProps({ solutions }: SessionState, theme: Theme): SolutionListProps {
  return { heading: HEADING, backLabel: BACK, rows: solutions.map((_, index) => solutionName(index + 1)), canOpenRows: false, empty: emptyListLine(theme) };
}
