// spec-007 FR-705: what each preset's daily puzzle must be (spec.md, Context, the presets table).
// A preset is fixed for good once its story is released (research R13).

import type { Operator, PresetName } from './types';

/** From fewest to most, both included. */
export interface Between {
  readonly fewest: number;
  readonly most: number;
}

export interface Preset {
  readonly rows: number;
  readonly columns: number;
  readonly operators: readonly Operator[];
  /** How many of the grid's lines are open for the player to choose. */
  readonly openLines: Between;
  readonly givenCells: Between;
  /** Every target is within these, and never 0. */
  readonly targets: { readonly lowest: number; readonly highest: number };
  /** The solution counts a puzzle may have; 101 means more than 100. */
  readonly band: Between;
  /** Search steps a count may take before its candidate is dropped (research R4). */
  readonly workBudget: number;
}

/** Part of every seed and daily puzzle identity; a deliberate change to how puzzles are made is v2 (research R2). */
export const GENERATOR_VERSION = 'v1';

// The spike's suggestion (research R4); measured over every date of 2027 and fixed at task T021.
const SUGGESTED_WORK_BUDGET = 200_000;

export const PRESETS: Readonly<Partial<Record<PresetName, Preset>>> = {
  easy: {
    rows: 3,
    columns: 3,
    operators: ['+', '−', '×', '÷'],
    openLines: { fewest: 0, most: 0 },
    givenCells: { fewest: 4, most: 5 },
    targets: { lowest: 1, highest: 100 },
    band: { fewest: 1, most: 10 },
    workBudget: SUGGESTED_WORK_BUDGET,
  },
  medium: {
    rows: 5,
    columns: 4,
    operators: ['+', '−', '×', '÷'],
    openLines: { fewest: 4, most: 5 },
    givenCells: { fewest: 10, most: 10 },
    targets: { lowest: 1, highest: 100 },
    band: { fewest: 2, most: 20 },
    workBudget: SUGGESTED_WORK_BUDGET,
  },
  hard: {
    rows: 7,
    columns: 5,
    operators: ['+', '−', '×', '÷'],
    openLines: { fewest: 1, most: 2 },
    givenCells: { fewest: 21, most: 22 },
    targets: { lowest: -500, highest: 500 },
    band: { fewest: 1, most: 3 },
    workBudget: SUGGESTED_WORK_BUDGET,
  },
  collector: {
    rows: 4,
    columns: 3,
    operators: ['+', '−', '×', '÷'],
    openLines: { fewest: 7, most: 7 },
    givenCells: { fewest: 0, most: 0 },
    targets: { lowest: -29, highest: 29 },
    // 101 is the count's "more than 100" (FR-710).
    band: { fewest: 21, most: 101 },
    workBudget: SUGGESTED_WORK_BUDGET,
  },
};
