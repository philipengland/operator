// Workings strip (combined component, spec-007 FR-718, FR-719): under a large grid, the selected
// cell's row and column workings in full ("6 + 2 = 8 ✓"), or one line of text: a prompt to tap a
// cell, or the operator's line after a Check. Seen only: every working is heard where it belongs.

import type { LineWorkingProps } from './line-working.model';

/** The row's working then the column's; or a line of text in their place. */
export type WorkingsStripProps = { readonly workings: readonly LineWorkingProps[] } | { readonly text: string };

export interface WorkingsStripModel {
  readonly workings: readonly LineWorkingProps[];
  /** Empty when workings are shown. */
  readonly text: string;
}

export function workingsStripModel(props: WorkingsStripProps): WorkingsStripModel {
  return 'workings' in props ? { workings: props.workings, text: '' } : { workings: [], text: props.text };
}
