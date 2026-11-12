// Layer 2 — the words spec-007's scenarios use: days, presets and the Today screen.

import type { Digit, Operator } from './vocabulary';

/** spec-007: the four kinds of daily puzzle. */
export type Preset = 'Easy' | 'Medium' | 'Hard' | 'Collector';

/** A row on the Today screen: one of today's puzzles, or the worked example as "Practice". */
export type TodayChoice = Preset | 'Practice';

type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

/** A calendar date as the phone shows it, for example "10 November 2026". */
export type CalendarDay = `${number} ${Month} ${number}`;

/** A line's operator as the puzzle shows it: one of the four, or open for the player to choose. */
export type LineOperator = Operator | 'open';

/** A cell as the player sees it: given by the puzzle, or for the player to fill. */
export interface DailyCell {
  readonly given: Digit | null;
  readonly value: Digit | 'empty';
}

/** A row's or column's target and operator. */
export interface DailyLine {
  readonly target: number;
  readonly operator: LineOperator;
}

/** A daily puzzle as the player sees it: its name, shape, cells and lines. */
export interface DailyPuzzle {
  /** What a screen reader hears for the puzzle, for example "Easy puzzle, 3 by 3" (FR-717). */
  readonly heardAs: string;
  readonly rows: number;
  readonly columns: number;
  readonly cells: readonly (readonly DailyCell[])[];
  readonly rowLines: readonly DailyLine[];
  readonly columnLines: readonly DailyLine[];
}

/** Where a line's result is shown on the grid (FR-718): at a row's right, below a column, or not beside its line. */
export type ResultPlace = 'right of its row' | 'below its column' | 'not beside its line';

/** A line's result as shown beside it (FR-718): "Row 1" shows "14" with a tick at the right of its row. */
export interface ResultBesideLine {
  readonly line: string;
  /** The result in short form: "?", "14", "−3"; empty when a cross says it all. */
  readonly shown: string;
  readonly mark: 'tick' | 'cross' | 'none';
  readonly place: ResultPlace;
}

/** A row on the Today screen, as shown and as heard ("Easy, found 1 of 4"). */
export interface TodayRow {
  readonly choice: TodayChoice;
  readonly heardAs: string;
}

/** The phone sizes the spec names (spec-004). */
export type PhoneSize = '375 × 667' | '320 × 568';
