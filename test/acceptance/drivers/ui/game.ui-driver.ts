// Layer 3 — drives the game through a phone-sized browser page, locating elements only by
// role and accessible name (docs/contracts/play-screen.md).

import type { Locator, Page } from '@playwright/test';
import type { KeypadKey, Cell, Line, SolutionName } from '../../dsl/vocabulary';
import { scanForAccessibilityProblems } from '../../support/axe';
import { DEFAULT_VIEW } from '../default-view';
import type { GameDriver, GameScreenName, KeypadKeyView, GameView, PopUpView, SolutionView, WorkingView } from '../game.driver';
import { CELLS, LINES } from '../positions';
import {
  cellNamePattern,
  COUNTER_PATTERN,
  readCellName,
  readPill,
  readResult,
  readWorkingName,
  workingNamePattern,
  pillIn,
} from './screen-names';
import { shownText } from './catalogue-reading';
import { readGameScreen, readHeardTexts, readPopUp } from './game-reading';

const GAME_READY_TIMEOUT_MS = 5_000;

interface AnnouncementCounter {
  operatorAnnouncements?: number;
}

// Readings not built yet (spec-004 T011): each returns what no scenario can accept.
const NOT_READ_YET = 'not read yet';
const BUBBLE_TITLE = 'Hello, Operator!';

const SOLUTION_NAME = /^Solution \d+$/;

export class UiGameDriver implements GameDriver {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('./');
    await this.puzzle().waitFor({ state: 'visible', timeout: GAME_READY_TIMEOUT_MS });
    await this.listenForAnnouncements();
    await scanForAccessibilityProblems(this.page);
  }

  async tapCell(cell: Cell): Promise<void> {
    await tapLikeAFinger(this.cellButton(cell));
  }

  async tapOperator(line: Line): Promise<void> {
    await tapLikeAFinger(pillIn(this.puzzle(), line));
  }

  async check(): Promise<void> {
    await this.page.getByRole('button', { name: 'Check' }).tap();
    await scanForAccessibilityProblems(this.page);
  }


  async tapCounter(): Promise<void> {
    await this.page.getByRole('button', { name: COUNTER_PATTERN }).tap();
    await scanForAccessibilityProblems(this.page);
  }

  async tapBack(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back', exact: true }).tap();
    await scanForAccessibilityProblems(this.page);
  }

  async screenShowing(): Promise<GameScreenName> {
    if (await this.listHeading().isVisible()) {
      return 'solution list';
    }
    return (await this.page.getByRole('heading', { name: SOLUTION_NAME }).isVisible()) ? 'solution' : 'puzzle';
  }

  /** The bubble's second line is what the empty list shows; the list itself holds what is heard. */
  async emptyList(): Promise<{ readonly shown: string; readonly heardAs: string }> {
    const shown = this.listHeading().locator('xpath=following-sibling::*[not(@hidden)]');
    const heard = this.list().locator('p.visually-hidden');
    return {
      shown: (await shown.count()) === 0 ? '' : await shown.innerText(),
      heardAs: (await heard.count()) === 0 ? '' : ((await heard.textContent()) ?? ''),
    };
  }

  async solutionsShown(): Promise<readonly string[]> {
    return this.list().locator('.solution-list__rows .button').evaluateAll((rows) =>
      rows.map((row) => (row.querySelector('[aria-hidden="true"]') ?? row).textContent ?? ''),
    );
  }

  async solutionsHeard(): Promise<readonly string[]> {
    return this.list().locator('.solution-list__rows .button').evaluateAll((rows) =>
      rows.map((row) => (row.querySelector('.visually-hidden') ?? row).textContent ?? ''),
    );
  }

  async tapSolution(solution: SolutionName): Promise<void> {
    await this.page.getByRole('button', { name: solution, exact: true }).tap();
    await scanForAccessibilityProblems(this.page);
  }

  async tapInSolution(place: Cell | Line): Promise<void> {
    const puzzle = this.solution().getByRole('group', { name: 'Puzzle', exact: true });
    const isCell = (CELLS as readonly string[]).includes(place);
    await (isCell ? puzzle.getByText(cellNamePattern(place as Cell)).locator('xpath=..') : pillIn(puzzle, place as Line)).tap();
  }

  async solutionView(): Promise<SolutionView> {
    const texts = await this.solutionHeard();
    const screen = { buttons: [], texts, status: '' };
    const pills = mapEach(LINES, (line) => readPill(line, screen));
    return {
      title: texts.find((text) => SOLUTION_NAME.test(text)) ?? '',
      cells: mapEach(CELLS, (cell) => readCellName(cell, texts.find((name) => cellNamePattern(cell).test(name)) ?? '')),
      operators: mapEach(LINES, (line) => pills[line].choice),
      marks: mapEach(LINES, (line) => workingFrom(line, texts).mark),
    };
  }

  async solutionHeard(): Promise<readonly string[]> {
    return this.solution().evaluate(readHeardTexts);
  }

  async controlsOnScreen(): Promise<readonly string[]> {
    return Promise.all((await this.page.getByRole('button').all()).map(accessibleName));
  }

  async tapStartAgain(): Promise<void> {
    await this.startAgain().tap();
    await scanForAccessibilityProblems(this.page);
  }

  /** Both taps land on the same spot, as a finger's would. */
  async doubleTapStartAgain(): Promise<void> {
    const box = await this.startAgain().boundingBox();
    if (box) {
      const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
      await this.page.touchscreen.tap(x, y);
      await this.page.touchscreen.tap(x, y);
    }
  }

  async tapPopUpButton(name: string): Promise<void> {
    await this.page.getByRole('dialog').getByRole('button', { name, exact: true }).tap();
    await scanForAccessibilityProblems(this.page);
  }

  async popUp(): Promise<PopUpView | null> {
    const dialog = this.page.locator('dialog[open]');
    if ((await dialog.count()) === 0) {
      return null;
    }
    return dialog.evaluate(readPopUp);
  }

  async focusedControl(): Promise<string> {
    return this.page.evaluate(() => {
      const focused = document.activeElement;
      return focused?.getAttribute('aria-label') ?? focused?.textContent ?? '';
    });
  }

  private startAgain(): Locator {
    return this.page.getByRole('button', { name: 'Start again', exact: true });
  }

  private solution(): Locator {
    return this.page
      .getByRole('heading', { name: SOLUTION_NAME })
      .locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " solution-view ")]');
  }

  private listHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Solutions', exact: true });
  }

  private list(): Locator {
    return this.listHeading().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " solution-list ")]');
  }

  /** The whole screen, read in one browser call. */
  async view(): Promise<GameView> {
    const screen = await this.page.evaluate(readGameScreen);
    const pills = mapEach(LINES, (line) => readPill(line, screen));
    return {
      cells: mapEach(CELLS, (cell) => readCellName(cell, screen.buttons.find((name) => cellNamePattern(cell).test(name)) ?? '')),
      targets: mapEach(LINES, (line) => pills[line].target),
      operators: mapEach(LINES, (line) => ({ choice: pills[line].choice, isOpen: pills[line].isOpen })),
      counter: screen.texts.find((text) => COUNTER_PATTERN.test(text)) ?? '',
      result: readResult(screen.status),
      workings: mapEach(LINES, (line) => workingFrom(line, screen.texts)),
    };
  }

  async tapKey(key: KeypadKey): Promise<void> {
    await tapLikeAFinger(this.keypadGroup().getByRole('button', { name: key === 'Oops' ? /^Oops/ : String(key), exact: key !== 'Oops' }));
  }

  /** The cell a screen reader hears as selected, if any. */
  async selectedCell(): Promise<Cell | null> {
    const selected = this.puzzle().getByRole('button', { pressed: true });
    if ((await selected.count()) !== 1) {
      return null;
    }
    const name = await accessibleName(selected);
    return CELLS.find((cell) => cellNamePattern(cell).test(name)) ?? null;
  }

  /** The keys, row by row, by where they sit. */
  async keypad(): Promise<readonly (readonly KeypadKeyView[])[]> {
    const keys = await this.keypadGroup()
      .getByRole('button')
      .evaluateAll((buttons) =>
        buttons.map((button) => ({
          name: button.getAttribute('aria-label') ?? button.textContent ?? '',
          isAvailable: button.getAttribute('aria-disabled') !== 'true',
          top: Math.round(button.getBoundingClientRect().top),
        })),
      );
    const tops = [...new Set(keys.map((key) => key.top))].sort((first, second) => first - second);
    return tops.map((top) => keys.filter((key) => key.top === top).map(({ name, isAvailable }) => ({ name, isAvailable })));
  }

  /** The speech bubble: its title, and the line after it. */
  async bubble(): Promise<{ readonly title: string; readonly line: string }> {
    const title = this.page.getByText(BUBBLE_TITLE, { exact: true });
    if ((await title.count()) !== 1) {
      return { title: NOT_READ_YET, line: NOT_READ_YET };
    }
    return { title: await title.innerText(), line: await title.locator('xpath=following-sibling::*[1]').innerText() };
  }

  async announcement(): Promise<string> {
    return (await this.status().textContent()) ?? NOT_READ_YET;
  }

  /** The counter as the player sees it. Its element holds the heard "Found N of M", kept out of what is shown. */
  async counterShown(): Promise<string> {
    const heard = this.page.getByText(COUNTER_PATTERN);
    return (await heard.count()) === 1 ? shownText(heard.locator('xpath=..')) : NOT_READ_YET;
  }

  async pillShown(line: Line): Promise<string> {
    const pill = pillIn(this.puzzle(), line);
    return (await pill.count()) === 1 ? shownText(pill) : NOT_READ_YET;
  }

  async workingSlot(line: Line): Promise<string> {
    const named = this.puzzle().getByText(workingNamePattern(line));
    return (await named.count()) === 1 ? shownText(named.locator('xpath=..')) : NOT_READ_YET;
  }

  async helperLine(): Promise<string> {
    const helper = this.puzzle().getByRole('paragraph');
    return (await helper.count()) === 1 ? helper.innerText() : NOT_READ_YET;
  }

  async mainButton(): Promise<{ readonly shown: string; readonly heardAs: string }> {
    const button = this.page.getByRole('button', { name: 'Check' });
    return { shown: await shownText(button), heardAs: await accessibleName(button) };
  }

  async announcementCount(): Promise<number> {
    return this.page.evaluate(() => (window as unknown as AnnouncementCounter).operatorAnnouncements ?? 0);
  }

  /**
   * Screen readers announce text added to a polite status region, not text removed from it.
   * Count each batch of changes that adds text.
   */
  private async listenForAnnouncements(): Promise<void> {
    await this.status().evaluate((region) => {
      const counter = window as unknown as AnnouncementCounter;
      counter.operatorAnnouncements = 0;
      new MutationObserver((changes) => {
        const addsText = changes.some((change) =>
          change.type === 'characterData'
            ? (change.target.textContent ?? '') !== ''
            : [...change.addedNodes].some((node) => (node.textContent ?? '') !== ''),
        );
        if (addsText) {
          counter.operatorAnnouncements = (counter.operatorAnnouncements ?? 0) + 1;
        }
      }).observe(region, { childList: true, characterData: true, subtree: true });
    });
  }

  private keypadGroup(): Locator {
    return this.page.getByRole('group', { name: 'Keypad', exact: true });
  }

  private puzzle(): Locator {
    return this.page.getByRole('group', { name: 'Puzzle' });
  }

  private status(): Locator {
    return this.page.getByRole('status');
  }

  private cellButton(cell: Cell): Locator {
    return this.puzzle().getByRole('button', { name: cellNamePattern(cell) });
  }
}

function mapEach<K extends string, V>(keys: readonly K[], read: (key: K) => V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, read(key)])) as Record<K, V>;
}

/** A working that is not on the screen reads as nothing. */
function workingFrom(line: Line, texts: readonly string[]): WorkingView {
  const name = texts.find((text) => workingNamePattern(line).test(text));
  return name === undefined ? DEFAULT_VIEW.workings[line] : readWorkingName(line, name);
}

/** A finger can tap an aria-disabled button; Playwright only does so when forced. */
async function tapLikeAFinger(button: Locator): Promise<void> {
  const isMarkedDisabled = (await button.getAttribute('aria-disabled')) === 'true';
  await button.tap({ force: isMarkedDisabled });
}

async function accessibleName(element: Locator): Promise<string> {
  return (await element.getAttribute('aria-label')) ?? (await element.innerText());
}
