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
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-2: Given the top-right cell is empty, when the player taps it once, then it shows 1; when they tap it 6 more times, then it shows 7

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "one tap shows 1, and six more show 7" (engine, iphone, android)
- **Drivers added** (`3baae25`): engine `tapCell` dispatches a `tapCell` action; UI `tapCell` taps the cell's button by accessible name. The session reducer gained its `action` parameter (still returning the state unchanged).
- **Acceptance RED** (engine, iphone, android): `Error: top-right cell — Expected: 1, Received: "empty"`

### Cycle 1 — an empty cell steps to 1

- **RED**: `nextCellValue › steps an empty cell to 1` in `src/engine/cycles.spec.ts` — failed: `AssertionError: expected null to be 1`
- **GREEN**: returns 1 (hard-coded; the next test forces the rule) — commit `89d4cb2`
- **REFACTOR**: none needed.

### Cycle 2 — each digit from 1 to 8 steps to the next

- **RED**: `nextCellValue › steps %i to the next digit` (8 rows) — failed: `expected 1 to be 2` … `expected 1 to be 9`
- **GREEN**: `(value ?? 0) + 1`; 9 → empty is AC-3's rule — commit `bb651b9`
- **REFACTOR**: none needed.

### Cycle 3 — tapping a changeable cell in a session steps its value

- **RED**: `applyAction › tapCell › steps an empty changeable cell to 1` in `src/app/session.spec.ts` — failed: `AssertionError: expected null to be 1`
- **GREEN**: the reducer steps the tapped cell with `nextCellValue` — commit `12e65ee`. The engine AC-2 scenario now passes.
- **REFACTOR**: named the step `tapCell(state, position)` behind a `switch` on the action — commit `9fbb4a3`

### Cycle 4 — a cell's name includes the digit entered

- **RED**: `cellName › names a cell by the digit the player entered` in `src/app/labels.spec.ts` — failed: `AssertionError: expected 'Top-right cell, empty' to be 'Top-right cell, 7'`
- **GREEN**: given digit first, then the entered digit, else "empty" — commit `dea0630`
- **REFACTOR**: none needed.

### View — taps reach the session

- `view.ts` reports each cell tap as an action and shows entered digits; `main.ts` runs actions
  through the session and re-renders. `render` was split into cell and operator steps when the
  complexity limit (10) caught it — commit `a356903`. Phone AC-2 now passes.

- **Acceptance GREEN**: AC-2 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  31 unit tests pass (lines 96.7%, branches 96.2%); lint, type checks and build clean.
- **False pass found and fixed**: the UI driver read any cell value outside 1 to 9 as "empty",
  so a cell showing "10" (9 + 1, not yet AC-3's rule) made AC-3 and AC-5 pass on both phones
  while failing in-process. The driver now reports unrecognised cell and operator values as
  shown; AC-3 and AC-5 fail on the phones with `Received: "10"` — commit `5f13e8e`.
- **Still passing early**: AC-4 "tapping the given 6 leaves it showing 6" (all runs): a tap on the
  given cell does change the hidden entry, but the given digit always wins on screen. Both AC-7
  scenarios: operator tapping is not built yet. Both small-screen scenarios: real passes.
- **Slice refactor**: none beyond the cycle refactors.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-3: Given the bottom-left cell shows 9, when the player taps it, then the cell is empty again

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "tapping a cell that shows 9 empties it" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: engine `Error: bottom-left cell — Expected: "empty", Received: 10`; iphone and android `Received: "10"`.

### Cycle 1 — 9 steps back to empty

- **RED**: `nextCellValue › steps 9 back to empty` in `src/engine/cycles.spec.ts` — failed: `AssertionError: expected 10 to be null`
- **GREEN**: 9 (`HIGHEST_DIGIT`) returns `null` — commit `aa98c7f`
- **REFACTOR**: none needed.

- **Acceptance GREEN**: AC-3 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  32 unit tests pass (lines 97.0%, branches 96.4%); lint, type checks and build clean.
- **Now passing early**: AC-5 (all runs). Its rule (only 1 to 9 or empty, in order) is fully
  delivered by AC-2 and AC-3's cycles. To be reported at AC-5's RED step.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-4: Given the top-left cell holds the given 6, when the player taps it, then it still shows 6 and looks visibly different from cells the player can change

- **Acceptance tests**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`
  - "tapping the given 6 leaves it showing 6" (engine, iphone, android)
  - "the given 6 looks different from a cell the player can change, not by colour alone" (`@ui`: iphone, android)
- **Drivers added** (`84440fd`): phone `look(cell)` reads colours (text, background, border) apart
  from non-colour markings (border style and width, font weight and style, background pattern,
  text decoration).
- **Acceptance RED**:
  - "tapping the given 6 leaves it showing 6" **passed at RED** in all runs (reported to the owner
    at AC-2 and again here): the screen always shows the given digit. Underneath, the tap still
    stepped a hidden entry value, so cycle 1 below test-drives the session to ignore it (FR-004),
    as agreed with the owner.
  - look scenario, iphone and android: `Error: top-left cell should be marked differently from top-right, not by colour alone — Expected: not "border solid 2px | font 400 normal | pattern none | decoration none"`

### Cycle 1 — a session ignores taps on a given cell

- **RED**: `applyAction › tapCell › ignores a tap on the given cell` in `src/app/session.spec.ts` — failed: the hidden entry under the given 6 changed (`- null` / `+ 1` in `entry.cells[0][0]`)
- **GREEN**: `tapCell` returns the state unchanged when `isGiven` — commit `b93d295`
- **REFACTOR**: none needed.

### View — the given cell stands out

- The given cell is `aria-disabled="true"` and styled with a bold digit, a 4 px border and a
  hatched background: three non-colour differences — commit `404bad5`. The look scenario now
  passes on both phones.
- Driver: Playwright refuses to tap an `aria-disabled` element unless forced, though a finger
  can. The UI driver now forces the tap for such elements — commit `a32a8eb`.

- **Acceptance GREEN**: AC-4 passes — engine 1 of 1, iphone 2 of 2, android 2 of 2, axe clean.
  Full suite: 33 unit tests pass (lines 97.1%, branches 96.7%); lint, type checks and build
  clean (2.7 KB gzipped).
- **Still passing early**: AC-5 (all runs, delivered by AC-2 and AC-3); both AC-7 scenarios
  (operator tapping not built yet); both small-screen scenarios (real passes).
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-5: Given an empty cell, when the player taps it ten times, then it shows 1, 2, 3, 4, 5, 6, 7, 8, 9 and then is empty again, and never shows 0 or any other character

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "ten taps show 1 to 9 in order and then empty, never 0" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: **passed at RED** in all runs (engine 1 of 1, iphone 1 of 1, android 1 of 1). Reported to the owner at the AC-4 checkpoint. The rule is fully delivered by AC-2 (empty → 1, each digit → the next) and AC-3 (9 → empty); `nextCellValue` returns only `Digit | null`, so 0 cannot appear.
- **Decision**: owner chose option (a) on 2026-11-02 — record AC-5 as delivered by AC-2 and AC-3, write no new code, and move to AC-6. T027 (cycles only if red) was skipped.
- **Acceptance GREEN**: AC-5 passes in all runs; no code changed.
- **Checkpoint**: approved by Philip England on 2026-11-02 (option a).

## AC-6: Given Row 2's operator is not yet chosen, when the player taps it five times, then it shows +, then −, then ×, then ÷, then + again

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "five taps on Row 2 show +, −, ×, ÷ and then + again" (engine, iphone, android)
- **Drivers added** (`007ed82`): engine `tapOperator` dispatches a `tapOperator` action; UI `tapOperator` taps the operator's button by accessible name (forcing the tap on `aria-disabled` buttons, as a finger can).
- **Acceptance RED** (engine, iphone, android): `Error: Row 2 operator after each tap` — expected `["+", "−", "×", "÷", "+"]`, received `["not chosen", "not chosen", "not chosen", "not chosen", "not chosen"]`

### Cycle 1 — the first tap on an operator not yet chosen gives +

- **RED**: `nextOperator › steps an operator that is not chosen to +` in `src/engine/cycles.spec.ts` — failed: `AssertionError: expected '÷' to be '+'`. The return type has no empty value, so the stub returned `÷`, chosen so the test could not pass falsely.
- **GREEN**: returns `+` (hard-coded; the next test forces the cycle) — commit `cb54451`
- **REFACTOR**: none needed.

### Cycle 2 — operators cycle + → − → × → ÷ → +

- **RED**: `nextOperator › steps %s to %s` (4 rows) — failed: `expected '+' to be '−'`, `'×'`, `'÷'` (the `÷ → +` row passed against the hard-coded `+`)
- **GREEN**: `OPERATOR_CYCLE` in order, wrapping after `÷` — commit `8e0122e`
- **REFACTOR**: none needed.

### Cycle 3 — tapping an open line's operator in a session steps it

- **RED**: `applyAction › tapOperator › chooses + on the open row 1` and `… column 0` in `src/app/session.spec.ts` — failed: `expected null to be '+'` (both)
- **GREEN**: the reducer steps the tapped line's operator with `nextOperator` — commit `8b7515b`. The engine AC-6 scenario now passes.
- **REFACTOR**: none needed.

### Cycle 4 — an open operator is named by the player's choice

- **RED**: `operatorName › names an open operator by the choice %s as "%s"` (4 rows) in `src/app/labels.spec.ts` — failed: `expected 'Row 2 operator, not chosen' to be 'Row 2 operator, plus'` (and minus, times, divide)
- **GREEN**: the shown operator, else the entry's choice — commit `54053ac`
- **REFACTOR**: "the operator a line works with" moved into the engine as `lineOperator(puzzle, entry, line)`, used by the labels and then the view — commit `319bd89`

### View — operator taps reach the session

- Operator buttons report taps as actions; an open operator shows the chosen symbol in place
  of "?" — commit `e02d045`. Phone AC-6 now passes.

- **Acceptance GREEN**: AC-6 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  44 unit tests pass (lines 97.9%, branches 95.6%); lint, type checks and build clean.
- **False pass found and fixed**: once Solution A could be filled in, the AC-18 "no network
  requests" scenario passed on both phones because the phone driver's
  `networkRequestsSinceOpening()` stub returned 0. It now reports an unknown count (NaN) until
  AC-18 builds it — commit `6c5bff0`.
- **Still passing early**: both AC-7 scenarios (all runs). A tap on a shown operator still steps
  a hidden entry value, but `lineOperator` always returns the shown operator, so nothing
  visible changes — the same situation as AC-4. To be reported at AC-7.
- **Slice refactor**: none beyond the cycle refactor.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-7: Given the player taps Row 1's + or Column 2's ×, then the operator does not change

- **Acceptance tests**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "tapping Row 1's + leaves it as +" and "tapping Column 2's × leaves it as ×" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: **passed at RED** in all runs (engine 2 of 2, iphone 2 of 2, android 2 of 2),
  as reported at the AC-6 checkpoint: `lineOperator` always returns a shown operator, so nothing
  visible changes. Underneath, a tap still recorded a hidden choice. As agreed with the owner,
  cycle 1 test-drives the session to ignore it (FR-005).

### Cycle 1 — a session ignores taps on a shown operator

- **RED**: `applyAction › tapOperator › ignores a tap on the shown operator of row 0` and `… column 1` in `src/app/session.spec.ts` — failed: a hidden choice was recorded (`- null` / `+ "+"` in `rowOperators[0]`; likewise `columnOperators[1]`)
- **GREEN**: `tapOperator` returns the state unchanged unless the line is open — commit `fc0a66d`
- **REFACTOR**: none needed.

- **Acceptance GREEN**: AC-7 passes — engine 2 of 2, iphone 2 of 2, android 2 of 2. Full suite:
  46 unit tests pass (lines 98.0%, branches 95.7%); lint, type checks and build clean.
  Every scenario now passing is either a criterion completed so far (AC-1 to AC-7) or a real
  small-screen pass; no vacuous passes remain.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-8: Given the player has entered top-right 2, bottom-left 2, bottom-right 3, Row 2 × and Column 1 ÷ (Solution A), when they submit, then the game says the puzzle is solved and the counter reads "Found 1 of 2"

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "Solution A is accepted and the counter reads "Found 1 of 2"" (engine, iphone, android)
- **Drivers added** (`161bc8a`): engine `check()` dispatches `submit`, `view().result` maps the session's message kind, `announcementCount()` counts messages shown; UI `check()` taps "Check" and runs axe, `view().result` reads the message from the status region, `announcementCount()` counts batches of text added to the polite status region (MutationObserver installed at open).
- **Message wording** (drafted for the owner's content review, EXC-005): "New solution found!", "New solution found! You've found every solution.", "You've already found this solution.", "Not solved yet.", "Fill every cell and choose every operator before checking."
- **Acceptance RED** (engine, iphone, android): `Error: what the game says — Expected: "new solution", Received: null`

### Cycle 1 — a + line adds its digits: 6 + 2 is 8

- **RED**: `evaluateLine › adds the digits of a + line: 6 + 2 is 8` in `src/engine/evaluate-line.spec.ts` — failed: `expected { ok: true, value: +0 } to deeply equal { ok: true, value: 8 }`
- **GREEN**: sums the digits — commit `47ee746`
- **REFACTOR**: none needed.

### Cycle 2 — −, × and ÷ lines are worked out step by step in reading order

- **RED**: `evaluateLine › works out 6 − 3 as 3`, `2 × 3 as 6`, `6 ÷ 2 as 3` — failed: `value: 9 … 3`, `5 … 6`, `8 … 3` (the stub still added)
- **GREEN**: each step applies the line's operator to the running result, first digit onward — commit `f67b37b`
- **REFACTOR**: none needed.
- **Not written**: a separate test for a longer line (the brief's 8 − 3 − 2 = 3) would have passed on first run against the step-by-step working, so it would not be a valid red.

### Cycle 3 — Solution A is solved, keyed "2,2,3|×|÷"

- **RED**: `checkEntry › finds Solution A solved, keyed by its entered digits and chosen operators` in `src/engine/check-entry.spec.ts` — failed: `expected { kind: 'not-solved' } to deeply equal { kind: 'solved', key: '2,2,3|×|÷' }`
- **GREEN**: every row and column is worked out against its target; the key is the entered digits in reading order, then the open rows' operators, then the open columns' (data-model "SolutionKey"). A line with a gap is treated as missing its target until AC-11 — commit `9b63891`
- **REFACTOR**: none needed.

### Cycle 4 — a session records a new solution and says so

- **RED**: `applyAction › submit › records a new solution and says so` in `src/app/session.spec.ts` — failed: `expected Set{} to deeply equal Set{ '2,2,3|×|÷' }`
- **GREEN**: a solved check adds its key to `found` with message `new-solution` — commit `be83fd1`. The engine AC-8 scenario now passes; "Found 1 of 2" follows from `found.size`.
- **REFACTOR**: none needed.

### Cycle 5 — the new-solution message reads "New solution found!"

- **RED**: `messageText › says "New solution found!" for a new solution` in `src/app/labels.spec.ts` — failed: `expected '' to be 'New solution found!'`
- **GREEN**: commit `d40a5ec`
- **REFACTOR**: none needed.

### View — Check shows the result

- The status region holds a message line and the counter in one polite live region; Check
  dispatches `submit` — commit `eb374c2`. Phone AC-8 now passes, axe clean after Check.

- **Acceptance GREEN**: AC-8 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  53 unit tests pass (lines 97.6%, branches 91.0%); lint, type checks and build clean.
- **Vacuous pass found and fixed**: AC-18 "with no connection, Solution A is still accepted" passed
  on both phones because the phone driver's `loseConnection()` was an empty placeholder. It is an
  action, so it cannot report "unknown"; it was built ahead of AC-18 instead
  (`context.setOffline(true)`) — commit `8bca0d1`. The scenario still passes with the connection
  really cut: a genuine early pass (⚠️ in tasks.md).
- **Now passing early, genuinely**: AC-14 (the found set never counts a solution twice) and AC-16
  (Check never clears the grid), all runs. To be reported at their RED steps.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-9: Given the player has entered top-right 2, bottom-left 9, bottom-right 3, Row 2 − and Column 1 − (Row 2 gives 9 − 3 = 6, but Column 1 gives 6 − 9, which goes below zero), when they submit, then the game says the puzzle is not solved yet and the counter still reads "Found 0 of 2"

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "bottom-left 9 meets Row 2 but Column 1 goes below zero, so the puzzle is not solved" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED** (engine, iphone, android): `Error: what the game says — Expected: "not solved yet", Received: null`
- **Note**: 6 − 9 = −3 already misses Column 1's target of 3, so the grid was already "not solved"
  without a below-zero rule; the scenario's gap was the session's message. The below-zero rule is
  still the spec's (FR-008, edge case "going below zero"), so cycle 1 test-drives it in the engine.

### Cycle 1 — a step that goes below zero fails its line

- **RED**: `evaluateLine › fails a line at the step that goes below zero: 6 − 9` in `src/engine/evaluate-line.spec.ts` — failed: `expected { ok: true, value: -3 } to deeply equal { ok: false, …(2) }`
- **GREEN**: the line is worked one step at a time and stops at the first step below zero, returning `{ ok: false, reason: 'below-zero', step }` — commit `c550c6e`
- **REFACTOR**: none needed.
- **Not written**: a `checkEntry` test for the below-zero example would pass on first run (the grid was already "not solved"), so it would not be a valid red.

### Cycle 2 — a session says "not solved" and records nothing when a line misses

- **RED**: `applyAction › submit › says the grid is not solved, and records nothing, when a line misses` in `src/app/session.spec.ts` — failed: `expected null to be 'not-solved'`
- **GREEN**: an unsolved check sets message `not-solved` and leaves `found` alone — commit `c081f9a`
- **REFACTOR**: none needed.

### Cycle 3 — the not-solved message reads "Not solved yet."

- **RED**: `messageText › says "Not solved yet." when a line misses` — failed: `expected '' to be 'Not solved yet.'`
- **GREEN**: messages moved into a table keyed by message kind — commit `405524f`
- **REFACTOR**: none needed.

- **Acceptance GREEN**: AC-9 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  56 unit tests pass (lines 98.9%, branches 94.2%); lint, type checks and build clean.
- **Now passing early, genuinely**:
  - AC-10 (all runs): 6 ÷ 4 = 1.5 already misses its target, so the grid is "not solved". The
    inexact-division rule itself still needs its engine cycle at AC-10.
  - AC-20 "tapping the given 6 after "not solved yet" leaves the message in place" (all runs):
    messages never clear yet. The other AC-20 scenario (a changeable tap clears it) is still red.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-10: Given the player has entered top-right 2, bottom-left 4, bottom-right 3, Row 2 + and Column 1 ÷ (Column 1 gives 6 ÷ 4, which is not a whole number), when they submit, then the game says the puzzle is not solved yet and the counter does not change

- **Acceptance test**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "Column 1 gives 6 ÷ 4, so the puzzle is not solved" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: **passed at RED** in all runs (engine 1 of 1, iphone 1 of 1, android 1 of 1), as
  reported at the AC-9 checkpoint: 6 ÷ 4 = 1.5 already misses Column 1's target of 3. As agreed
  with the owner, the inexact-division rule (FR-008, edge case "inexact division") is still
  test-driven in the engine.

### Cycle 1 — a step that does not divide exactly fails its line

- **RED**: `evaluateLine › fails a line at the step that does not divide exactly: 6 ÷ 4` in `src/engine/evaluate-line.spec.ts` — failed: `expected { ok: true, value: 1.5 } to deeply equal { ok: false, …(2) }`
- **GREEN**: a ÷ step with a remainder returns `{ ok: false, reason: 'inexact-division', step }` — commit `eec9262`
- **REFACTOR**: none needed.

- **Acceptance GREEN**: AC-10 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  57 unit tests pass; lint, type checks and build clean. No new early passes.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-11: Given the bottom-right cell is empty, or Column 1's operator is not yet chosen, when the player submits, then the game says every cell and every open operator must be filled before checking, and the counter does not change

- **Acceptance tests**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "with the bottom-right cell empty, …" and "with Column 1's operator not chosen, …" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED** (engine 2, iphone 2, android 2): `Error: what the game says — Expected: "fill everything first", Received: "not solved yet"`

### Cycle 1 — an empty changeable cell makes the check incomplete, naming the cell

- **RED**: `checkEntry › is incomplete, naming the cell, when a changeable cell is empty` in `src/engine/check-entry.spec.ts` — failed: `expected { kind: 'not-solved' } to deeply equal { kind: 'incomplete', …(2) }`
- **GREEN**: empty changeable cells are listed before any line is worked out — commit `5de6741`
- **REFACTOR**: none needed.

### Cycle 2 — an unchosen open operator makes the check incomplete, naming the line

- **RED**: `checkEntry › is incomplete, naming the line, when an open operator is not chosen` — failed: `expected { kind: 'not-solved' } to deeply equal { kind: 'incomplete', …(2) }`
- **GREEN**: lines whose operator is still `null` are listed too — commit `937ef51`
- **REFACTOR**: the AC-8 "a gap misses its target" rule can no longer be reached; its guard
  now only narrows the types, and its comment says so — commit `54aa121`

### Cycle 3 — a session asks for everything to be filled first, and records nothing

- **RED**: `applyAction › submit › asks for everything to be filled first, and records nothing, when the grid has a gap` in `src/app/session.spec.ts` — failed: `expected 'not-solved' to be 'incomplete'`
- **GREEN**: an unsolved check's kind (`incomplete` or `not-solved`) becomes the message — commit `e12c505`
- **REFACTOR**: none needed.

### Cycle 4 — the incomplete message reads "Fill every cell and choose every operator before checking."

- **RED**: `messageText › asks for every cell and operator to be filled when the grid has a gap` — failed: `expected '' to be 'Fill every cell and choose every oper…'`
- **GREEN**: commit `49b3c5a`
- **REFACTOR**: none needed.

- **Acceptance GREEN**: AC-11 passes — engine 2 of 2, iphone 2 of 2, android 2 of 2. Full suite:
  61 unit tests pass (lines 99.0%, branches 95.1%); lint, type checks and build clean. No new
  early passes.
- **Slice refactor**: none beyond cycle 2's.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-20: Given the game has just said the puzzle is not solved yet, when the player taps the bottom-left cell, then the message disappears without anything being announced and the counter does not change; when they instead tap the given 6, then the message stays

- **Acceptance tests**: `test/acceptance/play/solve-puzzle.acceptance-spec.ts` — "tapping bottom-left after "not solved yet" removes the message silently" and "tapping the given 6 after "not solved yet" leaves the message in place" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**:
  - "removes the message silently" (all runs): `Error: what the game says — Expected: null, Received: "not solved yet"`
  - "leaves the message in place" **passed at RED** (all runs), as reported at the AC-9 and AC-11
    checkpoints: messages never cleared, and the session already ignores taps on the given cell.

### Cycle 1 — a tap on a changeable cell clears the message

- **RED**: `applyAction › tapCell › clears the message, because the grid it described has changed` in `src/app/session.spec.ts` — failed: `expected 'not-solved' to be null`
- **GREEN**: `tapCell` sets `message: null`; the given-cell guard comes first, so the given 6 keeps the message — commit `b6eef67`
- **REFACTOR**: none needed.

### Cycle 2 — changing an open operator clears the message

- **RED**: `applyAction › tapOperator › clears the message when an open operator changes` — failed: `expected 'not-solved' to be null`
- **GREEN**: `tapOperator` sets `message: null` after its shown-line guard — commit `67dac3a`. The engine AC-20 scenarios now pass.
- **REFACTOR**: none needed.

### View — clearing is silent

- The phone runs then failed: `Error: announcements to screen-reader users — Expected: 19, Received: 20`.
  The view rewrote the unchanged counter on every render, replacing text inside the polite live
  region, which screen readers may announce again; the count of 19 before the tap shows it
  happened on every tap. The view now writes status text only when it changes — commit `24bb809`
  (`fix:`). Phone AC-20 now passes.

- **Acceptance GREEN**: AC-20 passes — engine 2 of 2, iphone 2 of 2, android 2 of 2. Full suite:
  63 unit tests pass (lines 99.0%, branches 95.1%); lint, type checks and build clean.
- **Slice refactor**: none needed.

## US1 through the UI (T050)

- Every US1 scenario (AC-1 to AC-11, AC-20): engine 15 of 15, iphone 17 of 17, android 17 of 17,
  axe clean on every page visited.
- Layout guarantees measured with Playwright (WebKit iPhone SE and Chromium Pixel 5, at 375 × 667
  and 320 × 568, reduced motion on): 9 buttons, smallest 48 px; `touch-action: manipulation` on
  the game; all four `env(safe-area-inset-*)` insets used; 0 animated or transitioning elements;
  no page scroll. Real-device safe-area checks remain manual (quickstart section 6).
- **Checkpoint**: User Story 1 (the MVP) complete; awaiting approval from Philip England.
- **Checkpoint**: User Story 1 approved by Philip England on 2026-11-02.

## AC-12: Given the counter reads "Found 1 of 2" after Solution A, when the player changes bottom-left to 3, Row 2 to + and Column 1 to − (Solution B) and submits, then the game says this is a new solution and that every solution has been found, and the counter reads "Found 2 of 2"

- **Acceptance test**: `test/acceptance/play/find-solutions.acceptance-spec.ts` — "Solution B after Solution A is new, every solution is found, and the counter reads "Found 2 of 2"" (engine, iphone, android)
- **Drivers added**: none (both drivers already map the `all-found` message).
- **Acceptance RED** (engine, iphone, android): `Error: what the game says — Expected: "new solution, every solution found", Received: "new solution"`
- **Not written**: the planned test that Solution B's key is `"2,3,3|+|−"` would pass on first run, because `checkEntry` is already general, so it would not be a valid red.

### Cycle 1 — a new solution that completes the set says every solution is found

- **RED**: `applyAction › submit › says every solution has been found when a new solution completes the set` in `src/app/session.spec.ts` — failed: `expected 'new-solution' to be 'all-found'`
- **GREEN**: when the found set reaches the puzzle's `solutionCount`, the message is `all-found` — commit `c2f9e49`
- **REFACTOR**: none needed.

### Cycle 2 — the all-found message reads "New solution found! You've found every solution."

- **RED**: `messageText › says every solution has been found when the last new one is found` in `src/app/labels.spec.ts` — failed: `expected '' to be 'New solution found! You've found eve…'`
- **GREEN**: commit `0022972`
- **REFACTOR**: none needed.

- **Acceptance GREEN**: AC-12 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  65 unit tests pass (lines 99.0%, branches 95.2%); lint, type checks and build clean.
- **Now passing early, genuinely**: AC-15 (all runs): `all-found` depends only on how many
  solutions are found, so B then A also finds every solution. Already passing: AC-14, AC-16.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-02.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-13: Given the counter reads "Found 1 of 2" after Solution A, when the player submits Solution A again, then the game says this solution has already been found and the counter still reads "Found 1 of 2"

- **Acceptance test**: `test/acceptance/play/find-solutions.acceptance-spec.ts` — "Solution A again is already found and the counter stays at "Found 1 of 2"" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED** (engine, iphone, android): `Error: what the game says — Expected: "already found", Received: "new solution"`

### Cycle 1 — checking a found solution again says so and records nothing new

- **RED**: `applyAction › submit › says a solution has already been found, and records nothing new, when it is checked again` in `src/app/session.spec.ts` — failed: `expected 'new-solution' to be 'already-found'`
- **GREEN**: a solved key already in `found` gives message `already-found` and leaves `found` alone — commit `1f3d083`
- **REFACTOR**: none needed.

### Cycle 2 — the already-found message reads "You've already found this solution."

- **RED**: `messageText › says a solution checked again has already been found` in `src/app/labels.spec.ts` — failed: `expected '' to be 'You've already found this solution.'`
- **GREEN**: commit `6015aa1`
- **REFACTOR**: with all five message kinds worded, the table is now a complete `Record`, so the compiler requires wording for any new kind — commit `4e26258`

- **Acceptance GREEN**: AC-13 passes — engine 1 of 1, iphone 1 of 1, android 1 of 1. Full suite:
  67 unit tests pass; lint, type checks and build clean.
- **Slice refactor**: none beyond cycle 2's.
- **Checkpoint**: approved by Philip England on 2026-11-02.

## AC-14: Given the counter reads "Found 2 of 2", when the player submits Solution B again, then the counter still reads "Found 2 of 2"

- **Acceptance test**: `test/acceptance/play/find-solutions.acceptance-spec.ts` — "Solution B again leaves the counter at "Found 2 of 2"" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: **passed at RED** in all runs (engine 1 of 1, iphone 1 of 1, android 1 of 1). Reported to the owner at the AC-13 checkpoint. Delivered by AC-13: a key already in `found` gives `already-found` and leaves `found` unchanged, so the count cannot pass `solutionCount`.
- **Decision**: owner chose option (a) on 2026-11-02 — record AC-14 as delivered by AC-13, write no new code. T058 (cycles only if red) was skipped.
- **Acceptance GREEN**: AC-14 passes in all runs; no code changed.
- **Checkpoint**: approved by Philip England on 2026-11-02 (option a).

## AC-15: Given the player has submitted Solution B first, when they then submit Solution A, then the game says every solution has been found and the counter reads "Found 2 of 2"

- **Acceptance test**: `test/acceptance/play/find-solutions.acceptance-spec.ts` — "Solution A after Solution B finds every solution and the counter reads "Found 2 of 2"" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: **passed at RED** in all runs (engine 1 of 1, iphone 1 of 1, android 1 of 1). Reported to the owner at the AC-12 and AC-13 checkpoints. Delivered by AC-12: `all-found` depends only on the size of `found`, not on which solution came first.
- **Decision**: owner chose option (a) on 2026-11-02 — record AC-15 as delivered by AC-12, write no new code. T061 was skipped.
- **Acceptance GREEN**: AC-15 passes in all runs; no code changed.
- **Checkpoint**: approved by Philip England on 2026-11-02 (option a).

## AC-16: Given a solution has just been accepted, when the player looks at the grid, then their digits and operators are still in place for them to change

- **Acceptance test**: `test/acceptance/play/find-solutions.acceptance-spec.ts` — "after Solution A is accepted, the player's digits and operators are still in place" (engine, iphone, android)
- **Drivers added**: none.
- **Acceptance RED**: **passed at RED** in all runs (engine 1 of 1, iphone 1 of 1, android 1 of 1). Reported to the owner at the AC-13 checkpoint. Delivered by AC-8: `submit` has never changed the entry; it only sets `found` and `message` (FR-015).
- **Decision**: owner chose option (a) on 2026-11-02 — record AC-16 as delivered by AC-8, write no new code. T064 was skipped.
- **Acceptance GREEN**: AC-16 passes in all runs; no code changed.
- **Checkpoint**: approved by Philip England on 2026-11-02 (option a).

## User Story 2 complete (T066)

- Every US1 and US2 scenario run through all three projects on 2026-11-02:
  engine 20 of 20, iphone and android 44 of 44 (`solve-puzzle` and `find-solutions`), with
  the axe scan (wcag2a, wcag2aa, wcag22aa) after opening and after each Check clean in every
  phone run.
- Remaining failures belong to User Story 3 and Polish, not yet started: AC-19 (engine);
  AC-18 network requests, AC-21 offline reload and the Android speed budget (phones).

## AC-17: Given a change has been merged to main, when the pipeline finishes, then the public address serves the new version without anyone deploying by hand

- **Acceptance test**: `test/acceptance/delivery/publish.acceptance-spec.ts` — "once the pipeline finishes, the public address serves the merged version" (`after-publish` project, no browser; runs only when `ACCEPTANCE_PUBLIC_URL` is set)
- **Drivers added** (`12963ac`, `a84c13f`): delivery `mergedVersion` (the commit the build is labelled with, found the same way as the build) and `versionAtPublicAddress` (fetches the address with a cache-busting query and reads `<meta name="version">`; failures are reported as the version seen).
- **Acceptance RED** (2026-11-02, `ACCEPTANCE_PUBLIC_URL=https://philipengland.github.io/operator/`): `Error: version at the public address — Expected: "9c9b490…", Received: "nothing published (HTTP 404 from https://philipengland.github.io/operator/)"`. Nothing is published: the GitHub repository does not exist yet.

### Preparation — move the version lookup where it can be tested

- **REFACTOR**: the lookup moved from `vite.config.ts` to `tools/build-version.ts` with no behaviour change; added `tools/tsconfig.json` to the type check — commit `757ad06`
- **Tests written after the code** (`5661657`): Setup T004 wrote the lookup untested. Three tests (GitHub's commit wins, git commit otherwise, "unknown" without git) **passed on first run**; each was shown to fail when its branch of the lookup was broken, then the code was restored.

### Cycle 1 — label the build with the checked-out commit

- **Decision**: owner chose on 2026-11-02 that the checked-out git commit wins, with `GITHUB_SHA` as the fallback. A rollback run (`workflow_dispatch` with `ref`) checks out an older commit, but GitHub does not let a workflow change `GITHUB_SHA`, so the old order labelled rolled-back pages with the wrong version. This changes T068's stated order.
- **Guard first**: `uses the commit GitHub Actions names when git cannot be read` — passed on first run (the old order already gave this); it keeps the fallback through the change.
- **RED**: `buildVersion › uses the checked-out commit even when GitHub Actions names a different one` in `tools/build-version.spec.ts` — failed: `expected 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345…' to be '0f9e8d7c6b5a49382716f5e4d3c2b1a098765…'`
- **GREEN**: read git first, fall back to `GITHUB_SHA`, then "unknown" — commit `9c9b490`
- **REFACTOR**: none needed. The delivery driver now uses the same lookup (`a84c13f`).

### Pipeline

- `.github/workflows/ci-deploy.yml` (`e5d03b3`; authorised by T068): `verify` on every pull request and push to `main` (lint, type checks, unit tests with coverage, build, cached Playwright browsers, both acceptance drivers, upload `dist/`); `deploy` needs `verify`, runs only on `main`, publishes with `actions/deploy-pages`, then runs the `after-publish` project against the deployment URL. Workflow permissions `contents: read`; `deploy` adds only `pages: write` and `id-token: write`. Every action is pinned to a commit SHA resolved from its release tag. The exceptions check is added with T075.
- `2cc4936`: the config imports the lookup with its `.ts` extension, clearing a new Vite warning.
- Full suite after the cycle: 71 unit tests pass (lines 99.1%, branches 96.5%); lint, type checks and build clean; engine 20 passed, UI 50 passed (remaining failures are AC-18, AC-19, AC-21 and the Android budget, not yet started).
- **Acceptance GREEN**: **blocked** — needs the GitHub repository, Pages set to "GitHub Actions", and a merge to `main` (T069).
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-18: Given the game has loaded, when the device loses its connection, then the player can still fill in, check and find solutions, and the game makes no network requests after it has loaded

- **Acceptance tests**: `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` — "with no connection, Solution A is still accepted and the counter reads "Found 1 of 2"" and "playing to a solution makes no network requests after the game opens" (iphone, android)
- **Drivers added**: `loseConnection` (`context.setOffline(true)`, built earlier because a placeholder let the offline scenario pass without going offline); `networkRequestsSinceOpening` (records every page request and counts those after the page's last `load` event) — commit `38e0bde`.
- **Acceptance RED**: **passed at RED** on both phones (4 of 4), as T070 predicted. Nothing in the game uses the network after loading, and the CSP sets `connect-src 'none'`.
- **Counter proven**: with a temporary image request on every tap added to `src/app/main.ts` and the game rebuilt, the scenario failed on both phones: `network requests after opening — Expected: 0, Received: 15`. The change was reverted and the game rebuilt; no product code changed.
- **Decision**: owner chose option (a) on 2026-11-05 — record AC-18 as delivered by construction (no request after load; CSP `connect-src 'none'`), write no new code. T071 (cycles only if red) was skipped.
- **Acceptance GREEN**: AC-18 passes on both phones; no product code changed.
- **Checkpoint**: approved by Philip England on 2026-11-05 (option a).

## AC-19: Given a change fails the build, unit tests or acceptance tests, when the pipeline runs, then nothing is published and the public address keeps serving the previous version

- **Acceptance tests**: `test/acceptance/delivery/publish.acceptance-spec.ts` — "only changes merged to main are published" and "publishing happens only after the build, unit tests and acceptance tests succeed" (engine)
- **Acceptance RED** (stub driver): `branches that can publish — Expected ["main"], Received []` and `"build" must succeed before publishing — Received array: []`.
- **Driver added** (`38be746`): `publishingRoute` parses `.github/workflows/ci-deploy.yml`. It finds the job that runs `actions/deploy-pages`; `publishesFrom` comes from that job's `github.ref == 'refs/heads/…'` condition (with no condition, from whatever starts the pipeline; a condition with `||` is reported as unclear); `mustSucceedFirst` names the steps of every job it `needs`, directly or indirectly, mapping `npm run build`, `npm test` and `npm run test:acceptance` to "build", "unit tests" and "acceptance tests". Only steps that always run and stop the job on failure count.
- **With the real driver both scenarios passed**, because the pipeline was written during AC-17 (T068). Each break was then tried and reverted (T073):
  - `needs: verify` removed → `"build" must succeed before publishing — Received array: []`
  - the `main` condition removed → `Received: "any branch (pull_request)", "any branch (workflow_dispatch)"` added
  - the unit test step removed → `Expected value: "unit tests" — Received array: ["build", "acceptance tests"]`
  - `continue-on-error: true` on the acceptance step → `Expected value: "acceptance tests" — Received array: ["unit tests", "build"]`

### Supporting check — exceptions expiry (Baseline 9, T075)

- **Cycle 1 RED**: `findExpiryProblems › fails an exception whose expiry date has passed, naming it` in `tools/check-exceptions.spec.ts` — failed: `expected [] to deeply equal [ 'EXC-002 expired on 2027-11-01' ]`. **GREEN**: every exception reported as expired (a later test forces the comparison) — `ddbec9f`.
- **Cycle 2 RED**: `passes an exception that expires on 2027-11-02 / 2028-01-01, today or later` — failed: `expected [ 'EXC-001 expired on 2027-11-02' ] to deeply equal []`. **GREEN**: compare ISO dates as text — `b2fe606`.
- **Cycle 3 RED**: `fails an exception whose review date is after its expiry date` — failed: `expected [] to deeply equal [ Array(1) ]`. **GREEN**: a second rule per exception — `f8ff947`.
- **Cycle 4 RED**: `readExceptions › reads the dates from every exception record, skipping the template` — first run did not compile (a scripted edit put line breaks inside two strings; not a valid red, fixed), then failed: `expected [] to deeply equal [ { id: 'EXC-007', …(2) } ]`. **GREEN**: parse the front matter of each `EXC-*.md` with `yaml` — `aef1fb2`. **REFACTOR**: named the step that reads one record — `037a780`.
- `npm run exceptions:check` (`862bf9a`) passes today's date to the check and exits 1 on any problem; it is excluded from coverage as glue. With EXC-002's expiry temporarily set to 2026-01-01 it printed `EXC-002 expired on 2026-01-01` and exited 1; restored. It runs first in `verify` (`0b95c3f`).

- **Acceptance GREEN**: AC-19 passes (engine 2 of 2). Full suite: 76 unit tests pass (lines 99.2%, branches 95.6%); lint, type checks and build clean; engine 22 of 22; phones 52 passed, failing only AC-21 (next) and the Android speed budget (Polish).
- **Slice refactor**: none beyond cycle 4's.
- **Manual part (outstanding)**: after the first failing `verify` run on `main`, confirm the public address still serves the previous version (acceptance.md). Needs the pipeline live (pull request 5).
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-21: Given the player has opened the game once, when they reload it with no connection, then the game does not load (no offline reload in F0)

- **Acceptance test**: `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` — "after opening the game once, reloading with no connection does not load it" (iphone, android)
- **Drivers added** (`6615d5a`): `reload` (`page.reload()`, treating the offline navigation failure as the expected outcome) and `isGameShowing`.
- **First driver, by visibility alone**: Android passed; iPhone failed with `the game is showing — Expected: false, Received: true`. A probe showed why: Chromium fails the reload with `net::ERR_INTERNET_DISCONNECTED` and shows its error page, but Playwright's WebKit fails it with "WebKit encountered an internal error" and leaves the **old page in place** (its navigation entry was still the first load). The game had not loaded again; real Safari shows "Safari Can't Open the Page". This was a driver problem, not product behaviour.
- **Driver corrected**: the page is marked before the reload, and the game counts as showing only on a page that really loaded with the puzzle visible.
- **Acceptance RED**: with the corrected driver, **passed at RED** on both phones, as T077 predicted. The game has no service worker or offline cache (FR-016).
- **Driver proven**: with `loseConnection` temporarily left online, the reload loaded the game and both phones failed with `Expected: false, Received: true`; restored.
- Full suite: 76 unit tests pass; engine 22 of 22; phones 54 passed, failing only the Android speed budget (Polish, T080–T081).
- **Decision**: owner chose option (a) on 2026-11-05 — record AC-21 as delivered by construction (no service worker or offline cache), write no new code. T078 (cycles only if red) was skipped.
- **Acceptance GREEN**: AC-21 passes on both phones; no product code changed.
- **Checkpoint**: approved by Philip England on 2026-11-05 (option a).
