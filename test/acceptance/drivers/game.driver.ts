// Layer 3 contract — what every game driver (in-process or Playwright) must provide.
// Signatures only. Drivers report what the player would see; they never judge it.

import type { Cell, CellValue, Line, OperatorChoice, Result } from '../dsl/vocabulary';

export interface CellView {
  readonly value: CellValue;
  readonly isGiven: boolean;
}

export interface OperatorView {
  readonly choice: OperatorChoice;
  readonly isOpen: boolean;
}

export interface GameView {
  readonly cells: Readonly<Record<Cell, CellView>>;
  readonly targets: Readonly<Record<Line, number>>;
  readonly operators: Readonly<Record<Line, OperatorView>>;
  readonly counter: string;
  readonly result: Result | null;
}

export interface GameDriver {
  open(): Promise<void>;
  tapCell(cell: Cell): Promise<void>;
  tapOperator(line: Line): Promise<void>;
  check(): Promise<void>;
  view(): Promise<GameView>;
  /** How many announcements screen-reader users have heard since the game opened. */
  announcementCount(): Promise<number>;
}
