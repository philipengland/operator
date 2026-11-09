// Solution list (screen): the solutions found, or a line saying there are none (spec-006 FR-602, FR-603;
// docs/contracts/component-library.md). Wording is passed in.

import type { ButtonProps } from '../simple/button.model';

export interface SolutionListProps {
  readonly heading: string;
  readonly backLabel: string;
  /** Each found solution's name, in the order found. */
  readonly rows: readonly string[];
  /** False shows the rows as text, not as buttons. */
  readonly canOpenRows: boolean;
  /** What the list says when it is empty, and what a screen reader hears instead. */
  readonly empty: { readonly shown: string; readonly heardAs: string };
  /** The way to clear everything; left out when there is none to offer. */
  readonly startAgainLabel?: string;
}

export interface SolutionListModel {
  readonly back: ButtonProps;
  readonly rows: readonly ButtonProps[];
  readonly empty: SolutionListProps['empty'] | null;
  readonly startAgain: ButtonProps | null;
}

export function solutionListModel({ rows, canOpenRows }: SolutionListProps): SolutionListModel {
  const asRow = (label: string): ButtonProps => (canOpenRows ? { label, style: 'key' } : { label, style: 'key', isReadOnly: true });
  return { back: { label: '', style: 'key' }, rows: rows.map(asRow), empty: null, startAgain: null };
}
