import { describe, expect, it } from 'vitest';
import { CLASSIC, MIDNIGHT_BLUE } from '../ui/foundations/themes';
import { emptyListLine } from './labels';

describe('emptyListLine', () => {
  it("shows the theme's address, and is heard plainly (spec-006 AC-1)", () => {
    expect(emptyListLine(CLASSIC)).toEqual({ shown: 'No calls yet, pal.', heardAs: 'No solutions found yet' });
    expect(emptyListLine(MIDNIGHT_BLUE).shown).toBe('No calls yet, chief.');
  });
});
