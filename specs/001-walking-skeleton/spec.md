# Feature Specification: Walking Skeleton (F0)

**Feature Branch**: `001-walking-skeleton`

**Created**: 2026-11-01

**Status**: Draft

**Input**: User description: "F0 walking skeleton: a player opens the game on a phone browser and
plays one fixed puzzle, the 2 × 2 worked example in docs/brief/project-brief.md. They can enter
digits 1-9 in empty cells, cannot change the given cell, can cycle the operator on open lines,
and submit. A valid filling is accepted whether or not it matches a stored answer, and the
counter shows "Found N of 2", counting each distinct solution once. The game is built and
deployed to a public URL by the pipeline. Out of scope: generation, presets, the solution log
list, scoring."

## The Puzzle

F0 plays one fixed puzzle: the worked example from the project brief. Rows are worked left to
right and columns top to bottom.

| | Column 1: operator open, target 3 | Column 2: operator × shown, target 6 |
| --- | --- | --- |
| **Row 1: operator + shown, target 8** | 6 (given) | empty |
| **Row 2: operator open, target 6** | empty | empty |

The cells are called **top-left** (the given 6), **top-right**, **bottom-left** and
**bottom-right**.

The puzzle has exactly two solutions:

| Solution | Top-right | Bottom-left | Bottom-right | Row 2 operator | Column 1 operator |
| --- | --- | --- | --- | --- | --- |
| A | 2 | 2 | 3 | × | ÷ |
| B | 2 | 3 | 3 | + | − |

## Clarifications

### Session 2026-11-01

- Q: How should the player put digits into cells on a phone: with an on-screen number pad that the game draws, or with the phone's own keyboard? → A: Neither. Tapping a cell steps it through empty → 1 → … → 9 → empty, the same way the operators cycle. There is no pad and the phone keyboard never opens.
- Q: If a player opens the game once and later reopens or reloads the public address with no connection, should the game still load? → A: No. The browser build works offline once loaded; reopening or reloading needs a connection. Offline opening comes from store packaging (F13), which bundles the game inside the app.
- Q: After the game shows a submission result, when should that message go away? → A: It stays until the player taps any cell or operator, then disappears silently.
- Q: Which screen readers must be able to complete the puzzle for SC-006 to pass? → A: VoiceOver on Safari for iPhone, and TalkBack on Chrome for Android.
- Q: When the player finds the last solution, should the game say every solution has been found? → A: Yes. The result says the solution is new and that every solution has been found. The grid stays editable.

## User Scenarios & Testing *(mandatory)*

Each user story has its own file in [stories/](stories/). The acceptance criteria below are the
master copy. A change to a criterion must also be made in the story's file.

### User Story 1 - Solve the puzzle on a phone (Priority: P1)

> **As a** puzzle fan playing on my phone,
> **I want to** fill in the empty squares, choose the missing operators and check my answer,
> **So that** I can find out whether I have solved the puzzle.

**Full story**: [stories/us1-solve-the-puzzle.md](stories/us1-solve-the-puzzle.md) (the
narrative, why this priority, and the independent test).

**Acceptance Scenarios** (master copy):

1. **AC-1** — **Given** the game has just opened, **When** the player looks at the grid,
   **Then** they see the given 6 in the top-left cell, three empty cells, row targets 8 and 6,
   column targets 3 and 6, + on Row 1, × on Column 2, Row 2 and Column 1 shown as not yet
   chosen, and the counter reading "Found 0 of 2".
2. **AC-2** — **Given** the top-right cell is empty, **When** the player taps it once,
   **Then** it shows 1; **When** they tap it 6 more times, **Then** it shows 7.
3. **AC-3** — **Given** the bottom-left cell shows 9, **When** the player taps it,
   **Then** the cell is empty again.
4. **AC-4** — **Given** the top-left cell holds the given 6, **When** the player taps it,
   **Then** it still shows 6 and looks visibly different from cells the player can change.
5. **AC-5** — **Given** an empty cell, **When** the player taps it ten times, **Then** it
   shows 1, 2, 3, 4, 5, 6, 7, 8, 9 and then is empty again, and never shows 0 or any other
   character.
6. **AC-6** — **Given** Row 2's operator is not yet chosen, **When** the player taps it
   five times, **Then** it shows +, then −, then ×, then ÷, then + again.
7. **AC-7** — **Given** the player taps Row 1's + or Column 2's ×, **Then** the operator
   does not change.
8. **AC-8** — **Given** the player has entered top-right 2, bottom-left 2, bottom-right 3,
   Row 2 × and Column 1 ÷ (Solution A), **When** they submit, **Then** the game says the
   puzzle is solved and the counter reads "Found 1 of 2".
9. **AC-9** — **Given** the player has entered top-right 2, bottom-left 9, bottom-right 3,
   Row 2 − and Column 1 − (Row 2 gives 9 − 3 = 6, but Column 1 gives 6 − 9, which goes below
   zero), **When** they submit, **Then** the game says the puzzle is not solved yet and the
   counter still reads "Found 0 of 2".
   *Reason amended on 2026-11-05 by [spec-002](../002-live-calculations/spec.md): going below
   zero is allowed, and Column 1 gives 6 − 9 = −3, which is not its target of 3. The outcome
   is unchanged.*
10. **AC-10** — **Given** the player has entered top-right 2, bottom-left 4, bottom-right 3,
    Row 2 + and Column 1 ÷ (Column 1 gives 6 ÷ 4, which is not a whole number), **When** they
    submit, **Then** the game says the puzzle is not solved yet and the counter does not change.
11. **AC-11** — **Given** the bottom-right cell is empty, or Column 1's operator is not yet
    chosen, **When** the player submits, **Then** the game says every cell and every open
    operator must be filled before checking, and the counter does not change.
12. **AC-20** — **Given** the game has just said the puzzle is not solved yet, **When** the
    player taps the bottom-left cell, **Then** the message disappears without anything being
    announced and the counter does not change; **When** they instead tap the given 6,
    **Then** the message stays.

---

### User Story 2 - Find both solutions (Priority: P2)

> **As a** puzzle fan who has already solved the puzzle once,
> **I want to** look for a different answer and see how many answers I have found so far,
> **So that** I can keep playing until I have found every answer.

**Full story**: [stories/us2-find-both-solutions.md](stories/us2-find-both-solutions.md)
(the narrative, why this priority, and the independent test).

**Acceptance Scenarios** (master copy):

1. **AC-12** — **Given** the counter reads "Found 1 of 2" after Solution A, **When** the
   player changes bottom-left to 3, Row 2 to + and Column 1 to − (Solution B) and submits,
   **Then** the game says this is a new solution and that every solution has been found,
   and the counter reads "Found 2 of 2".
2. **AC-13** — **Given** the counter reads "Found 1 of 2" after Solution A, **When** the
   player submits Solution A again, **Then** the game says this solution has already been
   found and the counter still reads "Found 1 of 2".
3. **AC-14** — **Given** the counter reads "Found 2 of 2", **When** the player submits
   Solution B again, **Then** the counter still reads "Found 2 of 2".
4. **AC-15** — **Given** the player has submitted Solution B first, **When** they then
   submit Solution A, **Then** the game says every solution has been found and the counter
   reads "Found 2 of 2" (the order does not matter).
5. **AC-16** — **Given** a solution has just been accepted, **When** the player looks at the
   grid, **Then** their digits and operators are still in place for them to change.

---

### User Story 3 - Anyone can open the game at a public address (Priority: P3)

> **As a** playtester trying out the game,
> **I want to** open the latest version on my phone from a web link, with nothing to install,
> **So that** I can try each new change as soon as it is ready and say what I think.

**Full story**: [stories/us3-open-at-public-address.md](stories/us3-open-at-public-address.md)
(the narrative, why this priority, and the independent test).

**Acceptance Scenarios** (master copy):

1. **AC-17** — **Given** a change is merged to the main line, **When** the pipeline finishes,
   **Then** the public address serves the new version, with no manual step.
2. **AC-18** — **Given** the game has loaded on a phone, **When** the phone loses its
   connection, **Then** the player can still fill the grid, submit and see the counter update.
3. **AC-19** — **Given** the pipeline fails to build or test a change, **When** it stops,
   **Then** the public address keeps serving the previous version.
4. **AC-21** — **Given** the game has been opened once on a phone and the phone now has no
   connection, **When** the player reloads the page, **Then** the game does not load.

### Edge Cases

- **Right row, wrong column**: bottom-left 9 with Row 2 − meets Row 2's target but no
  Column 1 operator reaches 3 (AC-9). The puzzle is not solved until both lines meet their
  targets.
- **Going below zero**: any step that goes below zero fails its line, even if a later step
  would bring it back to the target (AC-9).
- **Inexact division**: any step that does not divide exactly fails its line (AC-10).
- **Incomplete grid**: submitting with an empty cell or an unchosen open operator is not a
  check. Nothing is marked wrong and the counter does not change (AC-11).
- **Same digits, different operators**: two solutions are distinct if any entered digit or
  chosen operator differs, as the brief defines. In this puzzle each solution has its own
  digits, so the case only appears in later puzzles. The rule is still applied.
- **Stale result**: after a result is shown, the next tap on a cell or open operator removes
  it, so the message never describes a grid that has since changed. Tapping the given cell or
  a shown operator changes nothing, so the message stays.
- **Reload**: reloading the page starts the puzzle afresh at "Found 0 of 2" (see Assumptions).
  Reloading or reopening with no connection does not load the game (FR-016).
- **Small screens and notches**: the whole grid, the targets, the counter and the submit
  control are visible without scrolling or zooming on a 320-pixel-wide screen. Nothing sits
  under a notch, rounded corner or home indicator.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST show the fixed puzzle in The Puzzle section: each row's target to
  its left and each column's target above it.
- **FR-002**: Each tap on a cell the player can change MUST move it through empty, 1, 2, 3,
  4, 5, 6, 7, 8, 9 in that order, returning to empty after 9. This is the only way to enter,
  change or clear a digit. The game MUST NOT show an on-screen number pad or open the phone's
  keyboard.
- **FR-003**: A cell MUST only ever be empty or hold a digit from 1 to 9. It never holds 0 or
  any other character.
- **FR-004**: The given cell MUST show its digit, MUST look different from cells the player
  can change, and MUST NOT accept changes.
- **FR-005**: Shown operators (Row 1 +, Column 2 ×) MUST NOT change when tapped.
- **FR-006**: Open operators (Row 2, Column 1) MUST start as not chosen. Each tap moves them
  through +, −, ×, ÷ in that order, returning to + after ÷.
- **FR-007**: Players MUST be able to submit the grid for checking.
- **FR-008**: The game MUST work out each line from its own digits and operator, rows left to
  right and columns top to bottom. A line fails if any step goes below zero or does not divide
  exactly.
  *Below-zero clause superseded on 2026-11-05 by [spec-002](../002-live-calculations/spec.md)
  FR-208: results below zero count, and targets may be negative. Inexact division still
  fails.*
- **FR-009**: A submitted grid MUST be accepted as a solution when every row and every column
  reaches its target. The game MUST NOT compare the grid with a stored answer.
- **FR-010**: Submitting with an empty cell or an unchosen open operator MUST NOT count as a
  check. It MUST tell the player what is missing.
- **FR-011**: A rejected grid MUST be reported as not solved yet. F0 does not say which line
  failed (that is F2).
- **FR-012**: Two solutions are distinct if any entered digit or chosen operator differs. The
  counter MUST increase by one for each distinct solution found, and MUST NOT increase when a
  solution already found is submitted again.
- **FR-013**: The counter MUST read "Found N of 2", where N is the number of distinct
  solutions found so far, starting at "Found 0 of 2".
- **FR-014**: After any submission the game MUST say whether the grid was a new solution, an
  already-found solution, not solved yet, or incomplete. When a new solution brings the count
  to the puzzle's total, the message MUST also say that every solution has been found. The
  grid stays editable. The message MUST stay until the
  player next taps a cell or an operator the player can change, and MUST then disappear
  without anything being announced. The counter is not affected.
- **FR-015**: After any submission the player's digits and operators MUST stay in place.
- **FR-016**: Once loaded, the game MUST work with no network connection and MUST make no
  network requests. Reopening or reloading the page needs a connection. The game MUST NOT
  keep a copy of itself on the phone for offline opening.
- **FR-017**: The pipeline MUST build, test and publish the game to a public web address on
  every merge to the main line, with no manual step. A failed build MUST leave the previous
  version in place.

### Key Entities

- **Puzzle**: the grid size, the given cells and their digits, each line's target, each
  line's operator (or that it is open), and the total number of solutions (2).
- **Line**: one row or column. It has a target and an operator, shown or open, and is worked
  in its reading direction.
- **Entry**: the player's current digits in empty cells and their chosen operators on open
  lines.
- **Found solution**: one accepted entry. Found solutions are kept for the current visit only,
  so the counter can tell new from repeated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player can find one solution within 3 minutes on a phone, with no
  instructions beyond the screen itself, in at least 4 of 5 hallway playtests.
- **SC-002**: All 21 acceptance criteria pass on current Safari for iPhone and current Chrome
  for Android, at a 375 × 667 phone-sized screen.
- **SC-003**: Every entry, tap or submission shows its result to the player within
  0.1 seconds.
- **SC-004**: The game is ready to play within 3 seconds of opening the public address on a
  mid-range phone over a 4G connection.
- **SC-005**: A merged change is live at the public address within 15 minutes, with no manual
  step.
- **SC-006**: The game meets WCAG 2.2 AA, with zero issues reported by the automated
  accessibility check. A player can find Solution A using only VoiceOver on Safari for iPhone,
  and using only TalkBack on Chrome for Android.

## Assumptions

- **Opening state**: open operators start blank ("not chosen"), not as +. This makes the
  player choose each one, since an operator is part of a solution.
- **Cycle order**: taps cycle + → − → × → ÷ → +. There is no way back to "not chosen" once an
  operator has been picked.
- **Cell cycle**: tapping a cell steps it empty → 1 → … → 9 → empty, the same way operators
  cycle. There is no number pad, and the phone's keyboard never opens, so the grid stays in
  view. There is no backward step: reaching a lower digit means tapping round through empty.
- **Checking on submit only**: lines are not checked as the player types. The brief warns that
  instant feedback could turn open lines into trial and error.
  *Superseded on 2026-11-05 by [spec-002](../002-live-calculations/spec.md): each line shows
  its working and is marked when it reaches its target. Check still decides what is a
  solution.*
- **Feedback detail**: a rejected grid is reported only as "not solved yet". Naming the failing
  line and step is F2.
- **No saving**: found solutions and the current entry are lost when the page is reloaded or
  closed. The solution log (F5) adds saving.
- **Offline opening comes from packaging**: the browser build is not made available offline
  before it loads. The store apps (F13) bundle the game inside the app, so they open offline
  without it, and a browser copy could keep serving an old version after a merge (AC-17).
- **Total is part of the puzzle**: the "of 2" comes from the puzzle's definition. Counting
  solutions by search is part of the seeded generator (F7).
- **Browsers**: current and previous major versions of Safari on iOS and Chrome on Android.
  Desktop browsers should work but are not tested.
- **Reference device for budgets**: a mid-range Android phone released in 2023, on a 4G
  connection.
- **Hosting**: the public address is on GitHub Pages, built and published by GitHub Actions
  (ADR 0001), under exception EXC-006 to Baseline principle 4.
- **Exceptions before implementation**: F0 relies on EXC-001 (no device telemetry), EXC-002
  (no availability alerting), EXC-005 (no shared design system) and EXC-006 (GitHub Pages and
  Actions), recorded in `docs/exceptions/`. EXC-003 and EXC-004 (store distribution and
  rollback) are recorded before store packaging (F13).

## Acceptance Criteria as Examples *(org baseline)*

All acceptance criteria above use the concrete puzzle and solutions in The Puzzle section, and
are numbered AC-1 to AC-21. These are the examples:

| Example | Top-right | Bottom-left | Bottom-right | Row 2 | Column 1 | Expected | Used in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Solution A | 2 | 2 | 3 | × | ÷ | Solved | AC-8, AC-13, AC-15 |
| Solution B | 2 | 3 | 3 | + | − | Solved | AC-12, AC-14, AC-15 |
| Below zero | 2 | 9 | 3 | − | − | Not solved (6 − 9) | AC-9 |
| Inexact division | 2 | 4 | 3 | + | ÷ | Not solved (6 ÷ 4) | AC-10 |
| Incomplete | 2 | 2 | empty | × | ÷ | Incomplete | AC-11 |

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: ready to play within 3 seconds of opening the address, and every
  interaction answered within 0.1 seconds, on the reference device (SC-003, SC-004).
- **Availability**: no target beyond the platform's static hosting default. Once loaded, the
  game needs no connection (FR-016). Availability alerting is covered by exception EXC-002,
  since there is no running service to monitor.
- **Security**: there are no accounts, personal data, inputs sent anywhere, or network calls
  after loading. The public address is served over HTTPS. A short threat model in the plan
  covers the hosting and the pipeline's publishing credentials.
- **Accessibility**: WCAG 2.2 AA (constitution IV, Overlay P2):
  - Touch-only play with touch targets of at least 44 × 44 CSS pixels.
  - Every cell, target, operator and the counter has an accessible name.
  - Results and counter changes are announced to screen readers.
  - Given cells and line results do not rely on colour alone.
  - Safe areas are respected.
  - The reduced-motion setting is honoured.
  - An automated accessibility check runs against the play journey on every build.
- **Capacity and scale**: the game is static and runs on the player's device. Up to 50
  playtesters are expected at F0, and any number is supported.

## Integration and Contract Impact *(mandatory — org baseline)*

None. F0 has no APIs, events, shared files or schemas. The game calls no services and nothing
calls it (constitution principle I).

## Out of Scope *(mandatory — org baseline)*

- Puzzle generation and seeds (F7). F0 plays one fixed puzzle.
- Presets and difficulty (F6).
- The solution log list, and saving progress or found solutions (F5).
- Scoring and hints (F8).
- Naming which line or step failed (F2).
- Any puzzle other than the worked example, any other grid size, and lines that mix
  operators (F9).
- Packaging for the iOS and Android stores (F13). F0 runs in the phone's browser only.
- Settings, menus, onboarding and sound.
