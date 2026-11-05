# TDD Log — Live Line Calculations (spec-002)

<!--
  Written by /speckit.implement as it works, one section per acceptance
  criterion and one entry per red-green-refactor cycle. Reviewed in the pull
  request; it is the trace from each acceptance criterion to the unit tests
  that delivered it.
-->

- **Spec**: `specs/002-live-calculations/spec.md`
- **Baseline**: 2026-11-05, after T001 (contracts moved to `docs/contracts/`, commit `5aef4ad`):
  - `npm run lint`: clean.
  - `npm test`: 10 files, 76 unit tests, all passing.
  - `npm run test:acceptance:engine`: 22 passed, 13 failed. The 22 are every spec-001
    scenario, including the reworded AC-9. The 13 are the approved spec-002 scenarios, which
    fail with `TypeError: Cannot read properties of undefined (reading 'Row 1')` because no
    driver fills in `workings` yet. They are the outer-loop targets, not baseline failures.
  - `npm run typecheck`: 5 errors, all `Property 'workings' is missing`, in the four Layer 3
    files the approved driver contract changed: `default-view.ts` (1),
    `game.engine-driver.ts` (1), `game.ui-driver.ts` (1) and `phone.ui-driver.ts` (2,
    `layout()` and `EMPTY_LAYOUT`). T003 closes them with default values.

## Setup notes

- **T001**: contracts moved to `docs/contracts/` with `git mv`, so their history follows them.
  `specs/001-walking-skeleton/contracts/README.md` points there. Links updated in `AGENTS.md`,
  the header comments of `src/app/labels.ts`, `src/app/view.ts`, `src/engine/index.ts`,
  `src/engine/types.ts` and the two UI driver files, and in the spec-002 contract change files.
  spec-001's plan, data model, tasks and TDD log keep their old links, as a record of F0.
- **T003, driver contract gap closed with defaults only.** `DEFAULT_VIEW.workings` is every
  line `{ working: '', mark: 'none' }`; both game drivers return it; the UI phone driver
  reports `NO_BOX` (unknown, NaN position) for every working. Then:
  - `npm run typecheck` and `npm run lint`: clean.
  - `npm run test:acceptance:engine`: 22 passed, 13 failed, each on its assertion, e.g.
    `Error: Row 1 working … Expected: "6 + ?" Received: ""`.
  - `npm run test:acceptance:ui -- -g "spec-002"`: 32 failed (16 on each phone), each on its
    assertion, including the layout ones (`Row 1 working is right of the top-left cell`,
    `Row 1 working is on screen without scrolling`). None passes against the defaults.
- **T004, T005**: `docs/contracts/engine-api.md` and `docs/brief/project-brief.md` updated
  before the code (commit `13a06b1`). The contract's data-model link, broken by T001's move,
  was fixed in the same commit.

## FR-208 and AC-12's rule: results below zero count (pull request 1)

No acceptance scenario changes outcome: spec-001 AC-9 still ends "not solved" (now because
6 − 9 = −3 misses Column 1's target of 3), and no spec-002 scenario can pass until the
workings are on screen. The rule is driven by unit tests.

### Cycle 1 — a line may go below zero

- **RED**: the existing spec-001 test "fails a line at the step that goes below zero: 6 − 9"
  in `src/engine/evaluate-line.spec.ts` was **rewritten to the new rule** (research R6), not
  deleted, as "works out a line that goes below zero: 6 − 9 is −3 (spec-002 FR-208)". Failed:
  `AssertionError: expected { ok: false, …(2) } to deeply equal { ok: true, value: -3 }`,
  received `"reason": "below-zero", "step": 1`. The old rule was still in the code, so this is
  the expected failure.
- **GREEN**: removed the below-zero check from `evaluateLine`; `LineResult`'s failure reason
  narrows to `'inexact-division'` in `src/engine/types.ts`. 76 unit tests pass; type checks
  and lint clean. "Fails … 6 ÷ 4" still passes unchanged — commit `1ff9bd2`.
- **REFACTOR**: none needed.

### Cycle 2 — Check accepts a row that reaches a negative target ⚠️ passed at RED

- **RED**: "finds a grid solved when a row goes below zero to reach a negative target
  (spec-002 FR-208)" in `src/engine/check-entry.spec.ts`, on a test puzzle with one row
  (6 − ?, target −3) and single-cell columns with targets 6 and 9, so the row decides.
  **Passed on its first run**: cycle 1's change already delivers it, because `checkEntry`
  compares each line's `evaluateLine` result with its target. Predicted before running.
- **Proof**: reinstating a below-zero failure in `evaluateLine` (reverted with
  `git checkout`) made it fail: `expected { kind: 'not-solved' } to deeply equal
  { kind: 'solved', key: '9||' }`. Kept as the unit test of FR-208 for Check — commit
  `bc32ebf` (`test:`, no production change).
- **REFACTOR**: none needed.

### Comment — the session's below-zero test

- `src/app/session.spec.ts` "says the grid is not solved … when a line misses": comment now
  gives the reason "6 − 9 = −3, not its target of 3 (spec-002 FR-208)"; assertion unchanged —
  commit `4badc67`.

### T007 — full suite

- `npm run exceptions:check`: 4 exceptions, 0 problems. `npm run lint`, `npm run typecheck`:
  clean.
- `npm test`: 77 unit tests pass (76 + cycle 2). Coverage: 99.21% statements, 95.5% branches.
- `npm run build`: JS 2.77 KB + CSS 0.90 KB gzipped, well within 30 KB.
- `npm run test:acceptance:engine`: 22 spec-001 scenarios pass, including the reworded AC-9;
  the 13 spec-002 scenarios fail on their working assertions, as approved.
- `npm run test:acceptance:ui -- --grep-invert "spec-002"`: 55 passed (both phones, speed
  budgets on Android).
- **Checkpoint**: approved by Philip England on 2026-11-05, including cycle 2 as delivered (passed at RED, proven by a reverted break).

### T008 — pull request 1, as a draft

- Pushed `002-live-calculations` and opened **draft** pull request #7, "spec-002 part 1 of 2:
  results below zero".
- **Gap found and decided**: `main` requires `verify`, which runs every approved acceptance
  scenario. The 13 spec-002 scenarios cannot pass until part 2, so part 1 cannot merge on its
  own. The owner chose (2026-11-05): keep #7 as a draft for review, build part 2 on the same
  branch, and merge once when every spec-002 scenario passes. No scenario is skipped and the
  pipeline is unchanged. Recorded in `plan.md` (Delivery) and `tasks.md` (T008, T045).
- **Lesson for later features**: a feature whose approved scenarios need more than one pull
  request cannot merge its early parts while `verify` runs them all. Plan the split around
  that, or decide up front how undelivered scenarios are handled.

## T009 — contracts before the code

`docs/contracts/play-screen.md` gains the row and column workings (name format, not a live
region, layout, what the UI driver reads, the 320 × 568 guarantee); `docs/contracts/engine-api.md`
gains `LineOutcome`, `LineWorking`, `lineWorking`, its guarantee and examples — commit
`65a194d`.

## AC-1: when the game has just opened, each line shows its working with ? for each gap, a row's on its right and a column's below it, and none is marked

- **Acceptance tests**: `test/acceptance/play/see-line-working.acceptance-spec.ts` —
  "each line shows its given digits and operators, with ? for everything not yet filled in"
  (engine and both phones) and "each row's working is on its right and each column's is
  underneath" (`@ui`).
- **Driver work (T010)** — commit `a1cfdf1`: the engine driver reports `lineWorkings(session)`
  through `workingText` and maps each outcome to its mark; the UI driver reads the text named
  `/^<Line> working, /` inside "Puzzle" and splits off ", target reached" or ", not a whole
  number"; the phone driver reads the box of the element around each name (the slot on
  screen). Stubs: `lineWorkings` returns `[]`, `workingText` returns `''`; the engine gains the
  `LineOutcome` and `LineWorking` types.
- **Acceptance RED**: engine `Error: Row 1 working … Expected: "6 + ?" Received: ""`; both
  phones the same, and the layout scenario `Row 1 working is right of the top-left cell …
  Expected: true Received: false`.

### Cycle 1 — a line's working lists its digits and operator

- **RED**: `lineWorking › gives Row 1 on opening as 6, an empty cell and +, with no result
  yet` in `src/engine/line-working.spec.ts` — failed: received `"digits": []`,
  `"operator": null` from the stub, expected `[6, null]` and `"+"`.
- **GREEN**: `lineWorking` reads the line's digits in reading order and its operator; outcome
  `incomplete`. "A line's digits in reading order" moved from `check-entry.ts` into
  `line-working.ts`, and `check-entry.ts` imports it — commit `af8b97d`.
- **REFACTOR**: none needed.

### Cycle 2 — the session gives every line's working, rows then columns

- **RED**: `lineWorkings › gives every line's working on opening, rows then columns` in
  `src/app/session.spec.ts` — failed: `expected [] to deeply equal [ { …(3) }, … ]`. (A
  first run failed to compile on a quote in the test name; fixed before the real red.)
- **GREEN**: `lineWorking` exported from the engine; `lineWorkings` works out each row, then
  each column — commit `0837ea5`.
- **REFACTOR**: none now. Listing every line is now in both `session.ts` and
  `check-entry.ts`; left for T032, which moves `checkEntry` onto `lineWorking`.

### Cycle 3 — a working is written with ? for each gap

- **RED**: `workingText › writes $text for an unfinished line, with ? for each gap`
  (`it.each`: "6 + ?", "? ? ?", "6 ? ?", "? × ?") in `src/app/labels.spec.ts` — failed:
  `expected '' to be '6 + ?'` and likewise for each.
- **GREEN**: digits joined by the operator, "?" for each gap (`GAP_MARK`) — commit
  `d780580`. AC-1's first scenario now passes on the engine driver.
- **REFACTOR**: none needed.

### Cycle 4 — each working has an accessible name

- **RED**: `workingName › names a working by its line, then the working: "Row 1 working,
  6 + ?"` — failed: `expected '' to be 'Row 1 working, 6 + ?'`.
- **GREEN**: `<line name> working, <working text>` — commit `3853b2b`.
- **REFACTOR**: none needed.

### Cycle 5 — the result slot of an unfinished line shows "= ?"

- **RED**: `resultText › shows "= ?" in the result slot while a line is unfinished` — failed:
  `expected '' to be '= ?'`.
- **GREEN**: returns `= ?` for now; AC-2 forces results — commit `bf8b5ea`.
- **REFACTOR**: none needed.

### Cycle 6 — the screen shows each working (view, no unit test)

- **RED**: the AC-1 UI scenarios above (`Row 1 working … Received: ""`; `… right of the
  top-left cell … false`). `view.ts` is DOM code without unit tests, as in spec-001.
- **GREEN**: `view.ts` adds a slot right of each row and below each column: a visually hidden
  name and visible text marked `aria-hidden="true"`, not in a live region, both written with
  `writeText`. `styles.css`: one more grid column (`auto`) and row; the slot wraps
  (`overflow-wrap: anywhere`) — commit `c0b6f06`. All four AC-1 UI runs pass, axe clean.
- **Note**: the first UI run after the change still failed, because the UI driver serves the
  built `dist/` and it was stale. **Run `npm run build` before `npm run test:acceptance:ui`**
  (CI builds first). The RED at T010 was unaffected: neither build had workings.
- **REFACTOR**: none needed.

- **Acceptance GREEN**: lint and type checks clean; 85 unit tests pass (99.29% statements,
  96.77% branches); engine 24 passed (22 spec-001, AC-1, and the "cell cleared again" edge
  case); phones 65 passed (55 spec-001 including their layout and small-screen checks, AC-1
  ×4, the edge case ×2, the spec-002 small-screen scenarios ×4). Failing: only the spec-002
  criteria not started yet.
- **Passing early, to be proven later**: "[spec-002 edge case] a cell cleared again" and
  "[spec-002 edge case] small screens" now pass. They are handled, each driver proven by a
  reverted break, at T030 and T031 as planned.
- **Slice refactor**: the three label tests share one named `ROW_1_ON_OPENING` working —
  commit `a9d0efa`.
- **Checkpoint**: awaiting the owner.
