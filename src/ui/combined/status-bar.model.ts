// Status bar (combined component, spec-007 FR-719): on a large grid's compact screen, one row holding
// the Solutions counter and the Today button, in place of the mascot, speech bubble and counter.

import type { ButtonProps } from '../simple/button.model';

export interface StatusBarModel {
  readonly name: string;
  readonly todayButton: ButtonProps;
}

/** The way to the Today screen, here and beside the counter on the full header (play-screen contract). */
export const TODAY_BUTTON: ButtonProps = { label: 'Today', name: "Today's puzzles", style: 'key' };

export function statusBarModel(): StatusBarModel {
  return { name: 'Status bar', todayButton: TODAY_BUTTON };
}
