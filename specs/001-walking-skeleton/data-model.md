# Data Model: Walking Skeleton (F0)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-01

F0 stores nothing. All data below lives in memory for the current visit and is lost on
reload (spec Assumptions: "No saving"). There is no persistence, no data classification
to record and no deletion behaviour beyond closing the page.

The engine types are the boundary between the pure rules and everything else. Their
TypeScript signatures are in [contracts/engine-api.md](contracts/engine-api.md).

## Engine (rules) — `src/engine/`

### Digit

A whole number from 1 to 9. Zero and anything else are unrepresentable (FR-003).

### Operator

One of `+`, `−`, `×`, `÷`.

**Cycle** (FR-006): `+ → − → × → ÷ → +`. From "not chosen" (`null`) the first step is `+`.
There is no step back to "not chosen".

### Cell value cycle

A changeable cell holds `Digit | null` (null means empty).

**Cycle** (FR-002): `null → 1 → 2 → … → 9 → null`.

### LineSpec

| Field | Type | Rule |
| --- | --- | --- |
| `target` | positive whole number | Never 0 (brief, generation step 3). |
| `operator` | `Operator \| 'open'` | `'open'` lines take the player's chosen operator. |

### Puzzle

| Field | Type | Rule |
| --- | --- | --- |
| `rows`, `columns` | whole numbers ≥ 1 | F0: 2 and 2. |
| `givens` | `(Digit \| null)[][]`, `rows × columns` | `null` = a cell the player fills. |
| `rowLines` | `LineSpec[]`, length `rows` | Worked left to right. |
| `columnLines` | `LineSpec[]`, length `columns` | Worked top to bottom. |
| `solutionCount` | whole number ≥ 1 | The "of M" in the counter. F0 states it (Assumptions: "Total is part of the puzzle"). |

F0 ships one instance, `workedExample`, exactly as in the spec's "The Puzzle" section:
givens `[[6, null], [null, null]]`; rows `{8, +}`, `{6, open}`; columns `{3, open}`,
`{6, ×}`; `solutionCount: 2`.

### Entry

What the player has filled in.

| Field | Type | Rule |
| --- | --- | --- |
| `cells` | `(Digit \| null)[][]`, same shape as `givens` | The values at given positions are ignored. The given digit always wins. |
| `rowOperators` | `(Operator \| null)[]` | Only read for `'open'` rows. `null` = not chosen. |
| `columnOperators` | `(Operator \| null)[]` | Only read for `'open'` columns. |

### Rules

| Field | Type | Rule |
| --- | --- | --- |
| `operatorOrder` | `'left-to-right'` | Constitution II and the brief: a parameter from the start. It has no effect while each line has one operator. `'standard-precedence'` is added with F9. |

### LineResult

`{ ok: true, value }` or `{ ok: false, reason: 'below-zero' | 'inexact-division', step }`,
where `step` is the 1-based index of the failing operation. F0 does not show `reason` or
`step` (FR-011). They exist so F2 can name the failing step without changing the engine's
shape.

### CheckResult

| Kind | When | Extra |
| --- | --- | --- |
| `incomplete` | Any changeable cell is empty or any open operator is `null` (FR-010). | `missingCells`, `missingOperators` (positions) |
| `not-solved` | Complete, but some line fails or misses its target (FR-008, FR-009, FR-011). | none shown in F0 |
| `solved` | Complete and every line hits its target. | `key: SolutionKey` |

Checking always calculates. It never compares with a stored answer (FR-009,
constitution II).

### SolutionKey

A canonical string built from the entered digits in reading order, then the chosen
operators on open rows, then on open columns. For example, Solution A gives
`"2,2,3|×|÷"`. Two solutions are distinct exactly when their keys differ (FR-012): any
entered digit or chosen operator that differs changes the key. Given digits and shown
operators are left out, because they are the same in every entry.

## Session (app state) — `src/app/session.ts`

A pure reducer, with no DOM access.

### SessionState

| Field | Type | Starts as |
| --- | --- | --- |
| `puzzle` | `Puzzle` | `workedExample` |
| `entry` | `Entry` | All changeable cells `null`, all open operators `null` (AC-1) |
| `found` | `ReadonlySet<SolutionKey>` | Empty, so "Found 0 of 2" |
| `message` | `Message \| null` | `null` |

`counterText` is derived as `Found ${found.size} of ${puzzle.solutionCount}` (FR-013).

### Message

| Kind | Shown when | Text intent |
| --- | --- | --- |
| `new-solution` | `solved` with a key not in `found`, and `found` does not reach the total | New solution |
| `all-found` | `solved` with a new key that brings `found` to `solutionCount` | New solution, and every solution has been found (FR-014) |
| `already-found` | `solved` with a key already in `found` | Already found |
| `not-solved` | `not-solved` | Not solved yet |
| `incomplete` | `incomplete` | Fill every cell and choose every open operator first |

Exact wording is settled with the acceptance scenarios and content review (Overlay P5).

### Actions and transitions

| Action | Effect on `entry` | Effect on `found` | Effect on `message` |
| --- | --- | --- | --- |
| `tapCell(row, col)` on a changeable cell | Value moves one step through the cell cycle | none | Cleared to `null` |
| `tapCell` on a given cell | none (FR-004) | none | Unchanged |
| `tapOperator(line)` on an open line | Operator moves one step through the operator cycle | none | Cleared to `null` |
| `tapOperator` on a shown line | none (FR-005) | none | Unchanged |
| `submit` | none (FR-015) | Adds the key if `solved` and new | Set from the table above |

The "unchanged" rows follow the spec's Stale result edge case: tapping something that
cannot change leaves the message in place.

```text
            tapCell / tapOperator (changeable)
   ┌──────────────────────────────────────────────┐
   ▼                                              │
[no message] ──submit──► [message shown] ─────────┘
                              │   ▲
                              └───┘ submit again (message replaced)
```
