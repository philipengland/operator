import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample, type Entry, type SolutionKey } from '../engine';
import { applyAction, counterText, lineWorkings, startSession, type SessionAction, type SessionState } from './session';

describe('startSession', () => {
  it('starts on the worked example with an empty entry, nothing found and no message', () => {
    expect(startSession()).toEqual({
      puzzle: workedExample,
      entry: emptyEntry(workedExample),
      found: new Set(),
      message: null,
      selected: null,
      solutions: [],
      place: { kind: 'play' },
    });
  });
});

describe('selecting a cell (spec-004 AC-8)', () => {
  it('selects a changeable cell when it is tapped, and steps its value as before', () => {
    const state = applyAction(startSession(), { type: 'tapCell', row: 0, column: 1 });

    expect(state.selected).toEqual({ row: 0, column: 1 });
    expect(state.entry.cells[0]?.[1]).toBe(1);
  });

  const selectedTopRight = () => applyAction(startSession(), { type: 'tapCell', row: 0, column: 1 });

  it('sets the selected cell to the key tapped, and keeps it selected (spec-004 AC-9)', () => {
    const state = applyAction(selectedTopRight(), { type: 'key', digit: 7 });

    expect(state.entry.cells[0]?.[1]).toBe(7);
    expect(state.selected).toEqual({ row: 0, column: 1 });
  });

  it('clears the last message, as any change to the grid does (spec-004 AC-9)', () => {
    const afterCheck = applyAction(selectedTopRight(), { type: 'submit' });

    expect(applyAction(afterCheck, { type: 'key', digit: 7 }).message).toBeNull();
  });

  it('empties the selected cell with Oops (spec-004 AC-10)', () => {
    const withSeven = applyAction(selectedTopRight(), { type: 'key', digit: 7 });

    expect(applyAction(withSeven, { type: 'clear' }).entry.cells[0]?.[1]).toBeNull();
  });

  it('changes nothing when a key is tapped with no cell selected (spec-004 AC-12)', () => {
    const opened = startSession();

    expect(applyAction(opened, { type: 'key', digit: 5 })).toEqual(opened);
    expect(applyAction(opened, { type: 'clear' })).toEqual(opened);
  });
});

describe('counterText', () => {
  it('reads "Found 0 of 2" when nothing has been found in the worked example', () => {
    expect(counterText(startSession())).toBe('Found 0 of 2');
  });

  it('still reads "Found 0 of 2" once every line reaches its target, until Check (spec-002 AC-6)', () => {
    const taps: SessionAction[] = [
      { type: 'tapCell', row: 0, column: 1 },
      { type: 'tapCell', row: 0, column: 1 },
      { type: 'tapCell', row: 1, column: 0 },
      { type: 'tapCell', row: 1, column: 0 },
      ...Array.from({ length: 3 }, (): SessionAction => ({ type: 'tapCell', row: 1, column: 1 })),
      ...Array.from({ length: 3 }, (): SessionAction => ({ type: 'tapOperator', line: { axis: 'row', index: 1 } })),
      ...Array.from({ length: 4 }, (): SessionAction => ({ type: 'tapOperator', line: { axis: 'column', index: 0 } })),
    ];
    const solutionAFilledIn = taps.reduce(applyAction, startSession());

    expect(lineWorkings(solutionAFilledIn).every(({ outcome }) => outcome.kind === 'result' && outcome.reachesTarget)).toBe(true);
    expect(counterText(solutionAFilledIn)).toBe('Found 0 of 2');
  });
});

describe('lineWorkings', () => {
  it("gives every line's working on opening, rows then columns", () => {
    const workings = lineWorkings(startSession());

    expect(workings.map(({ line, digits, operator }) => ({ line, digits, operator }))).toEqual([
      { line: { axis: 'row', index: 0 }, digits: [6, null], operator: '+' },
      { line: { axis: 'row', index: 1 }, digits: [null, null], operator: null },
      { line: { axis: 'column', index: 0 }, digits: [6, null], operator: null },
      { line: { axis: 'column', index: 1 }, digits: [null, null], operator: '×' },
    ]);
  });
});

describe('applyAction', () => {
  describe('tapCell', () => {
    it('steps an empty changeable cell to 1', () => {
      const state = applyAction(startSession(), { type: 'tapCell', row: 0, column: 1 });

      expect(state.entry.cells[0]?.[1]).toBe(1);
    });

    it('clears the message, because the grid it described has changed', () => {
      const afterCheck: SessionState = { ...startSession(), message: 'not-solved' };

      const state = applyAction(afterCheck, { type: 'tapCell', row: 1, column: 0 });

      expect(state.message).toBeNull();
    });

    it('ignores a tap on the given cell', () => {
      const before = startSession();

      const after = applyAction(before, { type: 'tapCell', row: 0, column: 0 });

      expect(after).toEqual(before);
    });
  });

  describe('tapOperator', () => {
    it.each([
      { line: { axis: 'row', index: 1 }, read: (state: SessionState) => state.entry.rowOperators[1] },
      { line: { axis: 'column', index: 0 }, read: (state: SessionState) => state.entry.columnOperators[0] },
    ] as const)('chooses + on the open $line.axis $line.index', ({ line, read }) => {
      const state = applyAction(startSession(), { type: 'tapOperator', line });

      expect(read(state)).toBe('+');
    });

    it('clears the message when an open operator changes', () => {
      const afterCheck: SessionState = { ...startSession(), message: 'not-solved' };

      const state = applyAction(afterCheck, { type: 'tapOperator', line: { axis: 'row', index: 1 } });

      expect(state.message).toBeNull();
    });

    it.each([
      { line: { axis: 'row', index: 0 } },
      { line: { axis: 'column', index: 1 } },
    ] as const)('ignores a tap on the shown operator of $line.axis $line.index', ({ line }) => {
      const before = startSession();

      const after = applyAction(before, { type: 'tapOperator', line });

      expect(after).toEqual(before);
    });
  });

  describe('submit', () => {
    // Solution A from spec-001's examples.
    const solutionA: Entry = { cells: [[null, 2], [2, 3]], rowOperators: [null, '×'], columnOperators: ['÷', null] };

    it('records a new solution and says so', () => {
      const filledIn: SessionState = { ...startSession(), entry: solutionA };

      const state = applyAction(filledIn, { type: 'submit' });

      expect(state.found).toEqual(new Set(['2,2,3|×|÷']));
      expect(state.message).toBe('new-solution');
    });

    it('says every solution has been found when a new solution completes the set', () => {
      // Solution B from spec-001's examples, after Solution A has been found.
      const solutionB: Entry = { cells: [[null, 2], [3, 3]], rowOperators: [null, '+'], columnOperators: ['−', null] };
      const afterA: SessionState = { ...startSession(), entry: solutionB, found: new Set(['2,2,3|×|÷' as SolutionKey]) };

      const state = applyAction(afterA, { type: 'submit' });

      expect(state.found.size).toBe(2);
      expect(state.message).toBe('all-found');
    });

    it('says a solution has already been found, and records nothing new, when it is checked again', () => {
      const solutionA: Entry = { cells: [[null, 2], [2, 3]], rowOperators: [null, '×'], columnOperators: ['÷', null] };
      const afterA: SessionState = { ...startSession(), entry: solutionA, found: new Set(['2,2,3|×|÷' as SolutionKey]) };

      const state = applyAction(afterA, { type: 'submit' });

      expect(state.message).toBe('already-found');
      expect(state.found.size).toBe(1);
    });

    it('says the grid is not solved, and records nothing, when a line misses', () => {
      // spec-001 "Below zero": Column 1 gives 6 − 9 = −3, not its target of 3 (spec-002 FR-208).
      const belowZero: Entry = { cells: [[null, 2], [9, 3]], rowOperators: [null, '−'], columnOperators: ['−', null] };
      const filledIn: SessionState = { ...startSession(), entry: belowZero };

      const state = applyAction(filledIn, { type: 'submit' });

      expect(state.message).toBe('not-solved');
      expect(state.found).toEqual(new Set());
    });

    it('asks for everything to be filled first, and records nothing, when the grid has a gap', () => {
      const state = applyAction(startSession(), { type: 'submit' });

      expect(state.message).toBe('incomplete');
      expect(state.found).toEqual(new Set());
    });
  });
});

describe('the list of solutions (spec-006)', () => {
  it('opens the list, changing nothing else (spec-006 AC-1)', () => {
    const opened = startSession();

    expect(applyAction(opened, { type: 'openList' })).toEqual({ ...opened, place: { kind: 'list' } });
  });

  it('goes back to the puzzle exactly as it was (spec-006 AC-5)', () => {
    const tapped = applyAction(startSession(), { type: 'tapCell', row: 0, column: 1 });
    const onTheList = applyAction(tapped, { type: 'openList' });

    expect(applyAction(onTheList, { type: 'showPlace', place: { kind: 'play' } })).toEqual(tapped);
  });

  it('opens a found solution, changing nothing else (spec-006 AC-7)', () => {
    const onTheList = applyAction(startSession(), { type: 'openList' });

    expect(applyAction(onTheList, { type: 'openSolution', number: 1 })).toEqual({ ...onTheList, place: { kind: 'solution', number: 1 } });
  });

  it('shows the list when the browser asks for a solution that does not exist (spec-006 FR-606)', () => {
    expect(applyAction(startSession(), { type: 'showPlace', place: { kind: 'solution', number: 3 } }).place).toEqual({ kind: 'list' });
  });
});

describe('remembering the solutions found (spec-006)', () => {
  const solutionA: Entry = { cells: [[null, 2], [2, 3]], rowOperators: [null, '×'], columnOperators: ['÷', null] };
  const solutionB: Entry = { cells: [[null, 2], [3, 3]], rowOperators: [null, '+'], columnOperators: ['−', null] };
  const found = (entry: Entry, from = startSession()): SessionState => applyAction({ ...from, entry }, { type: 'submit' });

  it('keeps a new solution (spec-006 AC-2)', () => {
    expect(found(solutionA).solutions).toEqual([solutionA]);
  });

  it('keeps solutions in the order found (spec-006 AC-3)', () => {
    expect(found(solutionB, found(solutionA)).solutions).toEqual([solutionA, solutionB]);
  });

  it('keeps a repeat only once (spec-006 AC-4)', () => {
    expect(found(solutionA, found(solutionA)).solutions).toEqual([solutionA]);
  });
});
