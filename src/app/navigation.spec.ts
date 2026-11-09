import { describe, expect, it } from 'vitest';
import { historyEntryFor, placeFrom } from './navigation';

describe('placeFrom', () => {
  it('reads back the screen a history entry was made for (spec-006 AC-5)', () => {
    expect(placeFrom(historyEntryFor({ kind: 'list' }))).toEqual({ kind: 'list' });
  });
});
