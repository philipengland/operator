import { describe, expect, it } from 'vitest';
import { CLASSIC, MIDNIGHT_BLUE } from '../ui/foundations/themes';
import { emptyListLine } from './labels';
import { startSession } from './session';
import { solutionListProps } from './solution-list';

describe('emptyListLine', () => {
  it("shows the theme's address, and is heard plainly (spec-006 AC-1)", () => {
    expect(emptyListLine(CLASSIC)).toEqual({ shown: 'No calls yet, pal.', heardAs: 'No solutions found yet' });
    expect(emptyListLine(MIDNIGHT_BLUE).shown).toBe('No calls yet, chief.');
  });
});

describe('solutionListProps', () => {
  it('heads the screen, with a way back and what an empty list says (spec-006 AC-1)', () => {
    expect(solutionListProps(startSession(), CLASSIC)).toEqual({
      heading: 'Solutions',
      backLabel: 'Back',
      rows: [],
      canOpenRows: false,
      empty: { shown: 'No calls yet, pal.', heardAs: 'No solutions found yet' },
    });
  });
});

describe('the rows (spec-006)', () => {
  it('names each solution by its number, in the order found (spec-006 AC-2, AC-3)', () => {
    const entry = startSession().entry;

    expect(solutionListProps({ ...startSession(), solutions: [entry, entry] }, CLASSIC).rows).toEqual(['Solution 1', 'Solution 2']);
  });

  it('can be opened once the story is released (spec-006 AC-7)', () => {
    expect(solutionListProps(startSession(), CLASSIC, { reopen: true }).canOpenRows).toBe(true);
  });

  it('offers "Start again" once released, when something has been found (spec-006 AC-11)', () => {
    const entry = startSession().entry;

    expect(solutionListProps({ ...startSession(), solutions: [entry] }, CLASSIC, { startAgain: true }).startAgainLabel).toBe('Start again');
  });
});
