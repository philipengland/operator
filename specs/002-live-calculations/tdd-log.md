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
