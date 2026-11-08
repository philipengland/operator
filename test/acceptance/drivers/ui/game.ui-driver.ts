// Layer 3 — drives the game through a phone-sized browser page, locating elements only by
// role and accessible name (docs/contracts/play-screen.md).

import type { Locator, Page } from '@playwright/test';
import type { KeypadKey, Cell, Line } from '../../dsl/vocabulary';
import { scanForAccessibilityProblems } from '../../support/axe';
import { DEFAULT_VIEW } from '../default-view';
import type { GameDriver, KeypadKeyView, GameView, WorkingView } from '../game.driver';
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
import { readGameScreen } from './game-reading';

const GAME_READY_TIMEOUT_MS = 5_000;

interface AnnouncementCounter {
  operatorAnnouncements?: number;
}

// Readings not built yet (spec-004 T011): each returns what no scenario can accept.
const NOT_READ_YET = 'not read yet';
const BUBBLE_TITLE = 'Hello, Operator!';

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
