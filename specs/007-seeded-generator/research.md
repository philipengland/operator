# Research: Daily Puzzles, Seeded Generator and Presets

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-10

Each decision below follows the format: decision, rationale, alternatives considered.

## R1. The random numbers

**Decision**: a small seeded generator written in the engine, `mulberry32`: 32 bits of state, advanced
with `Math.imul` and unsigned shifts. A whole number from 0 to n − 1 is `Math.floor(next() × n)`, where
`next()` is a 32-bit value divided by 2³². No package.

**Rationale**: constitution III needs the same numbers on every phone and in every later version. Integer
multiplication and shifts give identical results in every JavaScript engine, and a 32-bit value divided by
2³² and multiplied by a small n is exact in floating point, so nothing depends on rounding. It is a few lines,
so it adds nothing measurable to the 30 KB budget, and it can never change under us through a dependency
update. Its period, 2³², is far more than a puzzle needs.

**Alternatives**: `xoshiro128**` or `sfc32` (more state and code, no benefit at this scale); a package such as
`seedrandom` (a new dependency whose output we would not control for good); `Math.random` (banned by
constitution III).

## R2. From a date and a preset to a puzzle (FR-702, FR-716)

**Decision**: the app works out the phone's local date as text, `2026-11-10`, and passes it to the engine
with the preset. The engine forms the seed text `v1:2026-11-10:easy`, hashes it with 32-bit FNV-1a (as
`themeForSeed` already does) to start the generator, and draws candidates from that one stream until one
qualifies (R3). The puzzle's identity is `daily-v1-2026-11-10-easy`, so its saved solutions have their own
record (spec-006). Its theme comes from the seed text.

**Rationale**: the engine stays free of the clock (constitution II): the date arrives as data. Text dates
cannot drift with time zones once formed, and are readable in saved records and test names. `v1` is the
generator's version: a deliberate change to how puzzles are made (constitution III) becomes `v2`, so its
puzzles and saved records never mix with `v1`'s. Days released under `v1` keep `v1` (R13).

**Alternatives**: a number of days since a start date (harder to read and test); UTC dates (rejected by the
owner); the seed text without a version (a later change would silently mix old saved solutions with new
puzzles).

## R3. Making a puzzle (FR-703 to FR-707), and the given cells

**Decision**: the brief's method, in this order, each draw from the one stream:

1. Fill the grid with digits 1–9.
2. For each row, then each column, list the preset's operators whose result on that line's digits is whole
   at every step (spec-002), non-zero, within the preset's range, and not negative unless the preset allows
   it; pick one. If a line has none, this candidate fails.
3. Choose which lines are open (Medium 4 or 5 of 9, Hard 1 or 2 of 12, Collector all, Easy none).
4. Choose which cells are given (Easy 4 or 5, Medium 10, Hard 21 or 22, Collector none).
5. Count the solutions (R4). Keep the candidate if the count is within the band; otherwise draw the next.

A puzzle with no qualifying candidate within 2,000 is an error, which the golden sweep (R12) proves never
happens for the dates tested.

**Measured** (spike, 2026-11-10, a throwaway prototype of this method on a desktop PC):

| Preset | Given cells | Puzzles found | Candidates with over 100 answers | Average / worst time per puzzle |
| --- | --- | --- | --- | --- |
| Easy | 4 or 5 (brief) | 50 of 50 | 0 | 0.5 ms / 8 ms |
| Collector | none (brief) | 50 of 50 | 48 of 51 | 7 ms / 27 ms |
| Medium | 5 (brief) | 3 of 5 | 488 of 569 | 3 s / 5.5 s |
| Medium | 10 | 20 of 20 | 2 of 33 | 8 ms / 41 ms |
| Hard | 3 or 4 (brief) | 0 of 3 | every candidate counted | over 13 s |
| Hard | 18 | 5 of 10 | 247 of 1,391 | 9 s / 13 s |
| Hard | 22 | 10 of 10 | 3 of 72 | 244 ms / 454 ms |

With the brief's given cells, Medium and Hard have too few constraints for their many empty cells, so almost
every candidate has more than 100 answers and the bands are rarely or never met. The owner chose more given
cells (2026-11-10): Medium 10 of 20 and Hard 21 or 22 of 35, keeping the bands.

**Alternatives**: wider bands (Medium and Hard would become like Collector); a smaller Hard grid. Both
offered to the owner and not chosen.

## R4. Counting the solutions (FR-706)

**Decision**: a depth-first search over the empty cells in reading order. After each digit it checks every
line through that cell: a complete line must reach its target with its shown operator, or with at least one
operator if open; an unfinished line must still be able to reach it. That test is exact bounds per operator,
from the value so far v and the k cells to come: + needs v + k ≤ target ≤ v + 9k; − needs v − 9k ≤ target ≤
v − k; × needs the target to be a non-zero multiple of v with target ÷ v ≤ 9ᵏ; ÷ needs v to be a multiple of
the target with v ÷ target from 1 to 9ᵏ. A complete open line multiplies the count by the number of operators
that reach its target. The search stops at 101, or after a fixed number of search steps: the preset's
**work budget**. A candidate that reaches its budget is dropped, so every phone makes the same choice.

The budgets are fixed when each preset is released, as part of `v1`: Easy, Medium and Collector at User
Story 1 and 2; Hard at User Story 3. The spike suggests 200,000 steps; the first task of each story measures
the sweep (R12) and records the number.

**Rationale**: constitution III forbids time limits, as a slow phone would then skip a candidate a fast one
kept. The bounds prune a line as soon as it can no longer reach its target, which is what made the spike's
counts fast. The same search answers AC-5, compared with trying every filling.

**Alternatives**: a constraint solver library (a dependency, and its order of work could change); counting
only to 2 (cannot tell the bands apart); time-boxing (banned).

## R5. Being ready within 1 second (SC-701)

**Decision**: make each of today's puzzles once, when first needed, and keep it in memory for the session.
Start making today's four just after the game opens, one at a time while the player is idle, so the Today
screen rarely waits. Measure on the reference phone (Chromium, 4× slower CPU, as the speed budgets already
do). If Hard still takes over 1 second there after the search work in R4, move making puzzles into a Web
Worker so the screen never freezes, and record that here.

**Rationale**: on the reference phone, at 4× slower, the spike's Hard figures would be about 1 second on
average and 1.8 seconds at worst, so Hard is the risk. Easy (8 ms worst), Medium (41 ms) and Collector
(27 ms) are well within budget. A worker is more code and another file within the 30 KB budget, so it waits
for evidence.

**Alternatives**: making puzzles at build time into a data file (limits the game to the days built, and the
data would outgrow 30 KB); saving made puzzles on the phone (a stored copy that a later version must keep
reading, for little gain once they are made in memory).

## R6. Today's date in the game and in tests

**Decision**: `src/app/today.ts` turns the phone's clock into the local date text (R2), reading the clock
once when the game opens, again when the page becomes visible, and when the Today screen opens. A puzzle
already open stays open at midnight (spec Edge Cases). The UI driver sets the phone's date with Playwright's
clock (`page.clock.setFixedTime`) before opening the game; the engine driver passes the date directly.

**Rationale**: the clock is read only at the app's edge, which keeps the engine pure and makes the date one
input to tests, like the saved data in spec-006.

**Alternatives**: polling for midnight (wakes the phone for nothing); reading the clock inside the engine
(banned).

## R7. The Today screen (FR-701)

**Decision**: a new library screen, **Today**, in the solution list's pattern: an Operator header with a
way back, one row per preset with its count ("Found 1 of 4", "Found 3"), then "Practice" with the worked
example's count. A row is a real button. A **Today** button joins the play screen: beside the counter on
the full header, and in the compact bar on large grids (R9). History works as for the list (spec-006 research R7): opening Today pushes an entry,
and the back gesture returns to the puzzle.

**Rationale**: reuses the parts and behaviour players already know from the list, as the owner chose.

**Alternatives**: tabs on the play screen and swiping (not chosen by the owner).

## R8. The workings strip on large grids (FR-718)

**Decision**: when a grid has more than 3 columns, the puzzle grid leaves out the workings column and row
and shows a **Workings strip** under the grid: the selected cell's row working, then its column working, in
spec-002's form. With no cell selected it says "Tap a cell to see its row and column." Every line keeps its
working in the page with its existing accessible name, visually hidden, so screen readers and the UI driver
read it exactly as today; the strip itself is hidden from screen readers to avoid hearing it twice.

**Rationale**: keeps the names in `play-screen.md` unchanged, so existing scenarios and drivers keep working,
and is the owner's choice. Grids of 3 columns or fewer (the worked example, Easy, Collector) keep each working beside its line; Collector, being bigger than 3 × 3, uses the strip only for the operator's line (FR-719, R9).

**Alternatives**: smaller text, sideways scrolling (not chosen); putting the working into each pill's name
(changes the contract's names).

## R9. Fitting the screen (FR-713, FR-719)

**Measured** (2026-11-10, the catalogue's play screen in Chromium): at 320 × 568, everything except the grid
takes 331 pixels: operator header 76, counter about 52, keypad 92, main button 44, screen padding 16, and the
gaps and the grid's own padding and helper line. That leaves 237 pixels: 5 rows of 44. At 375 × 667 the
header is 78, the keypad 96 and the main button 52, with 8-pixel gaps.

| Grid | Rows of 44 needed (pills, cells, workings) | With today's header | Compact (owner, 2026-11-10) |
| --- | --- | --- | --- |
| Worked example, Easy (3 × 3) | 5 | fits both sizes, Easy exactly | unchanged |
| Collector (4 × 3) | 6 | 47 short at 320 × 568 | fits both |
| Medium (5 × 4, strip) | 6, and the strip | short at both | fits both, about 8 to spare at 568 |
| Hard (7 × 5, strip) | 8, and the strip | far short at both | fits 375 × 667 with about 11 to spare; scrolls at 320 × 568 |

**Decision**: grids bigger than 3 × 3 use a **compact screen** (FR-719): one 44-pixel bar with the counter
and the Today button in place of the mascot, speech bubble and counter; no helper line; the main button at
44; and the small phone's spacing (4-pixel gaps, 8-pixel padding) at every size. The operator's line shows in
the strip after a Check. Cells stay at least 44 pixels. Width at 320 (304 available): Hard needs 5 cells of
44, 5 gaps of 4 and a pill column of up to 64, so the pill column must hold "× −500" in 64 pixels, as
today's column pills do at 320.

**Proved first**: the first pull request, the library additions, builds the compact Medium and Hard screens in the catalogue at
375 × 667 and 320 × 568, before any game wiring. If Hard cannot fit 375 × 667 without going below 44
pixels, the work stops and the owner is asked.

## R10. What is kept on the phone (FR-714, FR-715)

**Decision**: one new record, `operator.today`, written as `{ "format": 1, "date": "2026-11-10",
"preset": "medium" }`, beside spec-006's solution records. On opening, if its date is not today, the four
solution records for that date (their identities are known from the date) are removed and the record is
rewritten. The worked example's record is never removed. The record is read as untrusted, as in spec-006
research R3: anything unreadable means "no record", which opens today's Easy (AC-21) on a phone that has
played, and the worked example on one that has not (AC-20).

**Rationale**: no need to list every key in storage; the store keeps its two methods (ADR 0004). A
`format` field follows ADR 0004, so a later version can change the record safely.

**Alternatives**: listing keys by prefix (a third store method); keeping past days (unreachable, and grows
for ever).

## R11. Flags and scenarios

**Decision**: one flag per story, `daily`, `presets`, `hard` and `newDay`, each with its own scenario file
so the rule in `playwright.config.ts` applies unchanged. Off means:

| Flag | Off |
| --- | --- |
| `daily` | No Today button; the worked example is the only puzzle |
| `presets` | The Today screen lists Easy and Practice only |
| `hard` | The Today screen does not list Hard |
| `newDay` | The game opens on the worked example; past days' records are not removed |

## R12. Sweeping every date of 2027 (AC-3, AC-5, AC-11, AC-15)

**Decision**: unit tests in the engine, one file per preset so Vitest runs them in parallel, each making
the puzzle for all 365 dates and checking it against its preset. If the Hard sweep takes over 60 seconds in
`verify`, it moves to an acceptance scenario on the engine driver, and the owner is told.

**Rationale**: these are rules on pure engine output, so they belong with the engine's tests. At the
spike's speeds the four sweeps take about 0.2, 3, 2.5 and 90 seconds; the search work in R4 must bring Hard
down.

## R13. Puzzles fixed for good (FR-702, SC-702)

**Decision**: golden tests pin the puzzle for the first of each month of 2027, per preset, as released.
Changing one is a breaking change: it needs a new generator version (R2), never an edit to the pinned
values, and the pull request says so. The pins are added when each preset is released, so Hard's are fixed
only at User Story 3.

## R14. The engine's new surface

**Decision**: `dailyPuzzle(date, preset)` returns `{ puzzle, builtFrom }`. `puzzle` gains optional `seed`
and `preset`. `builtFrom` is the filling the puzzle was made from, for tests; the app never shows it
(FR-711). `countSolutions(puzzle, budget)` and `PRESETS` are exported for the tests and the sweep. Nothing
in the engine reads the clock or the phone.

## R15. The brief

**Decision**: the plan's first pull request updates `docs/brief/project-brief.md`: daily puzzles move from
F11 into the MVP (sharing stays Phase 3), negative targets in Hard and Collector, and the presets' new given
cells and bands, each marked as the owner's decision of 2026-11-10.
