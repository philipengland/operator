// The play screen's props, worked out from the session: the only place game state becomes what the
// component library shows (spec-004 research R1). Pure; the library draws it.

import type { PlayScreenProps } from '../ui/screens/play-screen';
import type { Theme } from '../ui/foundations/themes';
import type { Features } from './features';
import type { SessionState } from './session';

export function playScreenProps(_state: SessionState, _theme: Theme, _features: Features): PlayScreenProps {
  return {
    header: { title: '', message: '' },
    counter: { found: 0 },
    grid: { columnPills: [], rowPills: [], cells: [], rowWorkings: [], columnWorkings: [], helper: '' },
    mainButtonLabel: '',
  };
}
