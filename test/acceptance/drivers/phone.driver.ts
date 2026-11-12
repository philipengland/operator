// Layer 3 contract — the phone around the game: screen, connection, looks and speed.
// Only the Playwright driver implements it, so scenarios that use it are tagged @ui.

import type { ColourToken, PageDots, PlayScreenPart, Typeface } from '../dsl/catalogue-vocabulary';
import type { Cell, Entry, Line, TypefacedText } from '../dsl/vocabulary';

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

/** spec-007: where a daily puzzle's parts sit, and how far the page can scroll each way. */
export interface DailyLayout {
  readonly screen: ScreenSize;
  /** Every cell, pill and key, and the main button: everything a player taps to play. */
  readonly tapTargets: readonly Box[];
  /** The puzzle's cells alone; each is also among the tap targets. */
  readonly cells: readonly Box[];
  /** The whole puzzle (pills, cells and any workings), the keypad and the main button. */
  readonly puzzle: Box;
  readonly keypad: Box;
  readonly mainButton: Box;
  /** The page's full scrollable size; larger than the screen when it scrolls. */
  readonly page: ScreenSize;
}

/** How a cell looks: its colours, and every visible marking that is not a colour. */
export interface CellLook {
  readonly colours: string;
  readonly markings: string;
}

/** spec-004: a cell's look in the theme's colour names; 'other' for anything else. */
export interface CellAppearance {
  readonly fill: ColourToken | 'none' | 'other';
  readonly digit: ColourToken | 'none' | 'other';
  readonly shadow: ColourToken | 'none' | 'other';
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
  // spec-004
  /** The screen's size and where its five parts sit. */
  playScreenParts(): Promise<{ readonly screen: ScreenSize; readonly parts: Readonly<Record<PlayScreenPart, Box>> }>;
  cellAppearance(cell: Cell): Promise<CellAppearance>;
  isPillDashed(line: Line): Promise<boolean>;
  /** Every colour drawn on the page, as #RRGGBB. */
  coloursInUse(): Promise<readonly string[]>;
  /** The page's Ben-Day dots as drawn; null when none are drawn. */
  pageDots(): Promise<PageDots | null>;
  /** The first family in the text's font stack that has loaded. */
  typeface(text: TypefacedText): Promise<Typeface | string>;
  // spec-006
  /** The phone's own back gesture or button. */
  goBack(): Promise<void>;
  closeAndReopen(): Promise<void>;
  /** From now on, the phone refuses to let the game save anything. */
  refuseSaving(): Promise<void>;
  /** Before the game opens: saved data that makes no sense. */
  leaveUnreadableSavedData(): Promise<void>;
  /** Before the game opens: these fillings are saved for the fixed puzzle, in this order. */
  leaveSavedFillings(fillings: readonly Entry[]): Promise<void>;
  // spec-007
  /** Where a daily puzzle's parts sit, measured at the top of the page. */
  dailyLayout(): Promise<DailyLayout>;
  /** Before the game opens: a record of the last puzzle played that makes no sense. */
  leaveUnreadableRecordOfLastPuzzle(): Promise<void>;
  accessibilityProblems(): Promise<readonly string[]>;
  errorsOnThePage(): Promise<readonly string[]>;
}
