// spec-007: today's puzzles in one session (data-model.md "Today"): the puzzle on the play screen, and
// the others kept as the player left them. Pure; no DOM, no clock: the date comes from today.ts.

import type { CalendarDate, PresetName } from '../engine';
import type { SessionState } from './session';

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

export const choose: (state: DailyState, choice: Choice) => DailyState = (state) => state;

/** The Today screen's rows, each as shown and heard: "Easy, found 1 of 4", then "Practice, found 0 of 2". */
export const todayRows: (state: DailyState) => readonly string[] = () => [];
