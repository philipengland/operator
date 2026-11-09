// Saving found solutions on the phone (docs/contracts/saved-solutions.md; ADR 0004). Pure: the browser is
// reached only through the store it is given.

import { checkEntry, defaultRules, type Entry, type Puzzle } from '../engine';

const FORMAT = 1;
const KEY_PREFIX = 'operator.solutions.';

export interface SolutionStore {
  read(key: string): string | null;
  /** `null` removes the record. */
  write(key: string, value: string | null): void;
}

export function readSolutions(store: SolutionStore, puzzle: Puzzle): readonly Entry[] {
  const solutions = parsed(store.read(keyFor(puzzle)))?.solutions;
  return Array.isArray(solutions) ? solutions.filter((entry) => checkEntry(puzzle, entry, defaultRules).kind === 'solved') : [];
}

function parsed(raw: string | null): { readonly solutions?: Entry[] } | null {
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as { readonly solutions?: Entry[] };
  } catch {
    return null;
  }
}

export function saveSolution(store: SolutionStore, puzzle: Puzzle, entry: Entry): void {
  store.write(keyFor(puzzle), JSON.stringify({ format: FORMAT, solutions: [...readSolutions(store, puzzle), entry] }));
}

function keyFor({ id }: Puzzle): string {
  return `${KEY_PREFIX}${id}`;
}
