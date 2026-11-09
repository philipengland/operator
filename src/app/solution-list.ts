// The solution list's props, worked out from the session (spec-006). Pure; the library draws it.

import type { Theme } from '../ui/foundations/themes';
import type { Features } from './features';
import type { SolutionListProps } from '../ui/screens/solution-list';
import { emptyListLine, solutionName } from './labels';
import type { SessionState } from './session';

const HEADING = 'Solutions';
export const BACK = 'Back';
// Rows are text unless the build says they can be opened.
const TEXT_ROWS: Pick<Features, 'reopen'> = { reopen: false };

export function solutionListProps({ solutions }: SessionState, theme: Theme, { reopen }: Pick<Features, 'reopen'> = TEXT_ROWS): SolutionListProps {
  return { heading: HEADING, backLabel: BACK, rows: solutions.map((_, index) => solutionName(index + 1)), canOpenRows: reopen, empty: emptyListLine(theme) };
}
