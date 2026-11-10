import { describe, expect, it } from 'vitest';
import { dailyPuzzle } from './daily-puzzle';

describe('dailyPuzzle', () => {
  it("names Easy for 10 November 2026 by its version, date and preset, and keeps its seed", () => {
    const { puzzle } = dailyPuzzle('2026-11-10', 'easy');

    expect([puzzle.id, puzzle.seed, puzzle.preset, puzzle.rows, puzzle.columns]).toEqual([
      'daily-v1-2026-11-10-easy',
      'v1:2026-11-10:easy',
      'easy',
      3,
      3,
    ]);
  });
});
