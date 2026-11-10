// The engine's data shapes (docs/contracts/engine-api.md, data-model.md "Engine").

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Operator = '+' | '−' | '×' | '÷';

export interface LineSpec {
  readonly target: number;
  readonly operator: Operator | 'open';
}

export interface Puzzle {
  /** Says which puzzle saved solutions belong to: `worked-example`, or `daily-v1-2026-11-10-easy` (spec-007). */
  readonly id: string;
  /** spec-007: the seed a daily puzzle was made from; absent for the worked example. */
  readonly seed?: string;
  /** spec-007: the preset a daily puzzle was made for; absent for the worked example. */
  readonly preset?: PresetName;
  readonly rows: number;
  readonly columns: number;
  readonly givens: readonly (readonly (Digit | null)[])[];
  readonly rowLines: readonly LineSpec[];
  readonly columnLines: readonly LineSpec[];
  readonly solutionCount: number;
}

export interface Entry {
  readonly cells: readonly (readonly (Digit | null)[])[];
  readonly rowOperators: readonly (Operator | null)[];
  readonly columnOperators: readonly (Operator | null)[];
}

export interface Rules {
  readonly operatorOrder: 'left-to-right';
}

export type LineResult =
  | { readonly ok: true; readonly value: number }
  | { readonly ok: false; readonly reason: 'inexact-division'; readonly step: number };

export type SolutionKey = string & { readonly __brand: 'SolutionKey' };

export interface CellPosition {
  readonly row: number;
  readonly column: number;
}

export interface LinePosition {
  readonly axis: 'row' | 'column';
  readonly index: number;
}

/** What one line currently works out to (spec-002, data-model "LineWorking"). */
export type LineOutcome =
  | { readonly kind: 'incomplete' }
  | { readonly kind: 'result'; readonly value: number; readonly reachesTarget: boolean }
  | { readonly kind: 'not-whole'; readonly step: number };

export interface LineWorking {
  readonly line: LinePosition;
  /** Reading order, given digits included; null for an empty cell. */
  readonly digits: readonly (Digit | null)[];
  readonly operator: Operator | null;
  readonly outcome: LineOutcome;
}

export type CheckResult =
  | {
      readonly kind: 'incomplete';
      readonly missingCells: readonly CellPosition[];
      readonly missingOperators: readonly LinePosition[];
    }
  | { readonly kind: 'not-solved' }
  | { readonly kind: 'solved'; readonly key: SolutionKey };

/** spec-007: the four presets. */
export type PresetName = 'easy' | 'medium' | 'hard' | 'collector';

/** spec-007: a calendar date as text, `2026-11-10`, formed by the app; the engine reads no clock. */
export type CalendarDate = string;

/** spec-007: a day's puzzle, and the full filling it was made from, which solves it. */
export interface DailyPuzzle {
  readonly puzzle: Puzzle;
  readonly builtFrom: Entry;
}
