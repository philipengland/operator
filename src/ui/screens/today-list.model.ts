// Today list (screen, spec-007 FR-701): today's puzzles by preset, each with its count, then the
// worked example as "Practice" (docs/contracts/component-library.md). Wording is passed in.

import type { SpeechBubbleProps } from '../combined/speech-bubble';
import type { ButtonProps } from '../simple/button';

export interface TodayListProps {
  readonly heading: string;
  readonly backLabel: string;
  /** Each choice as shown and heard, "Easy, found 1 of 4", in order, Practice last. */
  readonly rows: readonly string[];
}

export interface TodayListModel {
  readonly back: ButtonProps;
  readonly rows: readonly ButtonProps[];
}

export function todayListModel({ backLabel, rows }: TodayListProps): TodayListModel {
  return { back: { label: backLabel, style: 'key' }, rows: rows.map((label) => ({ label, style: 'key' })) };
}

/** The bubble at the top: the heading alone. */
export function todayListHeader({ heading }: TodayListProps): SpeechBubbleProps {
  return { title: heading, message: '', isMessageHeard: false, isTitleHeading: true };
}
