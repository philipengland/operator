# Feature Specification: Live Line Calculations

**Feature Branch**: `002-live-calculations`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "As a user, when any cell is clicked by the user, the calculation of
that click is displayed on screen so that the user can see in real time the impact of their
selection. This means the game becomes more of a game of deduction, as well as a maths game."

## Context

This feature builds on [spec-001, the walking skeleton](../001-walking-skeleton/spec.md).
Everything in spec-001 still holds unless this spec says otherwise. It plays the same fixed
2 × 2 puzzle, with the same cells, lines, targets, solutions and cell and operator cycles. See
spec-001's "The Puzzle" section.

This feature comes from the review after F0's playtests. In F0 a player sees nothing of a
line's arithmetic until they press Check, and a rejected grid says only "not solved yet".
Showing each line's working as the grid changes lets the player see the effect of each choice
straight away. The game then becomes one of deduction as well as arithmetic: the player reasons
towards the targets rather than guessing and checking.

### Changes to spec-001

| spec-001 item | Change |
| --- | --- |
| Assumption "Checking on submit only" (lines are not checked as the player types) | **Superseded.** Each line's working is shown as the grid changes. Accepting a solution and counting it still happen only on Check (FR-007, FR-009, FR-012 unchanged). |
| FR-008 "A line fails if any step goes below zero", and the edge case "Going below zero" | **Superseded.** Results below zero are calculated and shown ("6 − 9 = −3"), and a line can meet a negative target (FR-205, FR-208). A division that is not a whole number still fails the line. |
| AC-9 (Row 2 − with bottom-left 9: "not solved yet") | **Still holds, for a new reason.** Column 1 now works out as 6 − 9 = −3, which is not its target of 3. The locked scenario is unchanged. |
| Brief, core rule "subtraction may not go below zero", agreed default "a step cannot go below zero", and Phase 3 "optional negative-number variant" | **Superseded.** Negative numbers become the standard rule, brought forward from Phase 3. The brief is updated in this feature's pull request. Generating puzzles with negative targets stays with F7. |
| Out of Scope "Naming which line or step failed (F2)" | **Partly superseded.** The working marks a division that is not a whole number with a cross (FR-205). The Check message itself still says only "not solved yet" (spec-001 FR-011 unchanged). |
| Brief, open question "Instant line feedback could turn Open mode into trial and error" | **Answered for this puzzle**: show the working, and mark each line that reaches its target (FR-204). This accepts the brief's risk on purpose; SC-202 measures whether players still deduce rather than guess. |
| Brief F2 "a line is marked correct when its result equals its target" | **Brought forward** from F2 (FR-204). F2's naming of the failing step in the Check message stays out of scope. |
| AC-20 and FR-014: a cleared message disappears "without anything being announced" | **Not affected.** The working is not announced after a tap. It is part of each line's name, read when the player moves to that line (owner decision 2026-11-05). |

**Relies on spec-001**: lines are worked left to right and top to bottom, and a step that does
not divide exactly fails the line (FR-008, apart from its below-zero clause); digits are 1–9
only (FR-003).

## Clarifications

### Session 2026-11-05

- Q: Should a line say when it reaches its target, or only show its result? → A: Show the result and mark each line that reaches its target (FR-204).
- Q: Does every line show its working, or only the lines through the cell just tapped? → A: When any cell or operator the player can change is tapped, the working is updated in real time. Every line shows its working all the time.
- Q: Should screen readers announce the working after each tap? → A: No. The working is part of each line's name, read when the player moves to that line. spec-001 AC-20 is unchanged.
- Update (owner): results below zero are calculated and can meet a target, and targets may be negative. A division that is not a whole number shows a cross.
- Q: F0's puzzle has no negative target. Add a puzzle with one, or only allow it in the rules? → A: The rules allow it, proved by unit tests (AC-12). F0's puzzle stays as it is; generated puzzles (F7) bring negative targets to players.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See each line's working as I fill the grid (Priority: P1)

> **As a** puzzle fan playing on my phone,
> **I want to** see the calculation each row and column makes from what I have entered so far,
> **So that** I can see the effect of each choice and deduce the missing digits and operators.

**Why this priority**: it is the whole feature. Without it, players can only guess and check.

**Independent Test**: open the game, tap cells and operators, and read each line's working
beside the grid. It delivers value on its own, before any change to checking.

**Acceptance Scenarios**:

1. **AC-1** — **Given** the game has just opened, **When** the player looks at the grid,
   **Then** Row 1 shows "6 + ?", Column 2 shows "? × ?", Row 2 shows "? ? ?" and Column 1
   shows "6 ? ?". A ? marks an empty cell or an operator not yet chosen.
2. **AC-2** — **Given** the game has just opened, **When** the player taps top-right twice
   (2), **Then** Row 1 shows "6 + 2 = 8" and Column 2 shows "2 × ?".
3. **AC-3** — **Given** top-right 2 and bottom-right 3 are entered, **When** the player looks
   at Column 2, **Then** it shows "2 × 3 = 6".
4. **AC-4** — **Given** bottom-left 2 and bottom-right 3 are entered and Row 2's operator is
   not chosen, **When** the player taps Row 2's operator three times (×), **Then** Row 2's
   working changes from "2 ? 3" to "2 + 3 = 5", then "2 − 3", then "2 × 3 = 6", one change
   per tap.
5. **AC-5** — **Given** bottom-left 2 is entered, **When** the player taps Column 1's
   operator four times (÷), **Then** Column 1 shows "6 ÷ 2 = 3".
6. **AC-6** — **Given** Solution A is entered (top-right 2, bottom-left 2, bottom-right 3,
   Row 2 ×, Column 1 ÷), **When** the player looks at the grid, **Then** every line shows a
   result equal to its target (8, 6, 3 and 6) and every line is marked as reaching its target.
7. **AC-7** — **Given** Solution A is entered, **When** the player taps bottom-left once (3),
   **Then** Row 2 shows "3 × 3 = 9" and Column 1 shows "6 ÷ 3 = 2" straight away, before any
   Check, and neither is marked; Row 1 and Column 2 stay marked.
8. **AC-11** — **Given** top-right 3 is entered, **When** the player looks at Row 1, **Then**
   it shows "6 + 3 = 9" and is not marked; **When** they tap top-right 9 more times, round
   through empty to 2, **Then** Row 1 shows "6 + 2 = 8" and is marked.

---

### User Story 2 - Negative results, and a cross for division that isn't whole (Priority: P2)

> **As a** player exploring the grid,
> **I want to** see a result even when it goes below zero, and see at once when a division
> does not give a whole number,
> **So that** every choice tells me something, and I can rule out the ones that cannot work.

**Why this priority**: without it, a line that goes below zero or divides unevenly would show
nothing useful. Negative numbers widen what a line can reach.

**Independent Test**: enter the "below zero" and "inexact division" examples and read the
working for Column 1.

**Acceptance Scenarios**:

1. **AC-8** — **Given** bottom-left 9 is entered and Column 1's operator is −, **When** the
   player looks at Column 1, **Then** it shows "6 − 9 = −3" and is not marked, since its
   target is 3.
2. **AC-9** — **Given** bottom-left 4 is entered and Column 1's operator is ÷, **When** the
   player looks at Column 1, **Then** it shows "6 ÷ 4" with a cross, and no result.
3. **AC-10** — **Given** Column 1 shows "6 ÷ 4" with a cross, **When** the player taps
   bottom-left twice (6), **Then** Column 1 shows "6 ÷ 6 = 1", with no cross.
4. **AC-12** — **Given** a line whose target is −3, with digits 6 and 9 and operator −,
   **When** it is worked out, **Then** it meets its target; with digits 6 and 8 (6 − 8 = −2) it
   does not. F0's puzzle has no negative target, so this rule is proved by unit tests on the
   rules alone, not on the play screen. Players first meet a negative target in generated
   puzzles (F7).

---

### Edge Cases

- **Nothing entered on a line**: the working shows ? for each empty cell and unchosen operator,
  and no result (AC-1).
- **Partly entered line**: the working shows the parts entered and ? for the rest, and no
  result until the line is complete (AC-2).
- **Shown operators and the given cell**: tapping them changes nothing, so the working does
  not change.
- **Cell cycled back to empty**: the working returns to ? for that cell and loses its result.
- **Below zero**: a result below zero is shown with a minus sign and is not a failure. It is
  marked only if it equals the line's target (AC-8).
- **Division that is not whole**: the line shows a cross and no result. It cannot be marked or
  meet its target (AC-9).
- **Same solutions**: with negatives allowed, F0's puzzle still has exactly Solutions A and B,
  so the counter still reads "of 2".
- **Checking**: Check, the result messages and the counter behave as in spec-001, except that
  results below zero now count (FR-208). A grid whose every line shows its target is only
  counted once the player taps Check.
- **Small screens**: the working for all four lines fits on a 320-pixel-wide screen with
  everything spec-001 requires, without scrolling or zooming.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-201**: A line's working MUST show its cells' digits and its operator in reading order
  (rows left to right, columns top to bottom). Which lines show it, and when, is set out under
  Assumptions, "Which lines".
- **FR-202**: An empty cell or an operator not yet chosen MUST show as ? in the working. A line
  with any ? MUST NOT show a result.
- **FR-203**: When every cell and the operator on a line are filled, and no step fails, the
  working MUST end with "= " and the line's result.
- **FR-204**: A line whose result equals its target MUST be marked as reaching its target. A
  line that is incomplete, cannot continue, or has a different result MUST NOT be marked. The
  mark MUST NOT rely on colour alone and MUST be part of what a screen reader reads for the
  line. Marking a line accepts nothing: only Check does (FR-207).
- **FR-205**: A step that goes below zero MUST be calculated, and its result shown with a minus
  sign ("6 − 9 = −3"). A step that does not divide exactly MUST show the working up to that
  step with a cross and no result ("6 ÷ 4 ✗"). The cross MUST NOT rely on colour alone, and a
  screen reader MUST hear that the division is not a whole number.
- **FR-206**: The working MUST update after every tap on a cell or an open operator, with no
  other action needed.
- **FR-207**: Showing the working MUST NOT accept, reject or count anything. Only Check does
  that (spec-001 FR-007 and FR-009 to FR-015 unchanged).
- **FR-208**: When the player checks, a line MUST meet its target when its result equals the
  target, including when either is below zero. A line with a division that is not a whole
  number MUST NOT meet its target. This replaces spec-001 FR-008's below-zero clause. Targets
  MAY be negative.

### Key Entities

- **Line working**: for one line, the sequence of its digits and operator (or ? for each
  missing part), and then either its result (which may be below zero), a cross for a division
  that is not whole, or nothing while incomplete. It is derived entirely from the current
  entry and is never stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-201**: A first-time player finds one solution within 3 minutes, with no instructions
  beyond the screen itself, in at least 4 of 5 hallway playtests (as spec-001 SC-001).
- **SC-202**: In those playtests, at least 4 of 5 players find the first solution with no more
  than 2 rejected Checks. This shows they are deducing, not guessing.
- **SC-203**: Each line's working updates within 0.1 seconds of a tap (as spec-001 SC-003).
- **SC-204**: All acceptance criteria pass on current Safari for iPhone and current Chrome for
  Android, at 375 × 667 and 320 × 568, and every spec-001 criterion still passes.

## Assumptions

- **Format**: the working uses the line's own symbols (+ − × ÷), with digits in reading order.
  For example "6 + 2 = 8".
- **Where it appears**: the working is shown beside each line, next to its target, so the
  player can compare result and target at a glance. The exact layout follows the mockups and
  is settled in the plan.
- **Which lines**: every line shows its working all the time, and the working updates in real
  time whenever the player taps any cell or operator they can change (owner decision
  2026-11-05). A tap changes at most one row and one column.
- **Operator taps count**: the description names cells, but an operator change also changes a
  line's result, so operator taps update the working too.
- **Check still decides**: Check still decides what is a solution, and the counter still
  counts. This keeps the game's goal of finding every solution. Only its rule for numbers
  below zero changes (FR-208).
- **Minus sign**: a negative result is written with a true minus sign, "−3", as the minus
  operator is.
- **Same puzzle**: F0's fixed 2 × 2 puzzle. No new puzzles, grid sizes or mixed operators.

## Acceptance Criteria as Examples *(org baseline)*

All criteria use spec-001's fixed puzzle. These are the examples:

| Example | Top-right | Bottom-left | Bottom-right | Row 2 | Column 1 | Working shown | Used in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Just opened | empty | empty | empty | ? | ? | 6 + ?, ? ? ?, 6 ? ?, ? × ? | AC-1 |
| First digit | 2 | empty | empty | ? | ? | Row 1 6 + 2 = 8; Column 2 2 × ? | AC-2 |
| Solution A | 2 | 2 | 3 | × | ÷ | 8, 6, 3, 6; all four marked | AC-6 |
| One change from A | 2 | 3 | 3 | × | ÷ | Row 2 3 × 3 = 9 and Column 1 6 ÷ 3 = 2, not marked; Row 1 and Column 2 marked | AC-7 |
| Wrong then right | 3, then 2 | empty | empty | ? | ? | Row 1 6 + 3 = 9 not marked, then 6 + 2 = 8 marked | AC-11 |
| Below zero | – | 9 | – | – | − | Column 1 6 − 9 = −3, not marked | AC-8 |
| Inexact division | – | 4 | – | – | ÷ | Column 1 6 ÷ 4 with a cross | AC-9 |
| Division made whole | – | 6 | – | – | ÷ | Column 1 6 ÷ 6 = 1, no cross | AC-10 |

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: each line's working updates within 0.1 seconds of a tap on the reference
  phone (SC-203). Ready to play stays within 3 seconds (spec-001 SC-004).
- **Availability**: unchanged from spec-001. The working is worked out on the phone and needs
  no connection.
- **Security**: unchanged from spec-001. No new data, inputs or network calls.
- **Accessibility**: WCAG 2.2 AA (constitution IV). Each line's working and its target mark
  are part of what a screen reader reads for that line, read when the player moves to the
  line. They are not announced after each tap, so spec-001 AC-20 stays as it is (owner
  decision 2026-11-05). Neither the working nor the mark relies on colour alone.
- **Capacity and scale**: unchanged. The game runs on the player's phone.

## Integration and Contract Impact *(mandatory — org baseline)*

None outside the game. It calls no services and nothing calls it (constitution I). The internal
play-screen contract (spec-001 `contracts/play-screen.md`) gains each line's working, and is
updated in the plan.

## Out of Scope *(mandatory — org baseline)*

- Changing Check's messages or the counter. Check's only change is allowing results below zero
  (FR-208).
- Saying which line failed in the Check message (spec-001 FR-011 stays).
- Hints, scoring or limits on checks (F8).
- The visual redesign from the mockups, beyond placing the working. That is a separate feature.
- New puzzles, grid sizes and mixed operators (F7, F9).
- Generating puzzles with negative targets (F7). The brief's generator step "a whole,
  non-negative result" is revisited there.
- Fractions and decimals as answers. A division that is not whole is still never correct.
