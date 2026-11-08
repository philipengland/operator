# Data Model: Themed Play Screen (spec-004)

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-07

Nothing is stored. Everything lives only while the game is open.

## Session (changed)

`src/app/session.ts`, pure. spec-001's fields are unchanged; one field is added.

| Field | Type | Rule |
| --- | --- | --- |
| `puzzle` | `Puzzle` | the fixed 2 × 2 puzzle |
| `entry` | `Entry` | digits and chosen operators |
| `found` | `ReadonlySet<SolutionKey>` | distinct solutions found |
| `message` | `MessageKind \| null` | the last check's result; null once the grid changes |
| **`selected`** | **`CellPosition \| null`** | **new**: the cell the keypad sets; null when the game opens |

### Actions

| Action | Effect |
| --- | --- |
| `tapCell(row, column)` | Changeable cell: becomes `selected`, steps to its next value (spec-001 FR-002), message cleared. Given cell: nothing changes; `selected` stays. |
| `tapOperator(line)` | Open operator: next operator, message cleared; `selected` unchanged. Shown operator: nothing. |
| **`key(digit)`** (new) | With a selection: the selected cell becomes `digit`, message cleared. Without: nothing. |
| **`clear`** (new) | With a selection: the selected cell becomes empty, message cleared. Without: nothing. |
| `submit` | As spec-001 FR-014; `selected` and the entry unchanged (FR-015). |

A key that puts in the digit a cell already has still clears the message: the player acted on
the grid, as a tap does.

## Screen props (new mapping)

`src/app/screen.ts`: `playScreenProps(state, theme, features): PlayScreenProps`. Pure,
unit-tested in both flag states (R10).

| Library prop | From |
| --- | --- |
| `header.title` | "Hello, Operator!" |
| `header.message` | `bubbleLine(state.message, theme, features.voice)` (Messages table; with the voice off, a result is spec-001's message) |
| `counter` | `{ found: state.found.size, total: puzzle.solutionCount }` |
| `grid.rowPills`, `grid.columnPills` | per line: target, operator (shown, or the chosen one, or null), `isOpen`, name "Row 1 target 8, plus" / "Row 2 target 6, operator not chosen", `reachesTarget` from the line's working |
| `grid.cells` | per cell: name and digit as today (`labels.ts`), `isGiven`, `isSelected` (= `selected`, and only with `features.keypad`), `isInCorrectLine` (the player's digit in a line that reaches its target) |
| `grid.rowWorkings`, `grid.columnWorkings` | spec-002's working and mark (`labels.ts`) |
| `grid.helper` | "Tap a dashed bubble to swap its operator." while any operator is open (FR-403) |
| `isKeypadShown` (library addition) | `features.keypad` |
| `keysAvailable` (library addition) | `state.selected !== null` |
| `announcement` (library addition) | `announcement(state.message, theme, features.voice, countChanged, counterText)`; empty when `message` is null |
| `mainButtonLabel` | `theme.buttonLabel` ("Put it through!") |

**`countChanged`**: true when the last check found a new solution, so the count is in the same
announcement (clarification 2026-11-07).

## Messages

As the spec's Messages table. `bubbleLine` uses the theme's `address` and `signOff`.
`announcement` is spec-001's message (`labels.ts`, unchanged), then a space, then the bubble's
line, then " Found N of 2" when the count changed.

| Kind | Classic bubble line |
| --- | --- |
| none (greeting) | Fill the grid, pal. |
| `new-solution` | You're connected! Keep 'em coming, pal! |
| `all-found` | Every line connected, pal! |
| `already-found` | We've had that call, pal. |
| `not-solved` | Wrong number, pal! |
| `incomplete` | Line's busy, pal: fill every cell and operator first. |

## Features

`src/app/features.ts`: `{ keypad: boolean; voice: boolean }`, fixed at build time (R10). Both
false until their stories are released.

## Theme

The fixed puzzle has no seed, so the theme is `themeForSeed(undefined)`, which is Classic
(spec-003 AC-25). Nothing else selects a theme (FR-411).
