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
