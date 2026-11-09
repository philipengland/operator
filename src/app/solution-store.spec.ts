import { describe, expect, it } from 'vitest';
import { workedExample, type Entry } from '../engine';
import { applyAction, startSession, type SessionState } from './session';
import { readSolutions, rememberChange, saveSolution, type SolutionStore } from './solution-store';

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

  it('never overwrites a record in a newer format (spec-006 FR-614)', () => {
    const newer = JSON.stringify({ format: 2, solutions: [SOLUTION_A] });
    const store = storeWith({ [KEY]: newer });

    saveSolution(store, workedExample, SOLUTION_B);

    expect(store.records.get(KEY)).toBe(newer);
  });

  it('keeps what another tab saved since this one opened (spec-006 edge case)', () => {
    const store = storeWith({ [KEY]: JSON.stringify({ format: 1, solutions: [SOLUTION_A] }) });

    saveSolution(store, workedExample, SOLUTION_B);

    expect(readSolutions(store, workedExample)).toEqual([SOLUTION_A, SOLUTION_B]);
  });

  it('replaces an unreadable record with the new solution (spec-006 AC-20)', () => {
    const store = storeWith({ [KEY]: 'this is not a saved game' });

    saveSolution(store, workedExample, SOLUTION_A);

    expect(readSolutions(store, workedExample)).toEqual([SOLUTION_A]);
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

  it.each([
    ['the wrong size', { ...SOLUTION_A, cells: [[null, 2]] }],
    ['a digit that is not 1 to 9', { ...SOLUTION_A, cells: [[null, 12], [2, 3]] }],
    ['a digit that is text', { ...SOLUTION_A, cells: [[null, '2'], [2, 3]] }],
    ['an unknown operator', { ...SOLUTION_A, rowOperators: [null, 'x'] }],
    ['no operators', { cells: SOLUTION_A.cells }],
    ['not an entry at all', 7],
  ])('drops an entry with %s, keeping the rest (spec-006 FR-611)', (_name, bad) => {
    const reading = () => readSolutions(storeWith({ [KEY]: saved(bad, SOLUTION_A) }), workedExample);

    expect(reading).not.toThrow();
    expect(reading()).toEqual([SOLUTION_A]);
  });

  it('keeps the same solution once, at its first place (spec-006 FR-611)', () => {
    expect(readSolutions(storeWith({ [KEY]: saved(SOLUTION_A, SOLUTION_B, SOLUTION_A) }), workedExample)).toEqual([SOLUTION_A, SOLUTION_B]);
  });

  it('treats a newer format as nothing it can read (spec-006 FR-614)', () => {
    expect(readSolutions(storeWith({ [KEY]: JSON.stringify({ format: 2, solutions: [SOLUTION_A] }) }), workedExample)).toEqual([]);
  });
});

describe('another puzzle', () => {
  it("has its own log, and leaves this puzzle's alone (spec-006 AC-22)", () => {
    const store = storeWith();
    const another = { ...workedExample, id: 'seed-4F7A21' };

    saveSolution(store, workedExample, SOLUTION_A);

    expect(readSolutions(store, another)).toEqual([]);
    expect(readSolutions(store, workedExample)).toEqual([SOLUTION_A]);
  });
});

describe('rememberChange', () => {
  const before = startSession();
  const found = (entry: Entry, from: SessionState = before): SessionState => applyAction({ ...from, entry }, { type: 'submit' });

  it('saves a new solution (spec-006 AC-14)', () => {
    const store = storeWith();

    rememberChange(store, before, found(SOLUTION_A));

    expect(readSolutions(store, workedExample)).toEqual([SOLUTION_A]);
  });

  it('saves nothing when no new solution was found (spec-006 AC-16)', () => {
    const store = storeWith();
    const afterA = found(SOLUTION_A);
    rememberChange(store, before, afterA);
    const saved = store.records.get(KEY);

    rememberChange(store, afterA, found(SOLUTION_A, afterA));

    expect(store.records.get(KEY)).toBe(saved);
  });

  it('removes the record when the player starts again (spec-006 AC-18)', () => {
    const store = storeWith();
    const afterA = found(SOLUTION_A);
    rememberChange(store, before, afterA);

    rememberChange(store, afterA, applyAction(afterA, { type: 'startAgain' }));

    expect(store.records.has(KEY)).toBe(false);
  });
});
