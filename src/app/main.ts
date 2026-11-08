// The game's entry point: the library's play screen, fed from the session (spec-004 research R1).

import '../ui/foundations/tokens.css';
import '../ui/foundations/page.css';
import { applyTheme, themeForSeed } from '../ui/foundations/themes';
import { createPlayScreen } from '../ui/screens/play-screen';
import type { Digit } from '../engine';
import { playScreenProps } from './screen';
import { applyAction, startSession, type SessionAction } from './session';

const root = document.getElementById('game');
if (!root) {
  throw new Error('index.html must contain <main id="game">.');
}

// The fixed puzzle has no seed, so it is shown in Classic (spec-003 AC-25).
const theme = themeForSeed(undefined);
let state = startSession();

applyTheme(document.documentElement, theme);

const screen = createPlayScreen(playScreenProps(state, theme), {
  onCell: (row, column) => act({ type: 'tapCell', row, column }),
  onPill: (axis, index) => act({ type: 'tapOperator', line: { axis, index } }),
  onCheck: () => act({ type: 'submit' }),
  onKey: (value) => act(value === 'clear' ? { type: 'clear' } : { type: 'key', digit: value as Digit }),
});
root.append(screen.element);

function act(action: SessionAction): void {
  state = applyAction(state, action);
  screen.update(playScreenProps(state, theme));
}
