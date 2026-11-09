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
