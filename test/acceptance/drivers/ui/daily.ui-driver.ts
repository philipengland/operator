// Layer 3 — today's puzzles on the phones, through Playwright (spec-007). Reads the screen by role and
// accessible name (docs/contracts/play-screen.md). The filling a puzzle was made from, and its seed's
// theme, are worked out here by the engine itself: the game never shows them (FR-711).

import type { Locator, Page } from '@playwright/test';
import { dailyPuzzle, type Entry, type PresetName } from '../../../../src/engine';
import { THEMES, themeForSeed } from '../../../../src/ui/foundations/themes';
import { scanForAccessibilityProblems } from '../../support/axe';
import type { CalendarDay, DailyCell, DailyLine, DailyPuzzle, LineOperator, Preset, TodayChoice, TodayRow } from '../../dsl/daily-vocabulary';
import type { Digit } from '../../dsl/vocabulary';
import { dateText, dayParts } from '../calendar';
import { firstSolutions } from '../daily-solutions';
import type { DailyDriver } from '../daily.driver';
import { puzzleView } from '../daily-view';
import { COUNTER_PATTERN } from './screen-names';

const DAILY_PUZZLE = /^(Easy|Medium|Hard|Collector) puzzle, (\d+) by (\d+)$/;
const CELL = /^Row (\d+) column (\d+) cell, (.+)$/;
// An open pill's name begins with what it shows ("? 28, Column 3 target 28, operator not chosen"; play-screen contract).
const PILL = /^(?:[^,]*, )?(Row|Column) (\d+) target (-?−?\d+), (.*?)(?:, target reached)?$/;
const OPERATOR_WORDS: Readonly<Record<string, LineOperator>> = { plus: '+', minus: '−', times: '×', divide: '÷', 'operator not chosen': 'open' };
const PRESET_NAMES: Readonly<Record<Preset, PresetName>> = { Easy: 'easy', Medium: 'medium', Hard: 'hard', Collector: 'collector' };
// The phone's clock at midday, so the date is the same in every time zone the tests run in.
const MIDDAY = 12;
// An open operator goes round the four when tapped (spec-001 FR-006).
const OPERATOR_TAPS_TO_GO_ROUND = 4;

/** What the play screen holds, read in one browser call. */
interface DailyScreen {
  readonly name: string;
  readonly buttons: readonly string[];
  readonly texts: readonly string[];
}

/** Runs in the page: the daily puzzle's group, and every button and heard text in it. */
function readDailyScreen(pattern: string): DailyScreen | null {
  const puzzle = Array.from(document.querySelectorAll('[role="group"]')).find((group) => new RegExp(pattern).test(group.getAttribute('aria-label') ?? ''));
  if (!puzzle) {
    return null;
  }
  const buttons = Array.from(puzzle.querySelectorAll('button'), (button) => button.getAttribute('aria-label') ?? button.textContent ?? '');
  const texts = Array.from(puzzle.querySelectorAll('*'))
    .filter((element) => element.children.length === 0 && element.closest('[aria-hidden="true"]') === null)
    .map((element) => element.textContent ?? '')
    .filter((text) => text !== '');
  return { name: puzzle.getAttribute('aria-label') ?? '', buttons, texts };
}

/** Runs in the page: the theme colours the page is drawn in. */
function readThemeColours(): Record<string, string> {
  const style = document.documentElement.style;
  return Object.fromEntries(['ink', 'paper', 'tile', 'accent'].map((name) => [name, style.getPropertyValue(`--${name}`).trim().toLowerCase()]));
}

export class UiDailyDriver implements DailyDriver {
  private date = '';

  constructor(private readonly page: Page) {}

  async setDate(day: CalendarDay): Promise<void> {
    const { year, month, date } = dayParts(day);
    this.date = dateText(day);
    await this.page.clock.setFixedTime(new Date(year, month - 1, date, MIDDAY));
  }

  async tapToday(): Promise<void> {
    await this.page.getByRole('button', { name: "Today's puzzles" }).tap();
    await this.todayScreen().waitFor();
    await scanForAccessibilityProblems(this.page);
  }

  async todayRows(): Promise<readonly TodayRow[]> {
    const names = await this.todayScreen().getByRole('button').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label') ?? button.textContent ?? ''));
    return names.filter((name) => name !== 'Back').map((heardAs) => ({ choice: (heardAs.split(',')[0] ?? '') as TodayChoice, heardAs }));
  }

  async tapTodayRow(choice: TodayChoice): Promise<void> {
    await this.todayScreen().getByRole('button', { name: new RegExp(`^${choice}, found `) }).tap();
    await this.page.getByRole('group', { name: choice === 'Practice' ? /^Puzzle$/ : new RegExp(`^${choice} puzzle, `) }).waitFor();
    await scanForAccessibilityProblems(this.page);
  }

  async puzzle(): Promise<DailyPuzzle> {
    const screen = await this.page.evaluate(readDailyScreen, DAILY_PUZZLE.source);
    if (screen === null) {
      throw new Error('No daily puzzle is on the play screen.');
    }
    const [, , rows = '0', columns = '0'] = DAILY_PUZZLE.exec(screen.name) ?? [];
    const lines = [...screen.buttons, ...screen.texts].flatMap((name) => {
      const [, axis = '', index = '', target = '', word = ''] = PILL.exec(name) ?? [];
      return axis === '' ? [] : [{ axis, index: Number(index), line: { target: Number(target.replace('−', '-')), operator: OPERATOR_WORDS[word] ?? (word as LineOperator) } }];
    });
    const linesOf = (axis: string, count: number): DailyLine[] =>
      Array.from({ length: count }, (_, index) => lines.find((line) => line.axis === axis && line.index === index + 1)?.line ?? { target: Number.NaN, operator: 'open' });
    return {
      heardAs: screen.name,
      rows: Number(rows),
      columns: Number(columns),
      cells: Array.from({ length: Number(rows) }, (_, row) => Array.from({ length: Number(columns) }, (__, column) => cellFrom(screen.buttons, row + 1, column + 1))),
      rowLines: linesOf('Row', Number(rows)),
      columnLines: linesOf('Column', Number(columns)),
    };
  }

  async isWorkedExampleShowing(): Promise<boolean> {
    return this.page.getByRole('group', { name: 'Puzzle', exact: true }).isVisible();
  }

  async counterTitle(): Promise<string> {
    const heard = this.page.getByText(COUNTER_PATTERN);
    return ((await heard.locator('xpath=..').innerText()).split('\n')[0] ?? '').trim();
  }

  async counter(): Promise<string> {
    return ((await this.page.getByText(COUNTER_PATTERN).textContent()) ?? '').trim();
  }

  async enterBuiltFromFillingAndCheck(): Promise<void> {
    await this.enter(dailyPuzzle(this.date, await this.preset()).builtFrom);
    await this.page.getByRole('button', { name: 'Check' }).tap();
  }

  /** Each of the first solutions the drivers' own search finds in the puzzle shown, entered as a player would and checked. */
  async enterSolutionsAndCheck(count: number): Promise<void> {
    for (const solution of firstSolutions(await this.puzzle(), count)) {
      await this.enter(solution);
      await this.page.getByRole('button', { name: 'Check' }).tap();
    }
  }

  async madeByTheEngineAlone(day: CalendarDay, preset: Preset): Promise<DailyPuzzle> {
    const { puzzle } = dailyPuzzle(dateText(day), PRESET_NAMES[preset]);
    return puzzleView(puzzle, null, `${preset} puzzle, ${puzzle.rows} by ${puzzle.columns}`);
  }

  async themeShown(): Promise<string> {
    const shown = await this.page.evaluate(readThemeColours);
    const theme = THEMES.find(({ colours }) => Object.entries(colours).every(([name, colour]) => shown[name] === colour.toLowerCase()));
    return theme?.label ?? 'no theme';
  }

  async themeForThePuzzlesSeed(): Promise<string> {
    return themeForSeed(dailyPuzzle(this.date, await this.preset()).puzzle.seed).label;
  }

  // spec-007 User Story 3 (task T052).
  async secondsToOpen(): Promise<number> {
    return Number.NaN;
  }

  /** As a player would: each empty cell tapped and its digit keyed, each open operator tapped round to the filling's. */
  private async enter(filling: Entry): Promise<void> {
    const shown = await this.puzzle();
    for (const [row, digits] of filling.cells.entries()) {
      for (const [column, digit] of digits.entries()) {
        if (digit !== null && shown.cells[row]?.[column]?.given === null) {
          await this.cellButton(row + 1, column + 1).tap();
          await this.page.getByRole('group', { name: 'Keypad' }).getByRole('button', { name: String(digit), exact: true }).tap();
        }
      }
    }
    await this.chooseOperators('Row', filling.rowOperators);
    await this.chooseOperators('Column', filling.columnOperators);
  }

  private async chooseOperators(axis: 'Row' | 'Column', operators: Entry['rowOperators']): Promise<void> {
    for (const [index, operator] of operators.entries()) {
      const pill = this.dailyPuzzleGroup().getByRole('button', { name: new RegExp(`^${axis} ${index + 1} target `) });
      for (let taps = 0; operator !== null && taps < OPERATOR_TAPS_TO_GO_ROUND; taps++) {
        const name = (await pill.getAttribute('aria-label')) ?? '';
        if (OPERATOR_WORDS[PILL.exec(name)?.[4] ?? ''] === operator) {
          break;
        }
        await pill.tap();
      }
    }
  }

  private async preset(): Promise<PresetName> {
    const [, preset = ''] = DAILY_PUZZLE.exec((await this.puzzle()).heardAs) ?? [];
    return PRESET_NAMES[preset as Preset];
  }

  private cellButton(row: number, column: number): Locator {
    return this.dailyPuzzleGroup().getByRole('button', { name: new RegExp(`^Row ${row} column ${column} cell, `) });
  }

  private dailyPuzzleGroup(): Locator {
    return this.page.getByRole('group', { name: DAILY_PUZZLE });
  }

  private todayScreen(): Locator {
    return this.page.getByRole('region', { name: 'Today', exact: true });
  }
}

function cellFrom(buttons: readonly string[], row: number, column: number): DailyCell {
  const name = buttons.find((each) => CELL.exec(each)?.slice(1, 3).join(',') === `${row},${column}`) ?? '';
  const described = CELL.exec(name)?.[3] ?? '';
  if (described.startsWith('given ')) {
    const given = Number(described.slice('given '.length)) as Digit;
    return { given, value: given };
  }
  return { given: null, value: described === 'empty' ? 'empty' : (Number(described) as Digit) };
}
