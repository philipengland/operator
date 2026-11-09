// Layer 3 contract — what every game driver (in-process or Playwright) must provide.
// Signatures only. Drivers report what the player would see; they never judge it.

import type { Cell, CellValue, KeypadKey, Line, OperatorChoice, Result, SolutionName, Working, WorkingMark } from '../dsl/vocabulary';

export interface CellView {
  readonly value: CellValue;
  readonly isGiven: boolean;
}

export interface OperatorView {
  readonly choice: OperatorChoice;
  readonly isOpen: boolean;
}

/** spec-002: a line's working as the player reads it, and its mark. */
export interface WorkingView {
  readonly working: Working;
  readonly mark: WorkingMark;
}

export interface GameView {
  readonly cells: Readonly<Record<Cell, CellView>>;
  readonly targets: Readonly<Record<Line, number>>;
  readonly operators: Readonly<Record<Line, OperatorView>>;
  readonly counter: string;
  readonly result: Result | null;
  readonly workings: Readonly<Record<Line, WorkingView>>;
}

/** spec-004: one key on the keypad, as a screen reader hears it. */
export interface KeypadKeyView {
  readonly name: string;
  readonly isAvailable: boolean;
}

/** spec-006: which screen is showing. */
export type GameScreenName = 'puzzle' | 'solution list' | 'solution';

/** spec-006: a found solution in its read-only view, as the player reads it. */
export interface SolutionView {
  readonly title: string;
  readonly cells: Readonly<Record<Cell, CellView>>;
  readonly operators: Readonly<Record<Line, OperatorChoice>>;
  readonly marks: Readonly<Record<Line, WorkingMark>>;
}

/** spec-006: the pop-up, as a screen reader meets it. */
export interface PopUpView {
  readonly question: string;
  /** The controls that can be reached while it is open. */
  readonly reachableControls: readonly string[];
  readonly isFocusInside: boolean;
}

export interface GameDriver {
  open(): Promise<void>;
  tapCell(cell: Cell): Promise<void>;
  tapOperator(line: Line): Promise<void>;
  check(): Promise<void>;
  view(): Promise<GameView>;
  /** How many announcements screen-reader users have heard since the game opened. */
  announcementCount(): Promise<number>;
  // spec-004
  tapKey(key: KeypadKey): Promise<void>;
  selectedCell(): Promise<Cell | null>;
  /** The keys, row by row. */
  keypad(): Promise<readonly (readonly KeypadKeyView[])[]>;
  bubble(): Promise<{ readonly title: string; readonly line: string }>;
  /** What the announcement region holds now; empty when it holds nothing. */
  announcement(): Promise<string>;
  counterShown(): Promise<string>;
  pillShown(line: Line): Promise<string>;
  workingSlot(line: Line): Promise<string>;
  helperLine(): Promise<string>;
  mainButton(): Promise<{ readonly shown: string; readonly heardAs: string }>;
  // spec-006
  tapCounter(): Promise<void>;
  tapBack(): Promise<void>;
  tapSolution(solution: SolutionName): Promise<void>;
  /** Taps where the cell or the line's pill is drawn in the read-only view. */
  tapInSolution(place: Cell | Line): Promise<void>;
  tapStartAgain(): Promise<void>;
  doubleTapStartAgain(): Promise<void>;
  tapPopUpButton(name: string): Promise<void>;
  screenShowing(): Promise<GameScreenName>;
  /** The empty list's line: what it shows, and what a screen reader hears. */
  emptyList(): Promise<{ readonly shown: string; readonly heardAs: string }>;
  solutionsShown(): Promise<readonly string[]>;
  solutionsHeard(): Promise<readonly string[]>;
  solutionView(): Promise<SolutionView>;
  /** Everything a screen reader hears on the solution's view. */
  solutionHeard(): Promise<readonly string[]>;
  /** The names of everything on the screen that can be tapped. */
  controlsOnScreen(): Promise<readonly string[]>;
  popUp(): Promise<PopUpView | null>;
  focusedControl(): Promise<string>;
}
