// The play session: a pure reducer over the current entry, the found solutions and the last
// message (data-model.md "Session"). No DOM access.

import { emptyEntry, workedExample, type Entry, type LinePosition, type Puzzle, type SolutionKey } from '../engine';

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

export function startSession(): SessionState {
  return {
    puzzle: workedExample,
    entry: emptyEntry(workedExample),
    found: new Set(),
    message: null,
  };
}

/** "Found N of M" (FR-013). */
export function counterText(state: SessionState): string {
  return `Found ${state.found.size} of ${state.puzzle.solutionCount}`;
}

export function applyAction(state: SessionState): SessionState {
  return state;
}
