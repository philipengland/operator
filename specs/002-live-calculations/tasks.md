---

description: "Task list for spec-002, live line calculations"
---

# Tasks: Live Line Calculations (spec-002)

**Input**: design documents in `specs/002-live-calculations/`: [plan.md](plan.md),
[spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md),
[contracts/](contracts/), [quickstart.md](quickstart.md), [acceptance.md](acceptance.md)
(approved 2026-11-05).

**Tests**: mandatory and test-first (org baseline). The approved scenarios and DSL listed in
[acceptance.md](acceptance.md) are **locked**: tasks run them and never create, edit, skip or
delete them. Each acceptance criterion is an outer loop of red-green-refactor inner loops,
recorded in `specs/002-live-calculations/tdd-log.md`.

**Organisation**: setup and the rule change first (pull request 1), then User Story 1 and the
display part of User Story 2 (pull request 2), as the plan's Delivery section sets out. Within
a story, one group per acceptance criterion in the order the spec lists them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1, US2).

## Path Conventions

As in spec-001: `src/engine/` (pure rules; unit tests next to the code as `<file>.spec.ts`),
`src/app/` (`session.ts`, `labels.ts`, `view.ts`, `styles.css`), `test/acceptance/` (locked
Layers 1 and 2; Layer 3 in `drivers/` and `support/`). Current-state contracts move to
`docs/contracts/` in T001.

## How every acceptance group works

- **RED** task: run the criterion's scenarios with
  `npm run test:acceptance:engine -- -g "spec-002 AC-n]"`, then `npm run test:acceptance:ui -- -g "spec-002 AC-n]"`.
  Add only the Layer 3 driver code they need, engine driver first. Re-run: the scenarios must
  fail **because the behaviour is missing**, not because a driver is. Quote the failure in the
  TDD log.
- **TDD cycles** task: one failing unit test, the smallest code to pass it, then refactor.
  Commit `feat(<scope>): …` at each green and `refactor(<scope>): …` separately. The listed
  behaviours are the intended design; the actual cycles go in the TDD log.
- **GREEN** task: the criterion's scenarios pass through the engine project and both phone
  projects, axe clean. The full suite is green except criteria not yet started. Slice
  refactor, TDD log entry, then a checkpoint: **wait for the owner's approval before the next
  criterion.**
- A scenario that passes the first time it runs is **reported**, and its driver is proven by a
  deliberate, reverted break before it is recorded as delivered (AGENTS.md). Groups where this
  is likely are marked ⚠️.

---

## Phase 1: Setup (pull request 1)

**Purpose**: move the contracts to their current-state home, start the TDD log, and close the
driver contract gap the approved specifications opened, so the baseline is green apart from the
new scenarios.

- [X] T001 Move the current-state contracts (plan, Open Items 1): `git mv specs/001-walking-skeleton/contracts/engine-api.md docs/contracts/engine-api.md` and the same for `play-screen.md`. Leave `specs/001-walking-skeleton/contracts/README.md` saying the files moved to `docs/contracts/` on 2026-11-05 and that spec-001 describes them as they were then. Update the links in `AGENTS.md` (Contracts bullet and the accessible-name convention), the header comments of `src/app/labels.ts` and `src/app/view.ts`, and the links in `specs/002-live-calculations/contracts/*.md` and `plan.md`. Commit `docs: move the current contracts to docs/contracts`.
- [X] T002 Create `specs/002-live-calculations/tdd-log.md` from `.specify/presets/org-baseline/templates/tdd-log-template.md`. Record the baseline: `npm run lint`, `npm test` (76 unit tests), engine acceptance (22 spec-001 scenarios pass; 13 spec-002 scenarios fail, as approved) and the four Layer 3 type errors that T003 closes.
- [X] T003 Close the driver contract gap with default values only (no behaviour): `test/acceptance/drivers/default-view.ts` gains `workings` with every line `{ working: '', mark: 'none' }`; `test/acceptance/drivers/engine/game.engine-driver.ts` and `test/acceptance/drivers/ui/game.ui-driver.ts` return `DEFAULT_VIEW.workings`; `test/acceptance/drivers/ui/phone.ui-driver.ts` returns `NO_BOX` for each working in `layout()` and `EMPTY_LAYOUT`. Then `npm run typecheck` is clean, and the 13 spec-002 scenarios fail on their assertions, not on a missing field. Commit `test(acceptance): default line workings in the drivers`.

**Checkpoint**: baseline green except the approved spec-002 scenarios.

---

## Phase 2: Foundational — the rule change (pull request 1)

**Purpose**: results below zero count, and targets may be negative (FR-208, research R6). It
blocks User Story 1 too: AC-4 expects "2 − 3 = −1". No screen change in this phase.

- [X] T004 [P] Update `docs/contracts/engine-api.md` before the code: `evaluateLine` fails only on `'inexact-division'`; the `'below-zero'` reason is removed; `checkEntry` accepts results and targets below zero. Copy the before/after table from `specs/002-live-calculations/contracts/engine-api.md`.
- [X] T005 [P] Update `docs/brief/project-brief.md`: the core rule (line 33, "subtraction may not go below zero") becomes "results may go below zero; division must be exact"; the agreed default under Open questions and risks (line 184) records the 2026-11-05 change and links spec-002; the Phase 3 "optional negative-number … variant" (line 152) is now standard, leaving "no-repeat"; F2's row (line 165) drops "or goes below zero". Leave the generator step (line 116, "non-negative") with a note that F7 revisits it.
- [X] T006 Rule change, TDD cycles. Each existing test that requires "below zero fails" is **rewritten to the new rule** in the RED step and the TDD log names it (research R6):
  - `src/engine/evaluate-line.spec.ts`: "fails a line at the step that goes below zero: 6 − 9" becomes "works out 6 − 9 as −3" (`{ ok: true, value: -3 }`); 6 ÷ 4 still fails with `'inexact-division'`, step 1.
  - `src/engine/types.ts`: `LineResult`'s failure reason narrows to `'inexact-division'`.
  - `src/engine/check-entry.spec.ts`: the worked example's below-zero entry is still `not-solved` (6 − 9 = −3, target 3); on a test puzzle with one row (target −3, operator −, given 6 then an empty cell) and single-cell columns whose targets are 6 and 9, entering 9 is `solved` (the row reaches −3). The "6 − 8 misses −3" case is AC-12's, in T040, where the line is tested on its own.
  - `src/app/session.spec.ts`: the below-zero test's comment gives the new reason; its assertion ("not solved yet") is unchanged.
- [X] T007 Run the full suite: unit tests, lint, type checks, engine and both phone projects. Every spec-001 scenario passes, including the reworded AC-9. Record in the TDD log ("FR-208 and AC-12's rule") and stop at a checkpoint for the owner.
- [X] T008 *(Done 2026-11-05 as **draft** pull request #7, by the owner's decision: `verify` runs every approved scenario, so it can only pass once part 2 is on the branch. Merged once, after T045.)* Pull request 1: push `002-live-calculations` and open the pull request "spec-002 part 1 of 2: results below zero" with what changed, why (FR-208, the owner's 2026-11-05 decision), how it was tested (the rewritten tests by name), and rollback (re-run `ci-deploy.yml` with `ref` = `85ee990`, or revert the merge). End with the attribution line. The owner merges it with a merge commit.

**Checkpoint**: pull request 1 open as a draft (#7) for review; it is merged with part 2.

---

## Phase 3: User Story 1 — See each line's working (Priority: P1) 🎯 MVP (pull request 2)

**Goal**: every row shows its result on the right and every column below, updated on each tap,
with ✓ when it reaches its target.

**Independent Test**: open the game, tap cells and operators, and read each result slot
([quickstart.md](quickstart.md) section 3, steps 1, 2 and 5).

- [X] T009 [US1] Update `docs/contracts/play-screen.md` (the working elements, the layout and its guarantees, what the UI driver reads) and add `lineWorking` to `docs/contracts/engine-api.md`, both from `specs/002-live-calculations/contracts/`, before the code.

### AC-1: the working on opening

- [X] T010 [US1] AC-1 RED. Engine driver: `view().workings` from `lineWorkings(state)` in `src/app/session.ts`, with `workingText` and the mark from `src/app/labels.ts` (stub both to return nothing useful). UI driver (`test/acceptance/drivers/ui/game.ui-driver.ts`, `screen-names.ts`): read the element named `/^<Line> working, /` inside "Puzzle", strip the prefix, and map ", target reached" and ", not a whole number" to the mark. Phone driver: `layout().workings` from each working element's box. Expected failure: `Row 1 working — Expected: "6 + ?", Received: ""`.
- [X] T011 [US1] AC-1 TDD cycles:
  - `src/engine/line-working.ts`: `lineWorking` returns the line's digits in reading order (given digits included, `null` for empty cells) and its operator (`null` if not chosen); outcome `incomplete` when any part is `null`. Move "a line's digits in reading order" out of `check-entry.ts` into this file and use it in both.
  - `src/app/session.ts`: `lineWorkings(state)` returns all four, rows then columns.
  - `src/app/labels.ts`: `workingText` gives "6 + ?", "? ? ?", "6 ? ?", "? × ?"; `workingName` gives "Row 1 working, 6 + ?"; `resultText` gives "= ?".
  - `src/app/view.ts`: a result slot right of each row and below each column, holding the visually hidden name and the visible text marked `aria-hidden="true"`; not a live region; written with `writeText`.
  - `src/app/styles.css`: one extra grid column and row; the slot wraps rather than overflows.
- [X] T012 [US1] AC-1 GREEN (both scenarios, including the `@ui` layout one), slice refactor, checkpoint.

### AC-2: the first digit

- [X] T013 [US1] AC-2 RED: no new driver code. Expected failure: `Row 1 working — Expected: "6 + 2 = 8", Received: "6 + 2"`.
- [X] T014 [US1] AC-2 TDD cycles: `lineWorking` outcome `result` with `value` (from `evaluateLine`) and `reachesTarget` (`value === target`) once nothing is `null`; `workingText` appends " = 8"; `resultText` gives "= 8 ✓" when `reachesTarget`, "= 9" otherwise.
- [X] T015 [US1] AC-2 GREEN, slice refactor, checkpoint.

### AC-3: a column with both digits ⚠️

- [X] T016 [US1] AC-3 RED: likely passes once AC-2 is delivered (Column 2's working is built the same way). If it passes, report it, prove the driver with a reverted break (e.g. `workingText` drops the result for columns), and ask the owner whether to record it as delivered.
- [X] T017 [US1] AC-3 GREEN, checkpoint.

### AC-4: choosing an operator changes the working

- [X] T018 [US1] AC-4 RED: no new driver code. Expected failure on the second tap, the negative result: `Row 2 working after each tap — Expected: [..., "2 − 3 = −1", ...]`, with the received value showing how a negative result is currently written.
- [X] T019 [US1] AC-4 TDD cycles: `workingText` writes a negative result with the true minus sign U+2212 ("= −1", never a hyphen-minus); `workingName` speaks it as "minus 1" (research R2); `resultText` gives "= −1".
- [X] T020 [US1] AC-4 GREEN, slice refactor, checkpoint.

### AC-5: dividing in a column ⚠️

- [X] T021 [US1] AC-5 RED: likely passes (÷ with a whole result needs nothing new). Same handling as T016.
- [X] T022 [US1] AC-5 GREEN, checkpoint.

### AC-6: every line reaching its target

- [X] T023 [US1] AC-6 RED: no new driver code. Expected failure: `Row 1 should be marked as reaching its target — Expected: "target reached", Received: "none"` if the mark is not yet in the name, or a style failure in the UI projects.
- [X] T024 [US1] AC-6 TDD cycles: `workingName` adds ", target reached" when `reachesTarget`; the view gives a reached slot heavier weight as well as the ✓ (never colour alone, FR-204); the counter stays "Found 0 of 2" until Check (no session change expected; prove it with a unit test in `session.spec.ts`).
- [X] T025 [US1] AC-6 GREEN, slice refactor, checkpoint.

### AC-7: one change, straight away ⚠️

- [X] T026 [US1] AC-7 RED: likely passes (workings are derived on every render). Same handling as T016.
- [X] T027 [US1] AC-7 GREEN, checkpoint.

### AC-11: wrong, then right ⚠️

- [X] T028 [US1] AC-11 RED: likely passes. Same handling as T016.
- [X] T029 [US1] AC-11 GREEN, checkpoint.

### Edge cases and accessibility ⚠️

- [X] T030 [US1] Run "[spec-002 edge case] a cell cleared again" and "[spec-002 accessibility] the working is not announced". Both are likely to pass by construction; report, prove each driver with a reverted break (e.g. put the working inside the status region), and ask the owner.
- [X] T031 [US1] Run "[spec-002 edge case] small screens" (`@ui`) at 320 × 568 and 375 × 667. Fix layout in `src/app/styles.css` only if a working is off screen; record measurements in the TDD log.

### Slice refactor for User Story 1

- [X] T032 [US1] Re-express `checkEntry` through `lineWorking` (research R3, contract guarantee: solved exactly when every outcome is a `result` that reaches its target). `refactor(engine): …`, with `check-entry.spec.ts` green before and after.

**Checkpoint**: User Story 1 works on its own; every spec-001 scenario still passes.

---

## Phase 4: User Story 2 — Negative results, and a cross for division that isn't whole (Priority: P2) (pull request 2)

**Goal**: a negative result shows with a minus sign; a division that is not whole shows a cross
and no result. The rule itself shipped in Phase 2.

**Independent Test**: [quickstart.md](quickstart.md) section 3, steps 3 and 4.

### AC-8: a result below zero ⚠️

- [X] T033 [US2] AC-8 RED: likely passes after AC-4 (negative results are already written). Same handling as T016.
- [X] T034 [US2] AC-8 GREEN, checkpoint.

### AC-9: a division that is not whole

- [X] T035 [US2] AC-9 RED: no new driver code. Expected failure: `Column 1 working — Expected: "6 ÷ 4", Received: …` or `Column 1 should show a cross — Expected: "not a whole number", Received: "none"`.
- [X] T036 [US2] AC-9 TDD cycles: `lineWorking` outcome `not-whole` with the `step` from `evaluateLine`; `workingText` gives "6 ÷ 4" with no result; `workingName` adds ", not a whole number"; `resultText` gives "✗"; the view gives the cross the same weight treatment as the mark, never colour alone (FR-205).
- [X] T037 [US2] AC-9 GREEN, slice refactor, checkpoint.

### AC-10: making the division whole ⚠️

- [X] T038 [US2] AC-10 RED: likely passes. Same handling as T016.
- [X] T039 [US2] AC-10 GREEN, checkpoint.

### AC-12: a negative target (unit tests only, spec option A)

- [X] T040 [US2] AC-12 TDD cycles in `src/engine/line-working.spec.ts`, on a test puzzle whose Row 1 has target −3 and operator −: 6 then 9 gives `result`, value −3, `reachesTarget` true; 6 then 8 gives value −2, `reachesTarget` false. Record in the TDD log that this criterion has no acceptance scenario, by the owner's decision.

**Checkpoint**: both stories complete.

---

## Phase 5: Polish & Cross-Cutting Concerns (pull request 2)

- [X] T041 Run the whole suite: lint, type checks, unit tests with coverage (90% lines and branches on engine, session, labels), engine acceptance, both phone projects including the speed budget (SC-203), build within 30 KB.
- [X] T042 [P] Update `AGENTS.md` where spec-002 changes it: the purpose paragraph (each line shows its working; results below zero), the contracts location (if T001 did not already), and any new convention learned during implementation.
- [X] T043 [P] Run [quickstart.md](quickstart.md) sections 1 to 3 and record the results in the TDD log.
- [ ] T044 Owner's manual checks ([quickstart.md](quickstart.md) section 4): VoiceOver and TalkBack read each working sensibly ("?", "minus 3", "target reached"); five hallway playtests for SC-201 and SC-202. Results in the TDD log; raise a work item for any failure.
- [ ] T045 Pull request 2 (*now: mark draft #7 ready for review, retitle it "spec-002: live line calculations" and update its description to cover both parts*): push and open "spec-002 part 2 of 2: line workings on screen" with what changed, why, how it was tested, and rollback (re-run `ci-deploy.yml` with `ref` = the merge commit of pull request 1, or revert). End with the attribution line. The owner merges it with a merge commit.
- [X] T046 Owner decision, not done without it: add `/test/acceptance/play/examples.ts @philipengland` to `.github/CODEOWNERS`, so the locked examples file needs the owner's review (both approval records list it as locked; the current patterns do not cover it).

---

## Dependencies & Execution Order

- **Setup (T001–T003)** first: T002's baseline needs T001's paths settled; T003 makes the
  baseline type-check.
- **Foundational (T004–T008)** blocks both stories: AC-4 and AC-8 need negative results.
  T004 and T005 are documents and can run in parallel with each other, before T006.
- **User Story 1 (T009–T032)** after pull request 1 is merged. Criteria run in the spec's
  order; T032 after all US1 criteria.
- **User Story 2 (T033–T040)** after US1's AC-4 (minus sign) and AC-1 (slots). T040 depends
  only on T011 and can run any time after it.
- **Polish (T041–T046)** last. T046 waits for the owner.

## Parallel Opportunities

- T004 and T005 (different documents).
- T040 alongside any US1 group after T011 (engine test only).
- T042 and T043 (different files).

Most other tasks touch `labels.ts`, `view.ts` or the drivers in turn, so they run in order.

## Implementation Strategy

1. **Pull request 1** (T001–T008): contracts moved, rule changed, brief updated. Small,
   reviewable, deployable with no visible change.
2. **MVP — User Story 1** (T009–T032): the workings and marks on screen. Stop and validate
   with quickstart section 3 before going on.
3. **User Story 2 display** (T033–T040): the cross and the AC-12 proof.
4. **Polish** (T041–T046), then pull request 2.
