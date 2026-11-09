// Saving found solutions on the phone (docs/contracts/saved-solutions.md; ADR 0004). Pure: the browser is
// reached only through the store it is given.

import { checkEntry, defaultRules, type Entry, type Operator, type Puzzle } from '../engine';

const FORMAT = 1;
const KEY_PREFIX = 'operator.solutions.';
const LOWEST_DIGIT = 1;
const HIGHEST_DIGIT = 9;
const OPERATORS: readonly Operator[] = ['+', '−', '×', '÷'];

export interface SolutionStore {
  read(key: string): string | null;
  /** `null` removes the record. */
  write(key: string, value: string | null): void;
}

export function readSolutions(store: SolutionStore, puzzle: Puzzle): readonly Entry[] {
  const solutions = parsed(store.read(keyFor(puzzle)))?.solutions;
  return Array.isArray(solutions) ? solutions.filter((entry: unknown): entry is Entry => isEntry(entry, puzzle) && checkEntry(puzzle, entry, defaultRules).kind === 'solved') : [];
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
