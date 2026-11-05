// Layer 3 — the phone around the game: screen, connection, looks and speed.

import type { Locator, Page } from '@playwright/test';
import type { Cell, Line } from '../../dsl/vocabulary';
import { CELLS, LINES } from '../positions';
import { cellNamePattern, COUNTER_PATTERN, operatorNamePattern, targetTextPattern } from './screen-names';
import type { Box, CellLook, PhoneDriver, ScreenLayout } from '../phone.driver';

// Unknown positions: NaN compares false, so nothing unread can count as on screen.
const NO_BOX: Box = { left: Number.NaN, top: Number.NaN, right: Number.NaN, bottom: Number.NaN };

const EMPTY_LAYOUT: ScreenLayout = {
  screen: { width: 0, height: 0 },
  cells: { 'top-left': NO_BOX, 'top-right': NO_BOX, 'bottom-left': NO_BOX, 'bottom-right': NO_BOX },
  targets: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  operators: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  counter: NO_BOX,
  checkButton: NO_BOX,
};

export class UiPhoneDriver implements PhoneDriver {
  // Every request the page makes, and how many had been made when it last finished loading.
  private readonly requests: string[] = [];
  private requestsWhenOpened = 0;

  constructor(private readonly page: Page) {
    page.on('request', (request) => this.requests.push(request.url()));
    page.on('load', () => {
      this.requestsWhenOpened = this.requests.length;
    });
  }

  async useScreen(): Promise<void> {}

  async useReferencePhoneOn4G(): Promise<void> {}

  // Built ahead of AC-18: an empty placeholder let the offline scenario pass without ever
  // going offline.
  async loseConnection(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  async reload(): Promise<void> {}

  // Until this is built it reports the game as showing, so AC-21 cannot pass vacuously.
  async isGameShowing(): Promise<boolean> {
    return true;
  }

  async networkRequestsSinceOpening(): Promise<number> {
    return this.requests.length - this.requestsWhenOpened;
  }

  async look(cell: Cell): Promise<CellLook> {
    const button = this.page.getByRole('group', { name: 'Puzzle' }).getByRole('button', { name: cellNamePattern(cell) });
    return button.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        colours: [style.color, style.backgroundColor, style.borderTopColor].join(' | '),
        markings: [
          `border ${style.borderTopStyle} ${style.borderTopWidth}`,
          `font ${style.fontWeight} ${style.fontStyle}`,
          `pattern ${style.backgroundImage}`,
          `decoration ${style.textDecorationLine}`,
        ].join(' | '),
      };
    });
  }

  async layout(): Promise<ScreenLayout> {
    const screen = this.page.viewportSize() ?? EMPTY_LAYOUT.screen;
    const puzzle = this.page.getByRole('group', { name: 'Puzzle' });
    const cells = {} as Record<Cell, Box>;
    for (const cell of CELLS) {
      cells[cell] = await boxOf(puzzle.getByRole('button', { name: cellNamePattern(cell) }));
    }
    const targets = {} as Record<Line, Box>;
    const operators = {} as Record<Line, Box>;
    for (const line of LINES) {
      targets[line] = await boxOf(puzzle.getByText(targetTextPattern(line)));
      operators[line] = await boxOf(puzzle.getByRole('button', { name: operatorNamePattern(line) }));
    }
    return {
      screen,
      cells,
      targets,
      operators,
      counter: await boxOf(this.page.getByRole('status').getByText(COUNTER_PATTERN)),
      checkButton: await boxOf(this.page.getByRole('button', { name: 'Check' })),
    };
  }

  async secondsUntilReadyToPlay(): Promise<number> {
    return Number.POSITIVE_INFINITY;
  }

  async tapResponseTimesInMilliseconds(): Promise<readonly number[]> {
    return [];
  }
}

/** Where an element sits; an element that is missing or hidden has an unknown position. */
async function boxOf(element: Locator): Promise<Box> {
  const box = (await element.count()) === 1 ? await element.boundingBox() : null;
  if (!box) {
    return NO_BOX;
  }
  return { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height };
}
