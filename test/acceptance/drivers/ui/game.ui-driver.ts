// Layer 3 — drives the game through a phone-sized browser page, locating elements only by
// role and accessible name (docs/contracts/play-screen.md).

import type { Locator, Page } from '@playwright/test';
import type { Cell, Line } from '../../dsl/vocabulary';
import { scanForAccessibilityProblems } from '../../support/axe';
import { DEFAULT_VIEW } from '../default-view';
import type { CellView, GameDriver, KeypadKeyView, GameView, OperatorView, WorkingView } from '../game.driver';
import { CELLS, LINES } from '../positions';
import {
  cellNamePattern,
  COUNTER_PATTERN,
  operatorNamePattern,
  readCellName,
  readOperatorName,
  readResult,
  readTargetText,
  readWorkingName,
  targetTextPattern,
  workingNamePattern,
  pillIn,
} from './screen-names';
import { shownText } from './catalogue-reading';

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
    await tapLikeAFinger(this.operatorButton(line));
  }

  async check(): Promise<void> {
    await this.page.getByRole('button', { name: 'Check' }).tap();
    await scanForAccessibilityProblems(this.page);
  }

  async view(): Promise<GameView> {
    const cells = {} as Record<Cell, CellView>;
    for (const cell of CELLS) {
      cells[cell] = readCellName(cell, await accessibleName(this.cellButton(cell)));
    }
    const targets = {} as Record<Line, number>;
    const operators = {} as Record<Line, OperatorView>;
    const workings = {} as Record<Line, WorkingView>;
    for (const line of LINES) {
      targets[line] = readTargetText((await this.target(line).textContent()) ?? '');
      operators[line] = await this.operatorView(line);
      workings[line] = await this.workingView(line);
    }
    const statusText = await this.status().innerText();
    const counter = statusText.match(COUNTER_PATTERN)?.[0] ?? '';
    return { cells, targets, operators, counter, result: readResult(statusText), workings };
  }

  async tapKey(): Promise<void> {}

  async selectedCell(): Promise<Cell | null> {
    return null;
  }

  async keypad(): Promise<readonly (readonly KeypadKeyView[])[]> {
    return [];
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
    return NOT_READ_YET;
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

  private puzzle(): Locator {
    return this.page.getByRole('group', { name: 'Puzzle' });
  }

  private status(): Locator {
    return this.page.getByRole('status');
  }

  private cellButton(cell: Cell): Locator {
    return this.puzzle().getByRole('button', { name: cellNamePattern(cell) });
  }

  private operatorButton(line: Line): Locator {
    return this.puzzle().getByRole('button', { name: operatorNamePattern(line) });
  }

  private target(line: Line): Locator {
    return this.puzzle().getByText(targetTextPattern(line));
  }

  /** A working that is not on the screen reads as nothing, rather than waiting for it. */
  private async workingView(line: Line): Promise<WorkingView> {
    const named = this.puzzle().getByText(workingNamePattern(line));
    if ((await named.count()) !== 1) {
      return DEFAULT_VIEW.workings[line];
    }
    return readWorkingName(line, (await named.textContent()) ?? '');
  }

  private async operatorView(line: Line): Promise<OperatorView> {
    const button = this.operatorButton(line);
    const choice = readOperatorName(line, await accessibleName(button));
    const isOpen = (await button.getAttribute('aria-disabled')) !== 'true';
    return { choice, isOpen };
  }
}

/** A finger can tap an aria-disabled button; Playwright only does so when forced. */
async function tapLikeAFinger(button: Locator): Promise<void> {
  const isMarkedDisabled = (await button.getAttribute('aria-disabled')) === 'true';
  await button.tap({ force: isMarkedDisabled });
}

async function accessibleName(element: Locator): Promise<string> {
  return (await element.getAttribute('aria-label')) ?? (await element.innerText());
}
