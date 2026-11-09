// The game's entry point: the library's play screen, fed from the session (spec-004 research R1).

import '../ui/foundations/tokens.css';
import '../ui/foundations/page.css';
import { applyTheme, themeForSeed } from '../ui/foundations/themes';
import { createConfirmDialog } from '../ui/combined/confirm-dialog';
import { createPlayScreen } from '../ui/screens/play-screen';
import { createSolutionList } from '../ui/screens/solution-list';
import { createSolutionView, type SolutionViewScreen } from '../ui/screens/solution-view';
import type { Digit } from '../engine';
import { START_AGAIN_QUESTION } from './labels';
import { playScreenProps } from './screen';
import { applyAction, startSession, type Place, type SessionAction } from './session';
import { historyEntryFor, placeFrom } from './navigation';
import { solutionListProps } from './solution-list';
import { solutionViewProps } from './solution-view';
import { createBrowserStore } from './browser-store';
import { readSolutions, rememberChange } from './solution-store';

const root = document.getElementById('game');
if (!root) {
  throw new Error('index.html must contain <main id="game">.');
}

// The fixed puzzle has no seed, so it is shown in Classic (spec-003 AC-25).
const theme = themeForSeed(undefined);
const store = createBrowserStore(() => window.localStorage);
const opening = startSession();
let state = applyAction(opening, { type: 'restoreFound', solutions: readSolutions(store, opening.puzzle) });

applyTheme(document.documentElement, theme);

const screen = createPlayScreen(playScreenProps(state, theme), {
  onCell: (row, column) => act({ type: 'tapCell', row, column }),
  onPill: (axis, index) => act({ type: 'tapOperator', line: { axis, index } }),
  onCheck: () => act({ type: 'submit' }),
  onKey: (value) => act(value === 'clear' ? { type: 'clear' } : { type: 'key', digit: value as Digit }),
  onCounter: openList,
});
const list = createSolutionList(solutionListProps(state, theme), {
  onBack: () => history.back(),
  onRow: (index) => openSolution(index + 1),
  onStartAgain: askToStartAgain,
});
// The pop-up is one history entry, so the phone's back gesture closes it (research R7).
const popUp = createConfirmDialog(START_AGAIN_QUESTION, {
  onConfirm: () => {
    act({ type: 'startAgain' });
    history.back();
  },
  onCancel: () => history.back(),
});
let isPopUpShown = false;
let openSolutionView: SolutionViewScreen | null = null;
root.append(screen.element, popUp.element);
let shownPlace: Place = state.place;

// A reload opens on the puzzle, so the entry left by a screen that was open is replaced (research R7).
history.replaceState(historyEntryFor(state.place), '');
window.addEventListener('popstate', (event) => act({ type: 'showPlace', place: placeFrom(event.state) }));

function openList(): void {
  history.pushState(historyEntryFor({ kind: 'list' }), '');
  act({ type: 'openList' });
}

function askToStartAgain(): void {
  history.pushState(historyEntryFor({ kind: 'list' }), '');
  act({ type: 'askToStartAgain' });
}

function openSolution(number: number): void {
  history.pushState(historyEntryFor({ kind: 'solution', number }), '');
  act({ type: 'openSolution', number });
}

function act(action: SessionAction): void {
  const previous = state;
  state = applyAction(state, action);
  rememberChange(store, previous, state);
  screen.update(playScreenProps(state, theme));
  list.update(solutionListProps(state, theme));
  showScreen();
  showPopUp();
}

function showPopUp(): void {
  if (state.isConfirming === isPopUpShown) {
    return;
  }
  isPopUpShown = state.isConfirming;
  if (isPopUpShown) {
    popUp.open();
    return;
  }
  popUp.close();
  if (state.solutions.length > 0) {
    list.focusStartAgain();
  } else {
    list.focusHeading();
  }
}

/** The play screen stays in the page, hidden, so nothing about the game is lost (research R6). */
function showScreen(): void {
  const previous = shownPlace;
  if (JSON.stringify(state.place) === JSON.stringify(previous)) {
    return;
  }
  shownPlace = state.place;
  list.element.remove();
  openSolutionView?.element.remove();
  screen.element.hidden = shownPlace.kind !== 'play';
  if (shownPlace.kind === 'list') {
    showList(previous);
  } else if (shownPlace.kind === 'solution') {
    showSolution(shownPlace.number);
  } else {
    screen.focusCounter();
  }
}

function showList(previous: Place): void {
  root?.append(list.element);
  if (previous.kind === 'solution') {
    list.focusRow(previous.number - 1);
  } else {
    list.focusHeading();
  }
}

function showSolution(number: number): void {
  openSolutionView = createSolutionView(solutionViewProps(state, number), { onBack: () => history.back() });
  root?.append(openSolutionView.element);
  openSolutionView.focusHeading();
}
