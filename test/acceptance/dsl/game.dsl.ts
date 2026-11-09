// Layer 2 — playing the puzzle: filling cells, choosing operators, checking, counting.

import { expect } from '@playwright/test';
import type { GameDriver, GameView } from '../drivers/game.driver';
import type {
  Cell,
  CellValue,
  Digit,
  Entry,
  KeypadKey,
  Line,
  Operator,
  OperatorChoice,
  Result,
  SolutionName,
  Working,
} from './vocabulary';

// A cell has ten values (empty and 1 to 9) and an operator has four, so this many taps
// always reaches any value that the game allows.
const TAPS_TO_GO_ALL_THE_WAY_ROUND = 10;

// spec-004: nine digit keys and Oops.
const KEYS_ON_THE_KEYPAD = 10;

// spec-006: the only control on a solution's read-only view.
const WAY_BACK = 'Back';
const EVERY_LINE: readonly Line[] = ['Row 1', 'Row 2', 'Column 1', 'Column 2'];

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

  // spec-004 — the keypad and the selected cell.

  async tapKey(digit: Digit): Promise<void> {
    await this.driver().tapKey(digit);
  }

  async tapOops(): Promise<void> {
    await this.driver().tapKey('Oops');
  }

  /** Enters each digit by selecting its cell and tapping the key; Oops for an empty cell. */
  async fillInWithKeypad(entry: Entry): Promise<void> {
    await this.enterWithKeypad('top-right', entry.topRight);
    await this.enterWithKeypad('bottom-left', entry.bottomLeft);
    await this.enterWithKeypad('bottom-right', entry.bottomRight);
    await this.chooseOperator('Row 2', entry.row2);
    await this.chooseOperator('Column 1', entry.column1);
  }

  async expectSelected(cell: Cell): Promise<void> {
    expect(await this.driver().selectedCell(), 'the selected cell').toBe(cell);
  }

  async expectKeysAvailable(): Promise<void> {
    await this.expectKeysToBe(true);
  }

  /** Every digit key and Oops is shown and heard as unavailable. */
  async expectKeysUnavailable(): Promise<void> {
    await this.expectKeysToBe(false);
  }

  /** The names a screen reader hears for each row of keys, top row first. */
  async expectKeypadRows(rows: readonly (readonly string[])[]): Promise<void> {
    const names = (await this.driver().keypad()).map((row) => row.map((key) => key.name));
    expect(names, 'the keys, row by row').toEqual(rows);
  }

  // spec-004 — what the screen shows and says.

  async expectBubble(title: string, line: string): Promise<void> {
    expect(await this.driver().bubble(), 'the speech bubble').toEqual({ title, line });
  }

  /** The one announcement a screen reader has been given since the grid last changed, word for word. */
  async expectAnnounced(words: string): Promise<void> {
    expect(await this.driver().announcement(), 'what is announced').toBe(words);
  }

  /** The announcement ends with these words, whatever comes before them. */
  async expectAnnouncementEndsWith(words: string): Promise<void> {
    const announced = await this.driver().announcement();
    expect(announced.endsWith(words), `what is announced ends "${words}": "${announced}"`).toBe(true);
  }

  async expectNothingAnnounced(): Promise<void> {
    await this.expectAnnounced('');
  }

  async expectCounterShows(text: string): Promise<void> {
    expect(await this.driver().counterShown(), 'the counter shows').toBe(text);
  }

  /** The target pill as the player sees it, such as "+ 8", "? 6" or "+ 8 ✓". */
  async expectPillShows(line: Line, text: string): Promise<void> {
    expect(await this.driver().pillShown(line), `${line} pill shows`).toBe(text);
  }

  /** The working's visible slot as the player sees it, such as "= ?" or "= 8 ✓". */
  async expectWorkingSlotShows(line: Line, text: string): Promise<void> {
    expect(await this.driver().workingSlot(line), `${line} working shows`).toBe(text);
  }

  async expectHelperLine(text: string): Promise<void> {
    expect(await this.driver().helperLine(), 'the helper line').toBe(text);
  }

  /** The main button shows these words, and a screen reader hears them first and then "Check". */
  async expectMainButton(label: string): Promise<void> {
    const { shown, heardAs } = await this.driver().mainButton();
    expect(shown, 'the main button shows').toBe(label);
    expect(heardAs.startsWith(label), `the main button is heard beginning "${label}", heard "${heardAs}"`).toBe(true);
    expect(heardAs, 'the main button is heard as Check').toContain('Check');
  }

  // spec-006 — the list of solutions, reopening one, and starting again.

  /** The player taps the "Solutions found" counter. */
  async openSolutionList(): Promise<void> {
    await this.driver().tapCounter();
  }

  /** The on-screen way back. */
  async goBack(): Promise<void> {
    await this.driver().tapBack();
  }

  async openSolution(solution: SolutionName): Promise<void> {
    await this.driver().tapSolution(solution);
  }

  /** Tries to change something on a solution's read-only view. */
  async tapInSolutionOn(place: Cell | Line): Promise<void> {
    await this.driver().tapInSolution(place);
  }

  async tapStartAgain(): Promise<void> {
    await this.driver().tapStartAgain();
  }

  async doubleTapStartAgain(): Promise<void> {
    await this.driver().doubleTapStartAgain();
  }

  async confirmStartAgain(): Promise<void> {
    await this.driver().tapPopUpButton('Yes, clear');
  }

  async keepSolutions(): Promise<void> {
    await this.driver().tapPopUpButton('Keep them');
  }

  async expectOnPuzzle(): Promise<void> {
    expect(await this.driver().screenShowing(), 'the screen showing').toBe('puzzle');
  }

  async expectOnSolutionList(): Promise<void> {
    expect(await this.driver().screenShowing(), 'the screen showing').toBe('solution list');
  }

  async expectSolutionListEmpty(shown: string, heardAs: string): Promise<void> {
    await this.expectOnSolutionList();
    expect(await this.driver().emptyList(), 'the empty list').toEqual({ shown, heardAs });
    expect(await this.driver().solutionsShown(), 'solutions listed').toEqual([]);
  }

  async expectSolutionsListed(solutions: readonly SolutionName[]): Promise<void> {
    await this.expectOnSolutionList();
    expect(await this.driver().solutionsShown(), 'solutions listed, in order').toEqual(solutions);
  }

  async expectSolutionsHeardAs(solutions: readonly SolutionName[]): Promise<void> {
    expect(await this.driver().solutionsHeard(), 'solutions as a screen reader hears them').toEqual(solutions);
  }

  /** The read-only view shows the given 6, this entry, and every line reaching its target. */
  async expectSolutionShown(solution: SolutionName, entry: Entry): Promise<void> {
    expect(await this.driver().screenShowing(), 'the screen showing').toBe('solution');
    const shown = await this.driver().solutionView();
    expect(shown.title, 'the solution showing').toBe(solution);
    expect(shown.cells['top-left'], 'the given cell').toEqual({ value: 6, isGiven: true });
    expect(shown.cells['top-right'].value, 'top-right cell').toBe(entry.topRight);
    expect(shown.cells['bottom-left'].value, 'bottom-left cell').toBe(entry.bottomLeft);
    expect(shown.cells['bottom-right'].value, 'bottom-right cell').toBe(entry.bottomRight);
    expect(shown.operators['Row 2'], 'Row 2 operator').toBe(entry.row2);
    expect(shown.operators['Column 1'], 'Column 1 operator').toBe(entry.column1);
    for (const line of EVERY_LINE) {
      expect(shown.marks[line], `${line} should be marked as reaching its target`).toBe('target reached');
    }
  }

  async expectSolutionHeardToInclude(phrases: readonly string[]): Promise<void> {
    const heard = await this.driver().solutionHeard();
    for (const phrase of phrases) {
      expect(heard, `a screen reader hears "${phrase}"`).toContain(phrase);
    }
  }

  async expectOnlyBackCanBeTapped(): Promise<void> {
    expect(await this.driver().controlsOnScreen(), 'what can be tapped on this screen').toEqual([WAY_BACK]);
  }

  async expectPopUp(question: string, buttons: readonly string[]): Promise<void> {
    const popUp = await this.driver().popUp();
    expect(popUp, 'the pop-up is open').not.toBeNull();
    expect(popUp?.question, 'what the pop-up asks').toBe(question);
    expect([...(popUp?.reachableControls ?? [])].sort(), 'what can be reached while it is open').toEqual([...buttons].sort());
    expect(popUp?.isFocusInside, 'focus is inside the pop-up').toBe(true);
  }

  async expectNoPopUp(): Promise<void> {
    expect(await this.driver().popUp(), 'the pop-up').toBeNull();
  }

  async expectFocusOn(control: string): Promise<void> {
    expect(await this.driver().focusedControl(), 'where focus is').toBe(control);
  }

  async expectStartAgainNotOffered(): Promise<void> {
    expect(await this.driver().controlsOnScreen(), 'what can be tapped on this screen').not.toContain('Start again');
  }

  private async enterWithKeypad(cell: Cell, value: CellValue): Promise<void> {
    await this.driver().tapCell(cell);
    await this.driver().tapKey(value === 'empty' ? 'Oops' : (value satisfies KeypadKey));
  }

  private async expectKeysToBe(isAvailable: boolean): Promise<void> {
    const keys = (await this.driver().keypad()).flat();
    expect(keys.length, 'keys on the keypad').toBe(KEYS_ON_THE_KEYPAD);
    for (const key of keys) {
      expect(key.isAvailable, `"${key.name}" is ${isAvailable ? 'available' : 'unavailable'}`).toBe(isAvailable);
    }
  }

  private view(): Promise<GameView> {
    return this.driver().view();
  }
}
