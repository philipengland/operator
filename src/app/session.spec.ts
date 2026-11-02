import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample } from '../engine';
import { counterText, startSession } from './session';

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
