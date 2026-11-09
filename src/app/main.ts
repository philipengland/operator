// The game's entry point: the library's play screen, fed from the session (spec-004 research R1).

import '../ui/foundations/tokens.css';
import '../ui/foundations/page.css';
import { applyTheme, themeForSeed } from '../ui/foundations/themes';
import { createPlayScreen } from '../ui/screens/play-screen';
import { createSolutionList } from '../ui/screens/solution-list';
import type { Digit } from '../engine';
import { playScreenProps } from './screen';
import type { Features } from './features';
import { applyAction, startSession, type SessionAction } from './session';
import { historyEntryFor, placeFrom } from './navigation';
import { solutionListProps } from './solution-list';

// Fixed at build time (vite.config.ts; constitution VII).
declare const __OPERATOR_FEATURES__: Features;

const root = document.getElementById('game');
if (!root) {
  throw new Error('index.html must contain <main id="game">.');
}

// The fixed puzzle has no seed, so it is shown in Classic (spec-003 AC-25).
const theme = themeForSeed(undefined);
const features = __OPERATOR_FEATURES__;
let state = startSession();

applyTheme(document.documentElement, theme);

const screen = createPlayScreen(playScreenProps(state, theme), {
  onCell: (row, column) => act({ type: 'tapCell', row, column }),
  onPill: (axis, index) => act({ type: 'tapOperator', line: { axis, index } }),
  onCheck: () => act({ type: 'submit' }),
  onKey: (value) => act(value === 'clear' ? { type: 'clear' } : { type: 'key', digit: value as Digit }),
  ...(features.log ? { onCounter: openList } : {}),
});
const list = createSolutionList(solutionListProps(state, theme), { onBack: () => history.back() });
root.append(screen.element);
let shownPlace = state.place.kind;

// A reload opens on the puzzle, so the entry left by a screen that was open is replaced (research R7).
history.replaceState(historyEntryFor(state.place), '');
window.addEventListener('popstate', (event) => act({ type: 'showPlace', place: placeFrom(event.state) }));

function openList(): void {
  history.pushState(historyEntryFor({ kind: 'list' }), '');
  act({ type: 'openList' });
}

function act(action: SessionAction): void {
  state = applyAction(state, action);
  screen.update(playScreenProps(state, theme));
  list.update(solutionListProps(state, theme));
  showScreen();
}

/** The play screen stays in the page, hidden, so nothing about the game is lost (research R6). */
function showScreen(): void {
  if (state.place.kind === shownPlace) {
    return;
  }
  shownPlace = state.place.kind;
  const isOnList = shownPlace === 'list';
  screen.element.hidden = isOnList;
  if (isOnList) {
    root?.append(list.element);
    list.focusHeading();
  } else {
    list.element.remove();
    screen.focusCounter();
  }
}
