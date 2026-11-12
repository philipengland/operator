// spec-007: today's puzzles in one session (data-model.md "Today"): the puzzle on the play screen, and
// the others kept as the player left them. Pure; no DOM, no clock: the date comes from today.ts.

import { dailyPuzzle, emptyEntry, type CalendarDate, type Entry, type PresetName, type Puzzle } from '../engine';
import { applyAction, counterText, startSession, type SessionState } from './session';
import type { LastPlayed } from './today-record';

/** A row on the Today screen: one of today's puzzles, or the worked example as Practice. */
export type Choice = PresetName | 'practice';

export interface DailyState {
  readonly date: CalendarDate;
  /** Which of today's choices is on the play screen; null for a puzzle of an earlier day, still open. */
  readonly current: Choice | null;
  /** The puzzle on the play screen. */
  readonly session: SessionState;
  /** Every other puzzle opened today, as the player left it. */
  readonly kept: Readonly<Partial<Record<Choice, SessionState>>>;
  /** Today's presets, in the Today screen's order; a story's flag decides which (research R11). */
  readonly offered: readonly PresetName[];
}

/** The game opens on the worked example (spec-007 FR-701). */
export function startDaily(date: CalendarDate, practice: SessionState, offered: readonly PresetName[]): DailyState {
  return { date, current: 'practice', session: practice, kept: {}, offered };
}

/** What the phone has saved for a puzzle (spec-006); nothing, unless the app says otherwise. */
export type SavedSolutions = (puzzle: Puzzle) => readonly Entry[];

const NOTHING_SAVED: SavedSolutions = () => [];

/** The Today screen over the puzzle; today's puzzles not yet made are made, so each row has its count. */
export function openToday(state: DailyState, saved: SavedSolutions = NOTHING_SAVED): DailyState {
  const made = state.offered.filter((preset) => preset !== state.current && state.kept[preset] === undefined);
  const kept = { ...state.kept, ...Object.fromEntries(made.map((preset) => [preset, freshSession(state.date, preset, saved)])) };
  return { ...state, kept, session: { ...state.session, place: { kind: 'today' } } };
}

/** The phone's date when the Today screen opens (research R6). */
export function onDate(state: DailyState, date: CalendarDate): DailyState {
  if (date === state.date) {
    return state;
  }
  // A new day: its puzzles are made afresh. The puzzle on screen stays open; Practice keeps what it found.
  const practice = state.current === 'practice' ? {} : pick(state.kept, 'practice');
  return { ...state, date, current: state.current === 'practice' ? 'practice' : null, kept: practice };
}

function pick(kept: DailyState['kept'], choice: Choice): DailyState['kept'] {
  const session = kept[choice];
  return session === undefined ? {} : { [choice]: session };
}

/** On opening the game: the puzzle last played, if the phone says so (FR-701, FR-715). */
export function openLastPlayed(state: DailyState, lastPlayed: LastPlayed, saved: SavedSolutions = NOTHING_SAVED): DailyState {
  if (typeof lastPlayed === 'string') {
    return state;
  }
  return choose(state, lastPlayed.preset, saved);
}

/** The chosen puzzle goes on the play screen; the one left is kept as the player left it (FR-708). */
export function choose(state: DailyState, choice: Choice, saved: SavedSolutions = NOTHING_SAVED): DailyState {
  const everyKept: DailyState['kept'] = state.current === null ? state.kept : { ...state.kept, [state.current]: state.session };
  const session = openedAgain(everyKept[choice] ?? freshSession(state.date, choice, saved));
  const kept = Object.fromEntries(Object.entries(everyKept).filter(([each]) => each !== choice));
  return { ...state, current: choice, session, kept };
}

/** FR-709: an empty grid, no selected cell, the greeting, on the play screen; what was found is kept. */
function openedAgain(session: SessionState): SessionState {
  return { ...session, entry: emptyEntry(session.puzzle), selected: null, message: null, place: { kind: 'play' }, isConfirming: false };
}

/** A puzzle opened for the first time today, with whatever the phone has saved for it. */
function freshSession(date: CalendarDate, choice: Choice, saved: SavedSolutions): SessionState {
  const session = choice === 'practice' ? startSession() : startSession(dailyPuzzle(date, choice).puzzle);
  return applyAction(session, { type: 'restoreFound', solutions: saved(session.puzzle) });
}

const CHOICE_WORDS: Readonly<Record<Choice, string>> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', collector: 'Collector', practice: 'Practice' };

/** The Today screen's choices, in order: today's presets, then Practice. */
export function todayChoices({ offered }: DailyState): readonly Choice[] {
  return [...offered, 'practice'];
}

/** The Today screen's rows, each as shown and heard: "Easy, found 1 of 4", then "Practice, found 0 of 2". */
export function todayRows(state: DailyState): readonly string[] {
  return todayChoices(state).flatMap((choice) => {
    const session = choice === state.current ? state.session : state.kept[choice];
    return session === undefined ? [] : [`${CHOICE_WORDS[choice]}, ${counterText(session).replace('Found', 'found')}`];
  });
}
