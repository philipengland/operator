import { describe, expect, it } from 'vitest';
import { CLASSIC } from '../ui/foundations/themes';
import { playScreenProps } from './screen';
import { applyAction, startSession } from './session';

const NO_FLAGS = { keypad: false, voice: false };
const justOpened = () => playScreenProps(startSession(), CLASSIC, NO_FLAGS);
const TOP_RIGHT = { type: 'tapCell', row: 0, column: 1 } as const;

/** Top-right 2: Row 1 is 6 + 2 = 8, its target. */
const row1Correct = () => playScreenProps([TOP_RIGHT, TOP_RIGHT].reduce(applyAction, startSession()), CLASSIC, NO_FLAGS);

describe('playScreenProps', () => {
  it('says hello, counts from nothing, and labels the main button in the theme\'s words', () => {
    const props = justOpened();

    expect(props.header).toEqual({ title: 'Hello, Operator!', message: 'Fill the grid, pal.' });
    expect(props.counter).toEqual({ found: 0, total: 2 });
    expect(props.mainButtonLabel).toBe('Put it through!');
  });

  it('gives each line a pill: shown operators, and open ones not yet chosen', () => {
    const { columnPills, rowPills } = justOpened().grid;

    expect(rowPills).toEqual([
      { target: 8, operator: '+', isOpen: false, name: 'Row 1 target 8, plus', reachesTarget: false },
      { target: 6, operator: null, isOpen: true, name: 'Row 2 target 6, operator not chosen', reachesTarget: false },
    ]);
    expect(columnPills).toEqual([
      { target: 3, operator: null, isOpen: true, name: 'Column 1 target 3, operator not chosen', reachesTarget: false },
      { target: 6, operator: '×', isOpen: false, name: 'Column 2 target 6, times', reachesTarget: false },
    ]);
  });

  it('gives the cells, the given 6 and three empty ones', () => {
    expect(justOpened().grid.cells).toEqual([
      [
        { name: 'Top-left cell', digit: 6, isGiven: true, isInCorrectLine: false, isSelected: false },
        { name: 'Top-right cell', digit: null, isGiven: false, isInCorrectLine: false, isSelected: false },
      ],
      [
        { name: 'Bottom-left cell', digit: null, isGiven: false, isInCorrectLine: false, isSelected: false },
        { name: 'Bottom-right cell', digit: null, isGiven: false, isInCorrectLine: false, isSelected: false },
      ],
    ]);
  });

  it('gives each line its working, named as spec-002 names it', () => {
    const { rowWorkings, columnWorkings } = justOpened().grid;

    expect(rowWorkings[0]).toEqual({ result: '= ?', mark: 'none', name: 'Row 1 working, 6 + ?' });
    expect(columnWorkings[1]).toEqual({ result: '= ?', mark: 'none', name: 'Column 2 working, ? × ?' });
  });

  it('shows the helper line while an operator is open, and no keypad with the flag off', () => {
    const props = justOpened();

    expect(props.grid.helper).toBe('Tap a dashed bubble to swap its operator.');
    expect(props.isKeypadShown).toBe(false);
  });


  it('announces a new solution with its count, and shows the result in the bubble', () => {
    const session = { ...startSession(), found: new Set(['a'] as never[]), message: 'new-solution' as const };

    const props = playScreenProps(session, CLASSIC, NO_FLAGS);

    expect(props.header.message).toBe('New solution found!');
    expect(props.announcement).toBe('New solution found! Found 1 of 2');
  });

  it('ticks the pill of a line that reaches its target, and no other (spec-004 AC-3)', () => {
    const { rowPills, columnPills } = row1Correct().grid;

    expect(rowPills.map((pill) => pill.reachesTarget)).toEqual([true, false]);
    expect(columnPills.map((pill) => pill.reachesTarget)).toEqual([false, false]);
  });

  it("gives the player's digits in a correct line the correct-line look, but not the given (spec-004 AC-3)", () => {
    const { cells } = row1Correct().grid;

    expect(cells[0]?.map((cell) => cell.isInCorrectLine)).toEqual([false, true]);
    expect(cells[1]?.map((cell) => cell.isInCorrectLine)).toEqual([false, false]);
  });

  it('shows the selected cell with the keypad flag on, and never with it off (spec-004 AC-8, FR-413)', () => {
    const tapped = applyAction(startSession(), TOP_RIGHT);
    const selectedIn = (keypad: boolean) => playScreenProps(tapped, CLASSIC, { keypad, voice: false }).grid.cells[0]?.[1]?.isSelected;

    expect([selectedIn(true), selectedIn(false)]).toEqual([true, false]);
  });

  it('makes the keys available once a cell is selected, not before (spec-004 AC-12)', () => {
    const withKeypad = { keypad: true, voice: false };

    expect(playScreenProps(startSession(), CLASSIC, withKeypad).keysAvailable).toBe(false);
    expect(playScreenProps(applyAction(startSession(), TOP_RIGHT), CLASSIC, withKeypad).keysAvailable).toBe(true);
  });
});
