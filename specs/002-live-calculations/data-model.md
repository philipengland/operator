# Data Model: Live Line Calculations (spec-002)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Unchanged from spec-001 ([data-model.md](../001-walking-skeleton/data-model.md)): Puzzle,
LineSpec, Entry, Rules, CheckResult, SolutionKey and Session. spec-002 changes one rule and
adds one derived value. Nothing new is stored.

### Changed: LineResult and LineSpec.target

- `LineResult`'s failure becomes `{ ok: false, reason: 'inexact-division', step }`. The
  `'below-zero'` reason is removed: a step below zero is a normal result (FR-208).
- `LineSpec.target` may be negative (AC-12). Its type is already `number`.

## Engine

### LineWorking

What one line currently works out to. Derived from the puzzle and the current entry on every
render; never stored.

| Field | Type | Meaning |
| --- | --- | --- |
| `line` | `LinePosition` | Which row or column. |
| `digits` | `(Digit \| null)[]` | The line's digits in reading order (rows left to right, columns top to bottom). Given digits included; `null` for an empty cell. |
| `operator` | `Operator \| null` | The shown operator, or the player's choice on an open line; `null` if not chosen. |
| `outcome` | `LineOutcome` | See below. |

### LineOutcome

| Kind | Fields | When |
| --- | --- | --- |
| `incomplete` | none | Any digit or the operator is `null` (FR-202). |
| `result` | `value: number`, `reachesTarget: boolean` | Complete, and every division is whole. `value` may be below zero (FR-203, FR-204, FR-208). |
| `not-whole` | `step: number` | Complete, and a division step is not whole (FR-205). `step` counts from 1, as `LineResult` does. |

**Rules**

- `reachesTarget` is `value === target`. It accepts nothing; only `checkEntry` accepts a solution
  (FR-207).
- `outcome` comes from `evaluateLine` (spec-001 FR-008), so the working and Check can never
  disagree about a line.
- A complete entry is solved exactly when every line's outcome is a `result` that reaches its
  target. `checkEntry` is refactored to use `lineWorking` (research R3).

## App

### Session

No new state. `lineWorkings(state)` derives the four `LineWorking` values for the view, as
`counterText(state)` derives the counter.

### Labels

| Function | Returns | Example |
| --- | --- | --- |
| `workingText(working)` | The working as the player reads the line | "6 + 2 = 8", "6 + ?", "6 − 9 = −3", "6 ÷ 4" |
| `workingName(working)` | The spoken name of the result slot | "Row 1 working, 6 + 2 = 8, target reached", "Column 1 working, 6 ÷ 4, not a whole number" |
| `resultText(working)` | The visible result slot | "= 8 ✓", "= ?", "= −3", "✗" |
