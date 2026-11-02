import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample } from '../engine';
import { applyAction, counterText, startSession } from './session';

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
  });
});
