import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample } from '../engine';
import { startSession } from './session';

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
