# Research: Live Line Calculations (spec-002)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

The stack, hosting and test tooling are unchanged from spec-001
([ADR 0001](../../docs/adr/0001-web-stack-and-hosting.md), spec-001
[research.md](../001-walking-skeleton/research.md)). This file covers only what spec-002 adds.

## R1. Where the working sits on screen

- **Decision**: the targets stay on the left of each row and above each column. Each line's
  **calculated value** sits at the opposite end: to the **right** of each row and **below** each
  column. Each row and column then reads as its own working, from target to result:

  ```text
              3   6
              ?   ×
   8  +   [ 6 ][   ]  = ?
   6  ?   [   ][   ]  = ?
             = ?  = ?
  ```

  With top-right 2 entered, Row 1 reads "8 + [6][2] = 8 ✓": the digits and operator are the
  line itself, and the result slot holds "= 8 ✓".
- **Rationale**: the owner's layout decision (2026-11-05): "on the left hand side and top are
  the values you want to reach; on the bottom and right are the values that are calculated,
  intending to match". The player compares each result with the target at the other end of the
  same line. Nothing is repeated, so it fits at 320 px.
- **Fit at 320 × 568**: the content width is 304 px after the 8 px gutters. Row header (target,
  operator) about 72 px, two cells of 48–72 px, a result column of about 56 px and three 8 px
  gaps: 248–296 px. One extra row of about 40 px is added under the grid; F0's content ends
  375 px down, so it still fits. The spec-001 small-screen scenario keeps passing, and a
  spec-002 scenario adds the four results to what must be visible.
- **Alternatives considered**: the whole working ("6 + 2 = 8") beside each line repeats digits
  already in the cells and does not fit under a 48–72 px column. A list under the grid fits
  easily, but the player looks away from the grid, against the owner's layout.

## R2. What the result slot shows

| Line state | Visible in the result slot | Read by a screen reader (R4) |
| --- | --- | --- |
| Any cell empty or operator not chosen | `= ?` | "Row 1 working, 6 + ?" |
| Complete, reaches target | `= 8 ✓` | "Row 1 working, 6 + 2 = 8, target reached" |
| Complete, other result | `= 9` | "Row 1 working, 6 + 3 = 9" |
| Complete, below zero | `= −3` | "Column 1 working, 6 − 9 = minus 3" |
| A division is not whole | `✗` | "Column 1 working, 6 ÷ 4, not a whole number" |

- **Decision**: the spec's working text ("6 + 2 = 8", "6 ÷ 4") is what the line reads as and
  what a screen reader hears. The result slot shows only the part not already on screen.
- **The mark** (FR-204) is a ✓ plus heavier weight on the result; the cross (FR-205) is a ✗.
  Neither relies on colour (constitution IV), and each has a spoken form: "target reached",
  "not a whole number".
- **Minus sign**: negative results use U+2212 "−", matching the operator. The spoken name
  writes "minus 3", because some screen readers skip or misread U+2212 before a number.
- **Alternatives considered**: an empty slot while incomplete hides that the line has a result
  to come; "= ?" keeps the slot's purpose visible. Showing the decimal ("= 1.5 ✗") was not
  asked for: the owner chose "simply add a cross".

## R3. Working out a line: engine or app?

- **Decision**: add `lineWorking(puzzle, entry, line, rules)` to the engine. It returns the
  line's digits and operator (or null for each gap), then one outcome: incomplete; a result
  (possibly negative) with whether it reaches the target; or the division step that is not
  whole. It reuses `evaluateLine`, which already reports the failing step.
- **Rationale**: whether a line reaches its target is a rule (constitution II: the UI asks the
  engine, it never re-implements rules). `checkEntry` already works out lines and keeps its own
  copy of "a line's digits in reading order"; both now share one function.
- **Refactor**: `checkEntry` is re-expressed with `lineWorking`, in a separate `refactor:`
  commit with its existing tests green before and after.
- **Alternatives considered**: computing in `labels.ts` or `view.ts` puts a rule in the app
  layer and duplicates `checkEntry`'s logic.

## R4. Screen readers: read, not announced

- **Decision**: each result slot holds visually hidden text naming the whole working, as F0's
  targets do ("Row 1 target 8"): "Row 1 working, 6 + 2 = 8, target reached". The visible
  "= 8 ✓" is hidden from assistive technology so it is not read twice. The slot is **not** a
  live region.
- **Rationale**: owner decision Q3 (2026-11-05): the working is read when the player moves to
  the line and is not announced after a tap. A screen reader moving through the grid reads a row
  as target, operator, cells, working. The status region is untouched, so spec-001 AC-20 still
  holds.
- **Wording** comes from `labels.ts`, like every other name. "?" is spoken as "question mark"
  by VoiceOver and TalkBack; the manual check in [quickstart.md](quickstart.md) confirms it reads
  sensibly, and the wording can change without touching a locked file, since scenarios read the
  working text through the DSL.

## R5. Acceptance drivers

- **Decision**: the drivers' `GameView` gains each line's working: its text as spoken ("6 + 2 =
  8") and whether it is marked. The engine driver builds it from the session and `labels.ts`;
  the UI driver reads each line's working by name (`/^Row 1 working, /`). `ScreenLayout` gains
  the four result slots for the small-screen scenario.
- **Rationale**: spec-002's criteria are about what the player can read, so the same scenarios
  run through both drivers, as in spec-001.
- **Layer 1 and 2**: `/speckit-acceptance` drafts a new capability file
  (`test/acceptance/play/see-line-working.acceptance-spec.ts`) and the DSL methods it needs,
  for the owner's approval. No spec-001 scenario changes: Q3 left AC-20 intact, and the
  spec-001 small-screen scenario still applies.

## R6. The rule change: numbers below zero (FR-208)

- **Decision**: `evaluateLine` stops failing on a step below zero; only an inexact division
  fails. `LineResult`'s failure reason narrows to `'inexact-division'`. `checkEntry` needs no
  rule of its own: it accepts a line whose result equals its target, negative or not.
- **Existing unit tests**: the `evaluate-line.spec.ts` and `check-entry.spec.ts` cases that
  require "below zero fails" are **rewritten to the new rule**, not deleted or loosened: each
  becomes the matching spec-002 example (6 − 9 = −3; a target of −3 met by 6 − 9). This is a
  requirement change approved in spec-002, and the TDD log records it per test.
- **Negative targets (AC-12)**: proved by engine unit tests with a small test puzzle whose
  target is −3. `LineSpec.target` is already a plain number, so the puzzle type needs no
  change. F0's worked example is untouched, and its two solutions were re-derived with
  negatives allowed: still exactly A and B.
- **Locked spec-001 scenarios**: every assertion still holds. AC-9 still ends "not solved
  yet", since Column 1 gives −3, not 3. But its **wording gives the old reason**: the test
  title says "Column 1 goes below zero, so the puzzle is not solved", and the `belowZero`
  comment in `examples.ts` says "which goes below zero". `/speckit-acceptance` proposes the
  rewording ("Column 1 gives 6 − 9 = −3, not its target of 3") for the owner's approval. These
  are locked files, so the agent does not edit them. `session.spec.ts`'s matching unit test
  asserts "not solved", which still holds; only its comment is updated.
- **Documents**: the brief's core rule, its agreed default and its Phase 3 line are updated in
  this feature's pull request; `engine-api.md` gains the new rule (see
  [contracts/engine-api.md](contracts/engine-api.md)).
- **Alternatives considered**: a `Rules.allowNegative` switch, keeping both behaviours. Not
  needed: the owner made negatives the standard rule, and a switch with one used setting is
  speculative (coding principles §3). F7 can add one if a preset needs it.

## R7. Performance

- **Decision**: no new budget work. Working out four two-digit lines per tap is negligible; the
  existing Android budget scenario covers taps, and the bundle stays far under 30 KB.
