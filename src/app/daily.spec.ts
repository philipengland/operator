import { describe, expect, it } from 'vitest';
import { dailyPuzzle, type Digit, type LinePosition, type Puzzle } from '../engine';
import { choose, openToday, startDaily, todayRows } from './daily';
import { onDate } from './daily';
import { openLastPlayed } from './daily';
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

describe('todayRows', () => {
  it("lists today's puzzles, then Practice, each heard with its count (FR-701)", () => {
    const easyTotal = dailyPuzzle(TENTH_OF_NOVEMBER, 'easy').puzzle.solutionCount;

    const rows = todayRows(openToday(startDaily(TENTH_OF_NOVEMBER, withSolutionAFound(), ['easy'])));

    expect(rows).toEqual([`Easy, found 0 of ${easyTotal}`, 'Practice, found 1 of 2']);
  });
});

describe('saved solutions (FR-714)', () => {
  it('starts a puzzle made today with the solutions saved on the phone for it', () => {
    const easy = dailyPuzzle(TENTH_OF_NOVEMBER, 'easy');
    const saved = (puzzle: Puzzle) => (puzzle.id === easy.puzzle.id ? [easy.builtFrom] : []);

    const chosen = choose(openToday(startDaily(TENTH_OF_NOVEMBER, startSession(), ['easy']), saved), 'easy', saved);

    expect(chosen.session.solutions).toEqual([easy.builtFrom]);
    expect(chosen.session.found.size).toBe(1);
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

describe('onDate (spec-007 FR-716, research R6)', () => {
  const ELEVENTH_OF_NOVEMBER = '2026-11-11';

  it("on a new date offers that date's puzzles; the puzzle on screen stays, and Practice keeps what it found", () => {
    const practice = withSolutionAFound();
    const playingCollector = choose(openToday(startDaily(TENTH_OF_NOVEMBER, practice, ['easy', 'collector'])), 'collector');

    const nextDay = openToday(onDate(playingCollector, ELEVENTH_OF_NOVEMBER));

    expect(nextDay.session.puzzle).toBe(playingCollector.session.puzzle);
    expect(choose(nextDay, 'collector').session.puzzle).toEqual(dailyPuzzle(ELEVENTH_OF_NOVEMBER, 'collector').puzzle);
    expect(choose(nextDay, 'easy').session.puzzle).toEqual(dailyPuzzle(ELEVENTH_OF_NOVEMBER, 'easy').puzzle);
    expect(choose(nextDay, 'practice').session.found).toEqual(practice.found);
  });
});

describe('openLastPlayed (spec-007 FR-701, AC-18)', () => {
  it("opens today's puzzle for the preset last played today, on the play screen, with its saved solutions", () => {
    const medium = dailyPuzzle(TENTH_OF_NOVEMBER, 'medium');
    const saved = (puzzle: Puzzle) => (puzzle.id === medium.puzzle.id ? [medium.builtFrom] : []);
    const daily = startDaily(TENTH_OF_NOVEMBER, startSession(), ['easy', 'medium']);

    const opened = openLastPlayed(daily, { date: TENTH_OF_NOVEMBER, preset: 'medium' }, saved);

    expect(opened.current).toBe('medium');
    expect(opened.session.puzzle).toEqual(medium.puzzle);
    expect(opened.session.place).toEqual({ kind: 'play' });
    expect(opened.session.solutions).toEqual([medium.builtFrom]);
  });

  it("opens today's Easy puzzle when the record cannot be read (FR-715, AC-21)", () => {
    const daily = startDaily(TENTH_OF_NOVEMBER, startSession(), ['easy', 'medium']);

    const opened = openLastPlayed(daily, 'unreadable');

    expect(opened.current).toBe('easy');
    expect(opened.session.puzzle).toEqual(dailyPuzzle(TENTH_OF_NOVEMBER, 'easy').puzzle);
  });
});
