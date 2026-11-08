// Layer 3 contract — what every game driver (in-process or Playwright) must provide.
// Signatures only. Drivers report what the player would see; they never judge it.

import type { Cell, CellValue, KeypadKey, Line, OperatorChoice, Result, Working, WorkingMark } from '../dsl/vocabulary';

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
}
