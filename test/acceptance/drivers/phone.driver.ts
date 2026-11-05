// Layer 3 contract — the phone around the game: screen, connection, looks and speed.
// Only the Playwright driver implements it, so scenarios that use it are tagged @ui.

import type { Cell, Line } from '../dsl/vocabulary';

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface ScreenSize {
  readonly width: number;
  readonly height: number;
}

/** Where things sit on the screen, in CSS pixels from the top-left of the visible area. */
export interface ScreenLayout {
  readonly screen: ScreenSize;
  readonly cells: Readonly<Record<Cell, Box>>;
  readonly targets: Readonly<Record<Line, Box>>;
  readonly operators: Readonly<Record<Line, Box>>;
  readonly counter: Box;
  readonly checkButton: Box;
  /** spec-002: where each line's working is. */
  readonly workings: Readonly<Record<Line, Box>>;
}

/** How a cell looks: its colours, and every visible marking that is not a colour. */
export interface CellLook {
  readonly colours: string;
  readonly markings: string;
}

export interface PhoneDriver {
  useScreen(size: ScreenSize): Promise<void>;
  useReferencePhoneOn4G(): Promise<void>;
  loseConnection(): Promise<void>;
  reload(): Promise<void>;
  isGameShowing(): Promise<boolean>;
  networkRequestsSinceOpening(): Promise<number>;
  look(cell: Cell): Promise<CellLook>;
  layout(): Promise<ScreenLayout>;
  secondsUntilReadyToPlay(): Promise<number>;
  tapResponseTimesInMilliseconds(): Promise<readonly number[]>;
}
