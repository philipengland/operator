// Layer 3 — the phone around the game: screen, connection, looks and speed.

import type { Locator, Page } from '@playwright/test';
import { accessibilityProblems as problemsOn } from '../../support/axe';
import type { Cell, Entry, Line, TypefacedText } from '../../dsl/vocabulary';
import { CELLS, LINES } from '../positions';
import { readCellAppearance, readColoursInUse, readDeclaredDots, readDotColour, readTypeface } from './catalogue-reading';
import { cellNamePattern, COUNTER_PATTERN, pillIn, workingNamePattern } from './screen-names';
import { recordSpeedTimings, SPEED_TIMINGS, type SpeedTimings } from './speed-timing';
import type { PageDots, PlayScreenPart, Typeface } from '../../dsl/catalogue-vocabulary';
import type { Box, CellAppearance, CellLook, PhoneDriver, ScreenLayout, ScreenSize } from '../phone.driver';

// Set on the page before a reload; a page that really reloads no longer has it.
const PAGE_BEFORE_RELOAD = 'operatorPageBeforeReload';

const GAME_TYPEFACE = /\.woff2$/;
const MILLISECONDS_PER_SECOND = 1000;
const BITS_PER_BYTE = 8;

// Plan research R9: about 9 Mbps down, 170 ms latency, and a CPU four times slower than the
// test machine. Upload speed is assumed to be a third of download, typical for 4G.
const REFERENCE_4G = {
  latencyMilliseconds: 170,
  downloadBytesPerSecond: (9 * 1_000_000) / BITS_PER_BYTE,
  uploadBytesPerSecond: (3 * 1_000_000) / BITS_PER_BYTE,
  cpuSlowdown: 4,
} as const;

// Unknown positions: NaN compares false, so nothing unread can count as on screen.
const NO_BOX: Box = { left: Number.NaN, top: Number.NaN, right: Number.NaN, bottom: Number.NaN };

const EMPTY_LAYOUT: ScreenLayout = {
  screen: { width: 0, height: 0 },
  cells: { 'top-left': NO_BOX, 'top-right': NO_BOX, 'bottom-left': NO_BOX, 'bottom-right': NO_BOX },
  targets: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  operators: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  workings: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  counter: NO_BOX,
  checkButton: NO_BOX,
};

// docs/contracts/saved-solutions.md: where the fixed puzzle's solutions are kept.
const SAVED_SOLUTIONS_KEY = 'operator.solutions.worked-example';

/** A scenario's filling in the saved format: given cells and shown operators are null. */
function savedEntry({ topRight, bottomLeft, bottomRight, row2, column1 }: Entry) {
  const digit = (value: Entry['topRight']) => (value === 'empty' ? null : value);
  const operator = (value: Entry['row2']) => (value === 'not chosen' ? null : value);
  return {
    cells: [[null, digit(topRight)], [digit(bottomLeft), digit(bottomRight)]],
    rowOperators: [null, operator(row2)],
    columnOperators: [operator(column1), null],
  };
}

export class UiPhoneDriver implements PhoneDriver {
  private readonly pageErrors: string[] = [];

  // Every request the page makes, and how many had been made when it last finished loading.
  private readonly requests: string[] = [];
  private requestsWhenOpened = 0;

  constructor(private readonly page: Page) {
    page.on('request', (request) => this.requests.push(request.url()));
    page.on('pageerror', (error) => this.pageErrors.push(error.message));
    page.on('load', () => {
      this.requestsWhenOpened = this.requests.length;
    });
  }

  // spec-004: the themed screen, read as the catalogue reads it.

  /** The screen's size and where its parts sit; a part that is not there has no position. */
  async playScreenParts(): Promise<{ readonly screen: ScreenSize; readonly parts: Readonly<Record<PlayScreenPart, Box>> }> {
    const screen = this.page.viewportSize() ?? { width: 0, height: 0 };
    const main = this.page.getByRole('main');
    const parts: Record<PlayScreenPart, Locator> = {
      'Operator header': main.getByText('Hello, Operator!', { exact: true }).locator('xpath=../..'),
      'Solutions counter': main.getByText(COUNTER_PATTERN).locator('xpath=..'),
      'Puzzle grid': main.getByRole('group', { name: 'Puzzle', exact: true }),
      Keypad: main.getByRole('group', { name: 'Keypad', exact: true }),
      'Main button': main.getByRole('button', { name: /Check/ }),
    };
    const boxes = await Promise.all((Object.entries(parts) as [PlayScreenPart, Locator][]).map(async ([part, found]) => [part, await boxOf(found)] as const));
    return { screen, parts: Object.fromEntries(boxes) as Record<PlayScreenPart, Box> };
  }

  async cellAppearance(cell: Cell): Promise<CellAppearance> {
    const button = this.page.getByRole('group', { name: 'Puzzle' }).getByRole('button', { name: cellNamePattern(cell) });
    return (await button.count()) === 1 ? button.evaluate(readCellAppearance) : { fill: 'other', digit: 'other', shadow: 'other' };
  }

  async isPillDashed(line: Line): Promise<boolean> {
    const pill = pillIn(this.page.getByRole('group', { name: 'Puzzle' }), line);
    return (await pill.count()) === 1 && (await pill.evaluate((element) => getComputedStyle(element).borderTopStyle === 'dashed'));
  }

  async coloursInUse(): Promise<readonly string[]> {
    const colours = await this.page.evaluate(readColoursInUse);
    return colours.length > 0 ? colours : ['no colours were read'];
  }

  async pageDots(): Promise<PageDots | null> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    const declared = await this.page.evaluate(readDeclaredDots);
    if (!declared.hasDots) {
      return null;
    }
    const screenshot = await this.page.screenshot({ clip: { x: 0, y: 0, width: declared.everyPixels, height: declared.everyPixels }, animations: 'disabled' });
    const drawn = await this.page.evaluate(readDotColour, [screenshot.toString('base64'), declared.paper] as const);
    return drawn ? { dotColour: drawn, paper: declared.paper, sizeInPixels: declared.sizeInPixels, everyPixels: declared.everyPixels } : null;
  }

  /** The first family in this text's font stack that has loaded, once loading has finished. */
  async typeface(text: TypefacedText): Promise<Typeface | string> {
    await this.page.evaluate(() => document.fonts.ready);
    const found: Record<TypefacedText, Locator> = {
      'speech bubble title': this.page.getByText('Hello, Operator!', { exact: true }),
      'helper line': this.page.getByRole('group', { name: 'Puzzle' }).getByRole('paragraph'),
    };
    return (await found[text].count()) === 1 ? found[text].evaluate(readTypeface) : 'not on the screen';
  }

  async useScreen(size: ScreenSize): Promise<void> {
    await this.page.setViewportSize(size);
  }

  /**
   * Plan research R9: a mid-range phone on 4G. The throttling needs Chromium's DevTools
   * protocol, so the speed budget runs in the android project only. Speed is recorded from
   * here on, so call this before the game opens.
   */
  async useReferencePhoneOn4G(): Promise<void> {
    await this.page.addInitScript(recordSpeedTimings, SPEED_TIMINGS);
    const devTools = await this.page.context().newCDPSession(this.page);
    await devTools.send('Network.enable');
    await devTools.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: REFERENCE_4G.latencyMilliseconds,
      downloadThroughput: REFERENCE_4G.downloadBytesPerSecond,
      uploadThroughput: REFERENCE_4G.uploadBytesPerSecond,
    });
    await devTools.send('Emulation.setCPUThrottlingRate', { rate: REFERENCE_4G.cpuSlowdown });
  }

  // Built ahead of AC-18: an empty placeholder let the offline scenario pass without ever
  // going offline.
  async loseConnection(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  // With no connection the reload fails; that is the expected outcome, not a driver error.
  // Chromium then shows its error page, but Playwright's WebKit leaves the old page in place
  // (real Safari shows "Safari Can't Open the Page"), so the old page is marked first and a
  // marked page never counts as the game having loaded again.
  /** Leaves the game for another page and comes back: the same phone, a fresh load. */
  async closeAndReopen(): Promise<void> {
    await this.page.goto('about:blank');
    await this.page.goto('./');
  }

  async refuseSaving(): Promise<void> {
    await this.page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Saving is refused', 'QuotaExceededError');
      };
    });
  }

  async leaveUnreadableSavedData(): Promise<void> {
    await this.leaveSaved('this is not a saved game');
  }

  async leaveSavedFillings(fillings: readonly Entry[]): Promise<void> {
    await this.leaveSaved(JSON.stringify({ format: 1, solutions: fillings.map(savedEntry) }));
  }

  private async leaveSaved(record: string): Promise<void> {
    await this.page.addInitScript(
      ([key, value]) => {
        if (window.location.protocol.startsWith('http')) {
          localStorage.setItem(key as string, value as string);
        }
      },
      [SAVED_SOLUTIONS_KEY, record],
    );
  }

  async errorsOnThePage(): Promise<readonly string[]> {
    return this.pageErrors;
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async accessibilityProblems(): Promise<readonly string[]> {
    return problemsOn(this.page);
  }

  async reload(): Promise<void> {
    await this.page.evaluate((marker) => Object.assign(window, { [marker]: true }), PAGE_BEFORE_RELOAD).catch(() => undefined);
    await this.page.reload().catch(() => undefined);
  }

  /** Whether the game is on screen in a page that actually loaded, not one left behind by a failed reload. */
  async isGameShowing(): Promise<boolean> {
    const isOldPage = await this.page
      .evaluate((marker) => marker in window, PAGE_BEFORE_RELOAD)
      .catch(() => false);
    return !isOldPage && (await this.page.getByRole('group', { name: 'Puzzle' }).isVisible());
  }

  /**
   * The game's own typefaces are part of opening: a slower browser asks for them just after the
   * load event, when it first lays the text out (found on CI, spec-004). Anything else counts.
   */
  async networkRequestsSinceOpening(): Promise<number> {
    return this.requests.slice(this.requestsWhenOpened).filter((url) => !GAME_TYPEFACE.test(url)).length;
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
          // A raised shadow is a shape, not a colour: the themed cells differ by it (spec-003 AC-10).
          `shadow ${style.boxShadow === 'none' ? 'none' : 'raised'}`,
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
    const workings = {} as Record<Line, Box>;
    for (const line of LINES) {
      // A pill is the line's target and operator together (spec-004 contract).
      targets[line] = await boxOf(pillIn(puzzle, line));
      operators[line] = targets[line];
      // The name is visually hidden; the working's slot on screen is the element around it.
      workings[line] = await boxOf(puzzle.getByText(workingNamePattern(line)).locator('..'));
    }
    return {
      screen,
      cells,
      targets,
      operators,
      workings,
      counter: await boxOf(this.page.getByText(COUNTER_PATTERN).locator('xpath=..')),
      checkButton: await boxOf(this.page.getByRole('button', { name: 'Check' })),
    };
  }

  // Unrecorded or unanswered timings read as infinitely slow, so they can never meet a budget.
  async secondsUntilReadyToPlay(): Promise<number> {
    const timings = await this.speedTimings();
    return timings?.readyAt == null ? Number.POSITIVE_INFINITY : timings.readyAt / MILLISECONDS_PER_SECOND;
  }

  async tapResponseTimesInMilliseconds(): Promise<readonly number[]> {
    const timings = await this.speedTimings();
    return (timings?.tapResponses ?? []).map((response) => response ?? Number.POSITIVE_INFINITY);
  }

  private async speedTimings(): Promise<SpeedTimings | undefined> {
    // The last tap's frame may still be pending.
    await this.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    return this.page.evaluate((name) => (window as unknown as Record<string, SpeedTimings | undefined>)[name], SPEED_TIMINGS);
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
