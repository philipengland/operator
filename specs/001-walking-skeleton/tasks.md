---

description: "Task list for the F0 walking skeleton"
---

# Tasks: Walking Skeleton (F0)

**Input**: design documents in `specs/001-walking-skeleton/`: [plan.md](plan.md),
[spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md),
[contracts/](contracts/), [quickstart.md](quickstart.md), [acceptance.md](acceptance.md)
(approved 2026-11-02).

**Tests**: mandatory and test-first (org baseline). The approved scenarios and DSL listed in
[acceptance.md](acceptance.md) are **locked**: tasks run them and never create, edit, skip or
delete them. Each acceptance criterion is an outer loop of red-green-refactor inner loops,
recorded in `specs/001-walking-skeleton/tdd-log.md`.

**Organisation**: grouped by user story, then by acceptance criterion in the order the spec
lists them. Each criterion has three tasks: RED (drivers), TDD cycles, GREEN and checkpoint.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1, US2, US3).

## Path Conventions

Single project at the repository root, as in [plan.md](plan.md):

- `src/engine/`: pure rules, no DOM or Node. Unit tests next to the code: `<file>.spec.ts`.
- `src/app/`: `session.ts` (pure reducer), `labels.ts` (pure wording and accessible names),
  `view.ts` and `main.ts` (DOM), `styles.css`.
- `test/acceptance/`: locked Layers 1 and 2. Layer 3 lives in `drivers/engine/`,
  `drivers/ui/`, `drivers/delivery/` and `support/`.

## How every acceptance group works

- **RED** task: run the criterion's scenarios with `npm run test:acceptance -- -g "spec-001 AC-n"`.
  Add only the Layer 3 driver methods they need: the in-process (engine) driver first, then the
  Playwright UI driver. Re-run: the scenarios must fail **because the behaviour is missing**,
  not because a driver is. Quote the failure in the TDD log.
- **TDD cycles** task: one failing unit test, the smallest code to pass it, then refactor.
  Commit `feat(<scope>): …` at each green and `refactor(<scope>): …` separately. The listed
  behaviours are the intended design; the actual cycles go in the TDD log.
- **GREEN** task: the criterion's scenarios pass through the engine project and both UI
  projects, with axe clean on every page. The full suite is green except criteria not yet
  started. Then a slice refactor, the TDD log entry, and a checkpoint: **wait for the owner's
  approval before the next criterion.**
- If a scenario passes the first time it runs, **stop and report**. The behaviour already
  exists, or the scenario does not test what the criterion says. Groups where this is likely
  are marked ⚠️.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: the toolchain the plan names, with the build-time checks the constitution requires.

- [X] T001 Add the remaining development dependencies with exact versions to `package.json` (this task explicitly authorises them, per plan Technical Context and research R11): `vite`, `vitest`, `@vitest/coverage-v8`, `eslint`, `@eslint/js`, `typescript-eslint`, `@axe-core/playwright`, `yaml` (the delivery driver reads the workflow). Add the scripts `dev` (vite), `build` (vite build), `preview` (vite preview), `lint` (eslint .), `typecheck` (tsc for the app, then tsc for `src/engine/tsconfig.json`, then the acceptance tsconfig) and `test` (vitest run --coverage). Keep `test:acceptance` and `typecheck:acceptance`.
- [X] T002 [P] Create `tsconfig.json` (app: strict, `noUncheckedIndexedAccess`, `lib: ["ES2022", "DOM"]`, `include: ["src"]`) and `src/engine/tsconfig.json` (`lib: ["ES2022"]`, `types: []`, `include: ["./**/*.ts"]`), so any DOM, Node or timer global in the engine fails type-checking (research R2).
- [X] T003 [P] Create `eslint.config.js` with `typescript-eslint` strict rules, plus: `complexity` 10, `max-params` 3 warn and 6 error, `max-depth` 3, `no-magic-numbers` (0, 1, -1, 2 allowed; `*.spec.ts` and `test/**` exempt). On `src/engine/**`: `no-restricted-imports` forbidding any package and any path outside `src/engine/`, `no-restricted-globals` for `window`, `document`, `navigator`, `localStorage`, `setTimeout`, `setInterval`, `Date`, and `no-restricted-properties` for `Math.random` (research R2, constitution II and III). Ignore `dist/`, `coverage/`, `test-results/`, `playwright-report/`.
- [X] T004 [P] Create `vite.config.ts`: `base: './'`, `build.outDir: 'dist'`, single `index.html` entry, no external assets (research R6, R7). Add a build plugin that writes the commit (`GITHUB_SHA`, falling back to `git rev-parse HEAD`) into `<meta name="version">`, and fails the build if the combined gzipped JavaScript and CSS exceed 30 KB (research R9).
- [X] T005 [P] Create `vitest.config.ts`: `include: ['src/**/*.spec.ts']`, `environment: 'node'`, `clearMocks: true`, v8 coverage over `src/engine/**` and `src/app/session.ts` and `src/app/labels.ts` with a 90% line and branch threshold.
- [X] T006 Create `index.html` per [contracts/play-screen.md](contracts/play-screen.md) Page section: `<html lang="en">`, `<title>Operator</title>`, the viewport meta with `viewport-fit=cover`, `<meta name="version">` placeholder, `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'">`, a single `<main>` root, `src/app/styles.css` and `src/app/main.ts` (empty module for now). Confirm `npm run build` produces `dist/` with relative asset paths.
- [X] T007 Prove the engine boundary: temporarily add `document.title` and an `import '../app/main'` to a scratch file in `src/engine/`. Confirm `npm run typecheck` and `npm run lint` both fail, then delete the scratch file. Record the two failure messages in the TDD log's Setup section.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: driver selection and the Layer 3 skeletons every criterion builds on.

**⚠️ CRITICAL**: no acceptance group can start until this phase is complete.

- [X] T008 Replace the placeholder `test/acceptance/support/acceptance.ts` with driver selection: `ACCEPTANCE_DRIVER=engine` (default) gives `game` the in-process driver; `ACCEPTANCE_DRIVER=ui` gives `game` and `phone` Playwright drivers sharing one page. `delivery` always uses the delivery driver. Keep the fixture names `game`, `phone` and `delivery`. Do not touch any locked file.
- [X] T009 Update `playwright.config.ts` with projects: `engine` (no browser; `grepInvert: /@ui|@after-publish/`), `iphone` (WebKit, `devices['iPhone SE']` viewport 375 × 667, `grepInvert: /@budget|@after-publish/`) and `android` (Chromium, Pixel profile at 375 × 667, `grepInvert: /@after-publish/`). The UI projects get `webServer: npm run preview` on `dist/` and `ACCEPTANCE_BASE_URL`. Use `trace: 'on-first-retry'` and `retries: process.env.CI ? 1 : 0` for diagnostics only (Playwright standard). Add `test:acceptance:engine` and `test:acceptance:ui` scripts.
- [X] T010 [P] Create `test/acceptance/support/axe.ts`: one helper that runs `@axe-core/playwright` with the tags `wcag2a`, `wcag2aa` and `wcag22aa` and fails on any violation. The UI driver calls it after every navigation and every action that changes the page (Playwright standard).
- [X] T011 [P] Create `test/acceptance/drivers/engine/game.engine-driver.ts` implementing `GameDriver` over `src/app/session.ts`, with every method returning a default (empty view, zero announcements). Create `src/app/session.ts` with the types from [data-model.md](data-model.md) "Session" and a reducer that returns its input unchanged. These are stubs only, with no behaviour.
- [X] T012 [P] Create `test/acceptance/drivers/ui/game.ui-driver.ts` (`GameDriver`) and `test/acceptance/drivers/ui/phone.ui-driver.ts` (`PhoneDriver`) as Playwright classes whose methods return defaults. They locate elements only by role and accessible name ([contracts/play-screen.md](contracts/play-screen.md)) and never assert outcomes.
- [X] T013 Create `specs/001-walking-skeleton/tdd-log.md` from `.specify/presets/org-baseline/templates/tdd-log-template.md`. Run the baseline (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`) and record it. The baseline must be green. The 31 approved scenarios are expected to be red at this point: they are the outer-loop targets, not baseline failures. Record their count, and that every one fails on a missing behaviour or default stub.

**Checkpoint**: the toolchain is green and every approved scenario runs and fails. Acceptance groups can start.

---

## Phase 3: User Story 1 - Solve the puzzle on a phone (Priority: P1) 🎯 MVP

**Goal**: the 2 × 2 puzzle renders on a phone; the player fills cells and open operators by
tapping and checks the grid. See [stories/us1-solve-the-puzzle.md](stories/us1-solve-the-puzzle.md).

**Independent test**: open the game on a phone, enter Solution A, check, and see "Found 1 of 2".

### AC-1 The opening grid

- [X] T014 [US1] AC-1 RED: engine driver `open()` (fresh session from `workedExample`) and `view()` (maps `SessionState` to `GameView`: cell values as `1`–`9` or `'empty'`, `isGiven`, targets, operator `choice` as a symbol or `'not chosen'`, `isOpen`, `counter`, `result: null`). UI driver `open()` (navigate to `ACCEPTANCE_BASE_URL`, wait for the "Puzzle" group, run axe) and `view()` (read cell buttons, targets, operator buttons and the `status` region by role and name). Phone driver `layout()` (bounding boxes of cells, targets, operators, counter and Check, plus the screen size). Files: `test/acceptance/drivers/engine/game.engine-driver.ts`, `test/acceptance/drivers/ui/game.ui-driver.ts`, `test/acceptance/drivers/ui/phone.ui-driver.ts`. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T015 [US1] AC-1 TDD cycles. Engine: `workedExample` has `rows: 2`, `columns: 2`, givens `[[6, null], [null, null]]`, rows `{8, +}` and `{6, open}`, columns `{3, open}` and `{6, ×}`, `solutionCount: 2` (data-model "Puzzle"); `emptyEntry` leaves every changeable cell `null` and every open operator `null`; `isGiven` is true only for top-left. App: the session's initial state uses `workedExample`, `emptyEntry`, an empty `found` set and `message: null`; `counterText` is `Found ${found.size} of ${puzzle.solutionCount}`; `labels.ts` produces "Top-left cell, given 6", "Top-right cell, empty", "Row 1 operator, plus", "Row 2 operator, not chosen", "Row 1 target 8". Then `view.ts` renders the grid per [contracts/play-screen.md](contracts/play-screen.md), with row targets left of their rows and column targets above their columns, and `main.ts` mounts it.
- [X] T016 [US1] AC-1 scenarios GREEN through all three projects (both AC-1 scenarios; the layout one runs in the UI projects only); slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-2 Tapping an empty cell

- [X] T017 [US1] AC-2 RED: engine driver `tapCell(cell)` dispatches `tapCell(row, column)` to the session. UI driver `tapCell(cell)` taps the cell button by its accessible name, waits for its name to change, and runs axe. Files: `test/acceptance/drivers/engine/game.engine-driver.ts`, `test/acceptance/drivers/ui/game.ui-driver.ts`. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T018 [US1] AC-2 TDD cycles. Engine: `nextCellValue(null)` is `1`; `nextCellValue(n)` is `n + 1` for 1 to 8. App: session `tapCell` on a changeable cell moves its value one step; `view.ts` re-renders the cell's text and accessible name; `main.ts` turns a tap on a cell into `tapCell`.
- [X] T019 [US1] AC-2 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-3 Clearing a cell

- [X] T020 [US1] AC-3 RED: no new driver methods expected. Run the scenario and confirm it fails because 9 does not step to empty. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T021 [US1] AC-3 TDD cycles. Engine: `nextCellValue(9)` is `null` ("empty → 1 → … → 9 → empty", data-model "Cell value cycle"). Files: `src/engine/cycles.ts` (tests in `src/engine/cycles.spec.ts`).
- [X] T022 [US1] AC-3 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-4 The given cell

- [X] T023 [US1] AC-4 RED: phone driver `look(cell)` returns `colours` (computed colour and background colour) and `markings` (every visible non-colour feature: border style and width, font weight, background image or pattern, text decoration, and any visible "given" text). UI driver taps on an `aria-disabled` button still go through. Files: `test/acceptance/drivers/ui/phone.ui-driver.ts`, `test/acceptance/drivers/ui/game.ui-driver.ts`. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T024 [US1] AC-4 TDD cycles. App: session `tapCell` on a given cell leaves the state unchanged (FR-004). `view.ts` and `styles.css` mark the given cell with `aria-disabled="true"` and a non-colour pattern or border, not colour alone (constitution IV).
- [X] T025 [US1] AC-4 scenarios GREEN (the look scenario runs in the UI projects only); slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-5 A cell only ever holds 1 to 9 or nothing ⚠️

- [X] T026 [US1] AC-5 RED: no new driver methods expected. ⚠️ This scenario may already pass after AC-2 and AC-3. If it does, stop and report it to the owner before going on. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T027 [US1] AC-5 TDD cycles: only if the scenario is red. Engine: `nextCellValue` never returns 0 or anything outside `Digit | null` (data-model: "Zero and anything else are unrepresentable"). Files: `src/engine/cycles.ts` (tests in `src/engine/cycles.spec.ts`).
- [X] T028 [US1] AC-5 scenarios GREEN; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-6 Choosing an open operator

- [X] T029 [US1] AC-6 RED: engine driver `tapOperator(line)` dispatches `tapOperator` with the line's axis and index. UI driver `tapOperator(line)` taps the operator button by name, waits for its name to change, and runs axe. Files: `test/acceptance/drivers/engine/game.engine-driver.ts`, `test/acceptance/drivers/ui/game.ui-driver.ts`. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T030 [US1] AC-6 TDD cycles. Engine: `nextOperator(null)` is `+`; then `+ → −`, `− → ×`, `× → ÷`, `÷ → +` ("There is no step back to not chosen", data-model "Operator"). App: session `tapOperator` on an open line moves one step; `labels.ts` names operators "plus", "minus", "times", "divide"; `view.ts` and `main.ts` wire operator taps.
- [X] T031 [US1] AC-6 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-7 Shown operators cannot change ⚠️

- [X] T032 [US1] AC-7 RED: no new driver methods expected. ⚠️ This may already pass if AC-6 only cycles open lines. If so, stop and report. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [X] T033 [US1] AC-7 TDD cycles: only if red. App: session `tapOperator` on a shown line leaves the state unchanged (FR-005); `view.ts` renders shown operators as `aria-disabled="true"` buttons.
- [X] T034 [US1] AC-7 scenarios GREEN; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-8 Checking a correct grid

- [X] T035 [US1] AC-8 RED: engine driver `check()` dispatches `submit`; `view().result` maps the session `Message` kind to `Result` ("new-solution" → "new solution", and so on); `announcementCount()` counts the messages set since opening. UI driver `check()` taps the "Check" button and waits for the status region to change; `view().result` maps the visible message to a `Result`; `announcementCount()` counts text additions to the `role="status"` region (a MutationObserver installed at open).
- [X] T036 [US1] AC-8 TDD cycles. Engine: `evaluateLine([6, 2], '+')` is `{ ok: true, value: 8 }`; `evaluateLine([2, 3], '×')` is 6; `evaluateLine([6, 2], '÷')` is 3; `evaluateLine([3, 3], '+')` is 6; `evaluateLine([6, 3], '−')` is 3; lines are worked in reading order. `checkEntry` returns `solved` with key `"2,2,3|×|÷"` for Solution A (data-model "SolutionKey") and uses the given digit in place of the entry's value at a given position. `defaultRules.operatorOrder` is `'left-to-right'`. App: session `submit` on a solved, new key adds it to `found` and sets `message: new-solution`; `labels.ts` gives the result wording; `view.ts` writes the message and counter into the `role="status"` region; `main.ts` wires Check.
- [X] T037 [US1] AC-8 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-9 A line that goes below zero

- [ ] T038 [US1] AC-9 RED: no new driver methods expected. Confirm the scenario fails because the below-zero line is not rejected. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [ ] T039 [US1] AC-9 TDD cycles. Engine: `evaluateLine([6, 9], '−')` is `{ ok: false, reason: 'below-zero', step: 1 }`; a line fails on the first such step even if a later step would reach the target (spec Edge Cases); `checkEntry` returns `not-solved` for the below-zero example. App: session `submit` on `not-solved` sets `message: not-solved` and leaves `found` unchanged. Files: `src/engine/evaluate-line.ts`, `src/engine/check-entry.ts` (tests next to each), `src/app/session.ts` (tests in `src/app/session.spec.ts`).
- [ ] T040 [US1] AC-9 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-10 A line that does not divide exactly

- [ ] T041 [US1] AC-10 RED: no new driver methods expected. Confirm the scenario fails because inexact division is not rejected. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [ ] T042 [US1] AC-10 TDD cycles. Engine: `evaluateLine([6, 4], '÷')` is `{ ok: false, reason: 'inexact-division', step: 1 }`; `checkEntry` returns `not-solved` for the inexact-division example. Files: `src/engine/evaluate-line.ts`, `src/engine/check-entry.ts` (tests next to each).
- [ ] T043 [US1] AC-10 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-11 Checking before everything is filled

- [ ] T044 [US1] AC-11 RED: no new driver methods expected. Confirm both scenarios fail. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [ ] T045 [US1] AC-11 TDD cycles. Engine: `checkEntry` returns `incomplete` with `missingCells` listing an empty changeable cell, and with `missingOperators` listing an open line whose operator is `null`; it returns `incomplete` before evaluating any line (FR-010). App: session `submit` on `incomplete` sets `message: incomplete` and leaves `found` unchanged; `labels.ts` gives the "fill everything first" wording.
- [ ] T046 [US1] AC-11 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### AC-20 The message goes once the grid changes

- [ ] T047 [US1] AC-20 RED: no new driver methods expected. Confirm the first scenario fails because the message stays after a changeable tap. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.
- [ ] T048 [US1] AC-20 TDD cycles. App: session `tapCell` and `tapOperator` on a changeable target set `message: null`; on a given cell or shown line they leave `message` unchanged (data-model "Actions and transitions"); `view.ts` clears the message text without adding anything new to the status region, so screen readers announce nothing (FR-014).
- [ ] T049 [US1] AC-20 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`.

### US1 through the UI

- [ ] T050 [US1] Run every US1 scenario (AC-1 to AC-11, AC-20) through the `engine`, `iphone` and `android` projects with `npm run test:acceptance`. All pass, with axe clean on every page. Check by hand at 375 × 667 that every button is at least 48 × 48 CSS px, content sits inside `env(safe-area-inset-*)`, `touch-action: manipulation` is set, and transitions are off under `prefers-reduced-motion` ([contracts/play-screen.md](contracts/play-screen.md) Layout guarantees). Record this in the TDD log.

**Checkpoint**: User Story 1 works on its own. This is the MVP.

---

## Phase 4: User Story 2 - Find both solutions (Priority: P2)

**Goal**: each distinct solution counts once, and the game says when every solution has been
found. See [stories/us2-find-both-solutions.md](stories/us2-find-both-solutions.md).

**Independent test**: check Solution A, then Solution B, and see "Found 2 of 2"; check A again
and the count stays at 2.

### AC-12 Finding a second, different solution

- [ ] T051 [US2] AC-12 RED: engine and UI drivers map the `all-found` message kind to "new solution, every solution found". Confirm the scenario fails. Files: `test/acceptance/drivers/engine/game.engine-driver.ts`, `test/acceptance/drivers/ui/game.ui-driver.ts`. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.
- [ ] T052 [US2] AC-12 TDD cycles. Engine: Solution B's key is `"2,3,3|+|−"` and differs from Solution A's (FR-012). App: session `submit` with a new key that brings `found.size` to `puzzle.solutionCount` sets `message: all-found`; `labels.ts` gives the all-found wording; the grid stays editable (FR-014).
- [ ] T053 [US2] AC-12 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.

### AC-13 Checking the same solution twice

- [ ] T054 [US2] AC-13 RED: drivers map the `already-found` message kind to "already found". Confirm the scenario fails. Files: `test/acceptance/drivers/engine/game.engine-driver.ts`, `test/acceptance/drivers/ui/game.ui-driver.ts`. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.
- [ ] T055 [US2] AC-13 TDD cycles. App: session `submit` with a key already in `found` sets `message: already-found` and does not grow `found`; `labels.ts` gives the already-found wording.
- [ ] T056 [US2] AC-13 scenarios GREEN; slice refactor; TDD log; checkpoint. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.

### AC-14 Checking a found solution after all are found ⚠️

- [ ] T057 [US2] AC-14 RED: no new driver methods expected. ⚠️ Likely to pass already after AC-12 and AC-13. If so, stop and report. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.
- [ ] T058 [US2] AC-14 TDD cycles: only if red. App: `found` never grows past `puzzle.solutionCount`.
- [ ] T059 [US2] AC-14 scenarios GREEN; TDD log; checkpoint. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.

### AC-15 The order solutions are found in does not matter ⚠️

- [ ] T060 [US2] AC-15 RED: no new driver methods expected. ⚠️ May already pass after AC-12. If so, stop and report. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.
- [ ] T061 [US2] AC-15 TDD cycles: only if red. App: `all-found` depends only on the size of `found`, not on which solution came first. Files: `src/app/session.ts` (tests in `src/app/session.spec.ts`).
- [ ] T062 [US2] AC-15 scenarios GREEN; TDD log; checkpoint. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.

### AC-16 The grid stays filled after a solution is accepted ⚠️

- [ ] T063 [US2] AC-16 RED: no new driver methods expected. ⚠️ Likely to pass already, because `submit` has never changed the entry. If so, stop and report. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.
- [ ] T064 [US2] AC-16 TDD cycles: only if red. App: session `submit` returns the same `entry` in every case (FR-015). Files: `src/app/session.ts` (tests in `src/app/session.spec.ts`).
- [ ] T065 [US2] AC-16 scenarios GREEN; TDD log; checkpoint. Scenarios: `test/acceptance/play/find-solutions.acceptance-spec.ts`.

### US2 through the UI

- [ ] T066 [US2] Run every US1 and US2 scenario through all three projects; all pass with axe clean. Record this in the TDD log. Scenarios: `test/acceptance/play/solve-puzzle.acceptance-spec.ts`, `test/acceptance/play/find-solutions.acceptance-spec.ts`.

**Checkpoint**: User Stories 1 and 2 both work.

---

## Phase 5: User Story 3 - Anyone can open the game at a public address (Priority: P3)

**Goal**: each merge to `main` is built, tested and published to GitHub Pages; the loaded game
works with no connection. See [stories/us3-open-at-public-address.md](stories/us3-open-at-public-address.md).

**Independent test**: merge a visible change, open the public address on a phone, and see it
without deploying by hand.

**Prerequisite (owner)**: the repository exists on GitHub, `main` is pushed, branch protection
requires a pull request and code-owner review, and Pages' source is "GitHub Actions" (plan
Open Items 1). AC-17 cannot go green without it.

### AC-17 A merged change goes live

- [ ] T067 [US3] AC-17 RED: create `test/acceptance/drivers/delivery/delivery.driver.ts` implementing `DeliveryDriver`. `mergedVersion()` reads `GITHUB_SHA`; `versionAtPublicAddress()` fetches `ACCEPTANCE_PUBLIC_URL` and reads `<meta name="version">`. Add an `after-publish` Playwright project (`grep: /@after-publish/`, no browser). Run it against the current public address: it fails because nothing is published yet.
- [ ] T068 [US3] AC-17 TDD cycles: `.github/workflows/ci-deploy.yml` (this task explicitly authorises the pipeline definition, per plan research R8). Workflow-level `permissions: contents: read`; triggers on `pull_request`, `push` to `main`, and `workflow_dispatch` with a `ref` input. The `verify` job runs `npm ci`, the exceptions check (T075), lint, typecheck, unit tests with coverage, build, Playwright browsers (cached), `test:acceptance` across the engine and UI projects against `vite preview`, then uploads `dist/` with `actions/upload-pages-artifact`. The `deploy` job has `needs: verify`, runs only for `main`, uses environment `github-pages` with `pages: write` and `id-token: write`, runs `actions/deploy-pages`, then runs the `after-publish` project with `ACCEPTANCE_PUBLIC_URL` set to the deployment URL. Every third-party action is pinned to a commit SHA. The unit-level behaviour here is the version meta from T004: unit-test the plugin's version lookup (`GITHUB_SHA` wins, then the git commit).
- [ ] T069 [US3] AC-17 GREEN: after the owner merges to `main`, the `after-publish` scenario passes in the `deploy` job, and the run shows merge-to-live under 15 minutes (SC-005). Slice refactor; TDD log; checkpoint. Files: `.github/workflows/ci-deploy.yml`. Scenarios: `test/acceptance/delivery/publish.acceptance-spec.ts`.

### AC-18 Playing after the connection is lost ⚠️

- [ ] T070 [US3] AC-18 RED: phone driver `loseConnection()` (`context.setOffline(true)`) and `networkRequestsSinceOpening()` (counts `page.on('request')` events after `open()` finishes). ⚠️ Both scenarios may pass the first time they run, because nothing in the game uses the network and the CSP forbids `connect-src`. If so, stop and report: the behaviour exists by construction.
- [ ] T071 [US3] AC-18 TDD cycles: only if red. Remove whatever makes a request after load. Files: `index.html`, `src/app/main.ts`.
- [ ] T072 [US3] AC-18 scenarios GREEN in both UI projects; TDD log; checkpoint. Scenarios: `test/acceptance/play/play-on-a-phone.acceptance-spec.ts`.

### AC-19 A failed change never goes live

- [ ] T073 [US3] AC-19 RED: delivery driver `publishingRoute()` parses `.github/workflows/ci-deploy.yml` with `yaml`. It reports `publishesFrom` from the deploy job's branch condition and environment, and `mustSucceedFirst` as the plain-named steps of the jobs the deploy job `needs` ("build", "unit tests", "acceptance tests"). Confirm both scenarios fail if `needs: verify` or the `main` condition is removed (try it, then restore).
- [ ] T074 [US3] AC-19 TDD cycles: the driver's step naming is Layer 3. Map `npm run build` to "build", `npm test` to "unit tests" and `npm run test:acceptance…` to "acceptance tests". There is no production code beyond the workflow from T068. Files: `test/acceptance/drivers/delivery/delivery.driver.ts`.
- [ ] T075 [US3] AC-19 supporting check, the Baseline 9 exceptions expiry, TDD cycles in `tools/check-exceptions.ts` with `tools/check-exceptions.spec.ts` (add `tools/**` to `vitest.config.ts`): an exception whose `expires` date is today or later passes; one whose `expires` date is in the past fails with its id; one whose `review_by` is after `expires` fails; the check reads the front matter of every `docs/exceptions/EXC-*.md` and takes today's date as a parameter (no clock inside the check). Add an `exceptions:check` script, which `verify` runs first.
- [ ] T076 [US3] AC-19 scenarios GREEN; slice refactor; TDD log; checkpoint. Record the manual part from [acceptance.md](acceptance.md): after the first failing `verify` run on `main`, the public address still served the previous version. Scenarios: `test/acceptance/delivery/publish.acceptance-spec.ts`.

### AC-21 Reloading with no connection ⚠️

- [ ] T077 [US3] AC-21 RED: phone driver `reload()` (`page.reload()`, catching the offline navigation error) and `isGameShowing()` (whether the "Puzzle" group is visible). ⚠️ This may pass the first time it runs, because there is no service worker. If so, stop and report.
- [ ] T078 [US3] AC-21 TDD cycles: only if red. Remove whatever caches the page for offline opening (FR-016). Files: `index.html`, `src/app/main.ts`.
- [ ] T079 [US3] AC-21 scenarios GREEN in both UI projects; TDD log; checkpoint. Scenarios: `test/acceptance/play/play-on-a-phone.acceptance-spec.ts`.

**Checkpoint**: all three user stories work, and every merge to `main` reaches the public address.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: the approved scenarios beyond the 21 criteria, the manual checks and the Definition of Done.

- [ ] T080 Edge case, small screens: phone driver `useScreen(size)` (set the viewport before `open()`). Run both small-screen scenarios; adjust `styles.css` until everything is on screen at 320 × 568 and 375 × 667 with no scrolling. Unit-test any sizing logic extracted to `src/app/labels.ts` or a new pure module; CSS-only changes are proven by the scenarios. TDD log.
- [ ] T081 SC-003 and SC-004, speed: phone driver `useReferencePhoneOn4G()` (Chromium CDP: network about 9 Mbps down, 170 ms latency, 4× CPU slowdown); `secondsUntilReadyToPlay()` (from navigation start to the "Puzzle" group being interactive); `tapResponseTimesInMilliseconds()` (time from each tap to the changed accessible name, recorded by the UI driver). Run the `@budget` scenario in the `android` project; fix anything over budget. TDD log. Files: `test/acceptance/drivers/ui/phone.ui-driver.ts`. Scenarios: `test/acceptance/play/play-on-a-phone.acceptance-spec.ts`.
- [ ] T082 [P] Run `/speckit-agents` to create `AGENTS.md`, which `CLAUDE.md` imports. It covers the stack, commands, folder layout, the engine boundary and the locked acceptance files.
- [ ] T083 [P] Update `README.md`: the stack is chosen (link ADR 0001), plus how to run, test and play, linking [quickstart.md](quickstart.md).
- [ ] T084 Run the manual checks in [quickstart.md](quickstart.md) section 6 (real iPhone and Android phone, VoiceOver, TalkBack, airplane mode, five hallway playtests for SC-001) and record the results in the TDD log. Raise a work item for anything that fails. Results in `specs/001-walking-skeleton/tdd-log.md`.
- [ ] T085 Run [quickstart.md](quickstart.md) sections 1 to 5 end to end on a clean clone and confirm every expected result. Results in `specs/001-walking-skeleton/tdd-log.md`.
- [ ] T086 Write each pull request description: what changed, why, how it was tested, and rollback (plan "Deployment and Rollback": re-run `ci-deploy.yml` with `ref` set to the last good commit, or revert the merge). End with the attribution line.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T001 first; T002 to T005 in parallel; then T006 and T007.
- **Foundational (Phase 2)**: needs Setup. T008 and T009 first; T010, T011 and T012 in parallel; T013 last.
- **US1 (Phase 3)**: needs Foundational. Criteria strictly in order, AC-1 to AC-11 then AC-20, each waiting for the owner's checkpoint approval.
- **US2 (Phase 4)**: needs US1's AC-8 (checking and the counter). Run it after Phase 3.
- **US3 (Phase 5)**: AC-17 and AC-19 need only Setup and Foundational, plus the GitHub repository. AC-18 and AC-21 need the UI from US1. Run it after Phase 4, in spec order.
- **Polish (Phase 6)**: needs the UI from US1. T082 and T083 can run any time after Phase 1.

### Within Each Criterion

RED (drivers) → TDD cycles (one unit test at a time, commit at each green) → GREEN, slice
refactor, TDD log, checkpoint. Never start the next criterion before the owner approves the
checkpoint.

### Parallel Opportunities

- Setup: T002, T003, T004 and T005 touch different files.
- Foundational: T010, T011 and T012.
- Polish: T082 and T083.
- Inside a criterion there is no parallel work: TDD takes one test at a time.

---

## Parallel Example: Setup and Foundational

```text
# After T001 has added the dependencies:
Task: "T002 Create tsconfig.json and src/engine/tsconfig.json"
Task: "T003 Create eslint.config.js with the engine boundary rules"
Task: "T004 Create vite.config.ts with relative base, version meta and bundle budget"
Task: "T005 Create vitest.config.ts with the coverage threshold"

# After T008 and T009:
Task: "T010 Create test/acceptance/support/axe.ts"
Task: "T011 Create the engine driver and session stubs"
Task: "T012 Create the UI game and phone driver stubs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup and Phase 2 Foundational: the toolchain is green and all 31 scenarios run red.
2. Phase 3: AC-1 puts a real grid on a phone screen early. That is the walking skeleton's spine.
3. **Stop and validate**: every US1 scenario passes through the engine and both phone projects (T050).

### Pull Requests (Each Reviewable in Under 30 Minutes)

F0 is too large for one review, so it ships as a sequence of short-lived pull requests from
`001-walking-skeleton`, each merged before the next starts:

| PR | Tasks | Delivers |
|---|---|---|
| 1 | T001–T013 | Toolchain, engine boundary, driver skeletons, TDD log baseline |
| 2 | T014–T028 | US1 AC-1 to AC-5: the grid renders; cells cycle; the given cell is fixed |
| 3 | T029–T050 | US1 AC-6 to AC-11 and AC-20: operators, checking, messages |
| 4 | T051–T066 | US2: distinct solutions and the counter |
| 5 | T067–T079 | US3: pipeline, publishing, offline |
| 6 | T080–T086 | Small screens, budgets, docs, manual checks |

Until PR 5 merges there is no pipeline, so PRs 1 to 4 are verified locally (`quickstart.md`
sections 1 to 4) and the results go in each PR description.

---

## Notes

- Locked files (see [acceptance.md](acceptance.md) Approval) are never edited. If a scenario
  or DSL method looks wrong, stop and ask the owner.
- A stub returns a default; it never throws "not implemented".
- Commit at each green (`feat:`), and refactors separately (`refactor:`). Never commit a failing
  test on its own.
- ⚠️ marks criteria likely to pass on first run. Report them rather than writing code no test
  needs.
- No new dependencies beyond T001, no suppressed warnings, no edits to `.editorconfig` or managed
  standards files.
