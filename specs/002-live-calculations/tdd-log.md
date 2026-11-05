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
- **Checkpoint**: awaiting the owner.
