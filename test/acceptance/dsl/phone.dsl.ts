// Layer 2 — the phone the game runs on: screen size, connection, how things look, speed.

import { expect } from '@playwright/test';
import type { Box, DailyLayout, PhoneDriver, ScreenLayout } from '../drivers/phone.driver';
import type { ColourToken, PageDots, PlayScreenPart, ThemeColours, ThemeName, Typeface } from './catalogue-vocabulary';
import type { Cell, Entry, Line, TypefacedText } from './vocabulary';

/**
 * spec-003 research R10: a browser may round a mixed colour by one level in each of red, green
 * and blue, so a dot colour within one level per channel is the spec's colour.
 */
const DOT_COLOUR_ROUNDING = 1;

/** How a cell looks in the theme's own colour names. Only the parts a scenario names are checked. */
export interface CellLookInTheme {
  readonly fill?: ColourToken;
  readonly digit?: ColourToken;
  readonly shadow?: ColourToken;
}

const ROWS: Readonly<Record<'Row 1' | 'Row 2', readonly Cell[]>> = {
  'Row 1': ['top-left', 'top-right'],
  'Row 2': ['bottom-left', 'bottom-right'],
};

const COLUMNS: Readonly<Record<'Column 1' | 'Column 2', readonly Cell[]>> = {
  'Column 1': ['top-left', 'bottom-left'],
  'Column 2': ['top-right', 'bottom-right'],
};

export class PhoneDsl {
  constructor(private readonly driver: () => PhoneDriver) {}

  async useScreen(width: number, height: number): Promise<void> {
    await this.driver().useScreen({ width, height });
  }

  async useReferencePhoneOn4G(): Promise<void> {
    await this.driver().useReferencePhoneOn4G();
  }

  async loseConnection(): Promise<void> {
    await this.driver().loseConnection();
  }

  async reload(): Promise<void> {
    await this.driver().reload();
  }

  async expectGameNotShowing(): Promise<void> {
    expect(await this.driver().isGameShowing(), 'the game is showing').toBe(false);
  }

  async expectNoNetworkRequestsSinceOpening(): Promise<void> {
    expect(await this.driver().networkRequestsSinceOpening(), 'network requests after opening').toBe(0);
  }

  /** The given cell must differ from a changeable one by more than colour. */
  async expectGivenCellStandsOut(given: Cell, changeable: Cell): Promise<void> {
    const givenLook = await this.driver().look(given);
    const changeableLook = await this.driver().look(changeable);
    expect(givenLook.markings, `${given} cell should be marked differently from ${changeable}, not by colour alone`)
      .not.toBe(changeableLook.markings);
  }

  async expectRowTargetsOnTheLeft(): Promise<void> {
    const layout = await this.driver().layout();
    for (const [row, cells] of Object.entries(ROWS) as [Line, readonly Cell[]][]) {
      for (const cell of cells) {
        expect(isLeftOf(layout.targets[row], layout.cells[cell]), `${row} target is left of the ${cell} cell`).toBe(true);
        expect(isLevelWith(layout.targets[row], layout.cells[cell]), `${row} target is level with the ${cell} cell`).toBe(true);
      }
    }
  }

  async expectColumnTargetsAbove(): Promise<void> {
    const layout = await this.driver().layout();
    for (const [column, cells] of Object.entries(COLUMNS) as [Line, readonly Cell[]][]) {
      for (const cell of cells) {
        expect(isAbove(layout.targets[column], layout.cells[cell]), `${column} target is above the ${cell} cell`).toBe(true);
        expect(isInLineWith(layout.targets[column], layout.cells[cell]), `${column} target is over the ${cell} cell`).toBe(true);
      }
    }
  }

  /** The grid, targets, operators, counter and Check button are all on screen without scrolling. */
  async expectEverythingOnScreen(): Promise<void> {
    const layout = await this.driver().layout();
    for (const [name, box] of everythingIn(layout)) {
      expect(isOnScreen(box, layout), `${name} is on screen without scrolling`).toBe(true);
    }
  }

  /** spec-002: each row's working is to the right of, and level with, its cells. */
  async expectRowWorkingsOnTheRight(): Promise<void> {
    const layout = await this.driver().layout();
    for (const [row, cells] of Object.entries(ROWS) as [Line, readonly Cell[]][]) {
      for (const cell of cells) {
        expect(isLeftOf(layout.cells[cell], layout.workings[row]), `${row} working is right of the ${cell} cell`).toBe(true);
        expect(isLevelWith(layout.workings[row], layout.cells[cell]), `${row} working is level with the ${cell} cell`).toBe(true);
      }
    }
  }

  /** spec-002: each column's working is below, and in line with, its cells. */
  async expectColumnWorkingsBelow(): Promise<void> {
    const layout = await this.driver().layout();
    for (const [column, cells] of Object.entries(COLUMNS) as [Line, readonly Cell[]][]) {
      for (const cell of cells) {
        expect(isAbove(layout.cells[cell], layout.workings[column]), `${column} working is below the ${cell} cell`).toBe(true);
        expect(isInLineWith(layout.workings[column], layout.cells[cell]), `${column} working is under the ${cell} cell`).toBe(true);
      }
    }
  }

  /** spec-002: all four line workings are on screen without scrolling. */
  async expectLineWorkingsOnScreen(): Promise<void> {
    const layout = await this.driver().layout();
    for (const [line, box] of Object.entries(layout.workings) as [Line, Box][]) {
      expect(isOnScreen(box, layout), `${line} working is on screen without scrolling`).toBe(true);
    }
  }

  // spec-004 — the themed screen.

  async expectPartsTopToBottom(parts: readonly PlayScreenPart[]): Promise<void> {
    const { parts: boxes } = await this.driver().playScreenParts();
    parts.slice(1).forEach((part, index) => {
      const above = parts[index] as PlayScreenPart;
      expect(isAbove(boxes[above], boxes[part]), `${above} is above ${part}`).toBe(true);
    });
  }

  async expectPartsOnScreen(parts: readonly PlayScreenPart[]): Promise<void> {
    const { screen, parts: boxes } = await this.driver().playScreenParts();
    for (const part of parts) {
      const box = boxes[part];
      const isVisible = box.left >= 0 && box.top >= 0 && box.right <= screen.width && box.bottom <= screen.height;
      expect(isVisible, `${part} is on screen without scrolling`).toBe(true);
    }
  }

  async expectCellLook(cell: Cell, look: CellLookInTheme): Promise<void> {
    const shown = await this.driver().cellAppearance(cell);
    for (const [part, colour] of Object.entries(look)) {
      expect(shown[part as keyof CellLookInTheme], `${cell} cell's ${part}`).toBe(colour);
    }
  }

  async expectPillDashed(line: Line): Promise<void> {
    expect(await this.driver().isPillDashed(line), `${line} pill is dashed`).toBe(true);
  }

  /** Every colour drawn is one of the theme's four. The page's dots are not among them (spec-003 AC-27). */
  async expectOnlyThemeColours(theme: ThemeName, colours: ThemeColours): Promise<void> {
    const allowed = Object.values(colours).map((colour) => colour.toUpperCase());
    for (const colour of await this.driver().coloursInUse()) {
      expect(allowed, `${colour} is one of ${theme}'s four colours`).toContain(colour.toUpperCase());
    }
  }

  async expectPageDots(dots: PageDots): Promise<void> {
    const drawn = await this.driver().pageDots();
    expect(drawn, 'dots are drawn on the page').not.toBeNull();
    if (!drawn) {
      return;
    }
    expect(channelsApart(drawn.dotColour, dots.dotColour), `the dots are ${dots.dotColour} (drawn ${drawn.dotColour})`).toBeLessThanOrEqual(DOT_COLOUR_ROUNDING);
    expect(drawn.paper.toUpperCase(), 'the paper behind the dots').toBe(dots.paper.toUpperCase());
    expect(drawn.sizeInPixels, 'each dot is this many pixels across').toBeCloseTo(dots.sizeInPixels, 0);
    expect(drawn.everyPixels, 'the dots are this many pixels apart').toBeCloseTo(dots.everyPixels, 0);
  }

  async expectShownIn(text: TypefacedText, typeface: Typeface): Promise<void> {
    expect(await this.driver().typeface(text), `the ${text} is shown in`).toBe(typeface);
  }

  async expectReadyToPlayWithin(seconds: number): Promise<void> {
    expect(await this.driver().secondsUntilReadyToPlay(), 'seconds until ready to play').toBeLessThanOrEqual(seconds);
  }

  // spec-006 — coming back to the game, and what is saved on the phone.

  async goBack(): Promise<void> {
    await this.driver().goBack();
  }

  async closeAndReopen(): Promise<void> {
    await this.driver().closeAndReopen();
  }

  async refuseSaving(): Promise<void> {
    await this.driver().refuseSaving();
  }

  async leaveUnreadableSavedData(): Promise<void> {
    await this.driver().leaveUnreadableSavedData();
  }

  async leaveSavedFillings(fillings: readonly Entry[]): Promise<void> {
    await this.driver().leaveSavedFillings(fillings);
  }

  // spec-007 — daily puzzles of every size.

  async leaveUnreadableRecordOfLastPuzzle(): Promise<void> {
    await this.driver().leaveUnreadableRecordOfLastPuzzle();
  }

  /** The whole puzzle, the keypad and the main button are on screen, and nothing scrolls (FR-713). */
  async expectDailyPuzzleFitsWithoutScrolling(): Promise<void> {
    const layout = await this.driver().dailyLayout();
    for (const [name, box] of dailyParts(layout)) {
      expect(isWithin(box, layout.screen), `${name} is on screen without scrolling`).toBe(true);
    }
    expect(layout.page, 'the page is no larger than the screen').toEqual(layout.screen);
  }

  /** Medium and Hard at 320 × 568 (FR-713): the page may scroll up and down, never sideways. */
  async expectDailyPuzzleScrollsOnlyUpAndDown(): Promise<void> {
    const layout = await this.driver().dailyLayout();
    expect(layout.page.width, 'the page is no wider than the screen').toBeLessThanOrEqual(layout.screen.width);
    for (const [name, box] of dailyParts(layout)) {
      expect(box.left >= 0 && box.right <= layout.screen.width, `${name} is within the screen's width`).toBe(true);
    }
  }

  /** Every cell, pill and key, and the main button, is at least this many pixels each way (spec-003). */
  async expectEveryTapTargetAtLeast(pixels: number): Promise<void> {
    const { tapTargets } = await this.driver().dailyLayout();
    expect(tapTargets.length, 'things to tap').toBeGreaterThan(0);
    for (const box of tapTargets) {
      expect(Math.round(box.right - box.left), 'width of something to tap').toBeGreaterThanOrEqual(pixels);
      expect(Math.round(box.bottom - box.top), 'height of something to tap').toBeGreaterThanOrEqual(pixels);
    }
  }

  /** spec-007 FR-713: every cell of the puzzle at least this many pixels each way (36 on Medium and Hard; EXC-007). */
  async expectEveryCellAtLeast(pixels: number): Promise<void> {
    const { cells } = await this.driver().dailyLayout();
    expect(cells.length, 'cells').toBeGreaterThan(0);
    expectEachAtLeast(cells, pixels, 'cell');
  }

  /** Every pill and key, and the main button, at least this many pixels each way (spec-003). */
  async expectEveryTapTargetOtherThanCellsAtLeast(pixels: number): Promise<void> {
    const { tapTargets, cells } = await this.driver().dailyLayout();
    const others = tapTargets.filter((box) => !cells.some((cell) => isSameBox(cell, box)));
    expect(others.length, 'things to tap other than cells').toBeGreaterThan(0);
    expectEachAtLeast(others, pixels, 'something to tap');
  }

  async expectNoAccessibilityProblems(): Promise<void> {
    expect(await this.driver().accessibilityProblems(), 'accessibility problems on this screen').toEqual([]);
  }

  async expectNoErrorsOnThePage(): Promise<void> {
    expect(await this.driver().errorsOnThePage(), 'errors on the page').toEqual([]);
  }

  async expectEveryTapAnsweredWithin(milliseconds: number): Promise<void> {
    const responseTimes = await this.driver().tapResponseTimesInMilliseconds();
    expect(responseTimes.length, 'taps measured').toBeGreaterThan(0);
    expect(Math.max(...responseTimes), 'slowest tap, in milliseconds').toBeLessThanOrEqual(milliseconds);
  }
}

/** The largest difference in red, green or blue between two #RRGGBB colours. */
function channelsApart(first: string, second: string): number {
  const channels = (colour: string) => (colour.match(/[0-9a-f]{2}/gi) ?? []).map((pair) => Number.parseInt(pair, 16));
  const [a, b] = [channels(first), channels(second)];
  return a.length === 3 && b.length === 3 ? Math.max(...a.map((value, index) => Math.abs(value - (b[index] ?? 0)))) : Number.POSITIVE_INFINITY;
}

function everythingIn(layout: ScreenLayout): [string, Box][] {
  return [
    ...Object.entries(layout.cells).map(([cell, box]): [string, Box] => [`${cell} cell`, box]),
    ...Object.entries(layout.targets).map(([line, box]): [string, Box] => [`${line} target`, box]),
    ...Object.entries(layout.operators).map(([line, box]): [string, Box] => [`${line} operator`, box]),
    ['counter', layout.counter],
    ['Check button', layout.checkButton],
  ];
}

function expectEachAtLeast(boxes: readonly Box[], pixels: number, what: string): void {
  for (const box of boxes) {
    expect(Math.round(box.right - box.left), `width of ${what}`).toBeGreaterThanOrEqual(pixels);
    expect(Math.round(box.bottom - box.top), `height of ${what}`).toBeGreaterThanOrEqual(pixels);
  }
}

function isSameBox(first: Box, second: Box): boolean {
  return first.left === second.left && first.top === second.top && first.right === second.right && first.bottom === second.bottom;
}

function dailyParts(layout: DailyLayout): [string, Box][] {
  return [
    ['the puzzle', layout.puzzle],
    ['the keypad', layout.keypad],
    ['the main button', layout.mainButton],
  ];
}

function isWithin(box: Box, screen: { readonly width: number; readonly height: number }): boolean {
  return box.left >= 0 && box.top >= 0 && box.right <= screen.width && box.bottom <= screen.height;
}

function isOnScreen(box: Box, layout: ScreenLayout): boolean {
  return box.left >= 0 && box.top >= 0 && box.right <= layout.screen.width && box.bottom <= layout.screen.height;
}

function isLeftOf(a: Box, b: Box): boolean {
  return a.right <= b.left;
}

function isAbove(a: Box, b: Box): boolean {
  return a.bottom <= b.top;
}

function isLevelWith(a: Box, b: Box): boolean {
  return a.top < b.bottom && b.top < a.bottom;
}

function isInLineWith(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right;
}
