// spec-007 research R12: every date of 2027 with Easy, against the preset (AC-3) and against a count by
// trying every filling (AC-5).

import { describe, expect, it } from 'vitest';
import { checkEntry } from './check-entry';
import { dailyPuzzle } from './daily-puzzle';
import { defaultRules } from './evaluate-line';
import { countEveryFilling } from './test-support/count-every-filling';
import { everyDateOf } from './test-support/dates';

// A sweep takes seconds, not milliseconds; research R12 allows up to a minute.
const SWEEP_TIME_LIMIT_MS = 60_000;

const PUZZLES = everyDateOf(2027).map((date) => ({ date, ...dailyPuzzle(date, 'easy') }));

describe('Easy on every date of 2027', () => {
  it('matches the Easy preset, has at least one solution, every target whole and not 0, and its filling solves it (spec-007 AC-3)', () => {
    const problems = PUZZLES.flatMap(({ date, puzzle, builtFrom }) => {
      const lines = [...puzzle.rowLines, ...puzzle.columnLines];
      const given = puzzle.givens.flat().filter((digit) => digit !== null).length;
      const checks = {
        '3 × 3': puzzle.rows === 3 && puzzle.columns === 3,
        'every operator shown, + or −': lines.every((line) => line.operator === '+' || line.operator === '−'),
        '4 or 5 given': given >= 4 && given <= 5,
        'targets whole, 1 to 29': lines.every(({ target }) => Number.isInteger(target) && target >= 1 && target <= 29),
        '1 to 10 solutions': puzzle.solutionCount >= 1 && puzzle.solutionCount <= 10,
        'solved by its filling': checkEntry(puzzle, builtFrom, defaultRules).kind === 'solved',
      };
      return Object.entries(checks).flatMap(([check, passes]) => (passes ? [] : [`${date}: ${check}`]));
    });

    expect(problems).toEqual([]);
  }, SWEEP_TIME_LIMIT_MS);

  it('counts the same as trying every filling (spec-007 AC-5)', () => {
    const differences = PUZZLES.flatMap(({ date, puzzle }) => {
      const everyFilling = countEveryFilling(puzzle);
      return puzzle.solutionCount === everyFilling ? [] : [`${date}: ${puzzle.solutionCount}, by every filling ${everyFilling}`];
    });

    expect(differences).toEqual([]);
  }, SWEEP_TIME_LIMIT_MS);
});
