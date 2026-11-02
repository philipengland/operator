import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample } from '../engine';
import { applyAction, counterText, startSession, type SessionState } from './session';

describe('startSession', () => {
  it('starts on the worked example with an empty entry, nothing found and no message', () => {
    expect(startSession()).toEqual({
      puzzle: workedExample,
      entry: emptyEntry(workedExample),
      found: new Set(),
      message: null,
    });
  });
});

describe('counterText', () => {
  it('reads "Found 0 of 2" when nothing has been found in the worked example', () => {
    expect(counterText(startSession())).toBe('Found 0 of 2');
  });
});

describe('applyAction', () => {
  describe('tapCell', () => {
    it('steps an empty changeable cell to 1', () => {
      const state = applyAction(startSession(), { type: 'tapCell', row: 0, column: 1 });

      expect(state.entry.cells[0]?.[1]).toBe(1);
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
  });
});
