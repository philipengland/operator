---

description: "Task list for spec-007, daily puzzles, seeded generator and presets"
---

# Tasks: Daily Puzzles, Seeded Generator and Presets (spec-007)

**Input**: design documents in `specs/007-seeded-generator/`: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md),
[acceptance.md](acceptance.md) (approved 2026-11-10, commit `514187c`).

**Tests**: mandatory and test-first (org baseline). The approved scenarios and DSL listed in
[acceptance.md](acceptance.md) are **locked**: tasks run them and never create, edit, skip or delete them. Each
acceptance criterion is an outer loop of red-green-refactor inner loops, recorded in
`specs/007-seeded-generator/tdd-log.md`.

**Existing unit tests are protected**: before amending or deleting one (most likely in
`src/ui/screens/play-screen.model.spec.ts` or `src/ui/combined/puzzle-grid.model.spec.ts`), tell the owner which test,
the exact change and why, and wait for their OK. Record it in `specs/007-seeded-generator/test-changes.md`.

**Organisation**: one pull request per release (constitution VII; plan, Release order). Every merge to `main` deploys, so
every pull request is fit for players. Each part branches from `main` after the previous part merges, and carries only
the approved Layer 1 file it makes pass, brought unchanged from `514187c`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1 to US4).

## Path Conventions

- `src/engine/`: the new `random.ts`, `presets.ts`, `count-solutions.ts`, `daily-puzzle.ts`, and their `*.spec.ts`; the sweeps `sweep-<preset>.spec.ts` and `golden-dates.spec.ts`; `types.ts` and `index.ts` changed.
- `src/app/`: the new `today.ts`, `today-record.ts`, `today-list.ts`, `daily.ts`; `session.ts`, `screen.ts`, `navigation.ts`, `labels.ts`, `features.ts` and `main.ts` changed.
- `src/ui/`: the new `combined/status-bar.*`, `combined/workings-strip.*`, `screens/today-list.*`; `combined/puzzle-grid.*` and `screens/play-screen.*` changed. Each component is `<name>.model.ts` (pure, unit-tested in `<name>.model.spec.ts`), `<name>.ts` (renderer, `builtFrom`) and `<name>.css`.
- `test/acceptance/play/`, `test/acceptance/dsl/`, `test/acceptance/library/`: Layers 1 and 2, locked.
- `test/acceptance/drivers/`: Layer 3, built here: `engine/daily.engine-driver.ts`, `ui/daily.ui-driver.ts`, `ui/phone.ui-driver.ts`, `ui/screen-names.ts`; the `daily` fixture in `test/acceptance/support/acceptance.ts`.
- Unit-test titles for criteria proved by unit tests name the criterion, e.g. `(spec-007 AC-3)`, one per title, so `npm run test-results` counts it.

## How every acceptance group works

1. **RED**: run the criterion's approved scenarios, for example `npm run test:acceptance:engine -- -g "spec-007 AC-1]"`, then `npm run build:flags-on` and `npm run test:acceptance:ui -- -g "spec-007 AC-1]"`. Quote the failure. A scenario that passes at RED is reported and proven by a deliberate, reverted break.
2. **Inner loops**: one failing unit test on its assertion, the smallest code, refactor. Commit test and code together at each green; refactors separately.
3. **GREEN**: the scenarios pass, then the full suite. Update `tdd-log.md` and tick the task.
4. **Checkpoint** with the owner, using generated evidence (`npm run test-results -- 007-seeded-generator --criterion AC-n`), unless the owner has said to run the story through.

---

## Phase 1: Setup

**Purpose**: the approved specifications, the record of work, and a clean baseline.

- [X] T001 Obtain approval of the scenarios, the DSL and the change to spec-003's lists, recorded in `specs/007-seeded-generator/acceptance.md` (commit `514187c`)
- [X] T002 Commit `specs/007-seeded-generator/tasks.md` on `007-seeded-generator`, by explicit path, never `specs/*/.speckit-board.json`. The spec, plan, research, data model, quickstart, contracts, checklist and `docs/adr/0005-daily-puzzles.md` are already committed (`7de75aa`, `4d05397`, `77c8400`)
- [X] T003 Create branch `007-seeded-generator-part-1` from `main`; create `specs/007-seeded-generator/tdd-log.md` from `.specify/presets/org-baseline/templates/tdd-log-template.md`; run the full suite and record it as the baseline, stopping if anything fails

---

## Phase 2: Foundational — the library additions (pull request 1)

**Purpose**: every new part, and the compact screen proved to fit, in the catalogue (research R7 to R9). **Players get**: no change.

**Checkpoint**: `[spec-003 AC-1]` passes with the new lists; the catalogue shows the compact Medium and Hard screens fitting at 375 × 667, and Medium at 320 × 568, with every target at least 44 × 44.

- [X] T004 Bring over unchanged from `514187c`, confirming each by blob: `test/acceptance/dsl/daily.dsl.ts`, `daily-vocabulary.ts`, `phone.dsl.ts`, `catalogue-vocabulary.ts`, `test/acceptance/drivers/daily.driver.ts`, `phone.driver.ts`, `test/acceptance/library/examples.ts`, `simple-components.acceptance-spec.ts`, `specs/007-seeded-generator/acceptance.md`, and the design documents. The four new scenario files and `test/acceptance/play/daily-examples.ts` stay behind
- [X] T005 Make the drivers compile: the `daily` fixture in `test/acceptance/support/acceptance.ts`; `test/acceptance/drivers/engine/daily.engine-driver.ts` and `ui/daily.ui-driver.ts` implementing `DailyDriver`; `dailyLayout` and `leaveUnreadableRecordOfLastPuzzle` in `ui/phone.ui-driver.ts`. Stubs return empty defaults, never throwing "not implemented"
- [X] T006 [P] TDD in `src/ui/combined/puzzle-grid.model.spec.ts`: the Puzzle grid draws any rows × columns (confirm with a 5 × 4 and a 7 × 5 sample before adding anything), and gains a prop to leave the workings beside lines visually hidden while keeping their accessible names (research R8), in `src/ui/combined/puzzle-grid.model.ts`, `puzzle-grid.ts`, `puzzle-grid.css`
- [X] T007 [P] TDD: new combined component Workings strip in `src/ui/combined/workings-strip.model.ts`, `workings-strip.ts`, `workings-strip.css`, built from Surface and Line working: two workings, or one line of text; hidden from screen readers (`aria-hidden`)
- [X] T008 [P] TDD: new combined component Status bar in `src/ui/combined/status-bar.model.ts`, `status-bar.ts`, `status-bar.css`, built from Solutions counter and Button: `region` "Status bar", one 44-pixel row holding the counter and the Today button
- [X] T009 [P] TDD: new screen Today list in `src/ui/screens/today-list.model.ts`, `today-list.ts`, `today-list.css`, in the Solution list's pattern: Operator header, heading "Today", "Back", one button row per choice ("Easy, found 1 of 4", "Collector, found 3"), then "Practice"
- [X] T010 TDD in `src/ui/screens/play-screen.model.spec.ts`: the play screen gains an optional Today button beside the counter on the full header, and a compact prop for grids bigger than 3 × 3: the Status bar in place of mascot, speech bubble and counter; no helper line; the Workings strip under the grid; main button at 44; 4-pixel gaps and 8-pixel padding at every size (research R9), in `src/ui/screens/play-screen.model.ts`, `play-screen.ts`, `play-screen.css`. Keep tier rules: no colours, fills, outlines, shadows, radii or type in combined or screen CSS (`tools/ui-tiers.spec.ts`)
- [X] T011 List and sample every new part and state in `src/catalogue/library.ts` and its samples: the Today list (counts with and without a total), the Status bar, the Workings strip (two workings, the prompt, the operator's line), and the compact play screen with a Medium-shaped 5 × 4 and a Hard-shaped 7 × 5 grid. `[spec-003 AC-1]` goes GREEN (`npm run test:acceptance:ui -- -g "spec-003 AC-1]"`), and every catalogue scenario still passes
- [X] T012 **Prove the fit** (research R9): in the catalogue at 375 × 667 and 320 × 568, measure the compact 5 × 4 and 7 × 5 screens: nothing below 44 × 44, the 7 × 5 pill column holds "× −500" within 64 pixels at 320 wide, and the 7 × 5 fits 375 × 667 without scrolling. Record the measurements in `research.md` R9. **If Hard cannot fit 375 × 667 at 44 pixels, stop and ask the owner**
- [X] T013 [P] Update `docs/contracts/component-library.md` from `contracts/component-library-changes.md`; `docs/contracts/engine-api.md`, `play-screen.md` and `saved-solutions.md` from the other three, each marked with the flag it depends on
- [X] T014 [P] Update `docs/brief/project-brief.md` (research R15): daily puzzles into the MVP (sharing stays Phase 3), negative targets in Hard and Collector, the new given cells and bands, each marked as the owner's decision of 2026-11-10
- [X] T015 Full suite, lint, typecheck, `npm run tests:guard`. Push and open "spec-007 part 1 of 5: library additions", noting the approved change to spec-003's lists and asking the owner to accept ADR 0005. The owner merges with a merge commit

---

## Phase 3: User Story 1 — Today's Easy puzzle (Priority: P1) 🎯 MVP

**Goal**: after the worked example, a player can open today's Easy puzzle, the same for every player on that date.

**Independent Test**: set the phone's date, open today's Easy puzzle, check it against the Easy preset, and solve it with the filling it was built from.

- [X] T016 [US1] Create `007-seeded-generator-part-2` from `main`; bring `test/acceptance/play/daily-easy.acceptance-spec.ts` and `daily-examples.ts` unchanged from `514187c` (confirm by blob). Add the `daily` flag, off, to `src/app/features.ts` as a named field; declare `__OPERATOR_FEATURES__` in `src/app/main.ts`; map `daily` to `**/play/daily-easy.acceptance-spec.ts` in `SCENARIOS_BEHIND_A_FLAG` in `playwright.config.ts`
- [X] T017 [P] [US1] TDD in `src/engine/random.spec.ts`: FNV-1a of a seed text (the same as `themeForSeed`'s), and `mulberry32` giving a fixed sequence for a fixed seed, and whole numbers 0 to n − 1 (research R1), in `src/engine/random.ts`. No `Math.random`
- [X] T018 [P] [US1] TDD in `src/engine/presets.spec.ts`: `PresetName` and `Preset` types in `src/engine/types.ts`; `PRESETS.easy` in `src/engine/presets.ts`: 3 × 3, `+ −`, open lines 0, given cells 4 to 5, targets 1 to 29 "never 0", band 1 to 10; `GENERATOR_VERSION = 'v1'`
- [X] T019 [US1] TDD in `src/engine/count-solutions.spec.ts`: `countSolutions(puzzle, workBudget) → { count, isWithinBudget }` in `src/engine/count-solutions.ts`: depth-first over empty cells in reading order; a complete line reaches its target with its shown operator, or multiplies the count by the open operators that reach it; an unfinished line is pruned by the exact per-operator bounds of research R4; stops at 101, or after `workBudget` steps with `isWithinBudget` false. Start with the worked example (count 2)
- [X] T020 [US1] TDD in `src/engine/daily-puzzle.spec.ts`: `dailyPuzzle(date, preset) → { puzzle, builtFrom }` in `src/engine/daily-puzzle.ts`, by research R3's steps from the seed `v1:<date>:<preset>`, drawing candidates until the count is within the band, at most 2,000; a malformed or impossible date, or an unknown preset, throws; `Puzzle` gains optional `seed` and `preset` in `src/engine/types.ts`; `id` is `daily-v1-<date>-<preset>`. Export the new surface from `src/engine/index.ts` (research R14)
- [X] T021 [US1] Measure Easy's work budget over every date of 2027 and fix it in `PRESETS.easy`; record the number and the sweep's time in `research.md` R4
- [X] T022 [US1] AC-3 and AC-5: `src/engine/sweep-easy.spec.ts`, titles `(spec-007 AC-3)` and `(spec-007 AC-5)`: every date of 2027 matches the Easy preset, `builtFrom` solves it, every target is whole and not 0, and the count equals the count by trying every filling and every open operator
- [X] T023 [US1] Pin Easy's golden dates in `src/engine/golden-dates.spec.ts`: the first of each month of 2027 (research R13), and 10 and 11 November 2026
- [X] T024 [US1] Engine daily driver in `test/acceptance/drivers/engine/daily.engine-driver.ts` (date, puzzle, rows, counter, entering `builtFrom`, `madeByTheEngineAlone`), sharing the session with the engine game driver; UI daily driver in `test/acceptance/drivers/ui/daily.ui-driver.ts` and `ui/screen-names.ts`, setting the date with `page.clock.setFixedTime` before the page loads (research R6)
- [X] T025 [US1] AC-1: TDD in `src/app/today.spec.ts`: the phone's local date as `YYYY-MM-DD` in `src/app/today.ts`; `src/app/daily.ts` makes each of today's puzzles once and keeps it for the session (research R5); in `src/app/session.spec.ts`: switching to a puzzle opens it with an empty grid, no selection, the greeting and "Found N of M"; in `src/app/labels.spec.ts`: "Easy puzzle, 3 by 3", cells "Row 2 column 3 cell, …" on daily grids, "Today's puzzles"; `src/app/today-list.ts` gives the Today screen's props (Easy and Practice with `presets` off); `src/app/navigation.ts` gains the `today` place, with history as for the list; `src/app/main.ts` shows the Today button only with `daily` on. The accessibility scan passes
- [X] T026 [US1] AC-2: the engine, the iPhone and the Android phone show the same Easy puzzle for 10 November 2026. ⚠️ May pass from AC-1: report, and prove with a reverted break
- [X] T027 [US1] AC-4: the filling it was built from is accepted, "Found 1 of M". ⚠️ May pass from AC-1: report, and prove with a reverted break
- [X] T028 [US1] AC-6: TDD in `src/app/screen.spec.ts`: a daily puzzle's theme is `themeForSeed(puzzle.seed)`; the worked example stays Classic (FR-712)
- [X] T029 [US1] AC-7: 10 and 11 November differ. ⚠️ May pass from AC-1: report, and prove with a reverted break
- [X] T030 [US1] AC-22: TDD in `src/app/session.spec.ts`: each puzzle keeps its own found solutions when switching (by puzzle identity, as spec-006 saves them); "Practice" opens the worked example at "Found 1 of 2" with Solution A listed
- [X] T031 [US1] FR-711: TDD in `src/app/labels.spec.ts` or `screen.spec.ts`: nothing shown or announced contains `builtFrom` before it is found. Measure Easy's opening time on the reference throttling and record it in `tdd-log.md` (SC-701)
- [ ] T032 [US1] Confirm `npm run build` shows no Today button with `daily` off, and the flags-on build passes `daily-easy.acceptance-spec.ts`. Update `tdd-log.md`. Push and open "spec-007 part 2 of 5: today's Easy puzzle (flag off)", noting that Easy's puzzles become fixed for good when `daily` goes on. The owner merges
- [ ] T033 [US1] **The owner reviews the flags-on build on a phone** (`npm run build:flags-on`, served by `npx vite preview --outDir dist-flags-on --host`, at the Wi-Fi address). Then a one-line pull request sets `daily` true in `src/app/features.ts`

---

## Phase 4: User Story 2 — Medium and Collector (Priority: P1)

**Goal**: a player chooses Medium or Collector from the Today screen; large grids use the compact screen.

**Independent Test**: set the phone's date, open today's Medium and Collector puzzles, and check each against its preset.

- [ ] T034 [US2] Create `007-seeded-generator-part-3` from `main`; bring `test/acceptance/play/medium-and-collector.acceptance-spec.ts` unchanged from `514187c` (confirm by blob); add the `presets` flag, off, in `src/app/features.ts` and `playwright.config.ts`
- [ ] T035 [P] [US2] TDD in `src/engine/presets.spec.ts`: `PRESETS.medium`: 5 × 4, `+ − ×`, open lines 4 to 5, given cells 10, targets 1 to 100 "never 0", band 2 to 20; `PRESETS.collector`: 4 × 3, `+ − × ÷`, all 7 open, no given cells, targets −29 to 29 "never 0", band 21 to 101. Negative targets allowed only for Collector (and Hard later), in `src/engine/daily-puzzle.ts`
- [ ] T036 [US2] Measure Medium's and Collector's work budgets over every date of 2027, fix them, and record them in `research.md` R4
- [ ] T037 [P] [US2] AC-11: `src/engine/sweep-medium.spec.ts` and `sweep-collector.spec.ts`, titles `(spec-007 AC-11)`: every date of 2027 matches its preset and AC-3 holds; pin Medium's and Collector's golden dates in `src/engine/golden-dates.spec.ts`
- [ ] T038 [US2] Drivers: Medium and Collector in the Today rows and the puzzle reading; `enterSolutionsAndCheck(count)` in both daily drivers, finding the first solutions with a search in the driver, never from the engine's contract; if that is too slow for Collector, stop and ask the owner. `dailyLayout` in `ui/phone.ui-driver.ts`
- [ ] T039 [US2] AC-8 and AC-9: Medium and Collector on the Today screen with `presets` on, in `src/app/today-list.ts`; each opens its puzzle; open pills read as today. The accessibility scan passes
- [ ] T040 [US2] AC-10: the counter reads "Found 3" with a capped total and never "All found!". ⚠️ May pass from spec-006 FR-616 (`totalToShow` in `src/app/session.ts`): report, and prove with a reverted break
- [ ] T041 [US2] AC-12: TDD in `src/app/screen.spec.ts`: grids bigger than 3 × 3 get the compact play screen (FR-719); grids wider than 3 columns leave their workings to the strip, which shows the selected cell's row and column, or "Tap a cell to see its row and column." (FR-718); after a Check the operator's line shows in the strip until a cell is tapped, and is still announced (Collector gains the strip for this line only). Both sizes fit with no scrolling; every target at least 44 × 44; the accessibility scan passes
- [ ] T042 [US2] AC-13: switching from Easy to Medium and back keeps "Found 1" and "Solution 1", with an empty grid. ⚠️ May pass from AC-22: report, and prove with a reverted break
- [ ] T043 [US2] Measure Medium's and Collector's opening times on the reference throttling and record them in `tdd-log.md` (SC-701)
- [ ] T044 [US2] Confirm `npm run build` lists only Easy and Practice with `presets` off, and the flags-on build passes. Update `tdd-log.md`. Push and open "spec-007 part 3 of 5: Medium and Collector (flag off)", noting that their puzzles become fixed for good when `presets` goes on. The owner merges
- [ ] T045 [US2] **The owner reviews the flags-on build on a phone**; then a one-line pull request sets `presets` true in `src/app/features.ts`

---

## Phase 5: User Story 3 — Hard (Priority: P2)

**Goal**: a player chooses today's Hard puzzle, ready within 1 second on the reference phone.

**Independent Test**: set the phone's date, open today's Hard puzzle, check it against the preset, and time it on the reference phone.

- [ ] T046 [US3] Create `007-seeded-generator-part-4` from `main`; bring `test/acceptance/play/hard.acceptance-spec.ts` unchanged from `514187c` (confirm by blob); add the `hard` flag, off, in `src/app/features.ts` and `playwright.config.ts`. While `hard` is off, AC-17 (`@budget`) must run against the flags-on build: add a flags-on speed project in `playwright.config.ts`, alone and after the others as `android-speed` is, and keep `android-speed` from running the unreleased file
- [ ] T047 [US3] TDD in `src/engine/presets.spec.ts`: `PRESETS.hard`: 7 × 5, `+ − × ÷`, open lines 1 to 2, given cells 21 to 22, targets −500 to 500 "never 0", band 1 to 3
- [ ] T048 [US3] Measure Hard's work budget and generation time over every date of 2027; fix the budget and record it in `research.md` R4. If the sweep takes over 60 seconds, speed up the search in `src/engine/count-solutions.ts` (no change to any count); if it still does, stop and tell the owner (research R12)
- [ ] T049 [US3] AC-15: `src/engine/sweep-hard.spec.ts`, titles `(spec-007 AC-15)`; pin Hard's golden dates in `src/engine/golden-dates.spec.ts`
- [ ] T050 [US3] AC-14: Hard on the Today screen with `hard` on, between Medium and Collector, in `src/app/today-list.ts`; the puzzle opens as the preset says
- [ ] T051 [US3] AC-16: Hard fits 375 × 667 without scrolling; at 320 × 568 it scrolls up and down only (FR-713); every target at least 44 × 44; the accessibility scan passes
- [ ] T052 [US3] AC-17: `secondsToOpen` in `ui/daily.ui-driver.ts`; Hard ready within 1 second on the reference throttling. If not, make puzzles in a Web Worker so the screen never freezes, within the 30 KB budget, and record it in `research.md` R5
- [ ] T053 [US3] Confirm `npm run build` does not list Hard with `hard` off, and the flags-on build passes, including the speed project. Update `tdd-log.md`. Push and open "spec-007 part 4 of 5: Hard (flag off)", noting that Hard's puzzles become fixed for good when `hard` goes on. The owner merges
- [ ] T054 [US3] **The owner reviews the flags-on build on a phone**; then a one-line pull request sets `hard` true in `src/app/features.ts`

---

## Phase 6: User Story 4 — A new day (Priority: P2)

**Goal**: the game reopens on the puzzle last played; the next day brings new puzzles and clears the last day's solutions.

**Independent Test**: on 10 November 2026, find one Medium solution and reload; then move the phone's date to 11 November 2026 and reopen.

- [ ] T055 [US4] Create `007-seeded-generator-part-5` from `main`; bring `test/acceptance/play/new-day.acceptance-spec.ts` unchanged from `514187c` (confirm by blob); add the `newDay` flag, off, in `src/app/features.ts` and `playwright.config.ts`
- [ ] T056 [US4] Drivers: `leaveUnreadableRecordOfLastPuzzle` in `ui/phone.ui-driver.ts`, setting `operator.today` before the page loads; changing the date between `closeAndReopen` calls in `ui/daily.ui-driver.ts`
- [ ] T057 [US4] AC-18: TDD in `src/app/today-record.spec.ts`: encode and decode `{ "format": 1, "date": "YYYY-MM-DD", "preset": "easy|medium|hard|collector" }` under `operator.today` in `src/app/today-record.ts`, written when one of today's puzzles is opened; `src/app/main.ts` opens today's puzzle for the preset last played, with its found solutions, an empty grid and the greeting
- [ ] T058 [US4] AC-19: TDD in `src/app/today-record.spec.ts`: a record of an earlier date removes that date's four `operator.solutions.daily-v1-<date>-<preset>` keys, never `operator.solutions.worked-example`, then is rewritten; `src/app/today.ts` reads the date again when the page becomes visible and when the Today screen opens; a puzzle already open stays open at midnight
- [ ] T059 [US4] AC-20: no record opens the worked example at "Found 0 of 2". ⚠️ May pass already: report, and prove with a reverted break
- [ ] T060 [US4] AC-21: TDD in `src/app/today-record.spec.ts`: not JSON, the wrong shape, a higher `format`, an unknown preset or a bad date is "unreadable", which opens today's Easy with no error; a higher `format` is never overwritten (ADR 0004)
- [ ] T061 [US4] Confirm `npm run build` opens the worked example and removes nothing with `newDay` off, and the flags-on build passes. Update `docs/contracts/saved-solutions.md` and `tdd-log.md`. Push and open "spec-007 part 5 of 5: a new day (flag off)". The owner merges
- [ ] T062 [US4] **The owner reviews the flags-on build on a phone**, including changing the phone's date; then a one-line pull request sets `newDay` true in `src/app/features.ts`

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T063 Remove the `daily`, `presets`, `hard` and `newDay` flags once released and signed off (constitution VII), in `src/app/features.ts`, `src/app/today-list.ts`, `src/app/main.ts` and `playwright.config.ts`, and the flags-on speed project, in small pull requests
- [ ] T064 Run `specs/007-seeded-generator/quickstart.md` in full. The owner signs off each story on a real phone (SC-706) and runs five hallway playtests (SC-703, SC-704); record both in `specs/007-seeded-generator/tdd-log.md`
- [ ] T065 `npm run test-results -- 007-seeded-generator`: `specs/007-seeded-generator/test-results.md` must end `OVERALL status: PASS`, with AC-1 to AC-22 covered and specs 001 to 006 still passing (SC-705). Update `AGENTS.md`: spec-007, the generator, `operator.today` and `docs/adr/0005-daily-puzzles.md`

---

## Dependencies & Execution Order

- **Phase 1** comes first; T003 stops on a failing baseline.
- **Phase 2 (library)** blocks everything; T012 can stop the feature if Hard cannot fit.
- **US1** needs Phase 2 merged: it builds the generator, counting, Today screen and switching that every later story uses.
- **US2** needs US1 merged. **US3** needs US2 merged: it uses the compact screen and strip from US2.
- **US4** needs US1 merged; it can come before US3 if the owner prefers, but the tasks put it last, as the plan does.
- **Flags go on in order**: `daily`, `presets`, `hard`, `newDay`. Each preset's puzzles are fixed for good when its flag goes on (research R13).
- **Within each part**, criteria run in order.

## Parallel Opportunities

- T006, T007, T008 and T009 are separate components; T013 and T014 are documents.
- T017 and T018 touch different engine files, before counting (T019) needs them.
- T035 and T037 can go alongside the drivers (T038).
- Everything else runs in order, because every checkpoint waits for the owner.

## Parallel Example: Phase 2

```text
T006 Puzzle grid, workings left to the strip, in src/ui/combined/puzzle-grid.ts
T007 Workings strip in src/ui/combined/workings-strip.ts
T008 Status bar in src/ui/combined/status-bar.ts
T009 Today list in src/ui/screens/today-list.ts
```

## Implementation Strategy

- **MVP**: User Story 1, today's Easy puzzle. It proves the generator, counting, the daily seed and the Today screen together, and gives players a new puzzle every day.
- **Incremental**: each part is one pull request, live when merged. Each story merges with its flag off and goes live with a one-line pull request after the owner's phone review.
- **The riskiest step comes first**: the compact screen is proved at both sizes in pull request 1, before any game wiring (research R9). Hard's speed is measured in its own part, with a Web Worker held back until the evidence needs one (research R5).
- **At every point `main` is fit for players**, and any release can be undone: a flag off or a revert. Solutions found stay on the phone. A released day's puzzle never changes, since a generator change needs a new version (research R13).
