# Contract: Puzzle Engine API

**Status**: internal boundary, not a published contract (constitution, Baseline
Applicability: Baseline 3 has no subject while there are no HTTP APIs or events).

This is the TypeScript surface the app (and the acceptance engine driver) may use from
`src/engine/index.ts`. Nothing else in `src/engine/` is imported from outside it. Field
meanings and rules are in spec-001's [data-model.md](../../specs/001-walking-skeleton/data-model.md)
and spec-002's [data-model.md](../../specs/002-live-calculations/data-model.md).

**History**: written for F0 (spec-001). Changed by spec-002 on 2026-11-05: results below
zero count, so `evaluateLine` fails only on a division that is not whole (FR-208).

```ts
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Operator = '+' | '−' | '×' | '÷';

export interface LineSpec {
  readonly target: number;
  readonly operator: Operator | 'open';
}

export interface Puzzle {
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

export type CheckResult =
  | { readonly kind: 'incomplete'; readonly missingCells: readonly CellPosition[]; readonly missingOperators: readonly LinePosition[] }
  | { readonly kind: 'not-solved' }
  | { readonly kind: 'solved'; readonly key: SolutionKey };

export interface CellPosition { readonly row: number; readonly column: number }
export interface LinePosition { readonly axis: 'row' | 'column'; readonly index: number }

/** The worked example from the project brief: the only puzzle in F0. */
export const workedExample: Puzzle;

/** The default rule settings. */
export const defaultRules: Rules;

/** Works out one line from its digits and operator in reading order. */
export function evaluateLine(digits: readonly Digit[], operator: Operator, rules: Rules): LineResult;

/** Checks a whole entry against a puzzle by calculation. Never compares with a stored answer. */
export function checkEntry(puzzle: Puzzle, entry: Entry, rules: Rules): CheckResult;

/** An entry with every changeable cell empty and every open operator not chosen. */
export function emptyEntry(puzzle: Puzzle): Entry;

/** True when the cell holds a given digit and cannot change. */
export function isGiven(puzzle: Puzzle, position: CellPosition): boolean;

/** empty → 1 → … → 9 → empty. */
export function nextCellValue(value: Digit | null): Digit | null;

/** not chosen → + → − → × → ÷ → +. */
export function nextOperator(operator: Operator | null): Operator;
```

## Guarantees

- Every function is pure: same input, same output, no side effects, no globals.
- Nothing in the engine references the DOM, browser APIs, Node APIs, timers, randomness
  or the clock. The build enforces this (research R2).
- `evaluateLine` fails on the first step that does not divide exactly, even if a later step
  would reach the target (spec-001 Edge Cases). A step may go below zero; results and
  targets may be negative (spec-002 FR-208).
- `checkEntry` returns `incomplete` before evaluating any line, so an incomplete grid is
  never marked wrong (FR-010).
- Two `solved` results have the same `key` exactly when every entered digit and chosen
  open operator is the same (FR-012).

## Examples (from the spec's example table)

| Entry (TR, BL, BR, Row 2, Col 1) | `checkEntry` result |
| --- | --- |
| 2, 2, 3, ×, ÷ | `solved`, key `2,2,3\|×\|÷` |
| 2, 3, 3, +, − | `solved`, key `2,3,3\|+\|−` |
| 2, 9, 3, −, − | `not-solved` (Column 1: 6 − 9 = −3, not its target of 3) |
| 2, 4, 3, +, ÷ | `not-solved` (Column 1: 6 ÷ 4 inexact at step 1) |
| 2, 2, empty, ×, ÷ | `incomplete`, missing bottom-right |

## `evaluateLine` examples

| Digits | Operator | Result |
| --- | --- | --- |
| 6, 9 | − | `{ ok: true, value: -3 }` (before spec-002: `{ ok: false, reason: 'below-zero', step: 1 }`) |
| 6, 4 | ÷ | `{ ok: false, reason: 'inexact-division', step: 1 }` |
| 6, 2 | ÷ | `{ ok: true, value: 3 }` |
