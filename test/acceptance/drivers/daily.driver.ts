// Layer 3 contract — what every daily-puzzle driver (in-process or Playwright) must provide (spec-007).
// Signatures only. Drivers report what the player would see; they never judge it.

import type { CalendarDay, DailyPuzzle, Preset, TodayChoice, TodayRow } from '../dsl/daily-vocabulary';

export interface DailyDriver {
  /** Sets the phone's own calendar date before the game opens or reopens. */
  setDate(day: CalendarDay): Promise<void>;
  tapToday(): Promise<void>;
  todayRows(): Promise<readonly TodayRow[]>;
  tapTodayRow(choice: TodayChoice): Promise<void>;
  /** The daily puzzle on the play screen; fails if the worked example is showing. */
  puzzle(): Promise<DailyPuzzle>;
  isWorkedExampleShowing(): Promise<boolean>;
  /** The counter's visible title: "Solutions found" or "All found!". */
  counterTitle(): Promise<string>;
  /** The counter as heard: "Found 1 of 4" or "Found 3". */
  counter(): Promise<string>;
  /** Enters the full filling the puzzle was made from, with each open line's operator, and checks it. */
  enterBuiltFromFillingAndCheck(): Promise<void>;
  /** Enters and checks the puzzle's first `count` distinct solutions, in a fixed order. */
  enterSolutionsAndCheck(count: number): Promise<void>;
  /** The same date's and preset's puzzle as the engine alone makes it, with no game or phone. */
  madeByTheEngineAlone(day: CalendarDay, preset: Preset): Promise<DailyPuzzle>;
  /** The theme the play screen shows, and the theme worked out from the puzzle's seed (spec-003). */
  themeShown(): Promise<string>;
  themeForThePuzzlesSeed(): Promise<string>;
  /** Seconds from tapping a row on the Today screen until that puzzle is ready to play. */
  secondsToOpen(choice: TodayChoice): Promise<number>;
}
