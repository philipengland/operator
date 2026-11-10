import { describe, expect, it } from 'vitest';
import { historyEntryFor, placeFrom } from './navigation';

describe('placeFrom', () => {
  it('reads back the screen a history entry was made for (spec-006 AC-5)', () => {
    expect(placeFrom(historyEntryFor({ kind: 'list' }))).toEqual({ kind: 'list' });
  });

  it.each([null, undefined, 'something else', { place: { kind: 'somewhere' } }])('treats %j as the puzzle', (entry) => {
    expect(placeFrom(entry)).toEqual({ kind: 'play' });
  });

  it('reads back a solution (spec-006 AC-26)', () => {
    expect(placeFrom(historyEntryFor({ kind: 'solution', number: 2 }))).toEqual({ kind: 'solution', number: 2 });
  });

  it.each([0, -1, 1.5, 'one', undefined])('treats a solution numbered %j as the puzzle', (number) => {
    expect(placeFrom({ place: { kind: 'solution', number } })).toEqual({ kind: 'play' });
  });
});

describe('placeFrom the Today screen (spec-007 FR-701)', () => {
  it('reads back the Today screen', () => {
    expect(placeFrom(historyEntryFor({ kind: 'today' }))).toEqual({ kind: 'today' });
  });
});
