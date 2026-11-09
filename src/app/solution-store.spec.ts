import { describe, expect, it } from 'vitest';
import { workedExample, type Entry } from '../engine';
import { readSolutions, saveSolution, type SolutionStore } from './solution-store';

const KEY = 'operator.solutions.worked-example';
const SOLUTION_A: Entry = { cells: [[null, 2], [2, 3]], rowOperators: [null, '×'], columnOperators: ['÷', null] };
const SOLUTION_B: Entry = { cells: [[null, 2], [3, 3]], rowOperators: [null, '+'], columnOperators: ['−', null] };

/** A store held in memory, starting with these records. */
function storeWith(records: Readonly<Record<string, string>> = {}): SolutionStore & { readonly records: Map<string, string> } {
  const held = new Map(Object.entries(records));
  return {
    records: held,
    read: (key) => held.get(key) ?? null,
    write: (key, value) => {
      if (value === null) {
        held.delete(key);
      } else {
        held.set(key, value);
      }
    },
  };
}

describe('saveSolution', () => {
  it('writes the agreed format, under the puzzle\'s own key (spec-006 AC-14)', () => {
    const store = storeWith();

    saveSolution(store, workedExample, SOLUTION_A);

    expect(JSON.parse(store.records.get(KEY) ?? 'null')).toEqual({ format: 1, solutions: [SOLUTION_A] });
  });

  it('adds to what is stored, in the order found (spec-006 AC-17)', () => {
    const store = storeWith();

    saveSolution(store, workedExample, SOLUTION_A);
    saveSolution(store, workedExample, SOLUTION_B);

    expect(readSolutions(store, workedExample)).toEqual([SOLUTION_A, SOLUTION_B]);
  });
});

describe('readSolutions', () => {
  const saved = (...solutions: readonly unknown[]): string => JSON.stringify({ format: 1, solutions });

  it('reads back what was saved (spec-006 AC-14)', () => {
    expect(readSolutions(storeWith({ [KEY]: saved(SOLUTION_A) }), workedExample)).toEqual([SOLUTION_A]);
  });

  it('treats text that is not a saved record as nothing saved (spec-006 AC-20)', () => {
    const reading = () => readSolutions(storeWith({ [KEY]: 'this is not a saved game' }), workedExample);

    expect(reading).not.toThrow();
  });

  it.each(['null', '{}', '{"format":1}', '{"format":1,"solutions":"none"}', '[1,2]'])('treats %s as nothing saved (spec-006 AC-20)', (record) => {
    expect(readSolutions(storeWith({ [KEY]: record }), workedExample)).toEqual([]);
  });

  it('drops a filling that does not solve the puzzle (spec-006 AC-21)', () => {
    const notASolution: Entry = { ...SOLUTION_A, cells: [[null, 9], [2, 3]] };

    expect(readSolutions(storeWith({ [KEY]: saved(SOLUTION_A, notASolution) }), workedExample)).toEqual([SOLUTION_A]);
  });
});
