// spec-007 SC-702, research R13: the puzzles released for these dates, pinned. A date's puzzle never
// changes in a later version: a change to how puzzles are made is a new generator version (v2), never
// an edit here. Each preset's dates are pinned in the pull request that releases it.

import { describe, expect, it } from 'vitest';
import { dailyPuzzle } from './daily-puzzle';
import type { LineSpec, PresetName, Puzzle } from './types';

const GOLDEN_DATES = ['2026-11-10', '2026-11-11', ...Array.from({ length: 12 }, (_, month) => `2027-${String(month + 1).padStart(2, '0')}-01`)];

/** A puzzle in one line: its cells ("·" to fill), its rows' and columns' pills, and its count. */
function written(puzzle: Puzzle): string {
  const cells = puzzle.givens.map((row) => row.map((digit) => digit ?? '·').join('')).join('/');
  const pills = (lines: readonly LineSpec[]) => lines.map(({ operator, target }) => `${operator === 'open' ? '?' : operator}${target}`).join(' ');
  return `${cells} | rows ${pills(puzzle.rowLines)} | columns ${pills(puzzle.columnLines)} | ${puzzle.solutionCount}`;
}

function puzzlesFor(preset: PresetName): Record<string, string> {
  return Object.fromEntries(GOLDEN_DATES.map((date) => [date, written(dailyPuzzle(date, preset).puzzle)]));
}

describe('golden dates', () => {
  it('Easy, released with spec-007 User Story 1', () => {
    expect(puzzlesFor('easy')).toMatchInlineSnapshot(`
      {
        "2026-11-10": "3·2/7·4/··· | rows +14 +17 +20 | columns +18 +20 +13 | 1",
        "2026-11-11": "···/7·9/14· | rows +20 +19 ×16 | columns +14 ×60 +22 | 1",
        "2027-01-01": "·8·/··8/671 | rows +20 +18 +14 | columns +15 +22 +15 | 1",
        "2027-02-01": "9··/··6/92· | rows +21 +17 +19 | columns +24 ×50 +21 | 1",
        "2027-03-01": "···/9·1/·58 | rows ×96 +19 +16 | columns +15 +18 ÷1 | 1",
        "2027-04-01": "3·9/3··/·18 | rows +16 +13 +16 | columns +13 ×32 +19 | 1",
        "2027-05-01": "·9·/··5/1·6 | rows +13 +15 +11 | columns +10 −1 ×30 | 1",
        "2027-06-01": "759/··1/·6· | rows +21 ×16 +11 | columns −1 +19 ÷9 | 1",
        "2027-07-01": "7··/·35/2·1 | rows −4 +16 ×16 | columns +17 +13 ×5 | 1",
        "2027-08-01": "98·/·1·/··3 | rows +22 −2 +13 | columns +17 ×56 +10 | 1",
        "2027-09-01": "4·4/·96/1·· | rows +11 +22 +5 | columns +12 ×27 ×72 | 1",
        "2027-10-01": "·82/··7/7·· | rows +18 ×35 +18 | columns +20 ×72 ×28 | 1",
        "2027-11-01": "1·4/··9/··3 | rows +12 +17 ×54 | columns +12 +13 +16 | 1",
        "2027-12-01": "2·3/1··/16· | rows +12 +11 ×48 | columns +4 +16 +18 | 1",
      }
    `);
  });
});
