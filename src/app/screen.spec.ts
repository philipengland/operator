import { describe, expect, it } from 'vitest';
import { CLASSIC } from '../ui/foundations/themes';
import { playScreenProps } from './screen';
import { applyAction, startSession } from './session';
import { dailyPuzzle } from '../engine';

const justOpened = () => playScreenProps(startSession(), CLASSIC);
const TOP_RIGHT = { type: 'tapCell', row: 0, column: 1 } as const;

/** Top-right 2: Row 1 is 6 + 2 = 8, its target. */
const row1Correct = () => playScreenProps([TOP_RIGHT, TOP_RIGHT].reduce(applyAction, startSession()), CLASSIC);

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

  it('shows the helper line while an operator is open', () => {
    expect(justOpened().grid.helper).toBe('Tap a dashed bubble to swap its operator.');
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

  it('shows the selected cell (spec-004 AC-8)', () => {
    const tapped = applyAction(startSession(), TOP_RIGHT);

    expect(playScreenProps(tapped, CLASSIC).grid.cells[0]?.[1]?.isSelected).toBe(true);
  });

  it('makes the keys available once a cell is selected, not before (spec-004 AC-12)', () => {
    expect(playScreenProps(startSession(), CLASSIC).keysAvailable).toBe(false);
    expect(playScreenProps(applyAction(startSession(), TOP_RIGHT), CLASSIC).keysAvailable).toBe(true);
  });

  it("shows and announces the operator's line (spec-004 AC-16)", () => {
    const session = { ...startSession(), found: new Set(['a'] as never[]), message: 'new-solution' as const };

    const props = playScreenProps(session, CLASSIC);

    expect(props.header.message).toBe("You're connected! Keep 'em coming, pal!");
    expect(props.announcement).toBe("New solution found! You're connected! Keep 'em coming, pal! Found 1 of 2");
  });
});

describe('the counter with a very large total (spec-006)', () => {
  const opened = (solutionCount: number) => {
    const session = startSession();
    return playScreenProps({ ...session, puzzle: { ...session.puzzle, solutionCount } }, CLASSIC);
  };

  it('leaves the total out of the counter when it is over 100 (spec-006 AC-24)', () => {
    expect(opened(101).counter.total).toBeUndefined();
  });

  it('keeps a total of 100 in the counter (spec-006 AC-23)', () => {
    expect(opened(100).counter.total).toBe(100);
  });
});

describe('playScreenProps for a daily puzzle (spec-007)', () => {
  const easy = () => playScreenProps(startSession(dailyPuzzle('2026-11-10', 'easy').puzzle), CLASSIC);

  it('names the grid by its preset and shape, and the worked example\'s as "Puzzle" (FR-717)', () => {
    expect([easy().grid.name, justOpened().grid.name]).toEqual(['Easy puzzle, 3 by 3', 'Puzzle']);
  });

  it('names each cell by its row and column', () => {
    expect(easy().grid.cells[1]?.[2]?.name).toBe('Row 2 column 3 cell');
  });
});
