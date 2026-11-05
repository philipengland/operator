// Layer 3 — drives the game through a phone-sized browser page, locating elements only by
// role and accessible name (docs/contracts/play-screen.md).

import type { Locator, Page } from '@playwright/test';
import type { Cell, Line } from '../../dsl/vocabulary';
import { scanForAccessibilityProblems } from '../../support/axe';
import type { CellView, GameDriver, GameView, OperatorView } from '../game.driver';
import { CELLS, LINES } from '../positions';
import {
  cellNamePattern,
  COUNTER_PATTERN,
  operatorNamePattern,
  readCellName,
  readOperatorName,
  readResult,
  readTargetText,
  targetTextPattern,
} from './screen-names';

const GAME_READY_TIMEOUT_MS = 5_000;

interface AnnouncementCounter {
  operatorAnnouncements?: number;
}

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
    for (const line of LINES) {
      targets[line] = readTargetText((await this.target(line).textContent()) ?? '');
      operators[line] = await this.operatorView(line);
    }
    const statusText = await this.status().innerText();
    const counter = statusText.match(COUNTER_PATTERN)?.[0] ?? '';
    return { cells, targets, operators, counter, result: readResult(statusText) };
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
