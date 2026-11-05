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
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-2: after top-right becomes 2, Row 1 reads "6 + 2 = 8" and Column 2 reads "2 × ?"

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "top-right 2 makes Row 1
  "6 + 2 = 8" and Column 2 "2 × ?"".
- **Acceptance RED** (no new driver code): engine and both phones `Error: Row 1 working …
  Expected: "6 + 2 = 8" Received: "6 + 2"`.

### Cycle 1 — a complete line's working gives its result

- **RED**: `lineWorking › works out Row 1 as 6 + 2 = 8 once top-right is 2, reaching its
  target of 8` — failed: `expected { kind: 'incomplete' } to deeply equal { kind: 'result',
  value: 8, …(1) }`.
- **GREEN**: a line with every digit and an operator is worked out with `evaluateLine`;
  `reachesTarget` hard-coded true for now. A division that is not whole stays `incomplete`
  until AC-9 drives `not-whole` — commit `786b3b7`.
- **REFACTOR**: none needed.

### Cycle 2 — the working says whether the line reaches its target

- **RED**: `lineWorking › works out Row 1 as 6 + 3 = 9 once top-right is 3, missing its target
  of 8` — failed: received `reachesTarget: true`, expected `false`.
- **GREEN**: compares the result with the line's target (`lineSpec`), passed in as one
  `LineParts` object — commit `f102312`.
- **REFACTOR**: none needed.

### Cycle 3 — a complete line's working ends with its result

- **RED**: `workingText › adds the result once the line is complete: "6 + 2 = 8"` — failed:
  `expected '6 + 2' to be '6 + 2 = 8'`.
- **GREEN**: appends ` = <value>` for a `result` — commit `ce68dd8`. AC-2 passes on the
  engine driver.
- **REFACTOR**: none needed.

### Cycle 4 — the slot shows a result that misses its target

- **RED**: `resultText › shows the result of a line that misses its target: "= 9"` — failed:
  `expected '= ?' to be '= 9'`.
- **GREEN**: `= <value>` for a `result` — commit `539d3c9`.
- **REFACTOR**: none needed.

### Cycle 5 — the slot ticks a line that reaches its target

- **RED**: `resultText › marks a line that reaches its target with a tick: "= 8 ✓"` — failed:
  `expected '= 8' to be '= 8 ✓'`.
- **GREEN**: appends `✓` (`TARGET_REACHED_MARK`) when `reachesTarget` — commit `6bfdf58`.
- **REFACTOR**: none needed.

- **Acceptance GREEN**: lint and type checks clean; 90 unit tests (99.34% statements, 96.19%
  branches); build 4.1 KB gzipped. Engine 32 passed, 3 failed (AC-4, AC-8, AC-9). Phones 75
  passed, 12 failed (AC-4, AC-6, AC-7, AC-8, AC-9, AC-11 on each).
- **Passing early, reported at their own RED**: on the engine driver AC-3, AC-5, AC-6, AC-7,
  AC-10, AC-11, the cleared-cell edge case and the not-announced check; on the phones AC-3,
  AC-5, AC-10, the edge cases and the not-announced check.
  **AC-6, AC-7 and AC-11 pass on the engine but not on the phones**: the engine driver takes
  the mark from the outcome itself, while the UI driver reads it from the name, which does not
  yet say ", target reached" (AC-6's planned cycle). So for marks, only the UI driver tests the
  app's wording.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-3: after top-right 2 and bottom-right 3, Column 2 reads "2 × 3 = 6" ⚠️ passed at RED

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "top-right 2 and bottom-right
  3 make Column 2 "2 × 3 = 6"".
- **Acceptance RED**: **passed on its first run**, on the engine and both phones, as
  `tasks.md` predicted: AC-1 and AC-2 build every line's working the same way, columns
  included.
- **Driver proof**: a deliberate break, `workingText` adding the result for rows only, made it
  fail on the engine and both phones: `Error: Column 2 working … Expected: "2 × 3 = 6"
  Received: "2 × 3"`. Reverted with `git checkout`, rebuilt; passes again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## AC-4: with bottom-left 2 and bottom-right 3, each tap on Row 2's operator shows "2 + 3 = 5", "2 − 3 = −1", "2 × 3 = 6"

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "with bottom-left 2 and
  bottom-right 3, each tap on Row 2's operator changes its working".
- **Driver work** — commit `dc8e6f5`: the UI driver reads a name's spoken negative result
  ("= minus 1") back as shown ("= −1"), as the play-screen contract specifies. No change to
  the engine driver.
- **Acceptance RED**: engine and both phones `Error: Row 2 working after each tap`,
  expected `"2 − 3 = −1"`, received `"2 − 3 = -1"` (a hyphen-minus), as `tasks.md` predicted.

### Cycle 1 — a result below zero is written with the minus sign

- **RED**: `workingText › writes a result below zero with the minus sign U+2212, not a hyphen:
  "2 − 3 = −1"` — failed: `expected '2 − 3 = -1' to be '2 − 3 = −1'`.
- **GREEN**: `shownNumber` writes a negative number with `MINUS_SIGN` (U+2212) — commit
  `7e8f04d`. AC-4 passes on the engine driver.
- **REFACTOR**: none needed.

### Cycle 2 — the working's name speaks a result below zero as "minus"

- **RED**: `workingName › speaks a result below zero as "minus": "Row 2 working, 2 − 3 =
  minus 1"` — failed: `expected 'Row 2 working, 2 − 3 = −1' to be 'Row 2 working, 2 − 3 =
  minus 1'`.
- **GREEN**: the working is described once (`describeWorking`) with a number writer:
  `shownNumber` for the text, `spokenNumber` ("minus 1") for the name, because some screen
  readers skip or misread U+2212 before a number (research R2) — commit `9bdfa82`.
- **REFACTOR**: none needed.

### Cycle 3 — the slot shows a result below zero with the minus sign

- **RED**: `resultText › shows a result below zero with the minus sign: "= −1"` — failed:
  `expected '= -1' to be '= −1'`.
- **GREEN**: the slot uses `shownNumber` — commit `321af9b`.
- **REFACTOR**: none needed.

- **Acceptance GREEN**: lint and type checks clean; 93 unit tests (99.36% statements, 95.41%
  branches); build 4.1 KB gzipped. Engine 34 passed, 1 failed (AC-9). Phones 79 passed, 8
  failed (AC-6, AC-7, AC-9, AC-11 on each).
- **Passing early**: AC-8 ("6 − 9 = −3", unmarked) now passes on the engine and both phones,
  as `tasks.md` predicted; it is reported at its own RED (T033).
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-5: with bottom-left 2 and Column 1 ÷, Column 1 reads "6 ÷ 2 = 3" ⚠️ passed at RED

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "bottom-left 2 and Column 1 ÷
  make Column 1 "6 ÷ 2 = 3"".
- **Acceptance RED**: **passed on its first run**, on the engine and both phones, as
  `tasks.md` predicted: a division with a whole result is worked out like any other line.
- **Driver proof**: a deliberate break, `lineWorking` treating every ÷ line as unfinished, made
  it fail on the engine and both phones: `Error: Column 1 working … Expected: "6 ÷ 2 = 3"
  Received: "6 ÷ 2"`. Reverted with `git checkout`, rebuilt; passes again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## AC-6: with Solution A, every line shows its target and is marked, and nothing is counted until Check

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "with Solution A, every line
  shows its target and is marked, and nothing is counted until Check".
- **Acceptance RED** (no new driver code): both phones `Error: Row 1 should be marked as
  reaching its target … Expected: "target reached" Received: "none"`. The engine driver
  **passed**: it takes the mark from the outcome, which AC-2 delivered (noted at AC-2). The
  phones test the app's wording of the mark.

### Cycle 1 — the working's name says when the line reaches its target

- **RED**: `workingName › says when the line reaches its target: "Row 1 working, 6 + 2 = 8,
  target reached"` — failed: `expected 'Row 1 working, 6 + 2 = 8' to be 'Row 1 working,
  6 + 2 = 8, target reac…'`.
- **GREEN**: appends ", target reached" when the outcome reaches its target — commit
  `5a14114`. AC-6 passes on both phones.
- **REFACTOR**: none needed.

### Cycle 2 — the counter waits for Check ⚠️ passed at RED

- **RED**: `counterText › still reads "Found 0 of 2" once every line reaches its target, until
  Check (spec-002 AC-6)` in `src/app/session.spec.ts`, filling Solution A through taps.
  **Passed on its first run**, as `tasks.md` expected (no session change needed).
- **Proof**: a deliberate break, the session checking the grid on every operator tap, made it
  fail: `expected 'Found 1 of 2' to be 'Found 0 of 2'`. (A first attempt broke cell taps
  only, which this test cannot see, because Solution A's last tap is an operator; a second
  attempt hit the wrong line and only broke the syntax. Neither counted as proof.) Reverted
  with `git checkout` — commit `082b245` (`test:`).
- **REFACTOR**: none needed.

### Heavier weight on a reached slot — no test, checked by hand (owner's decision)

T024 also lists "the view gives a reached slot heavier weight as well as the ✓". FR-204
requires only that the mark does not rely on colour alone and is heard by screen readers; the
✓ symbol and ", target reached" meet both. The weight comes from the plan and
`docs/contracts/play-screen.md`, and no test drives it, so the owner was asked. **Decision
(2026-11-05): add it, checked by hand.** `view.ts` toggles a `reached` class on the slot;
`styles.css` makes it bold. `quickstart.md` section 4 gains the manual check "Marks stand out
without colour" — commit `f678b2f`. Phones after the change: all 55 spec-001 scenarios pass;
spec-002 30 passed, 2 failed (AC-9).

- **Acceptance GREEN**: lint and type checks clean; 95 unit tests (99.37% statements, 96.46%
  branches); build 4.2 KB gzipped. Engine 34 passed, 1 failed (AC-9). Phones 85 passed, 2
  failed (AC-9 on each).
- **Passing early**: AC-7 and AC-11 now pass on the phones as well as the engine; reported at
  their own RED.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-7: changing bottom-left to 3 after Solution A updates Row 2 and Column 1 straight away, before any Check ⚠️ passed at RED

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "changing bottom-left to 3
  after Solution A updates Row 2 and Column 1 before any Check".
- **Acceptance RED**: **passed on its first run**, on the engine and both phones, as
  `tasks.md` predicted: workings are worked out afresh from the entry on every render.
- **Driver proof**: a deliberate break in `lineWorkings`, keeping each line's first complete
  working instead of working it out again, made it fail on the engine and both phones:
  `Error: Row 2 working … Expected: "3 × 3 = 9" Received: "2 + 3 = 5"` (the first complete
  Row 2 while Solution A was entered). Reverted with `git checkout`, rebuilt; passes again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## AC-11: top-right 3 gives Row 1 "6 + 3 = 9" unmarked, and nine more taps, round to 2, give "6 + 2 = 8" marked ⚠️ passed at RED

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "top-right 3 gives Row 1
  "6 + 3 = 9" unmarked, and nine more taps, round to 2, give "6 + 2 = 8" marked".
- **Acceptance RED**: **passed on its first run**, on the engine and both phones, as
  `tasks.md` predicted: AC-2 and AC-6 deliver the result and the mark.
- **Driver proof**: a deliberate break, "reaches its target" meaning "at least the target",
  made it fail on the engine and both phones: `Error: Row 1 should carry no mark … Expected:
  "none" Received: "target reached"`. Reverted with `git checkout`, rebuilt; passes again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## T030: edge case "a cell cleared again" and accessibility "the working is not announced" ⚠️ both passed at RED

- **Acceptance tests**: `see-line-working.acceptance-spec.ts` — "tapping top-right from 2
  round to empty returns Row 1 to "6 + ?"" and "a tap that changes Row 1's working announces
  nothing to screen-reader users".
- **Acceptance RED**: **both passed on their first run**, on the engine and both phones, as
  `tasks.md` predicted: an empty cell is always written "?", and the working is outside the
  live status region.
- **Proof, cleared cell**: a deliberate break, writing an empty cell as "_" in the working,
  made it fail on the engine and both phones: `Error: Row 1 working … Expected: "6 + ?"
  Received: "6 + _"`. Reverted, rebuilt; passes again.
- **Proof, not announced**: a deliberate break, writing Row 1's result slot into the status
  region alongside the counter, made it fail on both phones: `Error: announcements to
  screen-reader users … Expected: 0 Received: 2`. Reverted, rebuilt; passes again.
  **The engine driver still passed**: it counts an announcement itself whenever Check shows a
  message (spec-001 design), so no change in the app can make it fail there. Only the phones,
  which watch the page's live region, test this scenario.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: both recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## T031: edge case "small screens", 320 × 568 and 375 × 667 ⚠️ passed at RED

- **Acceptance tests** (`@ui`): `see-line-working.acceptance-spec.ts` — "on a 320 × 568
  screen, all four workings are visible without scrolling" and the same at 375 × 667.
- **Acceptance RED**: **all 4 runs passed on their first run** (two screens, two phones), as
  noticed at AC-1. No layout change was needed, so `styles.css` is unchanged.
- **Measurements** (Chromium and WebKit agree; CSS px, left/top/right/bottom), from a scratch
  script against the built preview:
  - **On opening** ("= ?" in every slot): grid 260 px wide. At 320 × 568 the row workings
    sit at 262–290, the column workings end at 282 down; the Check button ends at 410.
    At 375 × 667 the grid spans 58–317. No horizontal or vertical scroll at either size.
  - **With the widest results** ("= 8 ✓", "= −1", "= 6 ✓"): the row-working column grows
    from 28 to 52 px and the grid to 284 px. At 320 × 568 it spans 18–302, inside the 8 px
    gutter; at 375 × 667, 46–329. Still no scroll.
  - **Noticed, not fixed**: because the grid is centred and the row-working column sizes to
    its content, the grid moves up to 12 px sideways as results appear. No test or requirement
    covers it; raised with the owner for the redesign feature.
- **Driver proof**: a deliberate break, a 400 px minimum width on every working slot, made all
  4 runs fail: `Error: Row 1 working is on screen without scrolling … Expected: true Received:
  false`. Reverted, rebuilt; all 4 pass again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## T032: Check through `lineWorking` (slice refactor for User Story 1)

- **Before**: 95 unit tests pass; engine 34 passed, 1 failed (AC-9); phones 85 passed, 2
  failed (AC-9).
- **Change**: `checkEntry`'s `reachesTarget` now asks `lineWorking` and accepts only a
  `result` that reaches its target, so Check and the screen cannot disagree (engine
  contract guarantee, research R3). `lineDigits` is private to `line-working.ts` again; the
  type-narrowing guard in `check-entry.ts` is gone — commit `2806d4d` (`refactor:`).
- **After**: identical. 95 unit tests (coverage 100% statements, 97.24% branches, up from
  99.37% because the unreachable guard has gone); type checks and lint clean; engine 34
  passed, 1 failed (AC-9); phones 85 passed, 2 failed (AC-9).
- **Left as it is**: listing every line is written in both `session.ts` and
  `check-entry.ts`. Sharing it would mean a new engine export, a contract change for six
  lines; not worth it now.
- **User Story 1 complete**: AC-1 to AC-7, AC-11, both edge cases, the not-announced check
  and the small screens all pass on the engine and both phones, and every spec-001 scenario
  still passes.
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-8: with bottom-left 9 and Column 1 −, Column 1 reads "6 − 9 = −3", unmarked because its target is 3 ⚠️ passed at RED

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "bottom-left 9 and Column 1 −
  make Column 1 "6 − 9 = −3", unmarked because its target is 3".
- **Acceptance RED**: **passed on its first run**, on the engine and both phones, as
  `tasks.md` predicted: pull request 1's rule change works out −3, and AC-4 writes it with
  the minus sign.
- **Driver proof**: a deliberate break, putting back the old rule that a line may not go below
  zero, made it fail on the engine and both phones: `Error: Column 1 working … Expected:
  "6 − 9 = −3" Received: "6 − 9"`. Reverted with `git checkout`, rebuilt; passes again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## AC-9: with bottom-left 4 and Column 1 ÷, Column 1 reads "6 ÷ 4" with a cross and no result

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "bottom-left 4 and Column 1 ÷
  make Column 1 "6 ÷ 4" with a cross and no result".
- **Acceptance RED** (no new driver code): engine and both phones `Error: Column 1 should show
  a cross … Expected: "not a whole number" Received: "none"`. The working itself already read
  "6 ÷ 4", because the outcome was still `incomplete` (AC-2 cycle 1).

### Cycle 1 — the working reports a division that is not whole

- **RED**: `lineWorking › reports Column 1 as not whole at step 1 when bottom-left is 4 and
  Column 1 is ÷: 6 ÷ 4` — failed: `expected { kind: 'incomplete' } to deeply equal
  { kind: 'not-whole', step: 1 }`.
- **GREEN**: a failed `evaluateLine` becomes `not-whole` with its step — commit `8b684da`.
  AC-9 passes on the engine driver (it takes the cross from the outcome).
- **REFACTOR**: none needed.

### Cycle 2 — the working's name says the division is not whole

- **RED**: `workingName › says when a division is not whole: "Column 1 working, 6 ÷ 4, not a
  whole number"` — failed: `expected 'Column 1 working, 6 ÷ 4' to be 'Column 1 working,
  6 ÷ 4, not a whole …'`.
- **GREEN**: the name's ending comes from `spokenMark(outcome)`: ", not a whole number" or
  ", target reached" — commit `08eab12`.
- **REFACTOR**: none needed (the GREEN step already replaced the single-mark condition).

### Cycle 3 — the slot shows a cross and no result

- **RED**: `resultText › shows a cross and no result when a division is not whole: "✗"` —
  failed: `expected '= ?' to be '✗'`.
- **GREEN**: `NOT_WHOLE_MARK` (✗) for `not-whole` — commit `6a945b7`.
- **REFACTOR**: none needed.

### Cycle 4 — the cross is bold, like the tick (view, checked by hand)

- Following the owner's AC-6 decision ("and later the ✗ slot"), the view's class becomes
  `marked` for both ✓ and ✗, and is bold; `quickstart.md`'s manual check covers the ✗ —
  commit `09123c0`. AC-9 passes on both phones. A scratch check against the preview: "= 8 ✓"
  and "✗" slots carry `marked` at weight 700; "= ?" slots weight 400.

- **Acceptance GREEN**: lint and type checks clean; 98 unit tests (100% statements, 98.23%
  branches); **engine 35 of 35, phones 87 of 87** (every spec-001 and spec-002 scenario,
  speed budgets included).
- **Passing early**: AC-10 now passes everywhere; reported at its own RED.
- **Slice refactor**: none needed.
- **Checkpoint**: approved by Philip England on 2026-11-05.

## AC-10: from "6 ÷ 4" with a cross, two taps on bottom-left (6) make Column 1 "6 ÷ 6 = 1" with no cross ⚠️ passed at RED

- **Acceptance test**: `see-line-working.acceptance-spec.ts` — "from "6 ÷ 4" with a cross,
  two taps on bottom-left (6) make Column 1 "6 ÷ 6 = 1" with no cross".
- **Acceptance RED**: **passed on its first run**, on the engine and both phones, as
  `tasks.md` predicted: workings are worked out afresh on every tap (AC-7), so the cross goes
  when the division becomes whole.
- **Driver proof**: a deliberate break, `evaluateLine` treating a number divided by itself as
  not whole, made it fail on the engine and both phones: `Error: Column 1 working … Expected:
  "6 ÷ 6 = 1" Received: "6 ÷ 6"`. Reverted with `git checkout`, rebuilt; passes again.
- **No cycles**: no new behaviour was needed.
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## AC-12: a line whose target is −3 is met by 6 − 9 and not by 6 − 8 ⚠️ passed at RED (unit tests only)

- **No acceptance scenario, by the owner's decision (spec option A)**: F0's puzzle has no
  negative target, so the criterion is proved on a test puzzle with one row (6 − ?, target
  −3) and single-cell columns (targets 6 and 9), so the row is tested on its own.
- **Tests**: `lineWorking › a negative target … › reaches −3 with 6 − 9` (`result`, −3,
  `reachesTarget` true) and `… › misses −3 with 6 − 8, which gives −2` (`result`, −2,
  `reachesTarget` false) in `src/engine/line-working.spec.ts`.
- **RED**: **both passed on their first run**, as predicted: pull request 1's rule change
  works out the negative result and AC-2's comparison checks it against the target. (A first
  run failed to compile on a quote in the `describe` name; fixed before the real run.)
- **Proof, 6 − 9 reaches −3**: a deliberate break, only a result of zero or more can reach its
  target, made it fail on `reachesTarget`. Reverted.
- **Proof, 6 − 8 misses −3**: a deliberate break, any result with the target's sign reaches it,
  made it fail on `reachesTarget`. Reverted. Then 6 of 6 pass — commit `b2f33c5` (`test:`).
- Check's own negative-target test is pull request 1's cycle 2 (`bc32ebf`).
- **Checkpoint**: recorded as delivered with the owner's approval (Philip England, 2026-11-05).

## Polish

### T041 — the whole suite

- `npm run exceptions:check`: 4 exceptions, 0 problems. `npm run lint`, `npm run typecheck`:
  clean.
- `npm test`: 100 unit tests. Coverage 100% statements and lines, 98.23% branches (threshold
  90%, applied to the total). Two files sit below 90% branches, both unchanged since F0:
  `src/engine/cycles.ts` and `tools/` (87.5% each).
- `npm run build`: JavaScript 3.31 KB + CSS 0.93 KB gzipped (F0 ended at 2.77 + 0.90), well
  within 30 KB.
- `npm run test:acceptance`: **engine 35 of 35; phones 87 of 87** (iPhone SE on WebKit, Pixel 5
  on Chromium, speed budgets on Android: SC-203).
- Draft pull request #7: `verify` passed on the first push with every scenario green.

### T042 — AGENTS.md

Purpose paragraph describes the workings and the rule change; the UI acceptance command says
to build first; three conventions added, each with its reason (build before the UI driver;
marks and announcements are tested by the phones; split pull requests only where every
approved scenario can pass) — commit `2daa108`.

### T043 — quickstart sections 1 to 3

- **Section 1** (lint, type checks, unit tests): green, as T041. **Gap noted**: the section
  says the unit tests cover `lineWorking` for every row of the engine-API table. Every row
  but one has a `lineWorking` unit test; "bottom-left 9, Column 1 −" (−3 on the worked
  example) is covered by `evaluateLine`'s unit test and AC-8's scenario instead.
- **Section 2** (build and acceptance): as T041. Every spec-001 and spec-002 scenario passes
  through both drivers; small screens include the workings at 320 × 568; axe clean.
- **Section 3** (play it yourself): scripted against the built preview at 375 × 667 and
  320 × 568 (Chromium), reading each result slot. Identical at both sizes, no scrolling:

  | Step | Slots (Row 1 \| Row 2 \| Column 1 \| Column 2) |
  | --- | --- |
  | 1. Opening | = ? \| = ? \| = ? \| = ? |
  | 2. Top-right 3, then round to 2 | = 9 …, then = 8 ✓ … |
  | 3. Bottom-left 9, Column 1 − | = 8 ✓ \| = ? \| = −3 \| = ? |
  | 4. Bottom-left 4, Column 1 ÷; then 6 | … ✗ …; then … = 1 … |
  | 5. Solution A, then Check | = 8 ✓ \| = 6 ✓ \| = 3 ✓ \| = 6 ✓, "Found 0 of 2"; Check: "New solution found!", "Found 1 of 2" |

  Every step matches the quickstart. This is a scripted run, not the owner's hands-on play;
  T044 covers real phones and screen readers.

### T046 — CODEOWNERS

Owner's decision (2026-11-05): `/test/acceptance/play/examples.ts @philipengland` added to
`.github/CODEOWNERS`, so the locked examples file needs the owner's review — commit `3b77d0b`.

### T045 — pull request

Owner's decision (2026-11-05): mark #7 ready now and do T044 after merge. #7 retitled
"spec-002: live line calculations", its description rewritten to cover both parts, and marked
ready for review. The owner merges it with a merge commit.

### T044 — owner's manual checks

Open: VoiceOver and TalkBack, the bold marks in greyscale, and five hallway playtests for
SC-201 and SC-202 (quickstart section 4). Results to be recorded here.
