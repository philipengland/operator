// The play screen's props, worked out from the session: the only place game state becomes what the
// component library shows (spec-004 research R1). Pure; the library draws it.

import type { PlayScreenProps } from '../ui/screens/play-screen';
import type { Theme } from '../ui/foundations/themes';
import type { Features } from './features';
import { bubbleLine } from './labels';
import type { SessionState } from './session';

const TITLE = 'Hello, Operator!';

export function playScreenProps(state: SessionState, theme: Theme, _features: Features): PlayScreenProps {
  return {
    header: { title: TITLE, message: bubbleLine(state.message, theme) },
    counter: { found: state.found.size, total: state.puzzle.solutionCount },
    grid: { columnPills: [], rowPills: [], cells: [], rowWorkings: [], columnWorkings: [], helper: '' },
    mainButtonLabel: theme.buttonLabel,
  };
}
