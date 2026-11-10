// spec-007: today's puzzles in one session (data-model.md "Today"): the puzzle on the play screen, and
// the others kept as the player left them. Pure; no DOM, no clock: the date comes from today.ts.

import { dailyPuzzle, type CalendarDate, type PresetName } from '../engine';
import { startSession, type SessionState } from './session';

/** A row on the Today screen: one of today's puzzles, or the worked example as Practice. */
export type Choice = PresetName | 'practice';

export interface DailyState {
  readonly date: CalendarDate;
  readonly current: Choice;
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

export function openToday(state: DailyState): DailyState {
  return { ...state, session: { ...state.session, place: { kind: 'today' } } };
}

/** The chosen puzzle goes on the play screen; the one left is kept as the player left it (FR-708). */
export function choose(state: DailyState, choice: Choice): DailyState {
  const everyKept: DailyState['kept'] = { ...state.kept, [state.current]: state.session };
  const session = everyKept[choice] ?? freshSession(state.date, choice);
  const kept = Object.fromEntries(Object.entries(everyKept).filter(([each]) => each !== choice));
  return { ...state, current: choice, session, kept };
}

function freshSession(date: CalendarDate, choice: Choice): SessionState {
  return choice === 'practice' ? startSession() : startSession(dailyPuzzle(date, choice).puzzle);
}

/** The Today screen's rows, each as shown and heard: "Easy, found 1 of 4", then "Practice, found 0 of 2". */
export const todayRows: (state: DailyState) => readonly string[] = () => [];
