// Layer 2 — daily puzzles (spec-007): the phone's date, the Today screen, and what each preset's puzzle
// must be. Assertions are here, in the spec's terms; the driver only reports what the player sees.

import { expect } from '@playwright/test';
import type { DailyDriver } from '../drivers/daily.driver';
import type { CalendarDay, DailyPuzzle, Preset, ResultBesideLine, TodayChoice } from './daily-vocabulary';
import type { Operator } from './vocabulary';

/** spec-006 FR-616 and spec-007 FR-710: a total over 100 is not shown, and is counted as 101. */
const MORE_THAN_100 = 101;

/** How many days on from a starting date to look for a Collector puzzle with more than 100 solutions. */
const DAYS_TO_LOOK = 31;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export class DailyDsl {
  private remembered: DailyPuzzle | null = null;

  constructor(private readonly driver: () => DailyDriver) {}

  // The phone's date and the Today screen.

  async setPhoneDate(day: CalendarDay): Promise<void> {
    await this.driver().setDate(day);
  }

  async openTodayScreen(): Promise<void> {
    await this.driver().tapToday();
  }

  async choose(choice: TodayChoice): Promise<void> {
    await this.driver().tapTodayRow(choice);
  }

  /** From the play screen: open the Today screen and choose one of its rows. */
  async open(choice: TodayChoice): Promise<void> {
    await this.openTodayScreen();
    await this.choose(choice);
  }

  async expectTodayLists(choices: readonly TodayChoice[]): Promise<void> {
    expect((await this.driver().todayRows()).map((row) => row.choice), 'rows on the Today screen, in order').toEqual(choices);
  }

  /** The row is heard with its count, for example "Easy, found 1 of 4" or "Collector, found 3". */
  async expectTodayRowFound(choice: TodayChoice, found: number): Promise<void> {
    const row = (await this.driver().todayRows()).find((each) => each.choice === choice);
    expect(row?.heardAs, `${choice} row as heard`).toMatch(new RegExp(`^${choice}, found ${found}( of \\d+)?$`));
  }

  async expectWorkedExampleShowing(): Promise<void> {
    expect(await this.driver().isWorkedExampleShowing(), 'the worked example is on the play screen').toBe(true);
  }

  // What a puzzle must be (the presets, spec-007 Context).

  async expectPuzzle(preset: Preset, rows: number, columns: number): Promise<void> {
    const puzzle = await this.driver().puzzle();
    expect(puzzle.heardAs, 'the puzzle as heard').toBe(`${preset} puzzle, ${rows} by ${columns}`);
    expect([puzzle.rows, puzzle.columns], 'rows and columns').toEqual([rows, columns]);
    expect(puzzle.cells.length, 'rows of cells').toBe(rows);
    for (const row of puzzle.cells) {
      expect(row.length, 'cells in each row').toBe(columns);
    }
  }

  async expectEveryOperatorShown(): Promise<void> {
    expect(await this.openLines(), 'open lines').toBe(0);
  }

  async expectEveryOperatorOpen(): Promise<void> {
    const puzzle = await this.driver().puzzle();
    expect(await this.openLines(), 'open lines').toBe(puzzle.rows + puzzle.columns);
  }

  async expectOpenLines(fewest: number, most: number): Promise<void> {
    const open = await this.openLines();
    expect(open, 'open lines').toBeGreaterThanOrEqual(fewest);
    expect(open, 'open lines').toBeLessThanOrEqual(most);
  }

  /** Every shown operator is one of these. */
  async expectOperatorsOnlyFrom(operators: readonly Operator[]): Promise<void> {
    for (const line of await this.lines()) {
      if (line.operator !== 'open') {
        expect(operators, 'operators the preset allows').toContain(line.operator);
      }
    }
  }

  async expectGivenCells(fewest: number, most: number): Promise<void> {
    const given = (await this.driver().puzzle()).cells.flat().filter((cell) => cell.given !== null).length;
    expect(given, 'given cells').toBeGreaterThanOrEqual(fewest);
    expect(given, 'given cells').toBeLessThanOrEqual(most);
  }

  /** Every target is a whole number from lowest to highest, and none is 0. */
  async expectTargetsFrom(lowest: number, highest: number): Promise<void> {
    for (const { target } of await this.lines()) {
      expect(Number.isInteger(target), `target ${target} is a whole number`).toBe(true);
      expect(target, 'target').toBeGreaterThanOrEqual(lowest);
      expect(target, 'target').toBeLessThanOrEqual(highest);
      expect(target, 'target').not.toBe(0);
    }
  }

  /** The counter's total M, from "Found N of M"; "Found N" means more than 100 (FR-616). */
  async expectSolutionTotalFrom(fewest: number, most: number = MORE_THAN_100): Promise<void> {
    const total = await this.solutionTotal();
    expect(total, 'solutions in the puzzle').toBeGreaterThanOrEqual(fewest);
    expect(total, 'solutions in the puzzle').toBeLessThanOrEqual(most);
  }

  async expectSolutionTotalOver100(): Promise<void> {
    expect(await this.solutionTotal(), 'solutions in the puzzle').toBe(MORE_THAN_100);
  }

  // Each line's result beside it (FR-718).

  /** Every row's result at its right and every column's below it, each showing this and no mark. */
  async expectEachLineShowsBesideIt(shown: string): Promise<void> {
    const puzzle = await this.driver().puzzle();
    const results = await this.resultsBesideEachLine(puzzle);
    for (const result of results) {
      expect(result.shown, `${result.line}'s result`).toBe(shown);
      expect(result.mark, `${result.line}'s mark`).toBe('none');
    }
  }

  /** Every row's result at its right and every column's below it, each its line's target with a tick. */
  async expectEachLineShowsItsTargetTickedBesideIt(): Promise<void> {
    const puzzle = await this.driver().puzzle();
    const results = await this.resultsBesideEachLine(puzzle);
    const targets = [...puzzle.rowLines, ...puzzle.columnLines].map(({ target }) => target);
    results.forEach((result, index) => {
      expect(Number(result.shown.replace('−', '-')), `${result.line}'s result`).toBe(targets[index]);
      expect(result.mark, `${result.line}'s mark`).toBe('tick');
    });
  }

  async expectEmptyGrid(): Promise<void> {
    for (const cell of (await this.driver().puzzle()).cells.flat()) {
      if (cell.given === null) {
        expect(cell.value, 'a cell the player fills').toBe('empty');
      }
    }
  }

  // Playing a daily puzzle.

  async enterTheFillingItWasMadeFromAndCheck(): Promise<void> {
    await this.driver().enterBuiltFromFillingAndCheck();
  }

  async findSolutions(count: number): Promise<void> {
    await this.driver().enterSolutionsAndCheck(count);
  }

  /** "Found N of M", or "Found N" when the total is over 100. */
  async expectFound(count: number): Promise<void> {
    expect(await this.driver().counter(), 'the counter as heard').toMatch(new RegExp(`^Found ${count}( of \\d+)?$`));
  }

  async expectNeverAllFound(): Promise<void> {
    expect(await this.driver().counterTitle(), 'the counter title').not.toBe('All found!');
  }

  // The same puzzle for everyone.

  async rememberThisPuzzle(): Promise<void> {
    this.remembered = await this.driver().puzzle();
  }

  async expectSamePuzzleAsRemembered(): Promise<void> {
    expect(await this.driver().puzzle(), 'the puzzle, compared with the one remembered').toEqual(this.rememberedPuzzle());
  }

  async expectDifferentPuzzleFromRemembered(): Promise<void> {
    expect(await this.driver().puzzle(), 'the puzzle, compared with the one remembered').not.toEqual(this.rememberedPuzzle());
  }

  async expectSameAsTheEngineAloneMakes(day: CalendarDay, preset: Preset): Promise<void> {
    const shown = await this.driver().puzzle();
    expect(shown, `the puzzle, compared with ${preset} for ${day} made by the engine alone`).toEqual(
      await this.driver().madeByTheEngineAlone(day, preset),
    );
  }

  async expectThemeOfItsSeed(): Promise<void> {
    expect(await this.driver().themeShown(), "the theme, compared with the one worked out from the puzzle's seed").toBe(
      await this.driver().themeForThePuzzlesSeed(),
    );
  }

  /**
   * Sets the phone's date to the first day, from `from`, whose puzzle for the preset has more than 100
   * solutions, and opens that puzzle.
   */
  async openFirstDayWithMoreThan100(preset: Preset, from: CalendarDay): Promise<void> {
    let day = from;
    for (let tries = 0; tries < DAYS_TO_LOOK; tries++) {
      await this.setPhoneDate(day);
      await this.open(preset);
      if ((await this.solutionTotal()) === MORE_THAN_100) {
        return;
      }
      day = dayAfter(day);
    }
    throw new Error(`No ${preset} puzzle with more than 100 solutions in the ${DAYS_TO_LOOK} days from ${from}.`);
  }

  // Speed.

  async expectOpensWithin(choice: TodayChoice, seconds: number): Promise<void> {
    expect(await this.driver().secondsToOpen(choice), `seconds to open ${choice}`).toBeLessThanOrEqual(seconds);
  }

  private async lines() {
    const puzzle = await this.driver().puzzle();
    return [...puzzle.rowLines, ...puzzle.columnLines];
  }

  /** Each row's result, then each column's, checked to be in its place beside its line. */
  private async resultsBesideEachLine(puzzle: DailyPuzzle): Promise<readonly ResultBesideLine[]> {
    const results = await this.driver().resultsBesideLines();
    const expected = [
      ...puzzle.rowLines.map((_, index) => ({ line: `Row ${index + 1}`, place: 'right of its row' })),
      ...puzzle.columnLines.map((_, index) => ({ line: `Column ${index + 1}`, place: 'below its column' })),
    ];
    expect(
      results.map(({ line, place }) => ({ line, place })),
      'where each line shows its result',
    ).toEqual(expected);
    return results;
  }

  private async openLines(): Promise<number> {
    return (await this.lines()).filter((line) => line.operator === 'open').length;
  }

  private async solutionTotal(): Promise<number> {
    const counter = await this.driver().counter();
    const total = /^Found \d+ of (\d+)$/.exec(counter)?.[1];
    if (total !== undefined) {
      return Number(total);
    }
    expect(counter, 'the counter as heard').toMatch(/^Found \d+$/);
    return MORE_THAN_100;
  }

  private rememberedPuzzle(): DailyPuzzle {
    if (this.remembered === null) {
      throw new Error('Remember a puzzle before comparing with it.');
    }
    return this.remembered;
  }
}

/** The calendar day after this one, for example "30 November 2026" → "1 December 2026". */
function dayAfter(day: CalendarDay): CalendarDay {
  const [date = '', month = '', year = ''] = day.split(' ');
  const next = new Date(Date.UTC(Number(year), MONTHS.indexOf(month as (typeof MONTHS)[number]), Number(date) + 1));
  return `${next.getUTCDate()} ${MONTHS[next.getUTCMonth()] ?? 'January'} ${next.getUTCFullYear()}`;
}
