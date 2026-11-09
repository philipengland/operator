// Saving found solutions on the phone (docs/contracts/saved-solutions.md; ADR 0004). Pure: the browser is
// reached only through the store it is given.

import type { Entry, Puzzle } from '../engine';

const FORMAT = 1;
const KEY_PREFIX = 'operator.solutions.';

export interface SolutionStore {
  read(key: string): string | null;
  /** `null` removes the record. */
  write(key: string, value: string | null): void;
}

export function readSolutions(_store: SolutionStore, _puzzle: Puzzle): readonly Entry[] {
  return [];
}

export function saveSolution(store: SolutionStore, puzzle: Puzzle, entry: Entry): void {
  store.write(keyFor(puzzle), JSON.stringify({ format: FORMAT, solutions: [entry] }));
}

function keyFor({ id }: Puzzle): string {
  return `${KEY_PREFIX}${id}`;
}
