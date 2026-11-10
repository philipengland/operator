# Feature Specification: Daily Puzzles, Seeded Generator and Presets

**Feature Branch**: `007-seeded-generator`

**Created**: 2026-11-10

**Status**: Draft

**Input**: User description: "F7 seeded generator with F6 presets, from docs/brief/project-brief.md: the
same seed gives the same puzzle; every puzzle has at least one solution, whole-number targets and no
target of 0; solutions are counted by search, capped at 101, and fall inside the preset's band. Easy,
Medium, Hard and Collector set the levers in the preset table. The owner chose to build F6 and F7
together, so that players get new puzzles, and to make them daily: each day brings a new puzzle for
each of the four presets, the same for every player."

## Context

This feature builds on specs [001](../001-walking-skeleton/spec.md) to
[006](../006-solution-log/spec.md). Everything in them still holds unless this spec says otherwise.

**User need (Overlay P1).** Today there is one puzzle with two answers. Once a player has found both,
the game has nothing more to offer. Evidence: the brief's MVP needs a seeded generator and four
presets (F6, F7), and the game is built for puzzle fans who play daily. The owner decided that
puzzles are daily and shared: every player gets the same four puzzles on the same day.

**What is already done.** The engine checks any grid of rows and columns with shown and open
operators (spec-001, spec-002). A puzzle's colour theme is worked out from its seed (spec-003 AC-25).
Found solutions are kept per puzzle, under the puzzle's own identity, and the saved format already
allows for seeded puzzles (spec-006 FR-613, ADR 0004). The counter reads "Found N" when the total is
over 100 (spec-006 FR-616).

**Solution A** of the worked example is, as in spec-006, top-right 2, bottom-left 2, bottom-right 3,
Row 2 ×, Column 1 ÷.

**The presets** (brief, Difficulty system, with the owner's decisions on targets, bands and given
cells). Grid is rows × columns; every row and column has a target.

| Preset | Grid | Operators | Shown or open | Given cells | Targets | Solutions |
| --- | --- | --- | --- | --- | --- | --- |
| Easy | 3 × 3 | + − | All shown | 4 or 5 | 1 to 29 | 1 to 10 |
| Medium | 5 × 4 | + − × | 4 or 5 of 9 lines open | 10 | 1 to 100 | 2 to 20 |
| Hard | 7 × 5 | + − × ÷ | 1 or 2 of 12 lines open | 21 or 22 | −500 to 500, not 0 | 1 to 3 |
| Collector | 4 × 3 | + − × ÷ | All open | None | −29 to 29, not 0 | 21 or more |

### Release order (constitution VII)

Every merge to `main` deploys, so each step is fit for players and goes live on its own.

| Release | What players get | Flag |
| --- | --- | --- |
| 1. User Story 1: today's Easy puzzle | A new Easy puzzle every day, after the worked example | `daily` |
| 2. User Story 2: Medium and Collector | A choice of today's presets, and very large totals in Collector | `presets` |
| 3. User Story 3: Hard | The largest grid and division | `hard` |
| 4. User Story 4: a new day | Coming back the same day keeps the puzzle; the next day brings new ones | `newDay` |

**Why Hard comes on its own.** Its 7 × 5 grid is the hardest to fit on a small phone, and its
division lines make counting slowest. Keeping it separate lets Easy, Medium and Collector go live
first.

### Changes to earlier specs and the brief

| Earlier item | Change |
| --- | --- |
| Brief F11 "Daily puzzle and share" (Phase 3) | **Daily puzzles brought forward** into the MVP by the owner. Sharing by seed stays in Phase 3. |
| Brief, Puzzle generation, step 3 (results of 0 or more) | **Changed**: Hard and Collector may have negative targets (owner, 2026-11-10). |
| Brief, Presets: Medium "about a quarter" given, Hard "about 10%" | **Changed**: Medium gives 10 of 20 cells and Hard 21 or 22 of 35, as the brief's givens leave far too many answers to reach the bands (owner, 2026-11-10; research R3). |
| spec-002 FR-201 (each line's working is shown beside it) | **Changed for grids wider than 3 columns**: one strip shows the working of the selected cell's row and column (FR-718). Screen readers still hear every line's working. |
| spec-001 Out of Scope "generated puzzles (F7) and presets (F6)" | **Delivered here.** |
| spec-001 "plays one fixed 2 × 2 puzzle" | **Changed**: the worked example is the first puzzle on a new phone, and the daily puzzles follow it (FR-701). |
| spec-003 AC-25 (the fixed puzzle is shown in Classic) | **Still holds.** A daily puzzle is shown in its seed's theme (FR-712). |
| spec-004 the operator header (mascot and speech bubble) | **Changed for grids bigger than 3 × 3**: a compact bar, with the operator's line in the workings strip (FR-719). The worked example and Easy are unchanged. |
| spec-004 (the play screen fits 375 × 667 and 320 × 568 without scrolling) | **Extended** to every preset's grid, except Hard at 320 × 568, which may scroll up and down (FR-713). |
| spec-006 FR-616 ("Found N" over 100) | **Now reachable**, in Collector. "All found!" is never shown for a capped total (FR-710). |
| spec-006 the solution log, per puzzle | **Still holds** for each daily puzzle (FR-714). |

## Clarifications

### Session 2026-11-10

- Q: How should a player move between today's four puzzles? → A: A "Today" screen lists the four
  puzzles with each one's count. It opens from a button on the play screen and has a way back, like
  the solutions list (FR-701).
- Q: When does "today" change? → A: At midnight on the player's own phone: the phone's calendar date
  decides the day, so players on the same date get the same puzzles, not at the same moment (FR-716).
- Q: Must Hard's 7 × 5 puzzle fit without scrolling on the smallest supported phone, 320 × 568? →
  A: First answered yes; changed on the same day once the plan measured it: Hard needs about 640
  pixels of height there with 44 × 44 pixel targets. Hard may scroll up and down, never sideways, at
  320 × 568 only; every other preset and size fits without scrolling (FR-713).
- Q: Once a player has moved on, should the worked example stay available? → A: Yes: the Today screen
  always lists it below the four daily puzzles as "Practice", with its own count. It does not change
  by day, and its solutions are kept until the player starts it again (FR-701, FR-714).
- Q: The brief's given cells leave Medium and Hard with far more answers than their bands (no Hard
  puzzle found at 3 or 4 of 35 given). What changes? → A: More given cells: Medium 10 of 20, Hard 21
  or 22 of 35; the bands stay (FR-705; research R3).
- Q: Every line's working beside its line does not fit Medium or Hard's width. What do large grids
  show? → A: On grids wider than 3 columns, one strip under the grid shows the working of the
  selected cell's row and column. Pills still show when a line reaches its target, and screen
  readers still hear every line's working (FR-718).
- Q: Measured on the real screen, today's header (mascot and speech bubble) and counter leave room only
  for Easy at 320 × 568, and Medium and Hard do not fit at 375 × 667. How are grids bigger than 3 × 3
  laid out? → A: A compact screen: the mascot and speech bubble become one bar holding the counter
  and the Today button; the operator's line shows in the workings strip after each Check, and is still
  announced. The worked example and Easy keep the full header (FR-719; research R9).
- Q: Easy's column pills overlap on a phone (each wider than its column). How should they fit? → A: Stacked: the
  operator above the target, in smaller text (owner, 2026-11-10, from three mock-ups). Every column pill in a grid of 3
  or more columns is stacked, so a row of pills is consistent; the worked example keeps one-line pills (FR-713).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Today's Easy puzzle (Priority: P1)

A player who has played the worked example moves on to today's Easy puzzle: a 3 × 3 puzzle that every
player gets today, which they play exactly as before.

**Why this priority**: it is the smallest step that gives players a puzzle they have not seen, and a
reason to come back tomorrow. It proves the generator, the counting and the daily seed together.

**Independent Test**: set the phone's date, open today's Easy puzzle, check its shape against the
Easy preset, and solve it with the filling it was built from.

**Acceptance Scenarios**:

1. **AC-1** — **Given** the phone's date is 10 November 2026 and the worked example is open, **When**
   the player opens today's Easy puzzle, **Then** a 3 × 3 puzzle appears with every operator shown,
   only + and − in use, 4 or 5 of its 9 cells given, every target from 1 to 29, and the counter at
   "Found 0 of M", with M from 1 to 10.
2. **AC-2** — **Given** the date 10 November 2026 and Easy, **When** the puzzle is made on an iPhone,
   on an Android phone and by the engine alone, **Then** the given cells, targets, operators and
   count are the same every time.
3. **AC-3** — **Given** every date in 2027 with Easy, **When** each puzzle is made, **Then** it
   matches the Easy preset, it has at least one solution, every target is a whole number and not 0,
   and the filling it was built from solves it.
4. **AC-4** — **Given** the Easy puzzle for 10 November 2026, **When** the player enters the filling
   it was built from and checks, **Then** it is accepted as a new solution and the counter reads
   "Found 1 of M".
5. **AC-5** — **Given** every date in 2027 with Easy, **When** each puzzle's count is worked out,
   **Then** it equals the number of solutions found by trying every filling and every open operator.
6. **AC-6** — **Given** the Easy puzzle for 10 November 2026, **When** it is shown, **Then** it uses
   the colour theme worked out from that puzzle's seed (spec-003).
7. **AC-7** — **Given** the dates 10 and 11 November 2026, **When** each day's Easy puzzle is made,
   **Then** the two puzzles differ.
8. **AC-22** — **Given** the player found Solution A of the worked example and is now on today's Easy
   puzzle, **When** they open the Today screen and tap "Practice", **Then** the worked example opens
   at "Found 1 of 2", with Solution A in its list.

---

### User Story 2 - Medium and Collector (Priority: P1)

A player chooses which of today's puzzles to play: Medium for a bigger grid with some open operators,
or Collector for a small grid where every operator is open and there are many answers to collect.

**Why this priority**: the presets are what make the game last. Collector is the game's signature
mode, built around collecting solutions.

**Independent Test**: set the phone's date, open today's Medium and Collector puzzles, and check each
against its preset.

**Acceptance Scenarios**:

8. **AC-8** — **Given** the date 10 November 2026, **When** the player opens today's Medium puzzle,
   **Then** a 5 × 4 puzzle appears using only +, − and ×, with 4 or 5 of its 9 lines open, 10 of its
   20 cells given, every target from 1 to 100, and M from 2 to 20.
9. **AC-9** — **Given** the date 10 November 2026, **When** the player opens today's Collector
   puzzle, **Then** a 4 × 3 puzzle appears with all 7 lines open, no cells given, every target from
   −29 to 29 and not 0, and M of 21 or more.
10. **AC-10** — **Given** a Collector puzzle whose count is capped at 101, **When** the player has
    found 3 solutions, **Then** the counter reads "Found 3", and however many are found it never
    reads "All found!".
11. **AC-11** — **Given** every date in 2027 with Medium, and with Collector, **When** each puzzle is
    made, **Then** it matches its preset and AC-3 holds for it.
12. **AC-12** — **Given** a Medium puzzle and a Collector puzzle, **When** each is shown on a phone at
    375 × 667 and at 320 × 568, **Then** the whole puzzle, the keypad and the main button fit without
    scrolling, and every cell, pill and key is at least 44 × 44 pixels.
13. **AC-13** — **Given** the player has found 1 solution of today's Easy puzzle, **When** they open
    today's Medium puzzle and then go back to Easy, **Then** Easy shows "Found 1 of M" and its
    solution is in its list, with an empty grid.

---

### User Story 3 - Hard (Priority: P2)

A player chooses today's Hard puzzle: the largest grid, all four operators and few open lines, with
few answers.

**Why this priority**: it completes the presets, but it carries the most risk, in the screen and in
the counting.

**Independent Test**: set the phone's date, open today's Hard puzzle, check it against the preset,
and time it on the reference phone.

**Acceptance Scenarios**:

14. **AC-14** — **Given** the date 10 November 2026, **When** the player opens today's Hard puzzle,
    **Then** a 7 × 5 puzzle appears using +, −, × and ÷, with 1 or 2 of its 12 lines open, 21 or 22
    of its 35 cells given, every target from −500 to 500 and not 0, and M from 1 to 3.
15. **AC-15** — **Given** every date in 2027 with Hard, **When** each puzzle is made, **Then** it
    matches its preset and AC-3 holds for it.
16. **AC-16** — **Given** a Hard puzzle, **When** it is shown on a phone at 375 × 667, **Then**
    AC-12 holds for it; and at 320 × 568, everything can be reached by scrolling up and down, nothing
    needs scrolling sideways, and every cell, pill and key is at least 44 × 44 pixels.
17. **AC-17** — **Given** the reference phone, **When** the player opens today's Hard puzzle,
    **Then** it is ready to play within 1 second.

---

### User Story 4 - A new day (Priority: P2)

A player who comes back the same day finds the puzzle they were playing, with what they had found. A
player who comes back the next day finds four new puzzles.

**Why this priority**: it is what makes the puzzles daily for a returning player, and it stops past
days' saved solutions piling up on the phone.

**Independent Test**: on 10 November 2026, find one Medium solution and reload; then move the
phone's date to 11 November 2026 and reopen.

**Acceptance Scenarios**:

18. **AC-18** — **Given** the date 10 November 2026 and the player has found 1 solution of the
    Medium puzzle, **When** they reload the page, or close it and come back the same day, **Then**
    the Medium puzzle opens at "Found 1 of M", with an empty grid.
19. **AC-19** — **Given** the player found 1 solution of the Medium puzzle on 10 November 2026,
    **When** they come back on 11 November 2026, **Then** the Medium puzzle for 11 November opens at
    "Found 0 of M", and the solutions found on 10 November are no longer kept on the phone.
20. **AC-20** — **Given** a phone that has never played, **When** the game opens, **Then** the
    worked example opens at "Found 0 of 2".
21. **AC-21** — **Given** the record of the last puzzle played cannot be read, **When** the game
    opens on 10 November 2026, **Then** that day's Easy puzzle opens and no error is shown.

---

### Edge Cases

- **Counting takes too long**: a candidate puzzle whose count would take more than the counting budget
  is dropped and the next candidate for that day tried, so the day's puzzle is still the same on every
  phone (FR-706).
- **The preset cannot be met**: if a filling cannot give the preset's operators or targets, the next
  candidate for that day is tried (FR-704).
- **Midnight while playing**: a puzzle that is open at midnight stays open; the new day's puzzles
  appear the next time the player opens a puzzle or the game.
- **The phone's date is wrong**: the player gets the puzzles for the date their phone shows.
- **Players in other time zones**: each gets the puzzles for their own calendar date, so two players
  on the same date see the same puzzles, even if not at the same moment.
- **Hard on the smallest phone**: at 320 × 568, Hard needs about 640 pixels of height with 44 × 44
  pixel targets, so its screen scrolls up and down there (FR-713). At 375 × 667 it must fit, which is
  the tightest layout in the feature and is proved first (AC-16).
- **No cell selected on a large grid**: the workings strip says which line it would show, and fills
  in when a cell is tapped (FR-718).
- **Large × targets**: a × line on Hard is limited by the 500 cap, so long × lines may be rare.
- **Negative targets**: only on − lines in Hard and Collector, as the other operators cannot go below
  zero with digits 1–9.
- **The worked example after the daily puzzles**: it stays on the Today screen as "Practice", with
  whatever the player has found in it, on every day.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-701**: Each calendar day MUST have one puzzle for each preset: Easy, Medium, Hard and Collector.
  A new phone MUST open on the worked example, with a way on to today's puzzles. After that, the game
  MUST open on today's puzzle for the preset last played. A button on the play screen MUST open a
  "Today" screen listing today's four puzzles by preset, each with its count ("Found N of M", or
  "Found N" over 100), and below them the worked example as "Practice", with its own count; tapping
  one opens it. The Today screen MUST have a way back to the puzzle it
  was opened from, and the phone's back gesture MUST work as it does for the solutions list
  (spec-006).
- **FR-702**: A day's puzzle MUST be made from the date and the preset alone, so every player on the
  same date gets the same four puzzles, on every phone. Once released, a date's puzzles MUST NOT
  change in a later version, unless a change is made deliberately and called out (constitution III).
- **FR-703**: The generator MUST build each puzzle from a full filling of digits 1–9, which then
  solves it, so every puzzle has at least one solution and every target is a whole number.
- **FR-704**: Each line's operator MUST come from the preset's operators, every target MUST be within
  the preset's range, and no target may be 0. Targets MAY be negative only in Hard and Collector. If a
  candidate cannot meet the preset, the generator MUST try the next candidate for that day.
- **FR-705**: Each preset MUST set the grid size, the operators, which lines are open, how many cells
  are given, the range of targets and the band of solutions, as the table under Context says.
- **FR-706**: The generator MUST count each puzzle's solutions by search, stopping at 101, counting
  every open operator that reaches a line's target. The search MUST stop after a fixed amount of
  work, not of time, and a candidate that reaches it is dropped.
- **FR-707**: A puzzle MUST be kept only if its count is within its preset's band: Easy 1 to 10,
  Medium 2 to 20, Hard 1 to 3, Collector 21 or more (a count of 101 meaning more than 100).
- **FR-708**: Switching between today's puzzles MUST keep each one's found solutions; each puzzle
  opens with an empty grid.
- **FR-709**: A puzzle MUST open with an empty grid, no selected cell, the operator's greeting and the
  counter at "Found N of M", or "Found N" when M is over 100, where N is what the player has found
  of it today.
- **FR-710**: "All found!" MUST be shown only when the count is 100 or less and every solution is
  found. A count of 101 means "more than 100" and is never complete.
- **FR-711**: The game MUST never show or announce the filling a puzzle was built from, or its other
  solutions, before the player finds them.
- **FR-712**: A daily puzzle MUST be shown in the colour theme worked out from its seed (spec-003).
  The worked example stays in Classic.
- **FR-713**: Every preset's puzzle MUST fit a phone at 375 × 667 and 320 × 568 without scrolling, as
  spec-004 requires of the worked example, except Hard at 320 × 568, which MAY scroll up and down but
  never sideways. Every cell, pill and key MUST be at least 44 × 44 pixels (spec-003). The rest of the
  screen may be arranged more compactly for a large grid to make room. On a grid of 3 or more columns,
  each column's pill MUST show its operator above its target, in smaller text, so neighbouring pills
  never touch; the worked example's pills stay on one line.
- **FR-714**: Found solutions MUST be kept per puzzle, as spec-006 does. When a new day's puzzles
  are first opened, the earlier days' found solutions MUST be removed from the phone, as they cannot
  be reached again. The worked example's are kept, as it can always be played as "Practice".
- **FR-715**: The game MUST remember the preset last played. What it remembers is treated as
  untrusted when read: anything unreadable opens today's Easy puzzle (AC-21).
- **FR-716**: The day MUST be the phone's own calendar date, changing at its local midnight. Making a
  puzzle MUST need no network and no other service (constitution I).
- **FR-717**: Screen readers MUST hear the new controls and each preset by name, and the puzzle's
  preset and shape (for example "Easy, 3 by 3") when it opens.
- **FR-718**: On a grid wider than 3 columns, the workings MUST be shown in one strip under the grid,
  for the selected cell's row and column, in spec-002's form ("6 + 2 = 8 ✓"). Each pill MUST still
  show when its line reaches its target, and screen readers MUST still be able to hear every line's
  working. Grids of 3 columns or fewer keep each working beside its line.
- **FR-719**: On a grid bigger than 3 × 3 (Medium, Hard, Collector), the mascot, speech bubble and
  counter MUST be replaced by one bar holding the counter and the Today button. The operator's line
  after a Check MUST show in the workings strip until the player taps a cell, and MUST be announced as
  spec-004 requires. Collector, at 3 columns, gains the strip for this line only, keeping each working
  beside its line. The worked example and Easy keep the full header.

### Key Entities

- **Day**: a calendar date on the player's phone.
- **Preset**: Easy, Medium, Hard or Collector: grid size, operators, open lines, given cells, range of
  targets and band of solutions.
- **Daily puzzle**: the given cells, each line's target and operator (shown or open), and its capped
  count, made from a day and a preset. Its identity includes both.
- **Last played**: the preset the player last played, kept on the phone.

## Acceptance Criteria as Examples *(org baseline)*

AC-1 to AC-22 above use concrete examples: the dates 10 and 11 November 2026, every date in 2027,
and the phone sizes 375 × 667 and 320 × 568.

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: each of today's puzzles is ready within 1 second on the reference device
  (constitution, Platform Constraints). Input still responds within 0.1 seconds (spec-001 SC-003).
  The game stays within its 30 KB budget for code and styles.
- **Availability**: none beyond platform defaults: puzzles are made on the phone and need no service.
- **Security**: no accounts or personal data. Saved records are treated as untrusted when read
  (FR-715).
- **Accessibility**: WCAG 2.2 AA on every preset's grid. New controls pass the accessibility scan and
  are usable by touch and screen reader.
- **Capacity and scale**: four puzzles a day, and one day's found solutions on the phone at a time
  (FR-714).

## Integration and Contract Impact *(mandatory — org baseline)*

| Contract (API, event, file, schema) | New / Changed / Removed | Breaking? | Consumers affected |
|---|---|---|---|
| `docs/contracts/engine-api.md` | Changed: making a puzzle from a date and a preset, and counting | No | Game, drivers |
| `docs/contracts/play-screen.md` | Changed: choosing a preset, and larger grids | No, if existing names are kept | UI driver, screen readers |
| `docs/contracts/component-library.md` | Changed, if choosing a preset needs new components | No | Game, catalogue |
| `docs/contracts/saved-solutions.md` | Changed: the preset last played is also kept, and past days are removed | No: a new record beside the existing ones | Later versions of the game |
| Date and preset to puzzle | New: fixed for good once released (constitution III) | Changing it later is breaking | Every player; sharing by seed later (F11) |

There is no external integration.

## Data Impact *(mandatory if the feature stores, moves or exposes data)*

- **Data items**: the preset last played, and the found solutions of today's puzzles (spec-006), on
  the phone. Created when a puzzle is played; read on opening; earlier days' removed on a new day.
- **Classification**: game progress. Not personal data.
- **System of record**: the player's phone. There is no copy elsewhere.
- **Retention and deletion**: found solutions are kept until the next day's puzzles are opened, the
  player starts again, or the site's data is cleared; in the store apps (F13), also on uninstall.
- **Lawful basis / DPIA**: not required: no personal data, and the data is strictly necessary for a
  feature the player uses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-701**: Each of today's four puzzles is ready to play within 1 second on the reference device,
  for every date tested.
- **SC-702**: A fixed set of dates gives the same puzzles in every release after this one.
- **SC-703**: A player can open today's Easy puzzle and find one solution within 3 minutes, with no
  instructions, in at least 4 of 5 hallway playtests.
- **SC-704**: In at least 4 of 5 hallway playtests, players describe Collector as having "lots of
  answers" and Hard as harder than Easy.
- **SC-705**: Every acceptance criterion in specs 001 to 006 still passes.
- **SC-706**: The owner signs off each story on a real phone before its flag is turned on.

## Assumptions

- **The worked example stays first**: it is the first puzzle on a new phone, so the existing
  acceptance tests, which play it, still hold.
- **The phone's own date**: there is no server to say what day it is. A player who changes their
  phone's date gets that date's puzzles; that is accepted.
- **No archive**: past days' puzzles cannot be played again.
- **Preset names**: "Easy", "Medium", "Hard" and "Collector", as the brief has them. The owner can
  change the wording at the phone review.
- **No scoring or streaks**: the difficulty score, the score per solution and a run of days played
  wait for later.
- **Reference device and browsers**: as spec-001.

## Out of Scope *(mandatory — org baseline)*

- Seeing, typing or sharing a seed or a day's puzzle (F11).
- Playing a past day's puzzles, or a puzzle beyond the four for today.
- Custom difficulty and the difficulty score (F10).
- Hints (F8), lines with mixed operators (F9), scoring, streaks and rarity (F12).
- Store packaging (F13).
