// The play session: a pure reducer over the current entry, the found solutions and the last
// message (data-model.md "Session"). No DOM access.

import type { Entry, LinePosition, Puzzle, SolutionKey } from '../engine';

export type MessageKind = 'new-solution' | 'all-found' | 'already-found' | 'not-solved' | 'incomplete';

export interface SessionState {
  readonly puzzle: Puzzle;
  readonly entry: Entry;
  readonly found: ReadonlySet<SolutionKey>;
  readonly message: MessageKind | null;
}

export type SessionAction =
  | { readonly type: 'tapCell'; readonly row: number; readonly column: number }
  | { readonly type: 'tapOperator'; readonly line: LinePosition }
  | { readonly type: 'submit' };

export function applyAction(state: SessionState): SessionState {
  return state;
}
