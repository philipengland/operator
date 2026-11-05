// Layer 3 — drives the game through a phone-sized browser page, locating elements only by
// role and accessible name (contracts/play-screen.md).

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
  readTargetText,
  targetTextPattern,
} from './screen-names';

const GAME_READY_TIMEOUT_MS = 5_000;

export class UiGameDriver implements GameDriver {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('./');
    await this.puzzle().waitFor({ state: 'visible', timeout: GAME_READY_TIMEOUT_MS });
    await scanForAccessibilityProblems(this.page);
  }

  async tapCell(cell: Cell): Promise<void> {
    await tapLikeAFinger(this.cellButton(cell));
  }

  async tapOperator(): Promise<void> {}

  async check(): Promise<void> {}

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
    const counter = (await this.status().innerText()).match(COUNTER_PATTERN)?.[0] ?? '';
    return { cells, targets, operators, counter, result: null };
  }

  async announcementCount(): Promise<number> {
    return 0;
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
