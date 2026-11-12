# TDD Log — Daily Puzzles, Seeded Generator and Presets (spec-007)

- **Spec**: `specs/007-seeded-generator/spec.md`
- **Baseline**: 2026-11-10, on `main` (`e906acf`): 369 unit, 48 engine and 329 phone tests, all passing. Lint and types clean;
  9.4 KB of JavaScript and 2.3 KB of CSS gzipped.

## Part 1: library additions (T004 to T015)

Scenarios that this part makes pass: `[spec-003 AC-1]` with the new lists. The approved vocabulary, driver interfaces, catalogue
lists and design documents came over unchanged from `509e556` (the same blobs as the approval, `514187c`), confirmed by blob.

**Acceptance RED** (`npm run test:acceptance:ui -- --project=catalogue-android -g "spec-003 AC-1]"`): the combined tier lacked
`"Status bar"` and `"Workings strip"` (`- Expected - 2`), the expected failure.

Each new piece was a failing unit test on its assertion, then the smallest code:

| Behaviour | RED | Commit |
| --- | --- | --- |
| Puzzle grid: workings shown elsewhere have no place in the grid, still heard | `expected [ { row: 2, column: 6 }, …(1) ] to deeply equal [ null, null ]` | `49bfe47` |
| Workings strip: a cell's row then column working | `expected { workings: [], text: '' } to deeply equal { …(2) }` | `41a2b3f` |
| Workings strip: a line of text in their place | `expected { workings: [], text: '' } to deeply equal { workings: [], …(1) }` | `41a2b3f` |
| Status bar: a region with a Today button heard as "Today's puzzles" | `expected { name: '', todayButton: { …(2) } } to deeply equal { name: 'Status bar', …(1) }` | `05d3f0d` |
| Today list: each choice a button, after a way back | `expected { …(2) } to deeply equal { back: { label: 'Back', …(1) }, …(1) }` | `c4c323e` |
| Play screen: the compact screen shows the Status bar and the strip | `expected { header: true, …(3) } to deeply equal { header: false, …(3) }` | `be4b845` |
| Play screen: the full screen with a Today button puts it beside the counter | `expected { header: true, …(3) } to deeply equal { header: true, …(3) }` | `be4b845` |

**Not a valid red, kept as a guard**: "on the full screen with no Today button, keeps the header and the counter alone, as before"
passed at once, from the second play-screen cycle; it pins the worked example's screen as it is.

**Found along the way, and corrected:**

- **The Today list's first test broke label-in-name** (WCAG 2.5.3): a row shown as "Easy · 1 of 4" but named "Easy, found 1 of 4".
  Corrected at RED, before any code: each row shows exactly what it is heard as.
- **The Workings strip is also built from Text**, for its prompt and the operator's line; the contract change lists Surface and
  Line working only, and is corrected when the contracts are updated (T013).
- **The play screen's complexity reached 11** with the Status bar; the counter or Status bar is now made by one helper.
- **The catalogue page scrolled sideways** (459 px wide at 375): two workings side by side in the strip were too wide.
  The strip now wraps.

**Catalogue lists (T011)**: three existing tests in `src/catalogue/library.spec.ts` were amended, with the owner's
agreement before the change, and recorded in `test-changes.md`. They failed on their assertions (the three lists lacked the
new names), then passed once `src/catalogue/library.ts` listed the new parts.

**Proving the fit (T012, research R9)**: measured in the catalogue with the widest pills and workings each grid can show.
The first measurement did not fit: Hard 66 px over at 375 × 667, Medium 58 px over at 320 × 568, and Hard's column pills
overlapped. Asked, the owner chose to squeeze harder before changing the spec. A compact density token set, a wrapping
strip, hidden workings that take no room and stacked column pills then gave:

| Grid | 375 × 667 | 320 × 568 |
| --- | --- | --- |
| Medium, 5 × 4 | 561: fits | 559: fits |
| Hard, 7 × 5 | 666: fits, 1 px spare | scrolls up and down only, 320 wide |

The same in Chromium and WebKit. Everything tappable is at least 44 × 44. The scenarios that prove it in the game are
AC-12 and AC-16, in parts 3 and 4.

**A driver corrected**: the catalogue driver listed every region in a tier as a component, so the Status bar's samples
(each a region "Status bar") were counted. It now lists only components' own regions, those with a heading (`74bdf05`).

**Acceptance GREEN**: `[spec-003 AC-1]` and every catalogue scenario pass on both phones. Full suite: 377 unit, 48 engine
and 329 phone tests pass. In one full run, spec-001 AC-16 timed out on the iPhone waiting for the Check button to be
stable; it passed alone three times and in a second full run, so it is noted, not changed. JavaScript 9.96 KB and CSS
2.51 KB gzipped.

**Noticed for later**: a Target pill shows a negative target with a hyphen ("− -480"), where the game writes the minus
sign elsewhere. Hard (part 4) shows negative targets, so it is fixed there.

**Commits**: `7bba210` vocabulary and stubs, `49bfe47` grid, `41a2b3f` strip, `05d3f0d` status bar, `c4c323e` Today
list, `be4b845` play screen, `74bdf05` driver, `b67f3c6` compact density, `3d50ff8` catalogue, `d31c2a3` contracts,
research and brief.

## Part 2: User Story 1, today's Easy puzzle (T016 to T033)

- **Baseline**: `main` at `c70c130` (part 1 merged): 377 unit, 48 engine and 329 phone tests, all passing.
- The approved `daily-easy.acceptance-spec.ts` and `daily-examples.ts` came over unchanged from `514187c`, confirmed by blob,
  behind the `daily` flag (off).

### AC-1: today's Easy puzzle

- **Acceptance tests**: `test/acceptance/play/daily-easy.acceptance-spec.ts`, `[spec-007 AC-1]` (engine, both phones) and its
  accessibility scan (both phones).
- **Drivers**: an engine daily driver and a UI daily driver. The engine's game and daily drivers share one game in-process, as one
  phone does (needed by AC-22). The UI driver sets the phone's date with Playwright's clock, at midday.
- **Acceptance RED**: engine, `the puzzle as heard — Expected "Easy puzzle, 3 by 3", Received ""`; phones, tapping "Today's
  puzzles" timed out (no Today button).

| Cycle | RED | Commit |
| --- | --- | --- |
| A seed text becomes a number by 32-bit FNV-1a, matching its published values | `expected [ +0, +0, +0 ] to deeply equal [ 2166136261, … ]` | `c6d50c4` and before |
| mulberry32: the same seed draws the same numbers, another seed others | `expected [ +0, … ] to not deeply equal [ +0, … ]` | `c6d50c4` |
| Counting: the worked example's two solutions | `expected { count: +0, … } to deeply equal { count: 2, … }` | `9afe015` |
| Counting gives up on a line that cannot reach its target (research R4's bounds) | `expected { count: +0, isWithinBudget: false } to deeply equal { count: 1, isWithinBudget: true }` | `147a00b` |
| The Easy preset, and generator version v1 | `expected { rows: +0, … } to match object { rows: 3, … }` | |
| A daily puzzle's identity: id, seed, preset, shape | `expected [ 'worked-example', undefined, … ] to deeply equal [ 'daily-v1-2026-11-10-easy', … ]` | |
| Built from a full filling that solves it | `expected false to be true` | |
| As many cells given as the preset says | `expected 0 to be greater than or equal to 4` | |
| Kept only if its count is within the band | `expected 0 to be greater than or equal to 1` | |
| A malformed or impossible date is refused | `expected [Function] to throw an error` (five dates) | `acc7e50` |
| The phone's local date as YYYY-MM-DD | `expected [ '', '' ] to deeply equal [ '2026-11-10', '2026-01-05' ]` | |
| A daily puzzle heard as "Easy puzzle, 3 by 3" | `expected [ '', '' ] to deeply equal [ 'Easy puzzle, 3 by 3', 'Puzzle' ]` | |
| A daily puzzle's cells named by row and column | `expected [ 'Top-left cell, given 3', …(2) ] to deeply equal [ Array(3) ]` | |
| Opening Today shows the Today screen | `expected { puzzle: …, …(7) } to deeply equal …` | |
| Choosing Easy keeps Practice as it was left | `expected 'practice' to be 'easy'` | |
| A puzzle come back to opens empty, with the greeting, keeping what was found | session differed (with Solution A really found) | |
| The Today rows, each heard with its count | `expected [] to deeply equal [ 'Easy, found 0 of 1', …(1) ]` | |
| A puzzle made today starts with what is saved for it | `expected [] to deeply equal [ { …(3) } ]` | |
| The Today screen is a history entry | `expected { kind: 'play' } to deeply equal { kind: 'today' }` | |
| A daily puzzle's grid is named by its preset and shape | `expected [ undefined, undefined ] to deeply equal [ 'Easy puzzle, 3 by 3', 'Puzzle' ]` | |
| The Today screen's heading, way back and rows | object differed | |
| A daily puzzle in its seed's theme | `expected [ { label: 'Classic', … }, … ] to deeply equal [ …(2) ]` | |
| No helper line on a puzzle with nothing to swap | `expected [ …(2) ] to deeply equal [ '', …(1) ]` | `95f5664` |
| Easy's 3 × 3 grid is snug | `expected [ undefined, undefined ] to deeply equal [ true, false ]` | `3c61d53` |

**Not valid reds, kept as guards, each proved where it matters:**

- mulberry32's numbers are whole, from 0 to n − 1 (passes from `Math.floor`).
- The search agrees with trying every filling on three puzzles, one with every line open (4 solutions).
- 29 February in a leap year is accepted; 29 February 2027 and 2100 are refused.
- An unknown preset is refused.
- The generator gives up after 2,000 candidates; and it never keeps a count it did not finish. The second was first written so it
  could not fail (a budget of 1 also gave a count outside the band); corrected to keep the band open, then proved by removing the
  work check, which made it fail.
- A daily cell's title, added with the grid's name.

**Sweep (T022, AC-3 and AC-5)**: `src/engine/sweep-easy.spec.ts`, every date of 2027, about 6 seconds. Each was proved by a
deliberate, reverted break: a + bound off by one failed AC-5; Easy allowed 6 given cells failed AC-3 on 122 dates. The slow count
was rewritten to multiply each line's operators directly (no `checkEntry` per filling), from about a minute to 6 seconds.

**Work budget (T021)**: Easy has at most 5 empty cells, so even the unpruned search takes at most 66,429 steps; the budget of
200,000 can never drop an Easy candidate.

**Golden dates (T023)**: Easy pinned for 10 and 11 November 2026 and the first of each month of 2027, in
`src/engine/golden-dates.spec.ts`.

**Found along the way, and corrected:**

- **Easy did not fit 375 × 667** with the Today button beside the counter (40 px over): "Solutions found" wraps. The helper line
  ("Tap a dashed bubble") was wrong on Easy, which has nothing to swap, so it is left out there (35 px). The last 10 px: asked, the
  owner chose 50 px Easy cells on 601 to 700 px phones (`.density-snug`). Easy and the worked example fit 375 × 667 and 320 × 568
  in Chromium and WebKit.
- **A catalogue server left running** held port 4173 and made the phone tests wait for theirs; stopped.
- **Branch coverage fell to 89.19%**: the generator's give-up and out-of-work paths were not tested. A pure refactor gave the core
  its preset as data (`puzzleFor`), then two guards tested them; the golden dates showed no puzzle changed.
- **A lint error was committed once** (`no-dynamic-delete`), corrected in the next commit (`249ae91`).
- **Two RED tests were written at once** for the Easy preset and the generator version, a one-line constant.

**Noticed for the owner**: 319 of 2027's 365 Easy puzzles have exactly one solution (2: 8, 3: 7, 4: 7, 5: 11, 6: 8, 7: 4, 8: 1),
inside the band of 1 to 10. On Easy, the three column pills touch and read as one band.

- **Acceptance GREEN**: AC-1 on the engine and both phones, and the accessibility scan. Full suite: 420 unit (branches 90.21%),
  53 engine and 343 phone tests pass. JavaScript 12.68 KB gzipped.
- **Slice refactor**: the generator's core (`puzzleFor`) and `seedNumber` without defensive fallbacks; one order of today's
  choices (`todayChoices`).

### AC-2: the same puzzle everywhere

- **Acceptance test**: `[spec-007 AC-2]`, engine and both phones.
- **Passed at RED**, from AC-1's work: the generator is pure and seeded by the date and preset, and both drivers read the puzzle the
  game shows. **Proved** by a deliberate, reverted break: the game made Easy from 11 November instead of the phone's date. AC-2 then
  failed on the engine, the iPhone and the Android phone with "the puzzle, compared with Easy for 10 November 2026 made by the
  engine alone".
- No new unit tests or production code. **Acceptance GREEN** after the revert, on all three.

### AC-4: the filling it was made from

- **Acceptance test**: `[spec-007 AC-4]`, engine and both phones.
- **Passed at RED**, from AC-1's work: every target is worked out from the filling, so the filling the engine reports solves it.
  **Proved** by a deliberate, reverted break: each line's target was its filling's result plus 1. AC-4 then failed on the engine,
  the iPhone and the Android phone with "the counter as heard … Received: Found 0 of 3".
- A first break tried (each target worked out from its digits read backwards) left AC-4 passing: Easy for 10 November has no
  line where the order changes the result. It was reverted and replaced by the break above, which changes every line.
- No new unit tests or production code. **Acceptance GREEN** after the revert, on all three.

### AC-6: the puzzle's theme

- **Acceptance test**: `[spec-007 AC-6]`, both phones (tagged `@ui`: only the phones read the page's colours).
- **Passed at RED**: the unit behaviour T028 asks for was written test-first during AC-1, because the game needed it to show Easy
  (`0590f56`, `src/app/screen.spec.ts` › `puzzleTheme (spec-007 FR-712)`: a daily puzzle's theme is `themeForSeed(puzzle.seed)`, the
  worked example's is Classic). **Proved** by a deliberate, reverted break: the game no longer re-coloured the page when a new puzzle
  was chosen. AC-6 then failed on the iPhone and the Android phone with "the theme, compared with the one worked out from the
  puzzle's seed … Expected: Amber and teal, Received: Classic".
- No new unit tests or production code. **Acceptance GREEN** after the revert, on both phones.

### AC-7: a new puzzle each day

- **Acceptance test**: `[spec-007 AC-7]`, engine and both phones.
- **Passed at RED**, from AC-1's work: the seed is `v1:<date>:<preset>`, so each date draws its own stream. **Proved** by a
  deliberate, reverted break: the date was left out of the seed. AC-7 then failed on the engine, the iPhone and the Android phone
  with "the puzzle, compared with the one remembered … Expected: not" the same puzzle (10 and 11 November were identical).
- No new unit tests or production code. **Acceptance GREEN** after the revert, on all three.

### AC-22: the worked example as Practice

- **Acceptance test**: `[spec-007 AC-22]`, engine and both phones.
- **Passed at RED**: the unit behaviour T030 asks for was written test-first during AC-1, because choosing from the Today screen
  needed it (`bc4674a`, `src/app/daily.spec.ts` › `choose` › "opens a puzzle come back to with an empty grid, no cell selected and
  the greeting, keeping what was found (FR-709)"). It sits in `daily.spec.ts`, not `session.spec.ts` as T030 planned: each
  puzzle's session is kept by `DailyState`, so the session needed no change. **Proved** by a deliberate, reverted break: a puzzle
  come back to lost what had been found. AC-22 then failed on the engine, the iPhone and the Android phone with "counter …
  Expected: Found 1 of 2, Received: Found 0 of 2".
- No new unit tests or production code. **Acceptance GREEN** after the revert, on all three.

### T031: FR-711 and Easy's opening time (SC-701)

- **FR-711, unit**: `src/app/screen.spec.ts` › `the filling a daily puzzle was made from (spec-007 FR-711)` › "is never shown: Easy
  chosen from the Today screen opens with only its given cells filled in" (`56c14d0`). It goes through `choose`, so it covers the
  path by which a filling could reach the screen. **Passed at RED** (the behaviour existed). **Proved** by a deliberate, reverted
  break in `src/app/daily.ts`: Easy started with its filling entered *and* opening a puzzle no longer emptied the grid. The test
  then failed with `expected [ [ 3, 9, 2 ], [ 7, 6, 4 ], …(1) ] to deeply equal [ Array(3) ]`. Either half alone leaves it passing:
  opening a puzzle always empties its grid (FR-709), which is a second guard against showing the filling.
- **SC-701, measured** (not a test: the opening-time scenario is User Story 3's, task T052). Chromium, Pixel 5 at 375 × 667, CPU 4×
  slower as the speed budgets use, the flags-on build (version `b61422d`): from tapping "Easy" on the Today screen to the Easy puzzle
  on screen, five runs each.

  | Date | Milliseconds | Worst |
  |---|---|---|
  | 10 November 2026 | 73, 80, 70, 74, 74 | 80 |
  | 1 January 2027 (Easy's slowest date of 2027 to make) | 71, 75, 71, 73, 72 | 75 |
  | 25 June 2027 (second slowest) | 73, 66, 67, 73, 66 | 73 |

  Making Easy itself takes under 0.5 ms in Node on its slowest date, so nearly all of the time is drawing the screen. Easy is well
  within 1 second.

## Every operator on every difficulty (owner, 2026-11-10)

Asked before `daily` went on: Easy and Medium allow + − × ÷, Easy's targets become 1 to 100, its band stays 1 to 10, and a puzzle
need not use all four. Measured first over every date of 2027 with a scratch run of the generator: every date makes an Easy
within the band (slowest 1.2 ms); lines drawn: + 1,483, × 585, − 87, ÷ 35 (a 3-digit difference or quotient is rarely
positive and whole); 342 of 365 dates have exactly 1 solution (319 with + and − alone).

- **Locked change, approved** (`714dd80`, `acceptance.md` amendment): AC-1 reads "from +, −, × and ÷" and "targets 1 to 100".
  AC-8's change is recorded for part 3.
- **Acceptance RED**: none possible. The amended AC-1 only widens what it accepts, so it passed on the old Easy. The preset's unit
  test drove the change.
- **Cycle** (`70e80b2`): RED, `presets.spec.ts` › Easy amended to `+ − × ÷` and 1 to 100, failed with "expected { rows: 3, …(6) } to
  match object". GREEN, `PRESETS.easy` changed. As predicted, the sweep's operator check (307 dates) and target check
  (252 dates) failed, and so did Easy's golden dates. Each was amended with the owner's approval (`test-changes.md`); the golden dates were
  regenerated (given cells unchanged, operators and targets redrawn; 10 November 2026 unchanged, all + lines).
  The amended target check was proved by a reverted break (targets up to 200: it failed on 171 dates).
- **Acceptance GREEN**: 421 unit tests (branches 91.19%), 53 engine and 343 phone scenarios; the flagged Easy scenarios run again
  on a fresh server: 14 passed.

## Column pills stacked on grids of 3 or more columns (owner, 2026-11-10)

Easy's column pills overlapped by 33–36 px at 375 × 667 (each 87–94 px wide in a column about 54 px wide). The owner
chose mock-up C from three made on the real page (stacked, smaller text), for every grid of 3 or more columns.

- **Found on the way**: part 1's `puzzle-grid__column-pill` class was added after creating each pill, but Badge and Button
  set their whole class list on `update`, so it was gone after the first render and never took effect in the game.
  The catalogue showed it only because its samples are never updated. Replaced by a variant each component carries.
- **Cycles**: Badge `isStacked` → `badge--stacked` (`423a3b8`); dashed Button `isStacked` → `button--stacked`
  (`2933ab1`); `areColumnPillsStacked(columns)`, true from 3 columns (`c1f9ee4`). Each RED failed on its assertion
  (e.g. "expected [ false, false, false, false ] to deeply equal [ false, true, true, true ]"). The Puzzle grid passes
  `isStacked` to its column pills on create and on every update; the Target pill passes it to its Badge or Button. The Target pill
  model is unchanged (two existing tests compare it whole).
- **Look**: the text is four-fifths of body text (12.8 px at 375 wide, as in mock-up C). Four-fifths of a pill's text made the pills
  43 px tall, and the screen scrolled at 375 × 667. Measured on Easy for 10 and 11 November 2026 and 1 September 2027:

  | Phone | Column pills | Gap between pills | Fits without scrolling |
  |---|---|---|---|
  | 375 × 667 | 44–48 × 34 px | 11–14 px | yes |
  | 320 × 568 | 36–41 × 30 px | 12–15 px | yes |

  The worked example has no stacked pill.
- **Catalogue**: stacked Badge, dashed Button and Target pill samples (`a4e8104`).
- **GREEN**: 424 unit tests, 53 engine and 343 phone and catalogue scenarios.

### Both together (main merged into the operators branch, 2026-11-11)

PR #47 (stacked pills) was merged first, so `main` was merged into this branch; the spec and this log kept both additions.
Easy with + − × ÷ and stacked column pills, measured on 11 November 2026 and 1 March and 1 September 2027: column pills
40–49 × 34 px at 375 × 667 and 33–41 × 30 px at 320 × 568, 9–16 px apart, the page fitting without scrolling at both, the
row pill "× 96" included. 424 unit tests, 53 engine and 342 phone and catalogue scenarios passed, with the speed budget run alone.
One scenario, spec-006 AC-3 on the iPhone, timed out once in the full run (a tap waited 60 s); run again 5 times alone, it
passed every time in about 8 s.

Unit tests must run from `C:\…`: in a session opened at `c:\…` (lower-case drive), Vitest loaded itself twice and every
file failed with "Cannot read properties of undefined (reading 'config')".

## Part 3: User Story 2, Medium and Collector (T034 to T045)

**T034** (`48f31c8`): `medium-and-collector.acceptance-spec.ts` from `514187c` (same blob), with only the operator amendment
approved on 2026-11-10; behind the new `presets` flag, off. Its scenarios run on `iphone-flagged` and `android-flagged` (8 each).

### AC-11: Medium and Collector on every date of 2027

- **Cycles**: `PRESETS.medium` and `PRESETS.collector` (each RED on "expected undefined to match object");
  R3 step 3, opening as many lines as the preset says (RED: "expected 0 to be greater than or equal to 4"); the filling a puzzle was
  built from includes each open line's operator (RED: "expected 'incomplete' to be 'solved'"). Easy draws nothing for 0 open
  lines, so its golden dates are unchanged.
- **Work budgets (T036)**: 200,000 steps each, measured over 2027 (research R4). Collector: 22 dates where a candidate is
  dropped for work; slowest 134 ms on this PC. 358 of 365 Collector dates have more than 100 solutions.
- **Sweeps (T037)**: `sweep-medium.spec.ts`, `sweep-collector.spec.ts` through `test-support/preset-sweep.ts`. They passed at RED.
  **Proved** by a deliberate, reverted break (one line fewer opened): both failed on hundreds of dates. Golden dates pinned.

### AC-8 and AC-9: Medium and Collector on the Today screen

- **Acceptance RED** on the phones: no "Medium" row ("waiting for … getByRole('button', { name: /^Medium, found / })"). The engine
  passed already: its driver plays every preset the engine has (by design in part 2), so it went green with the presets.
- **Driver (T038)**: the drivers' own search for a puzzle's first solutions (`drivers/daily-solutions.ts`): rows top to bottom, the
  game's arithmetic, never the engine's. Checked against the engine: all 39 solutions of Collector on 10 November 2026 in 261 ms,
  each solved by the engine's check. `dailyLayout` in the phone driver.
- **Cycle**: `presetsOffered(features)` (RED: "expected [ [], [], [] ] to deeply equal [ [], [ 'easy' ], …(1) ]"), used by `main.ts`.
- **Driver fix**: an open pill's name begins with what it shows ("? 28, Column 3 target 28, operator not chosen").
- **Found on the way**: Collector's pills showed negative targets with a hyphen ("? -3"). Fixed test-first: "? −3" (`53cafe1`).
- **GREEN** on the engine and both phones, with the accessibility scan.

### AC-10: a Collector puzzle with more than 100 solutions

- **Acceptance RED** on the engine: "No Collector puzzle with more than 100 solutions in the 31 days from 10 November 2026". The game
  read the date only when it opened, so a new phone date never reached the Today screen.
- **Brought forward from part 5 (owner, 2026-11-11)**: with `presets`, opening the Today screen reads the date again (research R6).
  `onDate(state, date)`: a new date offers that date's puzzles; the puzzle on screen stays open (`current` is null); Practice keeps
  what it found. RED: Collector after the new date was still 10 November's. Clearing an earlier day's saved solutions stays in part 5.
- **On the phones the scenario opens the game before setting the date**, so it starts on the real day. On 11 November 2026 the
  first Collector already has more than 100 solutions, and a break removing the new-date reading from `main.ts` left the phones
  passing. The engine, which starts on 10 November (39), is the proof; on the 7 days a year with 100 or fewer, the phones need it too.
- **"Found 3", never "All found!" (T040)** passed from spec-006 (`totalToShow`). **Proved** by a deliberate, reverted break
  (a total left out counts as complete at 3 found). It first failed only on the engine: the phone driver read the counter's whole
  shown text ("All found! 3 ✓") as its title, so it could never equal "All found!". Fixed to read the title alone; then both phones
  failed with "the counter title … Expected: not 'All found!'", and passed after the revert. Two more driver gaps closed for
  "Found N" with no total and for tapping open pills.
- **GREEN**: 435 unit tests (branches 91.66%); engine 57; phones all but AC-12 (not yet built). In the full run, two iPhone taps
  timed out at 60 s (spec-006 AC-17 and AC-10); each passed 3 times out of 3 alone. AC-10 takes about 25 s on the iPhone alone.

### AC-12: Medium and Collector fit the phone

- **Acceptance RED** on both phones: "the puzzle is on screen without scrolling" and "the keypad is on screen without scrolling".
  Part 1's compact screen and workings strip were in the library, but the game did not use them.
- **Cycles** (T041, `src/app/screen.spec.ts`), each RED on its assertion first:
  - grids bigger than 3 × 3 get the compact screen (FR-719): "expected [ undefined, undefined, …(2) ] to deeply equal [ true, true, false, false ]";
  - grids wider than 3 columns show their workings elsewhere (FR-718): Medium, not Collector or Easy;
  - the strip prompts "Tap a cell to see its row and column." until a cell is tapped;
  - with a cell selected, it shows that cell's row working, then its column working;
  - after a Check, the operator's line is in the strip until a cell is tapped, on Medium and on Collector (which has no strip
    otherwise); it is still announced as before.
- **Medium at 320 × 568 was 17 px too tall** (page 585 px; cells already at 44 px). The owner chose: no helper line on the compact
  screen (spec FR-719 and the play-screen contract, `a715213`). Cycle RED: Medium's and Collector's helper was still shown.
  Medium now measures exactly 568 px at 320 × 568: it fits, with no pixel to spare.
- **GREEN**: all 8 scenarios on both phones, with the accessibility scan.

### AC-13: switching between today's puzzles

- **Passed at RED** on the engine and both phones, from part 2's AC-22. **Proved** by a deliberate, reverted break: the puzzle left
  was filed under Practice, not its own choice. The engine failed ("Found 0 of 1"). The phones still passed: Easy's solution is also
  saved on the phone (spec-006), and is restored when Easy is made again. With that ignored as well, both phones failed with
  "Found 0 of 1". Both halves were reverted.

### SC-701: opening Medium and Collector (T043)

Chromium, Pixel 5 at 375 × 667, CPU 4× slower, the flags-on build: from tapping "Today's puzzles" (which makes the puzzles not yet
made) to the chosen puzzle on screen, five runs each.

| Puzzle | Date | Milliseconds | Worst |
|---|---|---|---|
| Medium | 10 November 2026 | 395, 413, 392, 396, 418 | 418 |
| Medium | 7 January 2027 (slowest of 2027 to make) | 362, 372, 357, 371, 372 | 372 |
| Collector | 10 November 2026 | 417, 420, 393, 396, 398 | 420 |
| Collector | 16 August 2027 (slowest of 2027 to make) | 768, 780, 760, 750, 799 | 799 |

All within 1 second; Collector's slowest date leaves about 200 ms.

With `presets` off, the normal build (`49cf5e5`) lists only "Easy, found 0 of 1" and "Practice, found 0 of 2".

**Part 3 whole suite** (`49cf5e5`): 441 unit tests (lines 98.65%, branches 91.84%), 57 engine and 359 phone and catalogue scenarios,
no exceptions expired, no existing test changed. JS + CSS 15.8 KB gzipped.

## Part 4: User Story 3, Hard (T046 to T054)

**Baseline** (`main` at `d081506`, `presets` released): 441 unit tests, 57 engine scenarios and 359 phone and catalogue
scenarios pass. With `hard.acceptance-spec.ts` brought unchanged from `514187c` (blob `d97b42b`), AC-14 fails on the engine:
"rows on the Today screen, in order", Hard not listed. The behaviour is missing, not the driver.

### T046: the `hard` flag

`hard` is off. Its file runs on the flags-on phones; AC-17 (`@budget`) runs on `android-speed-flagged`, against the flags-on
build, alone and after `android-speed`, which no longer runs an unreleased file (checked with `playwright test --list`).
`presetsOffered` now takes only the `daily` and `presets` flags it reads, so `today-list.spec.ts` is unchanged.

### T047: Hard's preset

- **RED** `presets.spec.ts` › "Hard is 7 × 5, + − × ÷, 1 or 2 of its 12 lines open, 21 or 22 cells given, targets −500 to 500,
  1 to 3 solutions": `expected undefined to match object { rows: 7, columns: 5, …(5) }`.
- **GREEN** `PRESETS.hard`, between Medium and Collector (`3626c4d`). 442 tests pass. REFACTOR: nothing to change.

### T048: Hard's work budget

200,000 steps, measured over every date of 2027 (research R4): no date changes with the budget; the kept count needing
most steps took 138,717; the slowest date took 321 ms to make on this PC. Counts: 122 dates with 1 solution, 127 with 2, 116 with 3.

### AC-15: Hard on every date of 2027

- `sweep-hard.spec.ts` **passed at its first run** (12.9 s): the generator already keeps only puzzles that fit the preset.
  **Proved** by a deliberate, reverted break: letting Hard keep up to 8 solutions failed it, starting "2027-10-01: solutions
  within the band".
- Hard's golden dates pinned in `golden-dates.spec.ts`, as a new test; no existing line changed (`tests:guard`: 0 changed).

### AC-14: Hard on the Today screen

- **Acceptance RED** on the flags-on phones: "rows on the Today screen, in order", Hard missing. The engine driver passed once
  T047 added the preset: it offers every preset in `PRESETS`, and the game offers only those its flags allow.
- **RED** `today-list.spec.ts` › "offers Hard between Medium and Collector with hard (spec-007 AC-14)", a new test:
  `expected [ 'easy', 'medium', 'collector' ] to deeply equal [ 'easy', 'medium', 'hard', …(1) ]`.
- **GREEN** `presetsOffered` reads `hard`, optional and off when missing, so the existing test stands unchanged (`5102f83`).
  445 unit tests; AC-14 passes on the engine and both flags-on phones. REFACTOR: nothing to change.
- **Full suite**: with 16 browsers at once, every phone run lost one to four iPhone scenarios from earlier specs to tap timeouts
  (a different one each time, each passing alone). The owner chose 4 browsers at once for local runs (`LOCAL_WORKERS`); then 58
  engine and 365 phone and catalogue scenarios pass. Only Hard's AC-17 budget fails, as expected: its driver is still a stub (T052).

### AC-16: Hard fits the phone

- **Passed at RED** on both flags-on phones, at 375 × 667 and 320 × 568: Hard uses the compact screen and strip built for
  Medium and Collector (FR-718, FR-719). **Proved** by deliberate, reverted breaks:
  - Hard drawn without the compact screen: both phones failed at 375 × 667, "the puzzle is on screen without scrolling".
  - The wide grid made 400 px wide: both phones failed at 320 × 568, "the page is no wider than the screen". (A first try made the
    whole page 400 px wide; Chromium then zoomed the Today screen out, its tap missed, and Android ran out of time before the check.)
- The 44 × 44 and accessibility checks are the driver code AC-12 proved in part 3.

### AC-17: Hard on the reference phone

- **Acceptance RED**: the phone driver's `secondsToOpen` was a stub returning NaN, so the scenario could not pass. Built in the
  driver: from the tap on the choice's Today row until its puzzle is on screen, browser round trips included (`e181d23`).
- **GREEN with no product change**: today's puzzles are made when the Today screen opens, so choosing Hard only switches to it;
  0.13 seconds at worst. **Proved** by a deliberate, reverted break: 1.5 seconds of work on choosing Hard failed it with
  "seconds to open Hard, Expected: <= 1, Received: 1.616".
- **Found**: the scenario does not time opening the Today screen, where the puzzles are made. On the reference phone that takes
  up to 1.8 seconds on Hard's slowest date (20 October 2027), and over 1 second on about 6 to 12 dates of 2027 (research R5).
  The owner chose to accept and record it, not a worker, idle-time making or a faster count.

With `hard` off, the normal build (`720dd7c`) lists "Easy, found 0 of 1", "Medium, found 0 of 12", "Collector, found 0" and
"Practice, found 0 of 2": no Hard. Its flags are `{daily: true, presets: true, hard: false}`; the flags-on build's `hard` is true.

**Part 4 whole suite** (4 browsers at once): 445 unit tests (lines 98.65%, branches 91.84%), 58 engine and 366 phone and catalogue
scenarios, Hard's AC-17 on the flags-on speed project among them; no exceptions expired, no existing test changed. JS + CSS 15.85 KB gzipped.

### CI: the year sweeps past their minute, and the search sped up (research R12)

`verify` on #51 failed: with coverage and alongside each other, Collector's sweep took 70.6 s and Hard's 90.3 s (Collector alone
had taken 49.8 s in part 3's CI). Locally with coverage, Hard's also failed (60.3 s). As R12 says, the search was sped up with no
count changed, in two `perf` commits, each checked by all 445 unit tests, the golden dates among them:

- `ac9ebfb`: only the lines through the cell tried are checked, and each line's digits are read once. Hard 39.7 s, Collector 27.1 s.
- `6f49d3d`: a daily puzzle's count stops one past its band (`countUpTo`; `countSolutions` and the engine contract unchanged).
  A candidate over its band is dropped whatever its exact count; within the band the search and its steps are as before.
  Hard 15.1 s, Collector 26.1 s; the four sweeps 26.5 s instead of 60.7 s.

It also removed the slow Today screen the owner had accepted at AC-17: on the reference phone it now opens within 650 ms on the
slowest date of 2027 (1,766 ms before on 20 October 2027, now 610 ms). Choosing Hard stays about 0.12 s (research R5).

## Amendment 2026-11-12: results beside each line, the header back, smaller cells (Medium and Hard)

Branch `007-seeded-generator-workings-beside` from `main` at `471b3c4` (PR #51's merge; `ci-deploy` passed and the
public address serves `471b3c4`). The owner's decisions, from mock-ups on 11 and 12 November, are in the spec's
Clarifications; approved scenarios `99391d0`; exception EXC-007 (cells of Medium and Hard at least 36 × 36).

**Baseline**: 445 unit tests, 58 engine scenarios, all passing; `main`'s `verify` passed in CI.

### Acceptance RED (T067)

Drivers: `resultsBesideLines` reads each line's shown result, its mark and whether it is at its row's right or below
its column; `dailyLayout` gains `cells`. AC-23 failed for the reason expected: every line's result was "not beside
its line" (they were in the strip). AC-12 and AC-16 **passed at RED**: they now ask 36 × 36 of cells, less than the
44 the old layout gave. Proved by a reverted break after the layout (cells held to 30 px): both failed, "width of
cell — Expected: >= 36, Received: 30".

### Cycles

| Cycle | Test | Change | Commit |
|---|---|---|---|
| 1 | `screen.spec.ts` "keeps every grid's workings beside its lines, Medium's too" (amended, agreed) | no `workings: 'elsewhere'` | `fb42acc` |
| 2 | "shows a wide grid's results in short form…" (new) | `besideItsLine` drops "= "; the agreed strip test deleted | `b5d9453` |
| 3 | "is used by Collector only…" (amended, agreed) | `hasCompactScreen`: bigger than 3 × 3, at most 3 columns | `58a05f6` |
| 4 | "shows the operator's line after a Check in the strip on Collector only…" (amended, agreed) | the strip only on the compact screen; the prompt test deleted, `TAP_A_CELL` removed | `2c3a6ef` |
| 5 | "gives Medium and Hard the large grid's layout, and Hard's 7 rows the tall one…" (new) | `isLargeGrid`, `isTallGrid` | `dc23215` |
| 6 | `play-screen.model.spec.ts` `playScreenClasses` (new) | the densities as classes | `bbc40d1` |

**Layout (T070)**, checked by AC-12 and AC-16: `.density-large-grid` and `.density-tall-grid`; `--size-mascot`,
`--space-bubble-block`, `--size-cell-least`, `--size-row-pills`. The first run found the open column pills of Medium
at 320 px held only to 36 px (the cells' least width was set on every grid button): it now applies to cells only, and
narrow phones give the cells room so neighbouring 44 px pills do not touch. Hard was 669 px tall at 375 × 667: the
tall grid's screen edge is 7 px. Measured: Medium 375 × 667 and Hard 375 × 667 fit; Medium 320 × 599 and Hard
320 × 655 at 320 × 568 scroll down only. `a8cd495` / `71f58cd`.

**Given cells (T071)**: a shadow on every given cell failed spec-001 AC-4 on both phones, as the shadow had been the
given cell's only marking besides colour. The owner chose to read a solid disc against an outlined ring as a
difference of shape (spec-007, Changes to earlier specs). The phone driver reports a cell's fill, solid or ringed;
no locked file changed. Proved by a reverted break (given cells drawn as rings): AC-4 failed on both phones.

**Worst case** (catalogue, widest pills): Hard fits 375 × 667 with no tap target under 44 px; "× −500" and "× 432"
touch, and a result of 27216 reaches the panel's edge (raised with the owner).

**Whole suite**: no exceptions expired; no existing test changed without a recorded reason (the guard caught an
edited import line, put back in `refactor` commit); lint and typecheck clean; 446 unit tests; JS + CSS 16.07 KB
gzipped; 58 engine and 368 phone and catalogue scenarios.

**Owner's phone review, first pass**: "the numbers at the top and bottom are not centred". Measured: column pills
and column results were centred as boxes, but their text sat 9 and 10 px left, beside the room kept for a hidden
tick. Cycle: `target-pill.model.spec.ts` "keeps the tick's place in a one-line pill, but not in a stacked column
pill" (new; a whole-model field would have changed two existing tests, so it is its own function) failed on the
stub, `[true, true]`; `isTickPlaceKept` passes it. A column's result keeps its tick's place, but the tick hangs to
its right and takes no width. Measured after: every column pill's and column result's text 0.0 px from its
column's centre; a reached pill shows its tick inside, beside the target. 447 unit tests; 368 phone and catalogue
scenarios.

## Part 5: User Story 4, a new day (T055 to T062)

### T055: the `newDay` flag

Branch `007-seeded-generator-part-5` from `main` (`9e2af2b`). `test/acceptance/play/new-day.acceptance-spec.ts`
brought unchanged from `514187c` (blob `7f7907e`, confirmed). `newDay: false` in `src/app/features.ts`, and the file
behind it in `playwright.config.ts`. `e02fd52`.

**Baseline**: 447 unit tests; 59 engine scenarios; 368 phone and catalogue scenarios pass. Failing, as expected:
the new file's AC-18, AC-19 and AC-21 on the flags-on phones. AC-20 passes already (T059 expected it; to be proved
by a reverted break).

### AC-18: coming back the same day

**Acceptance RED** (flags-on phones): after the reload the worked example opened, not Medium: "No daily puzzle is
on the play screen" at `expectPuzzle('Medium', 5, 4)`. The drivers needed nothing new: the phone's fixed date
holds across a reload and a fresh load.

| Cycle | Test | Failure at RED | Change | Commit |
|---|---|---|---|---|
| 1 | `today-record.spec.ts` "keeps the day and preset in the agreed format, under operator.today" | `expected null to deeply equal { format: 1, … }` | `writeTodayRecord` | `f07be3e` |
| 2 | "reads back the day and preset written" | `expected 'none' to deeply equal { date, preset }` | `readTodayRecord` | `191d744` |
| 3 | `daily.spec.ts` "opens today's puzzle for the preset last played today, on the play screen, with its saved solutions" (new; import on its own line) | `expected 'practice' to be 'medium'` | `openLastPlayed`, through `choose` (FR-709) | `f5957d1` |
| 4 | `today-record.spec.ts` "reads "none" on a phone that has never played" | `expected { date: undefined, preset: undefined } to be 'none'` | no record is `'none'`, so the wiring keeps AC-20 | `54c7f3f` |
| 5 | (entry point; the scenario) | | `main.ts`, behind `newDay`: read on opening, written when one of today's puzzles is chosen | `6089823` |

**Acceptance GREEN**: AC-18 on both flags-on phones; AC-20 still passes.

**Slice refactor**: nothing changed. `today-record.spec.ts` repeats `solution-store.spec.ts`'s in-memory store;
sharing it would change a protected file.

**Whole suite**: lint clean; no existing test changed; 451 unit tests; 59 engine scenarios; 370 phone and catalogue
scenarios. Still failing, as expected: AC-19 and AC-21, not yet built.

### AC-19: coming back the next day

**Acceptance RED, first run** (flags-on phones): the opening on 11 November already passed (AC-18's
`openLastPlayed` opens the new date's Medium), and Practice kept "Found 1 of 2". The scenario then failed at
`expectSamePuzzleAsRemembered()`: it remembered 10 November's Medium after the filling was entered, so the
remembered puzzle held the player's entries, and an empty grid on coming back (FR-709) could never match. Stopped
and asked; the owner approved moving `rememberThisPuzzle()` before the filling (acceptance.md, Amendment
2026-11-12, `6696751`).

**Acceptance RED, after the amendment**: back on 10 November, Medium showed "Found 1 of 2", not "Found 0": the
solution had not been removed.

| Cycle | Test | Failure at RED | Change | Commit |
|---|---|---|---|---|
| 1 | `today-record.spec.ts` "removes an earlier day's four solution records, never the worked example's" | `expected [ …(5) ] to deeply equal [ 'operator.solutions.worked-example' ]` | `clearEarlierDay` removes `operator.solutions.daily-v1-<date>-<preset>` for all four presets | `5f87de1` |
| 2 | "removes nothing when the record is of today" | `expected [] to deeply equal [ …(4) ]` | no clearing on the same date (a guard written early in cycle 1 was taken out so this test could fail first) | `99ddf76` |
| 3 | "rewrites the record for today, with the same preset, so the next new day clears this one" | `expected { date: '2026-11-10', … } to deeply equal { date: '2026-11-11', … }` | the record rewritten; cycle 1's test now looks at solution records only, as the record sits beside them | `f605407` |
| 4 | (entry point; the scenario) | | `main.ts`, behind `newDay`: the date read again on opening, on the Today screen, and when the page comes back into view; an earlier day cleared; a puzzle already open stays open | `0c9224f` |

Cycle 2's first commit held its test failing (an edit did not apply, unseen behind a lint check); the code was
fixed and folded into the same unpushed commit before anything else.

**Acceptance GREEN**: AC-18, AC-19 and AC-20 on both flags-on phones.

**Coming back into view** (no scenario covers it; checked with a throwaway script on the flags-on build): opened on
10 November at Medium, the clock moved to 00:05 on 11 November and the page made visible again: Medium stayed on
screen, the record read 11 November, and 10 November's solution record was gone.

**Slice refactor**: nothing changed.

**Whole suite**: lint clean; no existing test changed; 454 unit tests; 59 engine scenarios; 372 phone and catalogue
scenarios. Still failing, as expected: AC-21, not yet built.

### AC-20: a phone that has never played

**Passed at RED** on the engine driver and both flags-on phones, as T059 expected: a phone with no record has
always opened the worked example, and AC-18's cycle 4 keeps "no record" as `'none'`, which opens nothing else.
Reported to the owner. **Proved by a reverted break**: `openLastPlayed` made to open today's Easy when there is no
record; AC-20 failed on both phones, "the worked example is on the play screen — Expected: true, Received: false".
Reverted; AC-20 passes again. No code or test added.
