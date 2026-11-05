// Layer 2 — playing the puzzle: filling cells, choosing operators, checking, counting.

import { expect } from '@playwright/test';
import type { GameDriver, GameView } from '../drivers/game.driver';
import type {
  Cell,
  CellValue,
  Digit,
  Entry,
  Line,
  Operator,
  OperatorChoice,
  Result,
  Working,
} from './vocabulary';

// A cell has ten values (empty and 1 to 9) and an operator has four, so this many taps
// always reaches any value that the game allows.
const TAPS_TO_GO_ALL_THE_WAY_ROUND = 10;

export class GameDsl {
  constructor(private readonly driver: () => GameDriver) {}

  async open(): Promise<void> {
    await this.driver().open();
  }

  async tapCell(cell: Cell, times = 1): Promise<void> {
    for (let tap = 0; tap < times; tap++) {
      await this.driver().tapCell(cell);
    }
  }

  async tapOperator(line: Line, times = 1): Promise<void> {
    for (let tap = 0; tap < times; tap++) {
      await this.driver().tapOperator(line);
    }
  }

  /** Taps the cell until it shows the value. Fails if the value can never be reached. */
  async fillCell(cell: Cell, value: CellValue): Promise<void> {
    for (let tap = 0; tap < TAPS_TO_GO_ALL_THE_WAY_ROUND; tap++) {
      if ((await this.view()).cells[cell].value === value) {
        return;
      }
      await this.driver().tapCell(cell);
    }
    await this.expectCell(cell, value);
  }

  /** Taps the operator until it shows the choice. "Not chosen" is only reachable before any tap. */
  async chooseOperator(line: Line, choice: OperatorChoice): Promise<void> {
    for (let tap = 0; tap < TAPS_TO_GO_ALL_THE_WAY_ROUND; tap++) {
      if ((await this.view()).operators[line].choice === choice) {
        return;
      }
      await this.driver().tapOperator(line);
    }
    await this.expectOpenOperator(line, choice);
  }

  async fillIn(entry: Entry): Promise<void> {
    await this.fillCell('top-right', entry.topRight);
    await this.fillCell('bottom-left', entry.bottomLeft);
    await this.fillCell('bottom-right', entry.bottomRight);
    await this.chooseOperator('Row 2', entry.row2);
    await this.chooseOperator('Column 1', entry.column1);
  }

  async check(): Promise<void> {
    await this.driver().check();
  }

  async fillInAndCheck(entry: Entry): Promise<void> {
    await this.fillIn(entry);
    await this.check();
  }

  async announcementsSoFar(): Promise<number> {
    return this.driver().announcementCount();
  }

  async expectCell(cell: Cell, value: CellValue): Promise<void> {
    const shown = (await this.view()).cells[cell];
    expect(shown.isGiven, `${cell} cell should be one the player can change`).toBe(false);
    expect(shown.value, `${cell} cell`).toBe(value);
  }

  async expectEmptyCells(cells: readonly Cell[]): Promise<void> {
    for (const cell of cells) {
      await this.expectCell(cell, 'empty');
    }
  }

  async expectGivenCell(cell: Cell, digit: Digit): Promise<void> {
    const shown = (await this.view()).cells[cell];
    expect(shown.isGiven, `${cell} cell should be given`).toBe(true);
    expect(shown.value, `${cell} cell`).toBe(digit);
  }

  /** Taps the cell once per expected value and checks what it shows after each tap. */
  async expectTappingCellShows(cell: Cell, valuesInOrder: readonly CellValue[]): Promise<void> {
    const seen: CellValue[] = [];
    for (let tap = 0; tap < valuesInOrder.length; tap++) {
      await this.driver().tapCell(cell);
      seen.push((await this.view()).cells[cell].value);
    }
    expect(seen, `${cell} cell after each tap`).toEqual(valuesInOrder);
  }

  async expectTargets(targets: Readonly<Record<Line, number>>): Promise<void> {
    expect((await this.view()).targets).toEqual(targets);
  }

  async expectShownOperator(line: Line, operator: Operator): Promise<void> {
    const shown = (await this.view()).operators[line];
    expect(shown.isOpen, `${line} operator should be shown, not open`).toBe(false);
    expect(shown.choice, `${line} operator`).toBe(operator);
  }

  async expectOpenOperator(line: Line, choice: OperatorChoice): Promise<void> {
    const shown = (await this.view()).operators[line];
    expect(shown.isOpen, `${line} operator should be open`).toBe(true);
    expect(shown.choice, `${line} operator`).toBe(choice);
  }

  /** Taps the operator once per expected choice and checks what it shows after each tap. */
  async expectTappingOperatorShows(line: Line, choicesInOrder: readonly Operator[]): Promise<void> {
    const seen: OperatorChoice[] = [];
    for (let tap = 0; tap < choicesInOrder.length; tap++) {
      await this.driver().tapOperator(line);
      seen.push((await this.view()).operators[line].choice);
    }
    expect(seen, `${line} operator after each tap`).toEqual(choicesInOrder);
  }

  async expectEntryShown(entry: Entry): Promise<void> {
    await this.expectCell('top-right', entry.topRight);
    await this.expectCell('bottom-left', entry.bottomLeft);
    await this.expectCell('bottom-right', entry.bottomRight);
    await this.expectOpenOperator('Row 2', entry.row2);
    await this.expectOpenOperator('Column 1', entry.column1);
  }

  async expectGameSays(result: Result): Promise<void> {
    expect((await this.view()).result, 'what the game says').toBe(result);
  }

  async expectGameSaysNothing(): Promise<void> {
    expect((await this.view()).result, 'what the game says').toBeNull();
  }

  async expectCounter(text: string): Promise<void> {
    expect((await this.view()).counter, 'counter').toBe(text);
  }

  async expectAnnouncementsStillAt(count: number): Promise<void> {
    expect(await this.driver().announcementCount(), 'announcements to screen-reader users').toBe(count);
  }

  // spec-002 — each line's working, shown as the grid changes.

  async expectWorking(line: Line, working: Working): Promise<void> {
    expect((await this.view()).workings[line].working, `${line} working`).toBe(working);
  }

  async expectWorkings(workings: Readonly<Record<Line, Working>>): Promise<void> {
    for (const [line, working] of Object.entries(workings) as [Line, Working][]) {
      await this.expectWorking(line, working);
    }
  }

  /** Taps the operator once per expected working and checks the line's working after each tap. */
  async expectTappingOperatorShowsWorking(line: Line, workingsInOrder: readonly Working[]): Promise<void> {
    const seen: Working[] = [];
    for (let tap = 0; tap < workingsInOrder.length; tap++) {
      await this.driver().tapOperator(line);
      seen.push((await this.view()).workings[line].working);
    }
    expect(seen, `${line} working after each tap`).toEqual(workingsInOrder);
  }

  async expectMarkedAsReachingTarget(lines: readonly Line[]): Promise<void> {
    for (const line of lines) {
      expect((await this.view()).workings[line].mark, `${line} should be marked as reaching its target`).toBe('target reached');
    }
  }

  async expectNotMarked(lines: readonly Line[]): Promise<void> {
    for (const line of lines) {
      expect((await this.view()).workings[line].mark, `${line} should carry no mark`).toBe('none');
    }
  }

  async expectCrossedOut(line: Line): Promise<void> {
    expect((await this.view()).workings[line].mark, `${line} should show a cross`).toBe('not a whole number');
  }

  private view(): Promise<GameView> {
    return this.driver().view();
  }
}
