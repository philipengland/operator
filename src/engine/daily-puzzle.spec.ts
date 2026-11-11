import { describe, expect, it } from 'vitest';
import { checkEntry } from './check-entry';
import { countSolutions } from './count-solutions';
import { dailyPuzzle, puzzleFor } from './daily-puzzle';
import { PRESETS, type Preset } from './presets';
import { defaultRules } from './evaluate-line';
import type { PresetName } from './types';

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

  it('is built from a full filling of digits 1 to 9, which solves it (FR-703)', () => {
    const { puzzle, builtFrom } = dailyPuzzle('2026-11-10', 'easy');

    expect(builtFrom.cells.flat().every((digit) => digit !== null && digit >= 1 && digit <= 9)).toBe(true);
    expect(checkEntry(puzzle, builtFrom, defaultRules).kind).toBe('solved');
  });

  it("gives as many of the filling's cells as the preset says: Easy 4 or 5", () => {
    const { puzzle, builtFrom } = dailyPuzzle('2026-11-10', 'easy');
    const given = puzzle.givens.flatMap((digits, row) => digits.flatMap((digit, column) => (digit === null ? [] : [[digit, builtFrom.cells[row]?.[column]]])));

    expect(given.length).toBeGreaterThanOrEqual(4);
    expect(given.length).toBeLessThanOrEqual(5);
    expect(given.every(([digit, filled]) => digit === filled)).toBe(true);
  });

  it("keeps only a puzzle whose count is within the preset's band, and records that count (FR-707)", () => {
    const { puzzle } = dailyPuzzle('2026-11-10', 'easy');

    expect(puzzle.solutionCount).toBeGreaterThanOrEqual(1);
    expect(puzzle.solutionCount).toBeLessThanOrEqual(10);
    expect(puzzle.solutionCount).toBe(countSolutions(puzzle, Number.MAX_SAFE_INTEGER).count);
  });

  it.each(['2026-11-31', '2026-13-01', '10 November 2026', '2026-1-5', '', '2027-02-29', '2100-02-29'])('refuses a date that is malformed or does not exist: "%s"', (date) => {
    expect(() => dailyPuzzle(date, 'easy')).toThrow(/date/);
  });

  it('opens as many lines as the preset says, each heard as open: Medium 4 or 5 of 9 (FR-705)', () => {
    const { puzzle } = dailyPuzzle('2026-11-10', 'medium');

    const open = [...puzzle.rowLines, ...puzzle.columnLines].filter((line) => line.operator === 'open').length;

    expect(open).toBeGreaterThanOrEqual(4);
    expect(open).toBeLessThanOrEqual(5);
  });

  it("is solved by its filling with each open line's operator, as built (FR-703)", () => {
    const { puzzle, builtFrom } = dailyPuzzle('2026-11-10', 'medium');

    expect(checkEntry(puzzle, builtFrom, defaultRules).kind).toBe('solved');
  });

  it('accepts 29 February in a leap year', () => {
    expect(dailyPuzzle('2028-02-29', 'easy').puzzle.id).toBe('daily-v1-2028-02-29-easy');
  });

  it('refuses a preset it does not know', () => {
    expect(() => dailyPuzzle('2026-11-10', 'unknown' as PresetName)).toThrow(/preset/);
  });
});

describe('puzzleFor, with a preset given as data', () => {
  const easy = PRESETS.easy as Preset;

  it('gives up after its candidates when none has a count within the band (research R3)', () => {
    expect(() => puzzleFor('2026-11-10', 'easy', { ...easy, band: { fewest: 50, most: 60 } })).toThrow(/within 2000 candidates/);
  });

  it('drops every candidate whose count runs out of work, never keeping a count it did not finish (FR-706)', () => {
    const anyCount = { fewest: 0, most: 101 };

    expect(() => puzzleFor('2026-11-10', 'easy', { ...easy, workBudget: 1, band: anyCount })).toThrow(/within 2000 candidates/);
  });
});
