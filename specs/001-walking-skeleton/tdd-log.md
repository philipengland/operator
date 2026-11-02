# TDD Log — Walking Skeleton (F0)

<!--
  Written by /speckit.implement as it works, one section per acceptance
  criterion and one entry per red-green-refactor cycle. Reviewed in the pull
  request; it is the trace from each acceptance criterion to the unit tests
  that delivered it.
-->

- **Spec**: `specs/001-walking-skeleton/spec.md`
- **Baseline**: 2026-11-02. Lint clean; type checks clean (app, engine, acceptance); 0 unit
  tests; build passes (JavaScript and CSS 0.5 KB gzipped). Approved scenarios, all red as
  expected (they are the outer-loop targets, not baseline failures):
  - `npm run test:acceptance:engine`: 22 of 22 fail (every untagged scenario).
  - `npm run test:acceptance:ui`: 55 of 55 fail (27 on `iphone`, 28 on `android`).
  - Every failure is an assertion against a default stub (for example
    `Error: top-right cell … Expected: 1, Received: "empty"`), not a missing driver.

## Setup notes

- **TypeScript pinned to 6.0.3** (owner's decision, option A): `typescript-eslint` 8.72.1
  supports TypeScript below 6.1 only. Recorded in ADR 0001.
- **npm audit**: 11 moderate findings, all one advisory (a `minimatch` denial-of-service
  weakness) in ESLint's and `typescript-eslint`'s dependency chain. These are development
  tools only; the game ships no dependencies (`npm ls --omit=dev` is empty). The only "fix"
  offered is a downgrade to ESLint 4, so no action was taken.
- **Engine boundary proven (T007)**. A scratch file in `src/engine/` importing
  `../app/main` and using `document`, `Math.random` and `Date` failed:
  - `npx tsc --project src/engine/tsconfig.json`: `error TS2584: Cannot find name 'document'.`
  - `npx eslint`: `no-restricted-imports` (outside import), `no-restricted-globals`
    (`document`, `Date`), `no-restricted-properties` (`Math.random`). 4 errors.
  - After deleting the file, both are clean.
- **Stub fix during the baseline**: the UI phone driver's stub layout first reported zero-sized
  boxes on a 0 × 0 screen. The two small-screen scenarios then passed vacuously in both phone
  projects. The stub now reports unknown (NaN) positions, and they fail as they should.
  Observation for the owner: `phone.expectEverythingOnScreen()` does not check that boxes
  have size. The real UI driver must report a missing element as an unknown position, never
  as a zero-sized box.

## AC-1: Given the game has just opened, when the player looks at the grid, then they see the given 6 in the top-left cell, three empty cells, row targets 8 and 6, column targets 3 and 6, + on Row 1, × on Column 2, Row 2 and Column 1 shown as not yet chosen, and the counter reading "Found 0 of 2"

- **Acceptance tests**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`
  - "shows the given 6, three empty cells, the targets, the shown operators and "Found 0 of 2"" (engine, iphone, android)
  - "shows each row target on the left and each column target above" (`@ui`: iphone, android)
- **Drivers added** (`95157ca`): engine `open()`, `view()`; UI `open()` (navigate, wait for the
  "Puzzle" group, axe scan), `view()` (reads accessible names); phone `layout()`. The launcher
  now runs Playwright through Node so `-g` arguments arrive intact.
- **Acceptance RED**:
  - engine: `Error: top-left cell should be given — Expected: true, Received: false`
  - iphone and android: `TimeoutError: locator.waitFor: Timeout 5000ms exceeded — waiting for getByRole('group', { name: 'Puzzle' }) to be visible`

### Cycle 1 — the worked example is the brief's 2 × 2 puzzle with two solutions

- **RED**: `workedExample › is the 2 × 2 puzzle from the project brief, with two solutions` in
  `src/engine/puzzles/worked-example.spec.ts` — failed: `AssertionError: expected { rows: +0, columns: +0, …(4) } to deeply equal { rows: 2, columns: 2, …(4) }`
- **GREEN**: puzzle data filled in — commit `8f239a1`. The engine import limit was made
  depth-aware first, because `../types` from `src/engine/puzzles/` was wrongly blocked; the
  boundary was re-proven at both depths — commit `de24966`.
- **REFACTOR**: none needed.

### Cycle 2 — an empty entry has every cell empty and every operator not chosen

- **RED**: `emptyEntry › has every cell empty and every operator not chosen, in the shape of the puzzle` in `src/engine/entry.spec.ts` — failed: `AssertionError: expected { cells: [], rowOperators: [], …(1) } to deeply equal { …(3) }`
- **GREEN**: built from the puzzle's rows, columns and lines — commit `0d9e044`
- **REFACTOR**: none needed.

### Cycle 3 — only the top-left cell is given

- **RED**: `isGiven › is true for the top-left cell of the worked example` in `src/engine/puzzle.spec.ts` — failed: `AssertionError: expected false to be true`. The three `false` rows passed against the stub's default; only the top-left row tested new behaviour.
- **GREEN**: reads the puzzle's givens — commit `352535e`
- **REFACTOR**: none needed.

### Cycle 4 — a session starts on the worked example, empty, with nothing found and no message

- **RED**: `startSession › starts on the worked example with an empty entry, nothing found and no message` in `src/app/session.spec.ts` — failed: `AssertionError: expected { puzzle: { rows: +0, …(5) }, …(3) } to deeply equal { puzzle: { rows: 2, …(5) }, …(3) }`
- **GREEN**: uses `workedExample` and `emptyEntry` — commit `845b081`
- **REFACTOR**: none needed.

### Cycle 5 — the counter reads "Found 0 of 2" for a new session

- **RED**: `counterText › reads "Found 0 of 2" when nothing has been found in the worked example` — failed: `AssertionError: expected '' to be 'Found 0 of 2'`
- **GREEN**: `Found ${found.size} of ${puzzle.solutionCount}` — commit `da96489`. The engine AC-1 scenario now passes.
- **REFACTOR**: none needed.

### Cycle 6 — cells are named by corner and content

- **RED**: `cellName › names the cell at row R, column C "…" when the game opens` (4 rows) in `src/app/labels.spec.ts` — failed: `expected '' to be 'Top-left cell, given 6'` (and the three "empty" names)
- **GREEN**: corner names plus "given N" or "empty"; entered digits wait for AC-2 — commit `3744b28`
- **REFACTOR**: none needed.

### Cycle 7 — lines are named "Row 1" to "Column 2"

- **RED**: `lineName › names <axis> <index> "…"` (4 rows) — failed: `expected '' to be 'Row 1'` (and the other three)
- **GREEN**: commit `737bdf3`
- **REFACTOR**: none needed.

### Cycle 8 — operators are named by line and choice

- **RED**: `operatorName › names <axis> <index> "…" when the game opens` (4 rows) — failed: `expected '' to be 'Row 1 operator, plus'` (and the other three)
- **GREEN**: shown operators by word, open ones "not chosen"; chosen operators wait for AC-6 — commit `68caf32`
- **REFACTOR**: none needed.

### View — the grid on the page

- `src/app/view.ts`, `main.ts`, `styles.css` render the grid per `contracts/play-screen.md`. The
  view only writes names and text from `labels.ts` and the session into the page, so its tests
  are the phone scenarios (research R3). Commit `9a0bc5a`.
- A UI driver bug read targets as `NaN` (`innerText` with a visually hidden prefix); the driver
  now reads text content — commit `81578cc`.
- Process slip: the view was refactored (split `build` into named steps) before its first green
  version was committed, so its green and refactor share commit `9a0bc5a`.

- **Acceptance GREEN**: AC-1 passes — engine 1 of 1; iphone 2 of 2 and android 2 of 2, axe clean.
  Full suite: 20 unit tests pass (lines 95.2%, branches 100%); lint and type checks clean;
  build 2.4 KB gzipped. Other scenarios that now pass early:
  - AC-4 "tapping the given 6 leaves it showing 6" and both AC-7 scenarios (engine and both
    phones): they pass only because the drivers' tap methods are still empty stubs. They are
    re-examined at AC-4 and AC-7 once tapping exists.
  - Both small-screen scenarios (both phones): a real pass; the grid fits at 320 × 568 and
    375 × 667 (T080).
- **Slice refactor**: `lineSpec(puzzle, line)` moved into the engine and used by the labels and
  the view — commit `33f9619`; `view.ts` `build` split into named steps (in `9a0bc5a`).
- **Checkpoint**: awaiting approval from Philip England.
