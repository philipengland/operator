---

description: "Task list for spec-006, solution log"
---

# Tasks: Solution Log (spec-006)

**Input**: design documents in `specs/006-solution-log/`: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md),
[acceptance.md](acceptance.md) (approved 2026-11-08, commit `df93d38`).

**Tests**: mandatory and test-first (org baseline). The approved scenarios and DSL listed in
[acceptance.md](acceptance.md) are **locked**: tasks run them and never create, edit, skip or delete them. Each
acceptance criterion is an outer loop of red-green-refactor inner loops, recorded in
`specs/006-solution-log/tdd-log.md`.

**Organisation**: one pull request per release (constitution VII; plan, Release order). Every merge to `main` deploys, so
every pull request is fit for players. Each part branches from `main` after the previous part merges, and carries only
the approved Layer 1 file it makes pass, brought unchanged from `df93d38`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1 to US5).

## Path Conventions

- `src/app/`: session, labels, `screen.ts`, `features.ts`, `main.ts`, and the new `solution-store.ts`, `browser-store.ts`, `navigation.ts`.
- `src/ui/`: the component library. Each component is `<name>.model.ts` (pure, unit-tested in `<name>.model.spec.ts`), `<name>.ts` (renderer, `builtFrom`) and `<name>.css`.
- `test/acceptance/play/`, `test/acceptance/dsl/`, both `examples.ts`: Layers 1 and 2, locked.
- `test/acceptance/drivers/`: Layer 3 (`ui/game.ui-driver.ts`, `ui/phone.ui-driver.ts`, `ui/screen-names.ts`, `engine/game.engine-driver.ts`), built here.
- Unit-test titles for criteria proved by unit tests name the criterion, e.g. `(spec-006 AC-22)`, one per title, so `npm run test-results` counts it.

## How every acceptance group works

1. **RED**: run the criterion's approved scenarios, for example `npm run test:acceptance:ui -- -g "spec-006 AC-1]"`, after `npm run build`. Quote the failure. A scenario that passes at RED is reported and proven by a deliberate, reverted break.
2. **Inner loops**: one failing unit test on its assertion, the smallest code, refactor. Commit test and code together at each green; refactors separately.
3. **GREEN**: the scenarios pass, then the full suite. Update `tdd-log.md` and tick the task.
4. **Checkpoint** with the owner, using generated evidence (`npm run test-results -- 006-solution-log --criterion AC-n`), unless the owner has said to run the story through.

---

## Phase 1: Setup

**Purpose**: the approved specifications, the record of work, and a clean baseline.

- [X] T001 Obtain approval of the scenarios, the DSL and the change to spec-003's lists, recorded in `specs/006-solution-log/acceptance.md` (commit `df93d38`)
- [X] T002 Commit the design documents on `006-solution-log`: `specs/006-solution-log/spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `tasks.md`, `contracts/`, `checklists/` and `docs/adr/0004-saved-solutions.md`, by explicit path, never `specs/*/.speckit-board.json`
- [X] T003 Create branch `006-solution-log-part-1` from `main`; create `specs/006-solution-log/tdd-log.md` from `.specify/presets/org-baseline/templates/tdd-log-template.md`; run the full suite and record it as the baseline, stopping if anything fails

---

## Phase 2: Foundational — the library additions (pull request 1)

**Purpose**: every new part, shown in the catalogue. **Players get**: no change.

**Checkpoint**: `[spec-003 AC-1]` passes with the new lists, and the catalogue shows every new part in every state.

- [X] T004 Bring over unchanged from `df93d38`, confirming each by blob: `test/acceptance/dsl/game.dsl.ts`, `phone.dsl.ts`, `vocabulary.ts`, `catalogue-vocabulary.ts`, `test/acceptance/drivers/game.driver.ts`, `phone.driver.ts`, `test/acceptance/play/examples.ts`, `test/acceptance/library/examples.ts`, `simple-components.acceptance-spec.ts`, `specs/006-solution-log/acceptance.md`, `specs/003-themed-ui/acceptance.md`, and the design documents from T002. The four new scenario files stay behind
- [X] T005 Make the drivers compile: add every new `GameDriver` and `PhoneDriver` method, with stubs returning empty defaults (never throwing "not implemented"), in `test/acceptance/drivers/ui/game.ui-driver.ts` and `ui/phone.ui-driver.ts`; use the existing `readOnlyOnThePhones` in `test/acceptance/drivers/engine/game.engine-driver.ts`
- [X] T006 [P] TDD: `Puzzle` gains `id: string` in `src/engine/types.ts`; `worked-example` in `src/engine/puzzles/worked-example.ts`; test puzzles in `src/engine/check-entry.spec.ts` and `line-working.spec.ts`; record it in `docs/contracts/engine-api.md`
- [X] T007 [P] TDD in `src/ui/simple/surface.model.spec.ts`: Surface takes an optional tap action and renders as a real `<button>` in `src/ui/simple/surface.ts` and `surface.css` (research R8)
- [X] T008 [P] TDD in `src/ui/simple/button.model.spec.ts`: Button gains a read-only form, the same look but plain text with its name read as text, in `src/ui/simple/button.ts` (research R9)
- [X] T009 TDD in `src/ui/combined/grid-cell.model.spec.ts`: `isReadOnly` in `src/ui/combined/grid-cell.ts`; `src/ui/combined/puzzle-grid.ts` passes it to every cell, and leaves no button in the grid when read-only
- [X] T010 TDD: the Solutions counter takes an optional `onTap` in `src/ui/combined/solutions-counter.ts`, passed to its Surface. Its "built from" list stays `Surface, Text, Badge, Icon`, and it stays named "Found N of M"
- [X] T011 [P] TDD: new simple component Dialog in `src/ui/simple/dialog.model.ts`, `dialog.ts`, `dialog.css`, on the native `<dialog>` with `showModal()`, declaring its backdrop here as `tools/ui-tiers.spec.ts` requires (research R10)
- [X] T012 TDD: new combined component Confirm dialog in `src/ui/combined/confirm-dialog.model.ts`, `confirm-dialog.ts`, built from Dialog, Text and Button: a question and two buttons, neither sitting where the control that opened it was
- [X] T013 TDD: new screen Solution list in `src/ui/screens/solution-list.model.ts`, `solution-list.ts`: heading "Solutions", "Back", rows or an empty line (shown and heard separately), optional "Start again". The list scrolls, and "Back" stays reachable without scrolling
- [X] T014 TDD: new screen Solution view in `src/ui/screens/solution-view.model.ts`, `solution-view.ts`: heading, "Back", a read-only Puzzle grid
- [X] T015 List and sample every new part and state in `src/catalogue/library.ts` and its samples; `[spec-003 AC-1]` goes GREEN (run `npm run test:acceptance:ui -- -g "spec-003 AC-1]"`), and every catalogue scenario still passes
- [X] T016 Update `docs/contracts/component-library.md` from `specs/006-solution-log/contracts/component-library-changes.md`; add `docs/contracts/saved-solutions.md`; add the play-screen changes to `docs/contracts/play-screen.md`, each marked with the flag it depends on
- [X] T017 Full suite, lint, typecheck. Push and open "spec-006 part 1 of 6: library additions", noting the approved change to spec-003's lists and asking the owner to accept ADR 0004 (`docs/adr/0004-saved-solutions.md`). The owner merges with a merge commit

---

## Phase 3: User Story 1 — The list of solutions found (Priority: P1) 🎯 MVP

**Goal**: a player can open a list of what they have found, and come back to the puzzle exactly as they left it.

**Independent Test**: find Solution A, open the list and read "Solution 1"; go back and see the grid unchanged.

- [X] T018 [US1] Create `006-solution-log-part-2` from `main`; bring `test/acceptance/play/solution-list.acceptance-spec.ts` unchanged from `df93d38` (confirm by blob). Add the `log` flag, off, to `src/app/features.ts` as a named field; restore `__OPERATOR_FEATURES__` in `src/app/main.ts`; map it in `playwright.config.ts`
- [X] T019 [US1] UI driver methods in `test/acceptance/drivers/ui/game.ui-driver.ts`, `ui/screen-names.ts` and `ui/phone.ui-driver.ts`: `tapCounter`, `tapBack`, `screenShowing`, `emptyList`, `solutionsShown`, `solutionsHeard`, `goBack`, `accessibilityProblems`
- [X] T020 [US1] AC-1: TDD in `src/app/session.spec.ts`: `openList` sets `place`, changing nothing else; in `src/app/labels.spec.ts`: "No calls yet, pal." with the theme's address, heard as "No solutions found yet"; the counter is tappable only with `log` on, in `src/app/main.ts`, which shows the list
- [X] T021 [US1] AC-2 to AC-4: TDD in `src/app/session.spec.ts`: `solutions` beside `found` in `src/app/session.ts`, in the order found; a repeat adds nothing; in `src/app/solution-list.spec.ts`: rows are "Solution 1", "Solution 2", in the order found
- [X] T022 [US1] AC-5: TDD: `showPlace` in `src/app/session.ts` returns to the puzzle with entry, selection and message unchanged; the play screen stays in the page, hidden, in `src/app/main.ts` (research R6); focus returns to the counter (research R11)
- [X] T023 [US1] AC-6: rows are heard as "Solution 1"; focus moves to the heading on arrival; the accessibility scan passes, in `src/ui/screens/solution-list.ts`
- [X] T024 [US1] AC-25 and the reload edge case: TDD in `src/app/navigation.spec.ts`: a place to and from a history entry in `src/app/navigation.ts`; `src/app/main.ts` uses `pushState`, `history.back()` and `popstate`, and replaces the entry on opening (research R7)
- [X] T025 [US1] Confirm `npm run build` keeps the counter untappable (flag off), and the flags-on build passes `solution-list.acceptance-spec.ts`. Update `specs/006-solution-log/tdd-log.md`. Push and open "spec-006 part 2 of 6: the list (flag off)". The owner merges
- [X] T026 [US1] **The owner reviews the flags-on build on a phone** (`npm run build:flags-on`, served by `npx vite preview --outDir dist-flags-on --host`, with a checklist). The owner may hold this until after User Story 2, to review both together. Then a one-line pull request sets `log` true in `src/app/features.ts`

---

## Phase 4: User Story 2 — Reopening a solution (Priority: P1)

**Goal**: a player can see a found solution in full, read-only, without losing the grid in progress.

**Independent Test**: find Solution A, start another entry, reopen Solution A, go back and see the entry unchanged.

- [X] T027 [US2] Create `006-solution-log-part-3` from `main`; bring `test/acceptance/play/reopen-solution.acceptance-spec.ts` unchanged from `df93d38` (confirm by blob); add the `reopen` flag, off, in `src/app/features.ts` and `playwright.config.ts`
- [X] T028 [US2] UI driver methods in `test/acceptance/drivers/ui/game.ui-driver.ts`: `tapSolution`, `tapInSolution`, `solutionView`, `solutionHeard`, `controlsOnScreen`
- [X] T029 [US2] AC-7: TDD in `src/app/session.spec.ts`: `openSolution(number)`; in `src/app/screen.spec.ts`: view props reuse the grid mapping with the found entry, open pills become shown pills with the player's operator, every line reaches its target, the helper line is empty; `src/app/main.ts` shows the view
- [X] T030 [US2] AC-8: nothing in the view can be tapped except "Back"; no keypad and no main button, in `src/ui/screens/solution-view.ts`
- [X] T031 [US2] AC-9: TDD in `src/app/session.spec.ts`: `showPlace` from a solution returns to the list, and opening one changes neither the grid, the count nor the list
- [X] T032 [US2] AC-10: the heading takes focus on arrival; cells and workings are heard as named in `specs/006-solution-log/contracts/play-screen-changes.md`; the accessibility scan passes
- [X] T033 [US2] AC-26: a solution is a history entry in `src/app/navigation.ts`, and the phone's back returns to the list, with focus on its row
- [X] T034 [US2] AC-27: numbers follow the order found. ⚠️ May pass from AC-7: report, and prove with a reverted break
- [X] T035 [US2] Confirm `npm run build` leaves rows as text with `reopen` off, and the flags-on build passes. Update `tdd-log.md`. Push and open "spec-006 part 3 of 6: reopening (flag off)". The owner merges
- [X] T036 [US2] **The owner reviews the flags-on build on a phone**; then a one-line pull request sets `reopen` true in `src/app/features.ts`

---

## Phase 5: User Story 3 — Starting again (Priority: P1)

**Goal**: a player can clear what they have found and hunt for the answers again.

**Independent Test**: find Solution A, start again, and find Solution A once more.

- [X] T037 [US3] Create `006-solution-log-part-4` from `main`; bring `test/acceptance/play/start-again.acceptance-spec.ts` unchanged from `df93d38` (confirm by blob); add the `startAgain` flag, off, in `src/app/features.ts` and `playwright.config.ts`
- [X] T038 [US3] UI driver methods in `test/acceptance/drivers/ui/game.ui-driver.ts`: `tapStartAgain`, `doubleTapStartAgain`, `tapPopUpButton`, `popUp`, `focusedControl`
- [X] T039 [US3] AC-11: TDD in `src/app/session.spec.ts`: `askToStartAgain` and `keepSolutions` set `isConfirming` and change nothing else; `src/app/main.ts` shows the Confirm dialog
- [X] T040 [US3] AC-12: TDD in `src/app/session.spec.ts`: `startAgain` clears `found`, the entry, `selected` and `message`, sets `isConfirming` false, and stays on the list
- [X] T041 [US3] AC-13: ⚠️ May pass from AC-12: report, and prove with a reverted break
- [X] T042 [US3] AC-28: focus stays inside the pop-up, and returns to "Start again" on "Keep them"; the accessibility scan passes
- [X] T043 [US3] Edge cases: "Start again" not offered when nothing is found, in `src/app/screen.ts`; the phone's back closes the pop-up and clears nothing, in `src/app/navigation.ts`; a double-tap cannot confirm, in `src/ui/combined/confirm-dialog.ts`
- [X] T044 [US3] Confirm `npm run build` shows no "Start again" with the flag off, and the flags-on build passes. Update `tdd-log.md`. Push and open "spec-006 part 4 of 6: starting again (flag off)". The owner merges
- [X] T045 [US3] **The owner reviews the flags-on build on a phone**; then a one-line pull request sets `startAgain` true in `src/app/features.ts`. Must be released before `remember` (T056)

---

## Phase 6: User Story 4 — Remembering what was found (Priority: P1)

**Goal**: a player who comes back later still has the solutions they found.

**Independent Test**: find Solution A, reload, and read the counter and the list.

- [X] T046 [US4] Create `006-solution-log-part-5` from `main`; bring `test/acceptance/play/remember-solutions.acceptance-spec.ts` unchanged from `df93d38` (confirm by blob); add the `remember` flag, off, in `src/app/features.ts` and `playwright.config.ts`
- [X] T047 [US4] UI driver methods in `test/acceptance/drivers/ui/phone.ui-driver.ts`: `closeAndReopen`, `refuseSaving`, `leaveUnreadableSavedData`, `leaveSavedFillings`, `errorsOnThePage`, setting up the record before the page loads (research R15). The key is `operator.solutions.worked-example`
- [X] T048 [US4] AC-14: TDD in `src/app/solution-store.spec.ts`: encode to `{ "format": 1, "solutions": [Entry, …] }` under the key `operator.solutions.<puzzle id>`, and decode in the order found; `restoreFound` in `src/app/session.ts`; `src/app/browser-store.ts` wraps `localStorage`, every call in `try`/`catch`; `src/app/main.ts` restores on opening, with an empty grid and the greeting, and saves each new solution
- [X] T049 [US4] AC-15, AC-16, AC-17: ⚠️ May pass from AC-14: report, and prove each with a reverted break
- [X] T050 [US4] AC-18: TDD in `src/app/solution-store.spec.ts`: "Start again" removes this puzzle's key
- [X] T051 [US4] AC-19: saving refused: TDD in `src/app/browser-store.spec.ts`: a store that throws is caught and the game carries on with no error
- [X] T052 [US4] AC-20 and AC-21: TDD in `src/app/solution-store.spec.ts`: not valid JSON or the wrong shape is treated as empty; an entry "of the wrong size, or with an unknown digit or operator" is dropped; an entry that does not solve the puzzle is dropped, by the engine's `checkEntry`; the same solution twice is "kept once, at its first place"
- [X] T053 [P] [US4] AC-22: TDD in `src/app/solution-store.spec.ts`, title `(spec-006 AC-22)`: another puzzle's identity reads an empty log, and this puzzle's is unaffected
- [X] T054 [P] [US4] Saving rules: TDD in `src/app/solution-store.spec.ts`: a save adds one solution to what is stored at that moment, so another tab's are kept; a newer `format` is "treated as empty, and never overwritten"; unreadable data is overwritten by the next save
- [X] T055 [US4] Confirm `npm run build` reads and writes nothing with `remember` off, and the flags-on build passes. Update `tdd-log.md`. Push and open "spec-006 part 5 of 6: remembering (flag off)". The owner merges
- [X] T056 [US4] **The owner reviews the flags-on build on a phone**; then, with `startAgain` already released, a one-line pull request sets `remember` true in `src/app/features.ts`

---

## Phase 7: User Story 5 — The counter with a very large total (Priority: P3)

**Goal**: with more than 100 solutions, the counter leaves out the total.

**Independent Test**: unit tests with sample totals, until F7 brings such a puzzle.

- [ ] T057 [P] [US5] Create `006-solution-log-part-6` from `main`. AC-23: TDD in `src/app/session.spec.ts`, title `(spec-006 AC-23)`: 100 solutions and 3 found gives "Found 3 of 100". ⚠️ May pass at once: report, and prove with a reverted break
- [ ] T058 [P] [US5] AC-24: TDD in `src/app/session.spec.ts`, title `(spec-006 AC-24)`: a count capped at 101 and 3 found gives "Found 3", in `counterText` in `src/app/session.ts`; `src/app/screen.spec.ts`: the counter's total is left out in `src/app/screen.ts`
- [ ] T059 [US5] Push and open "spec-006 part 6 of 6: very large totals". No flag, as recorded in research R13. The owner merges

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T060 Remove the `log`, `reopen`, `startAgain` and `remember` flags once released and signed off (constitution VII), in `src/app/features.ts`, `src/app/screen.ts`, `src/app/main.ts` and `playwright.config.ts`, in small pull requests
- [ ] T061 Run `specs/006-solution-log/quickstart.md` section 1 in full. The owner signs off the list on a real phone (SC-606) and runs the playtests (SC-602); record both in `specs/006-solution-log/tdd-log.md`
- [ ] T062 `npm run test-results -- 006-solution-log`: `specs/006-solution-log/test-results.md` must end `OVERALL status: PASS`, with AC-1 to AC-28 covered and specs 001 to 004 still passing (SC-605). Update `AGENTS.md`: the list, the saved format and `docs/adr/0004-saved-solutions.md`

---

## Dependencies & Execution Order

- **Phase 1** comes first; T003 stops on a failing baseline.
- **Phase 2 (library)** blocks everything: the game needs its parts.
- **US1** needs Phase 2 merged. **US2 and US3** need US1 merged: both start from the list. **US2 and US3 do not depend on each other**, but the tasks put US2 first.
- **US4** needs US3 **released**: remembering must not reach players before they can start again.
- **US5** needs only Phase 1, and can go at any point.
- **Within each part**, criteria run in order.

## Parallel Opportunities

- T006, T007, T008 and T011 touch different files.
- T053 and T054 are unit tests only, alongside T052.
- T057 and T058, in User Story 5, can run at any point.
- Everything else runs in order, because every checkpoint waits for the owner.

## Parallel Example: Phase 2

```text
T006 Puzzle.id in src/engine/types.ts
T007 tappable Surface in src/ui/simple/surface.ts
T008 read-only Button in src/ui/simple/button.ts
T011 Dialog in src/ui/simple/dialog.ts
```

## Implementation Strategy

- **MVP**: User Stories 1 and 2 together: the list and the read-only view. A list of bare numbers has little to see on its own.
- **Incremental**: each part is one pull request, live when merged. Each story merges with its flag off and goes live with a one-line pull request after the owner's preview.
- **At every point `main` is fit for players**, and any release can be undone: a flag off or a revert, each a pull request and a deploy of about 6 minutes. Saved solutions are left alone on the phone.
