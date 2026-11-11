// The game's entry point: the library's screens, fed from today's puzzles and the session on the play
// screen (spec-004 research R1; spec-007 data-model "Today").

import '../ui/foundations/tokens.css';
import '../ui/foundations/page.css';
import { applyTheme } from '../ui/foundations/themes';
import { createConfirmDialog } from '../ui/combined/confirm-dialog';
import { createPlayScreen, type PlayScreenComponent } from '../ui/screens/play-screen';
import { createSolutionList } from '../ui/screens/solution-list';
import { createSolutionView, type SolutionViewScreen } from '../ui/screens/solution-view';
import { createTodayList } from '../ui/screens/today-list';
import type { Digit } from '../engine';
import { START_AGAIN_QUESTION } from './labels';
import { playScreenProps, puzzleTheme } from './screen';
import { applyAction, startSession, type Place, type SessionAction } from './session';
import { historyEntryFor, placeFrom } from './navigation';
import { solutionListProps } from './solution-list';
import { solutionViewProps } from './solution-view';
import { createBrowserStore } from './browser-store';
import { readSolutions, rememberChange } from './solution-store';
import { choose, openToday, startDaily, todayChoices, type DailyState, type SavedSolutions } from './daily';
import { dateOnThePhone } from './today';
import { presetsOffered, todayListProps } from './today-list';
import type { Features } from './features';

// Fixed at build time (vite.config.ts; constitution VII).
declare const __OPERATOR_FEATURES__: Features;

const root = document.getElementById('game');
if (!root) {
  throw new Error('index.html must contain <main id="game">.');
}
const game = root;

const features = __OPERATOR_FEATURES__;
// Today's presets each story releases (spec-007 research R11).
const OFFERED = presetsOffered(features);
const store = createBrowserStore(() => window.localStorage);
const saved: SavedSolutions = (puzzle) => readSolutions(store, puzzle);
const practice = startSession();
let daily: DailyState = startDaily(dateOnThePhone(new Date()), applyAction(practice, { type: 'restoreFound', solutions: saved(practice.puzzle) }), OFFERED);
// The worked example has no seed, so it is shown in Classic (spec-003 AC-25); a daily puzzle in its seed's (FR-712).
let theme = puzzleTheme(daily.session);
applyTheme(document.documentElement, theme);

let screen = createScreen();
const list = createSolutionList(solutionListProps(daily.session, theme), {
  onBack: () => history.back(),
  onRow: (index) => openSolution(index + 1),
  onStartAgain: askToStartAgain,
});
const today = createTodayList(todayListProps(daily), { onBack: () => history.back(), onRow: chooseRow });
// The pop-up is one history entry, so the phone's back gesture closes it (spec-006 research R7).
const popUp = createConfirmDialog(START_AGAIN_QUESTION, {
  onConfirm: () => {
    act({ type: 'startAgain' });
    history.back();
  },
  onCancel: () => history.back(),
});
let isPopUpShown = false;
let openSolutionView: SolutionViewScreen | null = null;
game.append(screen.element, popUp.element);
let shownPlace: Place = daily.session.place;

// A reload opens on the puzzle, so the entry left by a screen that was open is replaced (research R7).
history.replaceState(historyEntryFor(daily.session.place), '');
window.addEventListener('popstate', (event) => {
  const place = placeFrom(event.state);
  if (place.kind === 'today') {
    showToday();
    return;
  }
  act({ type: 'showPlace', place });
});

/** The play screen for the puzzle now on it; a grid's size is fixed once shown, so each puzzle has its own. */
function createScreen(): PlayScreenComponent {
  return createPlayScreen(playScreenProps(daily.session, theme), {
    onCell: (row, column) => act({ type: 'tapCell', row, column }),
    onPill: (axis, index) => act({ type: 'tapOperator', line: { axis, index } }),
    onCheck: () => act({ type: 'submit' }),
    onKey: (value) => act(value === 'clear' ? { type: 'clear' } : { type: 'key', digit: value as Digit }),
    onCounter: openList,
    ...(features.daily ? { onToday: openTodayScreen } : {}),
  });
}

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

function openTodayScreen(): void {
  history.pushState(historyEntryFor({ kind: 'today' }), '');
  showToday();
}

function showToday(): void {
  daily = openToday(daily, saved);
  render();
}

/** The chosen puzzle replaces the Today screen in history, so the back gesture leaves it (FR-701). */
function chooseRow(index: number): void {
  const choice = todayChoices(daily)[index];
  if (choice === undefined) {
    return;
  }
  const previousPuzzle = daily.session.puzzle;
  daily = choose(daily, choice, saved);
  history.replaceState(historyEntryFor(daily.session.place), '');
  if (daily.session.puzzle !== previousPuzzle) {
    showNewPuzzle();
  }
  render();
}

/** Another puzzle: its own play screen, in its own theme. */
function showNewPuzzle(): void {
  theme = puzzleTheme(daily.session);
  applyTheme(document.documentElement, theme);
  const next = createScreen();
  screen.element.replaceWith(next.element);
  screen = next;
}

function act(action: SessionAction): void {
  const previous = daily.session;
  daily = { ...daily, session: applyAction(previous, action) };
  rememberChange(store, previous, daily.session);
  render();
}

function render(): void {
  screen.update(playScreenProps(daily.session, theme));
  list.update(solutionListProps(daily.session, theme));
  today.update(todayListProps(daily));
  showScreen();
  showPopUp();
}

function showPopUp(): void {
  if (daily.session.isConfirming === isPopUpShown) {
    return;
  }
  isPopUpShown = daily.session.isConfirming;
  if (isPopUpShown) {
    popUp.open();
    return;
  }
  popUp.close();
  if (daily.session.solutions.length > 0) {
    list.focusStartAgain();
  } else {
    list.focusHeading();
  }
}

/** The play screen stays in the page, hidden, so nothing about the game is lost (research R6). */
function showScreen(): void {
  const previous = shownPlace;
  const place = daily.session.place;
  if (JSON.stringify(place) === JSON.stringify(previous)) {
    return;
  }
  shownPlace = place;
  list.element.remove();
  today.element.remove();
  openSolutionView?.element.remove();
  screen.element.hidden = place.kind !== 'play';
  if (place.kind === 'list') {
    showList(previous);
  } else if (place.kind === 'solution') {
    showSolution(place.number);
  } else if (place.kind === 'today') {
    game.append(today.element);
    today.focusHeading();
  } else {
    screen.focusCounter();
  }
}

function showList(previous: Place): void {
  game.append(list.element);
  if (previous.kind === 'solution') {
    list.focusRow(previous.number - 1);
  } else {
    list.focusHeading();
  }
}

function showSolution(number: number): void {
  openSolutionView = createSolutionView(solutionViewProps(daily.session, number), { onBack: () => history.back() });
  game.append(openSolutionView.element);
  openSolutionView.focusHeading();
}
