---

description: "Task list for spec-004, themed play screen"
---

# Tasks: Themed Play Screen (spec-004)

**Input**: design documents in `specs/004-themed-play-screen/`: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md),
[contracts/play-screen.md](contracts/play-screen.md),
[contracts/component-library-changes.md](contracts/component-library-changes.md),
[quickstart.md](quickstart.md), [acceptance.md](acceptance.md) (approved 2026-11-08).

**Tests**: mandatory and test-first (org baseline). The approved scenarios and DSL listed in
[acceptance.md](acceptance.md) are **locked**: tasks run them and never create, edit, skip or delete
them. Each acceptance criterion is an outer loop of red-green-refactor inner loops, recorded in
`specs/004-themed-play-screen/tdd-log.md`.

**Organisation**: one release per user story (constitution VII; plan, Delivery; research R9). Every
merge to `main` deploys, so every pull request below is fit for players. Each part branches from
`main` after the previous part merges, and carries only the approved Layer 1 file it makes pass.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1 to US3).

## Path Conventions

- `src/app/`: session, labels, the new `screen.ts` and `features.ts`, wiring in `main.ts`.
- `src/ui/`: the component library (spec-003). Each component is `<name>.model.ts` (pure,
  unit-tested in `<name>.model.spec.ts`), `<name>.ts` (renderer, `builtFrom`) and `<name>.css`.
- `test/acceptance/play/`, `test/acceptance/dsl/`: Layers 1 and 2, locked.
- `test/acceptance/drivers/`: Layer 3 (`ui/game.ui-driver.ts`, `ui/phone.ui-driver.ts`,
  `ui/screen-names.ts`, `engine/game.engine-driver.ts`), built here.
- Unit-test titles for criteria proved by unit tests name the criterion, e.g. `(spec-004 AC-19)`,
  one criterion per title, so `npm run test-results` counts it.

## How every acceptance group works

- **RED**: run the criterion's scenarios with `node tools/run-acceptance.mjs ui -g "spec-004 AC-n]"`
  (and `engine` for the untagged keypad scenarios). Add only the Layer 3 driver code they need.
  Re-run: they must fail **because the behaviour is missing**, not because a driver is. Quote the
  failure in the TDD log.
- **TDD cycles**: one failing unit test, the smallest code to pass, then refactor. Commit
  `feat(…)` at each green and `refactor(…)` separately. The listed behaviours are the intended
  design; the actual cycles go in the TDD log.
- **GREEN**: the criterion's scenarios pass on both phones, the full suite is green except criteria
  not yet started, slice refactor, TDD log entry, then a **checkpoint: wait for the owner's approval
  before the next criterion.**
- A scenario that passes the first time it runs is **reported**, and its driver proven by a
  deliberate, reverted break before it is recorded as delivered (AGENTS.md). Likely cases are
  marked ⚠️.
- **Build before the phones.** `npm run build` for the game's projects. Stop any `npm run catalogue`
  or preview server first: the test runner reuses whatever is on its ports, and serves stale files.
- The game adds no styling of its own (FR-401). Anything new to see is added to the library first.

---

## Phase 1: Library additions (Release 1, pull request 1)

**Goal**: the four additions the game needs (research R2). Players see no change: the game's files
build byte-identical.

**Independent Test**: unit tests on the models; the new samples in the catalogue; every existing
catalogue scenario still passes.

- [X] T001 Create branch `004-themed-play-screen-part-1` from `main`. Bring over `specs/004-themed-play-screen/` from `004-themed-play-screen` (documents only; no Layer 1 file joins this part). Create `specs/004-themed-play-screen/tdd-log.md`. Run the full suite as the baseline and record it.
- [X] T002 [P] Button can show nodes after its label, as Badge does, in `src/ui/simple/button.ts` (a simple component may not import Icon, so Target pill supplies it). Decorative; the name does not change.
- [X] T003 TDD: an open Target pill whose line reaches its target shows the tick, through Button's `icon`, in `src/ui/combined/target-pill.model.ts` and `src/ui/combined/target-pill.ts`. Add the sample "Open, line correct" in `src/catalogue/samples.ts`. Heard as before: the name ends ", target reached".
- [X] T004 [P] TDD: Keypad takes `keysAvailable` (default true) in `src/ui/combined/keypad.model.ts` and `src/ui/combined/keypad.ts`. While false, every key and Oops is `aria-disabled="true"`, still focusable, and calls nothing; `update` switches it. Add the sample "Unavailable" in `src/catalogue/samples.ts`.
- [X] T005 Puzzle grid gains the actions `onCell(row, column)` and `onPill(axis, index)` in `src/ui/combined/puzzle-grid.ts` (Grid cell and Target pill pass their taps up). A given cell and a shown pill send nothing. Wiring: exercised by the game's scenarios in Phase 2.
- [X] T006 Play screen gains `isKeypadShown` (default true), `keysAvailable`, `announcement` and the actions `onCell` and `onPill` in `src/ui/screens/play-screen.ts`.
  - The announcement is a visually hidden `role="status"` region, written only when its text changes (`writeText` in `src/ui/component.ts`).
  - While it is not empty, the bubble's line is hidden from screen readers (research R2).
- [X] T007 `src/catalogue/screen-samples.ts`: "Row 1 correct" shows the greeting and "All found" shows "Every line connected, pal!" (in each theme's voice). spec-003 AC-17 must still pass: the new lines take the same number of lines in the bubble.
- [X] T008 `docs/contracts/component-library.md` gains the additions in [contracts/component-library-changes.md](contracts/component-library-changes.md). Full suite: every existing scenario passes, and `dist/` is byte-identical to `main`.
- [X] T009 Push and open "spec-004 part 1 of 4: library additions" (what, why, how tested, rollback; no change for players). The owner merges with a merge commit; it deploys with no visible change.

---

## Phase 2: User Story 1 — the new look (Priority: P1, Release 2, pull request 2) 🎯 MVP

**Goal**: players get the themed screen on the dotted page, with ticks, the mascot's greeting, and
results in the game's existing words. No keypad; digits by tapping. Unflagged (reason: research R9).

**Independent Test**: open the game and play both solutions by tapping cells; every spec-001,
spec-002 and spec-003 criterion passes; `themed-look.acceptance-spec.ts` passes on both phones.

### Before AC-1

- [X] T010 [US1] Create branch `004-themed-play-screen-part-2` from `main` after part 1 merges. Bring over, unchanged from the approved commit `f4da139` (confirm by blob): `test/acceptance/play/themed-look.acceptance-spec.ts`, `test/acceptance/dsl/game.dsl.ts`, `test/acceptance/dsl/phone.dsl.ts`, `test/acceptance/dsl/vocabulary.ts`, and the signatures in `test/acceptance/drivers/game.driver.ts` and `phone.driver.ts`.
- [X] T011 [US1] Placeholder readings so the interfaces compile, in `test/acceptance/drivers/ui/game.ui-driver.ts`, `ui/phone.ui-driver.ts` and `engine/game.engine-driver.ts`: each returns a value that cannot pass (spec-003 T085's pattern). Typecheck green. Run the full suite as this part's baseline.
- [X] T012 [US1] TDD: the flags (research R10). `src/app/features.ts`: `keypad` and `voice`, both false, and a pure `featuresForBuild(mode, released)`, unit-tested in `src/app/features.spec.ts`. `vite.config.ts` passes them through `define`; `package.json` gains `build:flags-on` (Vite mode, `dist-flags-on/`, git-ignored). The bundle budget applies to both builds.
- [X] T013 [US1] Flag testing (owner's approval 2026-11-08), in `playwright.config.ts`: projects `iphone-flagged` and `android-flagged` on a flags-on build, built and served by the test runner on its own port. While a flag is off, its Layer 1 file runs only on these projects (`keypad` → `keypad.acceptance-spec.ts`, `voice` → `operator-voice.acceptance-spec.ts`); once it is on, on the game's projects. `tools/test-results.ts` learns the two projects, test-first in `tools/test-results.spec.ts`. Confirm `.github/workflows/ci-deploy.yml` needs no change.

- [X] T013a [US1] TDD: `npm run test-results -- <feature> --criterion AC-n` reports one criterion from its real test results, every test on each run, with no tests shown as NOT COVERED (owner's request, 2026-11-08), in `tools/test-results.ts` and `tools/run-test-results.ts`. Each checkpoint from here on pastes this table, with the scenario link, its match with the approved commit, the original failure, the deliberate break, commits, whole-suite numbers and the re-run command, and a linked screenshot for criteria about how something looks.

### AC-1: the new screen

- [X] T014 [US1] AC-1 RED: real driver readings: `bubble`, `counterShown`, `pillShown`, `workingSlot`, `helperLine`, `mainButton` (game); `playScreenParts`, `isPillDashed`, `cellAppearance`, `coloursInUse`, `pageDots` (phone), reusing the catalogue's readings. Expected failure: `Operator header is above Solutions counter — Received: false` (the F0 screen has no header).
- [X] T015 [US1] AC-1 TDD cycles in `src/app/screen.spec.ts`: `playScreenProps(state, theme, features)` in `src/app/screen.ts` gives the header ("Hello, Operator!", the greeting from a new `bubbleLine` in `src/app/labels.ts`, unit-tested in `labels.spec.ts`), the counter, the pills ("Row 1 target 8, plus"; "Row 2 target 6, operator not chosen"), cells, workings, helper line, `isKeypadShown` false and the theme's button label.
- [X] T016 [US1] AC-1 the swap, as one commit so the game never ships half-changed:
  - `src/app/main.ts` applies `themeForSeed(undefined)`, imports the library's `tokens.css` and `page.css`, creates the library's play screen, and sends taps to the session.
  - `src/app/view.ts` and `src/app/styles.css` are removed, and `index.html`'s stylesheet link with them.
  - `test/acceptance/drivers/ui/game.ui-driver.ts`, `ui/screen-names.ts` and `ui/phone.ui-driver.ts` are re-pointed to [contracts/play-screen.md](contracts/play-screen.md) (research R3).
  - While re-pointing, `view()` reads the whole screen in one browser call instead of about 29, the root cause of spec-001 AC-12's timeouts (#17).
  - Every spec-001 and spec-002 scenario must pass unchanged. Any that cannot: **stop and ask**.
- [X] T017 [US1] AC-1 GREEN (six scenarios, both phones), slice refactor, checkpoint.

### AC-2 to AC-7

- [X] T018 [US1] AC-2 RED/GREEN. ⚠️ May pass once AC-1 is built: report, and prove with a reverted break (the main button without "Check" in its name).
- [ ] T019 [US1] AC-3 RED/GREEN, TDD in `src/app/screen.spec.ts`: a line that reaches its target gives its pill `reachesTarget` and the player's digits in it `isInCorrectLine`. Checkpoint.
- [ ] T020 [US1] AC-4 RED/GREEN, TDD in `src/app/labels.spec.ts` and `screen.spec.ts`: `announcement(kind, theme, isVoiceOn, countChanged, counter)` with the voice off is spec-001's message, then "Found N of 2" when the count changed; `bubbleLine` with the voice off is spec-001's message (FR-413). The driver's `announcement()` reads the status. Checkpoint.
- [ ] T021 [US1] AC-5 RED/GREEN: every pill ticked, dashed ones too (T003), and "All found! 2 of 2 ✓". Checkpoint.
- [ ] T022 [US1] AC-6 RED/GREEN at 375 × 667 and 320 × 568. ⚠️ May pass at RED (spec-003 AC-16 sized the screen, and here it has no keypad): report, and prove with a reverted break. Checkpoint.
- [ ] T023 [US1] AC-7 RED/GREEN: driver `typeface(text)` waits for `document.fonts.ready`. ⚠️ May pass at RED: report, and prove with a reverted break (a typeface file left out of the build). Checkpoint.

### Pull request 2

- [ ] T024 [US1] Confirm the Android speed-budget scenario (SC-405) still passes, and both builds are under the 30 KB budget. Copy [contracts/play-screen.md](contracts/play-screen.md) to `docs/contracts/play-screen.md`. `AGENTS.md`: the game uses the library, `src/app/` layout, the flags and their test projects, with why.
- [ ] T025 [US1] Run [quickstart.md](quickstart.md) sections 1 and 2 (steps for this release). `npm run test-results -- 004-themed-play-screen` reads BLOCKED, as expected until the last story, with AC-1 to AC-7 passing. Commit it.
- [ ] T026 [US1] Push and open "spec-004 part 2 of 4: the new look". **Before merging, the owner reviews the real build on a phone** (`npm run build && npx vite preview --host`, the printed `Network:` address, and a checklist for this story); changes are made on the branch until the owner is happy (SC-403, first visible release). Record the sign-off in `tdd-log.md`. The owner merges with a merge commit; **players get the new screen**.

---

## Phase 3: User Story 2 — the keypad (Priority: P1, Release 3, pull request 3)

**Goal**: select a cell, then keys and Oops. Merges behind `keypad`, off; released by a one-line pull
request.

**Independent Test**: on the flags-on build, select each changeable cell and use the keys and Oops;
tapping cells still steps them; `keypad.acceptance-spec.ts` passes on the flagged phones and the
engine driver.

- [ ] T027 [US2] Create branch `004-themed-play-screen-part-3` from `main` after part 2 merges. Bring over `test/acceptance/play/keypad.acceptance-spec.ts` unchanged from `f4da139` (confirm by blob).
- [ ] T028 [US2] AC-8 RED: drivers' `tapKey`, `selectedCell`, `keypad` (UI: `aria-pressed`, the group "Keypad", `aria-disabled`; engine: from the session and `playScreenProps`). Expected failure: `the selected cell — Expected: "top-right", Received: null`.
- [ ] T029 [US2] AC-8 TDD in `src/app/session.spec.ts`: the session gains `selected`, null at first; tapping a changeable cell selects it and steps it (FR-404); `playScreenProps` shows the selection and the keypad only with `features.keypad`, tested with the flag on and off in `src/app/screen.spec.ts`. GREEN on the flagged phones and the engine driver; checkpoint.
- [ ] T030 [US2] AC-9 TDD in `session.spec.ts`: `key(digit)` sets the selected cell and clears the message; the working follows. GREEN; checkpoint.
- [ ] T031 [US2] AC-10 TDD: `clear` empties the selected cell. GREEN; checkpoint.
- [ ] T032 [US2] AC-11 RED/GREEN. ⚠️ May pass after AC-8: report, and prove with a reverted break. Checkpoint.
- [ ] T033 [US2] AC-12 TDD: with nothing selected, `key` and `clear` change nothing; `playScreenProps` gives `keysAvailable` false. GREEN (FR-405); checkpoint.
- [ ] T034 [US2] AC-13 RED/GREEN: a given cell is not selected and the selection stays. ⚠️ May pass after AC-8: report, and prove with a reverted break. Checkpoint.
- [ ] T035 [US2] AC-14 RED/GREEN. ⚠️ May pass: report, and prove with a reverted break. Checkpoint.
- [ ] T036 [US2] AC-20 RED/GREEN: the keypad between the grid and the main button, on both screen sizes. If it does not fit, adjust the library's size tokens (`src/ui/foundations/tokens.css`), not the game. Checkpoint.
- [ ] T037 [US2] The four edge cases in `keypad.acceptance-spec.ts` RED/GREEN. ⚠️ Report any that pass at once, and prove with a reverted break. Checkpoint.
- [ ] T038 [US2] Confirm `npm run build` gives players no keypad and no selection (flag off: the game's phone projects still pass), and the flags-on build passes `keypad.acceptance-spec.ts`. Push and open "spec-004 part 3 of 4: the keypad (flag off)". The owner merges with a merge commit; no change for players.
- [ ] T039 [US2] **The owner reviews the flags-on build on a phone** (`npm run build:flags-on`, served by `npx vite preview --outDir dist-flags-on --host`, with a checklist for this story); changes are made until the owner is happy. Then a one-line pull request sets `keypad` true in `src/app/features.ts` ("release the keypad"). `verify` runs every scenario with it on. The owner merges; **players get the keypad**. Record the sign-off in `tdd-log.md`.

---

## Phase 4: User Story 3 — the voice (Priority: P2, Release 4, pull request 4)

**Goal**: results in the mascot's voice, with spec-001's words heard first. Merges behind `voice`,
off; released by a one-line pull request.

**Independent Test**: on the flags-on build, submit each kind of grid and read the bubble;
`operator-voice.acceptance-spec.ts` passes on the flagged phones; the Midnight blue unit tests pass.

- [ ] T040 [US3] Create branch `004-themed-play-screen-part-4` from `main` after the keypad's release merges. Bring over `test/acceptance/play/operator-voice.acceptance-spec.ts` unchanged from `f4da139` (confirm by blob). Remove the `keypad` flag (it is released and signed off, and this part touches the same files): `src/app/features.ts`, `screen.ts`, `playwright.config.ts`.
- [ ] T041 [US3] AC-15 RED/GREEN. ⚠️ The greeting and "nothing announced" pass from Phase 2: report, and prove with a reverted break (the greeting placed in the status).
- [ ] T042 [US3] AC-16 RED, then TDD in `src/app/labels.spec.ts`: `bubbleLine` with the voice on gives each line of the Messages table with the theme's address and sign-off; `announcement` with the voice on is spec-001's message, the line, then the count when it changed. GREEN on the flagged phones; checkpoint.
- [ ] T043 [US3] AC-17 RED/GREEN. ⚠️ May pass after AC-16: report, and prove with a reverted break. Checkpoint.
- [ ] T044 [US3] AC-18 RED/GREEN: the status is emptied silently and the bubble returns to the greeting. ⚠️ May pass: report, and prove with a reverted break. Checkpoint.
- [ ] T045 [P] [US3] AC-19 TDD in `src/app/labels.spec.ts`, title `(spec-004 AC-19)`: "Fill the grid, chief." and "You're connected! Next, please, chief!" for Midnight blue.
- [ ] T046 [US3] Confirm `npm run build` gives players the plain messages (flag off), and the flags-on build passes `operator-voice.acceptance-spec.ts`. Push and open "spec-004 part 4 of 4: the voice (flag off)". The owner merges with a merge commit; no change for players.
- [ ] T047 [US3] **The owner reviews the flags-on build on a phone** (`npm run build:flags-on`, served by `npx vite preview --outDir dist-flags-on --host`, with a checklist for this story); changes are made until the owner is happy. Then a one-line pull request sets `voice` true in `src/app/features.ts` ("release the voice"). The owner merges; **players get the voice**.

---

## Phase 5: Polish and closing spec-004

- [ ] T048 Remove the `voice` flag in a small pull request once released and signed off (constitution VII): `src/app/features.ts`, `src/app/screen.ts`, `src/app/labels.ts`, `playwright.config.ts`. If no flags remain, keep `features.ts` and the flagged projects only if another story is about to use them; otherwise record the choice in the pull request.
- [ ] T049 Run [quickstart.md](quickstart.md) sections 1 to 3 in full. The owner signs off the finished screen on a real phone (SC-403) and runs the playtests (SC-401, SC-402); record both in `specs/004-themed-play-screen/tdd-log.md`.
- [ ] T050 `npm run test-results -- 004-themed-play-screen`: `specs/004-themed-play-screen/test-results.md` must end `OVERALL status: PASS` with AC-1 to AC-20 covered; spec-001, spec-002 and spec-003 still pass (SC-404). Update `AGENTS.md` to match (`view.ts` gone; the game's screen). Commit in the same small pull request.

---

## Dependencies & Execution Order

- **Phase 1 (library)** comes first: the game needs its additions (FR-401). Blocks everything.
- **US1 (Phase 2)** needs Phase 1 merged. It also brings the flag mechanism (T012, T013).
- **US2 and US3** each need US1 released. The tasks put US2 first (P1 before P2); they do not depend on each other, except that T040 removes the `keypad` flag.
- **Within each part**, criteria run in order, because each checkpoint waits for the owner.
- **After this feature**: spec-005, reopening the game with no connection (owner decision 2026-11-08). Its scope is not in these tasks.

## Parallel Opportunities

- T002 and T004 (different components).
- T045 (the Midnight blue wording, unit tests only) alongside T043 and T044.
- Everything else runs in order because every checkpoint waits for the owner.

## Implementation Strategy

- **MVP**: Release 2, User Story 1: the game in its new look, with both solutions playable by tapping.
- **Incremental**: each release is one pull request, live when merged. The keypad and the voice
  merge with their flags off and go live with a one-line pull request after the owner's preview.
- **At every point `main` is fit for players**, and any release can be undone: a flag off, or a
  revert, each a pull request and a deploy of about 6 minutes.
