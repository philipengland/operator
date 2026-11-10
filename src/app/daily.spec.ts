import { describe, expect, it } from 'vitest';
import { dailyPuzzle, type Digit, type LinePosition } from '../engine';
import { choose, openToday, startDaily } from './daily';
import { applyAction, startSession, type SessionAction, type SessionState } from './session';

const TENTH_OF_NOVEMBER = '2026-11-10';

describe('openToday', () => {
  it('shows the Today screen over the puzzle, changing nothing else (spec-007 FR-701)', () => {
    const daily = startDaily(TENTH_OF_NOVEMBER, startSession(), ['easy']);

    const opened = openToday(daily);

    expect(opened.session).toEqual({ ...daily.session, place: { kind: 'today' } });
    expect([opened.current, opened.date]).toEqual(['practice', TENTH_OF_NOVEMBER]);
  });
});

describe('choose', () => {
  it("puts today's Easy puzzle on the play screen, and keeps Practice as the player left it (FR-708)", () => {
    const practice = { ...startSession(), selected: { row: 0, column: 1 } };
    const daily = openToday(startDaily(TENTH_OF_NOVEMBER, practice, ['easy']));

    const chosen = choose(daily, 'easy');

    expect(chosen.current).toBe('easy');
    expect(chosen.session).toEqual(startSession(dailyPuzzle(TENTH_OF_NOVEMBER, 'easy').puzzle));
    expect(chosen.kept.practice).toEqual({ ...practice, place: { kind: 'today' } });
  });

  it('opens a puzzle come back to with an empty grid, no cell selected and the greeting, keeping what was found (FR-709)', () => {
    const practice = withSolutionAFound();
    const daily = choose(openToday(startDaily(TENTH_OF_NOVEMBER, practice, ['easy'])), 'easy');

    const back = choose(openToday(daily), 'practice');

    expect(practice.found.size).toBe(1);
    expect(back.session).toEqual({ ...startSession(), found: practice.found, solutions: practice.solutions });
  });
});

/** Solution A of the worked example found, left with a cell selected and its message showing. */
function withSolutionAFound(): SessionState {
  const taps = (line: LinePosition, times: number): SessionAction[] => Array.from({ length: times }, () => ({ type: 'tapOperator', line }));
  const actions: SessionAction[] = [
    ...enter(0, 1, 2),
    ...enter(1, 0, 2),
    ...enter(1, 1, 3),
    ...taps({ axis: 'row', index: 1 }, ['+', '−', '×'].length),
    ...taps({ axis: 'column', index: 0 }, ['+', '−', '×', '÷'].length),
    { type: 'submit' },
  ];
  return actions.reduce(applyAction, startSession());
}

function enter(row: number, column: number, digit: Digit): SessionAction[] {
  return [
    { type: 'tapCell', row, column },
    { type: 'key', digit },
  ];
}
