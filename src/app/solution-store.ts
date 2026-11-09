// Saving found solutions on the phone (docs/contracts/saved-solutions.md; ADR 0004). Pure: the browser is
// reached only through the store it is given.

import { checkEntry, defaultRules, type Entry, type Operator, type Puzzle, type SolutionKey } from '../engine';
import type { SessionState } from './session';

const FORMAT = 1;
const KEY_PREFIX = 'operator.solutions.';
const LOWEST_DIGIT = 1;
const HIGHEST_DIGIT = 9;
const OPERATORS: readonly Operator[] = ['+', '−', '×', '÷'];

interface SavedRecord {
  readonly format?: unknown;
  readonly solutions?: unknown;
}

export interface SolutionStore {
  read(key: string): string | null;
  /** `null` removes the record. */
  write(key: string, value: string | null): void;
}

/** Keeps the phone in step with the session, after one action. */
export function rememberChange(store: SolutionStore, previous: SessionState, next: SessionState): void {
  const latest = next.solutions.at(-1);
  if (latest !== undefined && next.solutions.length > previous.solutions.length) {
    saveSolution(store, next.puzzle, latest);
  }
  if (previous.solutions.length > 0 && next.solutions.length === 0) {
    store.write(keyFor(next.puzzle), null);
  }
}

export function readSolutions(store: SolutionStore, puzzle: Puzzle): readonly Entry[] {
  const record = parsed(store.read(keyFor(puzzle)));
  return record?.format === FORMAT && Array.isArray(record.solutions) ? distinctSolutions(record.solutions, puzzle) : [];
}

/** Only entries that solve the puzzle, each solution once, at its first place. */
function distinctSolutions(candidates: readonly unknown[], puzzle: Puzzle): readonly Entry[] {
  const byKey = new Map<SolutionKey, Entry>();
  for (const candidate of candidates) {
    const result = isEntry(candidate, puzzle) ? checkEntry(puzzle, candidate, defaultRules) : null;
    if (result?.kind === 'solved' && !byKey.has(result.key)) {
      byKey.set(result.key, candidate as Entry);
    }
  }
  return [...byKey.values()];
}

function parsed(raw: string | null): SavedRecord | null {
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as SavedRecord;
  } catch {
    return null;
  }
}

export function saveSolution(store: SolutionStore, puzzle: Puzzle, entry: Entry): void {
  const format = parsed(store.read(keyFor(puzzle)))?.format;
  if (typeof format === 'number' && format > FORMAT) {
    return;
  }
  store.write(keyFor(puzzle), JSON.stringify({ format: FORMAT, solutions: [...readSolutions(store, puzzle), entry] }));
}

function keyFor({ id }: Puzzle): string {
  return `${KEY_PREFIX}${id}`;
}

function isEntry(value: unknown, puzzle: Puzzle): value is Entry {
  const entry = value as Partial<Entry> | null;
  return (
    isGrid(entry?.cells, puzzle) &&
    isOperators(entry?.rowOperators, puzzle.rows) &&
    isOperators(entry?.columnOperators, puzzle.columns)
  );
}

function isGrid(cells: unknown, { rows, columns }: Puzzle): boolean {
  return Array.isArray(cells) && cells.length === rows && cells.every((row: unknown) => Array.isArray(row) && row.length === columns && row.every(isDigitOrEmpty));
}

function isDigitOrEmpty(cell: unknown): boolean {
  return cell === null || (Number.isInteger(cell) && (cell as number) >= LOWEST_DIGIT && (cell as number) <= HIGHEST_DIGIT);
}

function isOperators(operators: unknown, length: number): boolean {
  return Array.isArray(operators) && operators.length === length && operators.every((operator: unknown) => operator === null || OPERATORS.includes(operator as Operator));
}
