// Layer 2 — the phone the game runs on: screen size, connection, how things look, speed.

import { expect } from '@playwright/test';
import type { Box, PhoneDriver, ScreenLayout } from '../drivers/phone.driver';
import type { Cell, Line } from './vocabulary';

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

  async expectReadyToPlayWithin(seconds: number): Promise<void> {
    expect(await this.driver().secondsUntilReadyToPlay(), 'seconds until ready to play').toBeLessThanOrEqual(seconds);
  }

  async expectEveryTapAnsweredWithin(milliseconds: number): Promise<void> {
    const responseTimes = await this.driver().tapResponseTimesInMilliseconds();
    expect(responseTimes.length, 'taps measured').toBeGreaterThan(0);
    expect(Math.max(...responseTimes), 'slowest tap, in milliseconds').toBeLessThanOrEqual(milliseconds);
  }
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
