# TDD Log — Solution Log (spec-006)

- **Spec**: `specs/006-solution-log/spec.md`
- **Baseline**: 2026-11-09, on `main` (`3e23718`): 279 unit, 48 engine and 267 phone tests, all passing. Lint and types clean.

## Part 1: library additions (T004 to T017)

Scenarios that this part makes pass: `[spec-003 AC-1]`. The approved vocabulary came over unchanged from `df93d38`, confirmed by blob. Drivers
got stubs returning empty defaults; each story's part replaces them.

Each new piece was a failing unit test on its assertion, then the smallest code:

| Behaviour | RED |
| --- | --- |
| A puzzle has an identity | `expected undefined to be 'worked-example'` |
| A Surface can be tapped | `expected [ 'surface', 'surface--panel' ] to deeply equal [ …, 'surface--tappable' ]` |
| A Button can be read-only | `expected [ 'button', 'button--cell' ] to deeply equal [ …, 'button--read-only' ]` |
| A read-only given cell keeps its look | `… to include 'button--read-only-given'` |
| A Grid cell can be read-only | `expected undefined to be true` |
| Dialog | `expected { name: '', classes: [] } to deeply equal { name: 'Clear all solutions?', … }` |
| Confirm dialog | `expected { …(2) } to deeply equal { confirmButton: …, … }` |
| Solution list: rows, text rows, way back, empty line, Start again, header | each failed on its assertion |
| Solution view: way back | `expected { label: '', style: 'key' } to deeply equal { label: 'Back', style: 'key' }` |
| The catalogue lists the new parts | three `library.spec.ts` assertions |

**Found along the way, and corrected:**

- **A test of mine overwrote an existing one.** Creating `src/engine/puzzles/worked-example.spec.ts` replaced a file that already existed, deleting
  "is the 2 × 2 puzzle from the project brief". Noticed because the unit count came out one short; restored, and it now also pins `id`.
- **Screens may not use Text directly** (lint, FR-304). The new screens are headed by the existing Operator header instead, whose bubble holds the
  heading and an empty list's line. Speech bubble gained `isTitleHeading`. The tier rule was not suppressed.
- **The grid's "read-only" lives in the cells**, not in Puzzle grid: the game passes read-only cells and shown pills, so Puzzle grid only hides an
  empty helper line (T009).
- **Rows' shadows were cut off** by the scrolling area, seen in a screenshot of the catalogue.

**Passing**: `[spec-003 AC-1]` and every catalogue scenario. Commits:

- `db9dcb1` test(acceptance): bring the approved vocabulary for spec-006, with driver stubs
- `47d6ad5` feat(engine): a puzzle has an identity (spec-006 FR-613)
- `13cdbeb` feat(ui): a Surface can be something to tap (spec-006 FR-601)
- `d74d623` feat(ui): a Button can be read-only (spec-006 FR-606)
- `0f81e5b` feat(ui): a read-only given cell keeps its look (spec-006 AC-7)
- `2f4cd34` feat(ui): a Grid cell can be read-only (spec-006 FR-606)
- `d041dcf` feat(ui): the Solutions counter can be tapped (spec-006 FR-601)
- `6441351` feat(ui): Dialog, a pop-up over the screen (spec-006 FR-608)
- `a8b9440` feat(ui): Confirm dialog, a question and two answers (spec-006 FR-608)
- `6591b12` feat(ui): the Solution list shows each solution (spec-006 FR-602)
- `5b4aed0` feat(ui): rows are text until they can be opened (spec-006 R13)
- `ed92f81` feat(ui): the Solution list has a way back (spec-006 FR-604)
- `1642942` feat(ui): the Solution list says when it is empty (spec-006 FR-603)
- `3aa05d4` feat(ui): the Solution list offers a way to start again (spec-006 FR-608)
- `42b3509` feat(ui): the Solution view shows a found solution (spec-006 FR-606)
- `f967c40` feat(ui): the new screens are headed by the Operator header (spec-006, FR-304)
- `d39c5e5` feat(catalogue): list and show the new parts (spec-006, spec-003 AC-1)
- `e6eae96` test(engine): the worked example test pins its identity, and is restored
- `64fdb06` fix(ui): the Solution list leaves room for its rows' shadows

## Part 2: User Story 1, the list (T018 to T025)

Scenarios: `solution-list.acceptance-spec.ts`, unchanged from `df93d38` (blob confirmed).

**Existing test amended, with the owner's approval first (2026-11-09)**: `session.spec.ts`, what a new session starts with, gains `solutions: []` and
`place: { kind: 'play' }`. Two approach changes avoided amending any other: `found` stays a Set with `solutions` beside it, and `playScreenProps` needs no
`features` at all (the counter's action is given only with `log` on, in `main.ts`). New tests are in new files, as even an import line in an existing
test file counts as amending it.

| Criterion | Acceptance RED | Unit cycles |
| --- | --- | --- |
| AC-1 | `locator.tap: Test timeout` (the counter is not a button) | `openList`; the empty line's wording; the list's props |
| AC-2, AC-3, AC-4 | `solutions listed, in order` | a new solution is kept; in the order found; rows are named by number |
| AC-5 (first scenario) | `the screen showing — Expected: "puzzle", Received: "solution list"` | `showPlace`; a history entry says its screen; anything else is the puzzle |

**Reported — passed before their own code**, each proven by a reverted break:

| Criterion | Break | Failure |
| --- | --- | --- |
| AC-5, second scenario | going back clears the message | `the speech bubble` |
| AC-6 | a row has no spoken name | `solutions as a screen reader hears them` |
| AC-25 | the phone's back is ignored | `the screen showing — Expected: "puzzle", Received: "solution list"` |
| Edge: reloading with the list open | reopens on the list | `the screen showing — Expected: "puzzle", Received: "solution list"` |
| AC-4 (unit) | a repeat is kept again | `expected [ …, … ] to deeply equal [ … ]` |

**Checked by hand**: focus moves to the heading "Solutions" on arrival and to the counter on return, at 375 × 667 and 320 × 568; no approved scenario covers it in this
story. Players' build (flag off): the counter is not a button. No overflow at either size. Commits:

- `4609f4e` feat(app): the list can be opened (spec-006 AC-1)
- `e1d21cc` feat(app): what an empty list says (spec-006 AC-1)
- `8af052b` feat(app): the counter opens the list (spec-006 AC-1)
- `37e497e` feat(app): a new solution is kept (spec-006 AC-2)
- `ff5a597` feat(app): solutions are kept in the order found (spec-006 AC-3)
- `016c8fd` test(app): a repeat is listed once (spec-006 AC-4)
- `bd60cb7` feat(app): each solution is named by its number (spec-006 AC-2)
- `32df17a` feat(app): going back leaves the puzzle as it was (spec-006 AC-5)
- `1750583` feat(app): a history entry says which screen it is for (spec-006 AC-5)
- `b2c6baa` feat(app): back returns to the puzzle, by the screen or the phone (spec-006 AC-5, AC-25)

## Part 3: User Story 2, reopening (T027 to T035)

Scenarios: `reopen-solution.acceptance-spec.ts`, unchanged from `df93d38` (blob confirmed). **No existing test was amended.**

- **AC-7, acceptance RED**: `locator.tap: Test timeout` (rows were text). Unit cycles, each failing on its assertion first: `openSolution`; a solution that does not exist shows the list;
  the view's heading; that solution's digits; nothing to tap; no helper line; a history entry for a solution, and a bad number as the puzzle; rows can be opened once released.
- **Refactor**: the puzzle grid mapping became `puzzleGridProps`, so the view shares the live grid's mapping.

**Reported — passed before their own code**, each proven by a reverted break:

| Criterion | Break | Failed |
| --- | --- | --- |
| AC-8 | cells stay buttons | on both phones |
| AC-9 | opening loads it into the grid | on both phones |
| AC-10 | cells have no spoken name | on both phones |
| AC-26 | opening adds no history entry | on both phones |
| AC-27 | always the first solution | on both phones |

Commits:

- `d180956` feat(app): a found solution can be opened (spec-006 AC-7)
- `208d0f3` feat(app): a solution that does not exist shows the list (spec-006 FR-606)
- `e2b59d0` refactor(app): the puzzle grid mapping can be reused
- `bfbe3e8` feat(app): a solution is headed by its number (spec-006 AC-7)
- `ea7ed74` feat(app): the view shows that solution (spec-006 AC-7)
- `f56ca78` feat(app): nothing in the view can be tapped (spec-006 AC-8)
- `af37716` feat(app): the view has no helper line (spec-006 AC-8)
- `fcbc889` feat(app): a history entry can be for a solution (spec-006 AC-26)
- `a07ddd7` feat(app): a history entry with a bad number is the puzzle (spec-006 FR-606)
- `56c953c` feat(app): rows can be opened once released (spec-006 AC-7)
- `ab3786e` feat(app): a found solution opens in its read-only view (spec-006 AC-7)
- `7e3e5bc` test(acceptance): the driver has no unused stub

## Release: the list and the read-only view (T026, T036)

- The owner reviewed the flags-on build on a phone, together, on 2026-11-09 ("looks great"), as the plan allows.
- `log` and `reopen` set true in `src/app/features.ts`. Their scenario files now run on the game's own phones.

## Part 4: User Story 3, starting again (T037 to T044)

Scenarios: `start-again.acceptance-spec.ts`, unchanged from `df93d38` (blob confirmed).

**Existing test amended, with the owner's approval first (2026-11-09)**: `session.spec.ts`, what a new session starts with, gains `isConfirming: false` (FR-608), the third line approved.

- **AC-11, acceptance RED**: `locator.tap: Test timeout` (no "Start again"). **AC-12, acceptance RED**: `the empty list` (nothing cleared).
- Unit cycles, each failing on its assertion first: asks first; keeping changes nothing; offered once released; not offered with nothing found; going back closes the pop-up; starting again clears everything and stays on the list.
- **Refactor**: actions around the puzzle moved to `applyLogAction`, after lint reported a complexity of 12.

**Reported — passed before their own code**, each proven by a reverted break, on both phones:

| Criterion | Break |
| --- | --- |
| AC-13 | starting again keeps the found set |
| AC-28, focus inside | the pop-up is not modal |
| AC-28, focus returned | focus goes to the heading |
| Edge: nothing to clear | offered with nothing found |
| Edge: the phone's back | going back clears everything |
| Edge: a double-tap | the pop-up sits where "Start again" was |

Commits:

- `f13d5f4` feat(app): starting again asks first (spec-006 AC-11)
- `47e8b5e` feat(app): keeping the solutions changes nothing (spec-006 AC-11)
- `03b1e21` feat(app): the list offers Start again once released (spec-006 AC-11)
- `9f7ce13` feat(app): nothing to clear, nothing offered (spec-006 FR-608)
- `b3152ed` feat(app): going back closes the pop-up (spec-006 edge case)
- `af9c267` feat(app): the pop-up asks before clearing (spec-006 AC-11)
- `7d97128` feat(app): starting again clears everything (spec-006 AC-12)
- `10011a1` refactor(app): actions around the puzzle have their own function

## Release: starting again (T045)

- The owner reviewed the flags-on build on a phone on 2026-11-09 ("looks great").
- `startAgain` set true in `src/app/features.ts`. Its scenario file now runs on the game's own phones.

## Part 5: User Story 4, remembering (T046 to T055)

Scenarios: `remember-solutions.acceptance-spec.ts`, unchanged from `df93d38` (blob confirmed). **No existing test was amended.**

- **AC-14, acceptance RED**: `counter — Expected: "Found 1 of 2", Received: "Found 0 of 2"`.
- **Unit cycles**, each failing on its assertion first: restoring; the agreed format under the puzzle's own key; reading back; adding to what is stored; unreadable text and the wrong shape as nothing saved; a filling
  that does not solve the puzzle dropped; entries of the wrong shape dropped; a solution saved twice counted once; a newer format unreadable, and never overwritten; only a new solution saved; starting again removing the record;
  the browser store reading, writing, removing, and carrying on when refused.
- **AC-22**: `(spec-006 AC-22)` in `solution-store.spec.ts`. It and two other save rules passed on first run, proven by reverted breaks (a save that rewrites from nothing; one key for every puzzle).

**Reported — passed before their own code**, each proven by a reverted break, on both phones:

| Criterion | Break | Failure |
| --- | --- | --- |
| AC-15 | nothing restored on opening | `counter — Received: "Found 0 of 2"` |
| AC-16 | restored but not counted as found | `the speech bubble` |
| AC-17 | only the first restored | `the counter shows — Received: "Solutions found 1 of 2"` |
| AC-18 | starting again leaves the record | `counter — Received: "Found 1 of 2"` |
| AC-19 | a refused save throws | `counter — Received: "Found 0 of 2"` |
| AC-20 | unreadable data throws | the game never opens |
| AC-21 | any shaped filling is kept | `solutions listed, in order` |

**A limit of AC-15**: the driver leaves the game for another page and returns in the same tab, because one driver holds one page. Really closing the tab is on the owner's phone review.

Commits:

- `0d540c7` feat(app): saved solutions can be restored (spec-006 AC-14)
- `897b9d2` feat(app): a found solution is written in the agreed format (spec-006 AC-14)
- `6d36dd8` feat(app): saved solutions are read back (spec-006 AC-14)
- `ce02321` feat(app): each save adds to what is stored (spec-006 AC-17)
- `a917264` feat(app): an unreadable record is nothing saved (spec-006 AC-20)
- `49fcd7d` feat(app): a record of the wrong shape is nothing saved (spec-006 AC-20)
- `065bd91` feat(app): a saved filling must solve the puzzle (spec-006 AC-21)
- `264b5af` feat(app): a saved entry must have the right shape (spec-006 FR-611)
- `2bbf364` feat(app): a solution saved twice counts once (spec-006 FR-611)
- `da10f11` feat(app): a newer format cannot be read (spec-006 FR-614)
- `7222cab` feat(app): a newer record is never overwritten (spec-006 FR-614)
- `45eca39` test(app): saves keep other tabs, replace junk, and stay per puzzle (spec-006 AC-22)
- `446ae0b` feat(app): a new solution is saved when found (spec-006 AC-14)
- `5711e64` feat(app): only a new solution is saved (spec-006 AC-16)
- `f48fe0d` feat(app): starting again removes the saved record (spec-006 AC-18)
- `bffaf4b` feat(app): the browser store reads (spec-006 AC-14)
- `d3aca20` feat(app): the browser store writes and removes (spec-006 AC-18)
- `e639c4d` feat(app): a refused read is nothing saved (spec-006 AC-19)
- `d69f496` feat(app): a refused save is ignored (spec-006 AC-19)
- `af1e5eb` feat(app): solutions are remembered on the phone (spec-006 AC-14)

## Part 6: User Story 5, very large totals (T057 to T059)

Unit tests only, as `acceptance.md` records: no puzzle can reach these until F7. **No existing test was amended**: the new tests are added to `session.spec.ts` and `screen.spec.ts` in their own `describe` blocks.

- **AC-24, RED**: `expected 'Found 3 of 101' to be 'Found 3'`, then GREEN in `counterText`.
- **AC-24 on the screen, RED**: `expected 101 to be undefined`, then GREEN in `playScreenProps`.

**Reported — passed before its own code**: AC-23 (a total of 100 is shown), because every total was shown until AC-24 added the limit. Proven by a reverted break (`>=` for `>` in `totalToShow`): `expected 'Found 3' to be 'Found 3 of 100'` and `expected undefined to be 100`.

Commits:

- `f740958` test(app): a total of 100 is shown (spec-006 AC-23)
- `aee5213` feat(app): a total over 100 is left out of the words (spec-006 AC-24)
- `e25a4e2` feat(app): the counter leaves out a total over 100 (spec-006 AC-24)

## Flags removed (T060)

`log`, `reopen`, `startAgain` and `remember` are removed, all four having been released. No behaviour changes. Four tests in `solution-list.spec.ts` changed, agreed with the owner first and recorded in `test-changes.md`.

## Owner sign-off on a real phone (SC-606)

The owner reviewed the flags-on build on a real phone before each flag was turned on, on 2026-11-09: the list and the reopened view (#32), "Start again" (#34, "looks great") and remembering, including really closing the tab (#36, "looks good").

The hallway playtests (SC-602) have not been run: T061 stays open until the owner has.
