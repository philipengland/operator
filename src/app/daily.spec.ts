import { describe, expect, it } from 'vitest';
import { dailyPuzzle } from '../engine';
import { choose, openToday, startDaily } from './daily';
import { startSession } from './session';

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
});
