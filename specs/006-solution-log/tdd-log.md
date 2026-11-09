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
