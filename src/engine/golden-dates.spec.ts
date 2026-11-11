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

  it('Medium, released with spec-007 User Story 2', () => {
    expect(puzzlesFor('medium')).toMatchInlineSnapshot(`
      {
        "2026-11-10": "·19·/·1··/923·/55·1/··5· | rows ?23 +12 +22 ?16 ×60 | columns +26 +15 ?28 ?96 | 2",
        "2026-11-11": "··7·/··69/··67/·846/·5·9 | rows ?25 ?26 +17 ?22 ?25 | columns ?17 +30 +30 +38 | 12",
        "2027-01-01": "·4·8/·77·/1··2/75··/··47 | rows ?29 ?24 ×16 ?20 +20 | columns +31 ?19 ?31 +24 | 2",
        "2027-02-01": "23··/67··/6··6/5··6/·6·4 | rows ?17 +19 ?25 ?19 +19 | columns +20 +28 ?28 +23 | 20",
        "2027-03-01": "·9·2/·3·5/·8··/44··/241· | rows ?72 ?17 ?23 +16 ×40 | columns ?19 ?28 ×72 +22 | 18",
        "2027-04-01": "64·6/4·2·/·2··/··29/8·2· | rows ?21 ?80 +28 ?19 ?24 | columns +30 +21 +20 ?34 | 4",
        "2027-05-01": "7·2·/··23/·7·4/162·/···8 | rows −1 ?18 ?23 ?11 +27 | columns +20 +23 ?21 +19 | 8",
        "2027-06-01": "·462/····/75·2/·75·/·5·4 | rows +17 ?24 +21 +20 +19 | columns ?31 ?25 ?33 ?12 | 3",
        "2027-07-01": "2·75/8·24/··26/····/9·5· | rows +22 ?15 ?16 ×96 ?25 | columns +25 ?23 +20 +23 | 6",
        "2027-08-01": "9··8/·24·/25··/956·/···2 | rows +28 ?11 ?80 +21 +22 | columns ?30 +28 +25 ?15 | 3",
        "2027-09-01": "·887/99··/3·3·/··49/1··· | rows ?25 ?30 ?16 +18 ×12 | columns ?18 +22 +20 +39 | 2",
        "2027-10-01": "··9·/3·62/4·24/1··3/·9·· | rows +18 ?20 ?15 ×24 ?19 | columns ×60 +28 +25 ?15 | 3",
        "2027-11-01": "613·/3··6/76·4/68··/···· | rows +18 ?25 +21 +29 ?22 | columns ?28 ?26 +28 ?33 | 12",
        "2027-12-01": "··5·/57·6/·7··/7259/·4·· | rows +19 +21 ?28 ?23 +16 | columns ?27 +27 +18 ?35 | 14",
      }
    `);
  });

  it('Collector, released with spec-007 User Story 2', () => {
    expect(puzzlesFor('collector')).toMatchInlineSnapshot(`
      {
        "2026-11-10": "···/···/···/··· | rows ?-4 ?10 ?-2 ?-15 | columns ?-3 ?27 ?26 | 39",
        "2026-11-11": "···/···/···/··· | rows ?-15 ?-4 ?-5 ?13 | columns ?-17 ?27 ?25 | 101",
        "2027-01-01": "···/···/···/··· | rows ?11 ?13 ?3 ?2 | columns ?-19 ?-11 ?-1 | 101",
        "2027-02-01": "···/···/···/··· | rows ?-8 ?-6 ?20 ?-2 | columns ?-16 ?-5 ?15 | 101",
        "2027-03-01": "···/···/···/··· | rows ?19 ?19 ?-3 ?4 | columns ?21 ?13 ?24 | 101",
        "2027-04-01": "···/···/···/··· | rows ?5 ?1 ?-5 ?-2 | columns ?26 ?-10 ?-15 | 101",
        "2027-05-01": "···/···/···/··· | rows ?25 ?13 ?16 ?-1 | columns ?24 ?16 ?25 | 101",
        "2027-06-01": "···/···/···/··· | rows ?19 ?-9 ?13 ?10 | columns ?20 ?22 ?23 | 101",
        "2027-07-01": "···/···/···/··· | rows ?-4 ?18 ?14 ?-4 | columns ?-8 ?-15 ?-15 | 101",
        "2027-08-01": "···/···/···/··· | rows ?-3 ?20 ?16 ?-11 | columns ?-13 ?23 ?-16 | 101",
        "2027-09-01": "···/···/···/··· | rows ?18 ?-11 ?18 ?16 | columns ?-8 ?-17 ?-14 | 101",
        "2027-10-01": "···/···/···/··· | rows ?10 ?18 ?2 ?-2 | columns ?-16 ?19 ?-4 | 101",
        "2027-11-01": "···/···/···/··· | rows ?-5 ?-5 ?12 ?-10 | columns ?-9 ?-13 ?24 | 101",
        "2027-12-01": "···/···/···/··· | rows ?19 ?16 ?-4 ?15 | columns ?-17 ?25 ?20 | 101",
      }
    `);
  });
});
