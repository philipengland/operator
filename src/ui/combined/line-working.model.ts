// Line working (combined component): a line's result slot as spec-002 shows it ("= ?", "= 8 ✓",
// "= −3", "✗"), heard by the line's whole working (spec-003 FR-317; docs/contracts/component-library.md).

import type { IconShape } from '../simple/icon.model';

/** A line's mark: none, a tick when it reaches its target, a cross when a division is not whole. */
export type WorkingMark = 'none' | 'tick' | 'cross';

export interface LineWorkingProps {
  /** The visible result slot: "= ?", "= 8", "= −3", or "" when a cross says it all. */
  readonly result: string;
  readonly mark: WorkingMark;
  /** How the line is heard (play-screen contract): "Row 1 working, 6 + 2 = 8, target reached". */
  readonly name: string;
}

export interface LineWorkingModel {
  readonly result: string;
  /** The icon shown after the result; null when there is no mark. */
  readonly icon: IconShape | null;
  readonly heardAs: string;
}

export function lineWorkingModel({ result, mark, name }: LineWorkingProps): LineWorkingModel {
  return { result, icon: mark === 'none' ? null : mark, heardAs: name };
}
