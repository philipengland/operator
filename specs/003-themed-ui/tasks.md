---

description: "Task list for spec-003, themed component library"
---

# Tasks: Themed Component Library (spec-003)

**Input**: design documents in `specs/003-themed-ui/`: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md),
[contracts/component-library.md](contracts/component-library.md), [quickstart.md](quickstart.md),
[acceptance.md](acceptance.md) (approved 2026-11-06).

**Tests**: mandatory and test-first (org baseline). The approved scenarios, DSL, vocabulary and
examples listed in [acceptance.md](acceptance.md) are **locked**: tasks run them and never create,
edit, skip or delete them. Each acceptance criterion is an outer loop of red-green-refactor inner
loops, recorded in `specs/003-themed-ui/tdd-log.md`.

**Organisation**: three pull requests (plan, Delivery; research R9), each on its own branch and
carrying only the approved Layer 1 file it makes pass: part 1 is User Story 1, part 2 is User
Story 2, part 3 is User Stories 3 to 5. Within a story, one group per acceptance criterion in the
order the spec lists them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1 to US5).

## Path Conventions

- `src/ui/foundations/`, `simple/`, `combined/`, `screens/`: the library (plan, Project
  Structure). Each component is `<name>.ts` (pure `<name>Model`, `create<Name>` renderer,
  `builtFrom`) with `<name>.css` beside it and `<name>.spec.ts` for the model.
- `src/catalogue/`: the catalogue page (`main.ts`, `samples.ts`, `catalogue.css`), entry
  `catalogue.html` at the repository root.
- `test/acceptance/library/` (Layer 1, locked), `test/acceptance/dsl/catalogue*.ts` (Layer 2,
  locked), `test/acceptance/drivers/ui/catalogue.ui-driver.ts` and
  `test/acceptance/drivers/engine/catalogue.engine-driver.ts` (Layer 3),
  `test/acceptance/support/acceptance.ts` (fixtures).
- Unit-test titles for criteria proved by unit tests name the criterion, e.g.
  `describe('themeForSeed (spec-003 AC-23)', …)`, so `npm run test-results` counts them.

## How every acceptance group works

- **RED**: run the criterion's scenarios with
  `node tools/run-acceptance.mjs ui -g "spec-003 AC-n]"` (AC-18 also with `engine`). Add only the
  Layer 3 driver code they need. Re-run: they must fail **because the behaviour is missing**, not
  because a driver is. Quote the failure in the TDD log.
- **TDD cycles**: one failing unit test on a model or foundation, the smallest code to pass, then
  refactor. Renderers and CSS are driven by the scenario, not unit tests (plan, Open Items 3).
  Commit `feat(ui): …` at each green and `refactor(ui): …` separately. The listed behaviours are
  the intended design; the actual cycles go in the TDD log.
- **GREEN**: the criterion's scenarios pass on `catalogue-iphone` and `catalogue-android`, the
  full suite is green except criteria not yet started, slice refactor, TDD log entry, then a
  **checkpoint: wait for the owner's approval before the next criterion.**
- A scenario that passes the first time it runs is **reported**, and its driver proven by a
  deliberate, reverted break before it is recorded as delivered (AGENTS.md). Likely cases are
  marked ⚠️.
- Every component's CSS uses only the foundations' custom properties; combined components and
  screens only lay out (FR-302 to FR-304).

---

## Phase 1: Setup (pull request 1)

**Purpose**: the part-1 branch, the ADR and contract, fonts, the catalogue build, the tier checks
and the test-results generator, so the baseline is green apart from the approved scenarios.

- [X] T001 Once pull request #8 (`chore/test-results`) is merged, create `003-themed-ui-part-1` from `main`. Bring over from `003-themed-ui` with `git checkout 003-themed-ui -- <paths>`: `specs/003-themed-ui/` (spec, plan, research, data model, quickstart, contract, checklist, acceptance, this file), `test/acceptance/dsl/catalogue.dsl.ts`, `test/acceptance/dsl/catalogue-vocabulary.ts`, `test/acceptance/library/examples.ts`, `test/acceptance/library/simple-components.acceptance-spec.ts` (**only this scenario file**), `test/acceptance/drivers/catalogue.driver.ts`, `test/acceptance/support/acceptance.ts`, `.github/CODEOWNERS`. Commit `docs(spec-003): specification, plan and approved part-1 scenarios`.
- [X] T002 Create `specs/003-themed-ui/tdd-log.md` from `.specify/presets/org-baseline/templates/tdd-log-template.md`. Record the baseline: `npm run lint`, `npm run typecheck`, `npm test` (count), engine and phone acceptance (every spec-001 and spec-002 scenario passes; the 17 spec-003 AC-1 to AC-6 scenarios fail with "The catalogue driver is not built yet").
- [X] T003 [P] Write `docs/adr/0002-component-library.md` (plan, Architecture): tiered, framework-free components in `src/ui/`; tiers enforced by lint and a styling check; themes as TypeScript data applied as four custom properties; the catalogue as a separate build never published; committed fonts. It revisits ADR 0001's "no framework, to be revisited at F1". Link it from `AGENTS.md` "Key ADRs".
- [X] T004 [P] Copy `specs/003-themed-ui/contracts/component-library.md` to `docs/contracts/component-library.md` as the current-state contract (history line: written for spec-003, 2026-11-06). Link it from `AGENTS.md` "Contracts".
- [ ] T005 [P] Fonts (plan, Open Items 2): download Chewy 400 and Nunito 700 and 800, latin subset, WOFF2, from Google Fonts once, into `src/ui/foundations/fonts/` with `OFL.txt` (each font's copyright line). Record each file's source and size in the TDD log.
- [ ] T006 Catalogue build (research R7): `catalogue.html` (CSP as `index.html`, `<title>Operator component catalogue</title>`, `<main>`, script `src/catalogue/main.ts`); `vite.config.ts` gains a `catalogue` mode with input `catalogue.html` and `outDir: 'catalogue-dist'` (the default mode keeps `index.html` only, and the bundle budget applies to the game only); `package.json` scripts `"catalogue": "vite --open /catalogue.html"` and `"build:catalogue": "vite build --mode catalogue"`; `.gitignore` and `eslint.config.js` ignores gain `catalogue-dist/`. `src/catalogue/main.ts` renders an empty `main` for now. Check `npm run build` output is unchanged (quickstart section 4).
- [ ] T007 Playwright projects (research R8) in `playwright.config.ts`: `catalogue-iphone` and `catalogue-android` (same devices and 375 × 667 viewport as the game's phones), `grep: /@catalogue/`, base URL `http://localhost:4174/catalogue.html`; a second `webServer` that runs `npm run build:catalogue && npx vite preview --outDir catalogue-dist --port 4174 --strictPort` (so CI needs no workflow change); the game's `iphone` and `android` projects gain `@catalogue` in `grepInvert`. Confirm the 17 part-1 scenarios now run only on the catalogue projects (34 runs, all failing as before).
- [ ] T008 `tools/test-results.ts` knows the catalogue projects (plan, Open Items 4), test-first in `tools/test-results.spec.ts`: `readPlaywrightReport` accepts `catalogue-iphone` and `catalogue-android`; the scenario table gains the columns "Catalogue iPhone SE" and "Catalogue Pixel 5". Commit `chore(tools): …`.
- [ ] T009 Tier rules (research R2), test-first where testable:
  - `eslint.config.js`: `no-restricted-imports` per tier: `src/ui/foundations/**` imports nothing from `src/`; `src/ui/simple/**` only `../foundations/`, `../component`; `src/ui/combined/**` only `../simple/`, `../combined/`, `../foundations/`, `../component`; `src/ui/screens/**` only `../combined/`, `../simple/button`, `../foundations/`, `../component`; nothing in `src/ui/**` imports `src/engine/` or `src/app/`. Prove each rule with a deliberate, reverted bad import, recorded in the TDD log.
  - `src/ui/tiers.spec.ts` (`describe('combined components and screens add no styling (spec-003 AC-7)')`): reads every `.css` under `src/ui/combined/` and `src/ui/screens/` and fails on `color`, `background*`, `border` other than `none`, `border-color`, `border-radius`, `box-shadow`, `font-family`, `font-size`, `font-weight`, `outline`. First cycle with a temporary bad fixture in the test itself, then against the real folders (empty so far, so it passes vacuously until part 2; note that in the log).
- [ ] T010 `vitest.config.ts` coverage gains `src/ui/foundations/**/*.ts` and `src/ui/**/*.ts` models (renderers excluded by a `create*` file split if the threshold needs it: decide at the first component and record it).

**Checkpoint**: lint, types and unit tests green; game build unchanged; part-1 scenarios fail only on the missing driver.

---

## Phase 2: Foundational (pull request 1)

**Purpose**: what every component and the catalogue stand on. Blocks every story.

- [ ] T011 Foundations, TDD cycles:
  - `src/ui/component.ts`: `Component<Props>` (`element`, `update`); `writeText(target, text)` writes only when the text changes (the rule from `src/app/view.ts`, AGENTS.md).
  - `src/ui/foundations/themes.ts`: `THEMES` holds the six themes in table order with the spec Themes table's values ("`#RRGGBB`", address, sign-off, button label); `CLASSIC`; `applyTheme(root, theme)` sets `--ink`, `--paper`, `--tile`, `--accent` and nothing else (the model of what it sets is unit-tested; the DOM write is one line).
  - `src/ui/foundations/tokens.css`: `@font-face` for the three font files with `font-display: swap` and system fallbacks; `--font-display`, `--font-body`, `--outline: 4px`, `--shadow-small: 3px`, `--shadow-large: 6px`, radii (pill 24px, cell 22px, key 26px, panel 30px, bubble 26px with 6px tail corner), `--gap: 8px`, `--touch-target: 44px`; `@media (prefers-reduced-motion: reduce)` turns off transitions.
- [ ] T012 Catalogue shell (`src/catalogue/main.ts`, `samples.ts`, `catalogue.css`): applies Classic; four `region`s named "Foundations", "Simple components", "Combined components", "Screens"; a helper that renders one component as a `region` named by the component, holding labelled samples (each sample a `figure`-like group named by its label) and, for combined components and screens, a "Built from:" line from the module's `builtFrom`. A theme switch: a `group` named "Theme" with six buttons, the current one `aria-pressed="true"` (behaviour delivered in US4; render it now with Classic pressed). No component samples yet.
- [ ] T013 Catalogue UI driver skeleton `test/acceptance/drivers/ui/catalogue.ui-driver.ts` implementing `CatalogueDriver` from `test/acceptance/drivers/catalogue.driver.ts`: `open()`, and a `sampleLocator(sample)` that finds the region named by the component, then the sample named by its label, by role and name only (Playwright standard). Every other method returns a value that cannot pass (`NaN` boxes, empty lists, `null`) until its criterion's RED task fills it in. `test/acceptance/support/acceptance.ts`: the UI fixture uses it; the engine fixture uses `test/acceptance/drivers/engine/catalogue.engine-driver.ts`, which implements only `publishedFiles()` (by reading `dist/`) and throws "browse the catalogue only with ACCEPTANCE_DRIVER=ui" elsewhere.

**Checkpoint**: the catalogue opens with four empty sections; scenarios fail on missing samples, not on a missing driver.

---

## Phase 3: User Story 1 — Simple components (Priority: P1) 🎯 MVP (pull request 1)

**Goal**: text, button, text input, icon, surface, badge and mascot, shown in the catalogue in
every state.

**Independent Test**: `npm run catalogue`, Simple components section, against the design guide;
the 17 scenarios in `simple-components.acceptance-spec.ts` pass on both catalogue phones.

### AC-1: organised by tier

- [ ] T014 [US1] AC-1 RED: driver `sections()` reads the four section regions in document order; `componentsIn(section)` reads the component regions inside one. Expected failure: `components in Simple components — Expected: ["Text", …], Received: []`.
- [ ] T015 [US1] AC-1 TDD cycles: `src/catalogue/samples.ts` lists the whole library by tier (`CATALOGUE_SECTIONS`: simple `Text, Button, Text input, Icon, Surface, Badge, Mascot`; combined `Speech bubble, Operator header, Solutions counter, Target pill, Grid cell, Line working, Puzzle grid, Keypad`; screens `Play screen`). Render one component region per entry. A component not built yet shows as a named region with the line "Built in part 2." or "Built in part 3." and no samples (owner decision 2026-11-06), so AC-1 passes from part 1; parts 2 and 3 replace each placeholder with real samples.
- [ ] T016 [US1] AC-1 GREEN (both scenarios), slice refactor, checkpoint.

### AC-2: buttons in four styles

- [ ] T017 [US1] AC-2 RED: driver `sample()` (text, accessible name, role button/textbox, `aria-disabled`, `aria-pressed`, bounding box) and `appearance()` (computed background, border style and colour, box-shadow colour, border radii; colours mapped to `ink`/`paper`/`tile`/`accent` by reading the four custom properties on the page root, `other` otherwise). Expected failure: `Button "Main" shows — Expected: "Put it through!", Received: ""`.
- [ ] T018 [US1] AC-2 TDD cycles in `src/ui/simple/button.ts`: `buttonModel` names a button by its label, or "label, action" when an action is given ("Oops, clear cell", "Put it through!, Check"); styles `main | key | solid | dashed`; `isUnavailable` gives `aria-disabled="true"` and ignores taps (the button stays focusable). Renderer: a real `<button type="button">`, at least `--touch-target` square; `button.css` per style (main: accent fill, tile text, large shadow; key: tile fill, small shadow; solid: ink fill, paper text; dashed: dashed accent outline). Samples in `samples.ts`: Main, Key, Solid, Dashed, Unavailable.
- [ ] T019 [US1] AC-2 GREEN, slice refactor, checkpoint.

### AC-3: labelled text input

- [ ] T020 [US1] AC-3 RED: driver `typeInto()`, `typeface()` (the first family in the computed `font-family` that `document.fonts.check` reports loaded), textbox role; the "shows" text of a textbox is its value, or its placeholder when empty. Expected failure: `Text input "Seed" is a text field — Expected: true, Received: false`.
- [ ] T021 [US1] AC-3 TDD cycles in `src/ui/simple/text-input.ts`: `textInputModel` gives a visible `<label for>` with the label text, the hint as placeholder, and an input id unique per instance; `text-input.css`: paper fill, outline, typed text in `--font-display`. Sample: Seed ("Play from a seed", "e.g. 4F7A21").
- [ ] T022 [US1] AC-3 GREEN, slice refactor, checkpoint.

### AC-4: the game's typefaces

- [ ] T023 [US1] AC-4 RED: driver `requestsToOtherSites()` counts requests whose origin is not the catalogue's since `open()`. Expected failure: `Text "Display" shows — Expected: "Hello, Operator!", Received: ""`.
- [ ] T024 [US1] AC-4 TDD cycles in `src/ui/simple/text.ts`: `textModel` with `style: display | body`; `text.css` maps them to `--font-display` (Chewy) and `--font-body` (Nunito 700, 800 bold). Samples: Display ("Hello, Operator!"), Body ("Tap a dashed bubble to swap its operator."). Import `tokens.css` from the catalogue entry so the fonts load from the same origin.
- [ ] T025 [US1] AC-4 GREEN (both scenarios; ⚠️ the "nothing fetched from another site" scenario may pass at RED: prove it with a reverted break that adds a cross-origin font link), checkpoint.

### AC-5: tick and cross

- [ ] T026 [US1] AC-5 RED: driver `greyscaleContrast()`: screenshot the sample with `filter: grayscale(1)` and return the WCAG contrast between the icon's darkest and its background's typical luminance. Expected failure: `Icon "Tick" is heard as — Expected: "target reached", Received: null`.
- [ ] T027 [US1] AC-5 TDD cycles in `src/ui/simple/icon.ts`: `iconModel` for `tick | cross`; with `spokenAs` it is `role="img"` named by it, without it `aria-hidden="true"`; inline SVG strokes in `currentColor`. Samples: Tick ("target reached"), Cross ("not a whole number"), Decorative tick.
- [ ] T028 [US1] AC-5 GREEN, slice refactor, checkpoint.

### AC-6: surfaces, badges, mascot

- [ ] T029 [US1] AC-6 RED: driver `appearance().hasTailCorner` (bottom-left radius smaller than the others). Expected failure: `Surface "Panel" fill — Expected: "tile", Received: "other"`.
- [ ] T030 [US1] AC-6 TDD cycles: `src/ui/simple/surface.ts` (`panel`: tile fill, outline, large ink shadow, panel radius; `bubble`: tile fill, outline, large accent shadow, bubble radius with the 6px tail corner); `src/ui/simple/badge.ts` (ink pill, paper text, display typeface); `src/ui/simple/mascot.ts` (the design guide's original mascot SVG, 76 px, ink head, paper face, accent mouth and headset from the tokens, `aria-hidden="true"`). Samples: Panel, Bubble, Badge ("× 12"), Mascot.
- [ ] T031 [US1] AC-6 GREEN, slice refactor, checkpoint.

### Pull request 1

- [ ] T032 [US1] Full suite: lint, types, unit, `npm run build` (unchanged `dist/`), engine and all phone projects; TDD log; `npm run test-results -- 003-themed-ui` (expected BLOCKED: later criteria not yet covered). Push `003-themed-ui-part-1` and open "spec-003 part 1 of 3: foundations and simple components" (what, why, how tested, rollback: revert the merge; players unaffected), with the attribution line. The owner merges with a merge commit.

**Checkpoint**: part 1 merged; the catalogue shows every simple component.

---

## Phase 4: User Story 2 — Combined components (Priority: P1) (pull request 2)

**Goal**: the play screen's parts, built only from simple components.

**Independent Test**: Combined components section against the design guide; the 20 scenarios in
`combined-components.acceptance-spec.ts` pass on both catalogue phones.

- [ ] T033 [US2] Create `003-themed-ui-part-2` from `main` (after part 1 merges) and bring over `test/acceptance/library/combined-components.acceptance-spec.ts` from `003-themed-ui`. Run it: 20 scenarios fail on missing samples. TDD log.

### AC-7: built from

- [ ] T034 [US2] AC-7 RED: driver `builtFrom(component)` reads the component region's "Built from:" line. Expected failure on the first combined component without a sample.
- [ ] T035 [US2] AC-7 TDD cycles: each combined module exports `builtFrom` matching the contract table, and imports exactly those simple or combined components (the lint rules from T009 and `tiers.spec.ts` now check real files: confirm `tiers.spec.ts` fails on a reverted bad declaration in a combined stylesheet).
- [ ] T036 [US2] AC-7 GREEN once all eight combined components exist (it is the last criterion in this phase to go green); checkpoint.

### AC-8: solutions counter

- [ ] T037 [US2] AC-8 RED: no new driver code expected. Expected failure: `Solutions counter "None yet" shows — Expected: "Solutions found 0 of 2", Received: ""`.
- [ ] T038 [US2] AC-8 TDD cycles in `src/ui/combined/solutions-counter.ts`: `solutionsCounterModel({ found, total? })` gives title "Solutions found" or "All found!" (complete when `total` is given and `found === total`), count "N of M" or "N", fill accent or ink, tick when complete, heard "Found N of M" or "Found N" (visible parts hidden, one visually hidden name). Built from Surface, Text, Badge, Icon. Samples: None yet, In progress, Complete, No total.
- [ ] T039 [US2] AC-8 GREEN, slice refactor, checkpoint.

### AC-9: target pill

- [ ] T040 [US2] AC-9 RED. Expected failure: `Target pill "Add" shows — Expected: "+ 16", Received: ""`.
- [ ] T041 [US2] AC-9 TDD cycles in `src/ui/combined/target-pill.ts`: shown operator → Badge with "<op> <target>", heard by the given `name`; open → dashed Button showing "? <target>" or the chosen operator; `reachesTarget` adds a heard Icon tick ("target reached"). Built from Badge, Button, Icon. Samples: Add, Subtract, Multiply, Divide, Open, Line correct, with sample names containing the operator word and target ("Row 1 target 16, plus").
- [ ] T042 [US2] AC-9 GREEN, slice refactor, checkpoint.

### AC-10: grid cell

- [ ] T043 [US2] AC-10 RED: driver `greyscaleImage()`. Expected failure: `Grid cell "Given" shows — Expected: "2", Received: ""`.
- [ ] T044 [US2] AC-10 TDD cycles in `src/ui/combined/grid-cell.ts`: `gridCellModel` for `given | empty | selected | digit | correct` plus selected-and-correct (selected wins), as the data model's Grid cell table: given → unavailable and heard "…, given 2"; selected → `aria-pressed="true"`; fills and shadows from the table. Built from Button. Samples: Given, Empty, Selected, Your digit, In a correct line, Selected, in a correct line.
- [ ] T045 [US2] AC-10 GREEN (including greyscale), slice refactor, checkpoint.

### AC-11: line working

- [ ] T046 [US2] AC-11 RED. Expected failure: `Line working "Incomplete" shows — Expected: "= ?", Received: ""`.
- [ ] T047 [US2] AC-11 TDD cycles in `src/ui/combined/line-working.ts`: shows the given result text and mark ("= ?", "= 8 ✓", "= −3", "✗"), the visible slot hidden, heard by the given `name` ("Row 1 working, 6 + 2 = 8, target reached"); marked slots heavier as well as the symbol. Built from Text, Icon.
- [ ] T048 [US2] AC-11 GREEN, slice refactor, checkpoint.

### AC-12: puzzle grid

- [ ] T049 [US2] AC-12 RED: driver `gridLayout()` reads, inside the sample, the pills, cells and workings by role and name pattern (column pills, row pills, cells by row and column, workings) and the helper text. Expected failure: `No box at position 1`.
- [ ] T050 [US2] AC-12 TDD cycles in `src/ui/combined/puzzle-grid.ts`: a `group` named "Puzzle" on a panel Surface; CSS grid of 64px pill column, the cells, and a working column, with a pill row on top and a working row below; helper line as body Text ("Tap a dashed bubble to swap its operator."). `puzzle-grid.css` lays out only. Built from Surface, Target pill, Grid cell, Line working, Text. Sample: Fixed puzzle (spec-001's puzzle, just opened).
- [ ] T051 [US2] AC-12 GREEN, slice refactor, checkpoint.

### AC-13: keypad

- [ ] T052 [US2] AC-13 RED: driver `keypadRows()` groups the sample's buttons by their top edge. Expected failure: `keypad keys, row by row — Received: []`.
- [ ] T053 [US2] AC-13 TDD cycles in `src/ui/combined/keypad.ts`: a `group` named "Keypad" of key Buttons 1–9 and a solid Button "Oops" with action "clear cell", in a five-column grid. Built from Button.
- [ ] T054 [US2] AC-13 GREEN, slice refactor, checkpoint.

### AC-14: operator header

- [ ] T055 [US2] AC-14 RED: driver `mascotAndBubble()`. Expected failure: `Operator header "Greeting" shows — Expected: "Hello, Operator! Fill the grid, pal.", Received: ""`.
- [ ] T056 [US2] AC-14 TDD cycles: `src/ui/combined/speech-bubble.ts` (bubble Surface, display title, body message; built from Surface, Text) and `src/ui/combined/operator-header.ts` (Mascot beside Speech bubble; built from Mascot, Speech bubble). Sample: Greeting ("Hello, Operator!", "Fill the grid, pal." in Classic; the address comes from the theme in US4).
- [ ] T057 [US2] AC-14 GREEN, AC-7 GREEN (T036), slice refactor, checkpoint.

### Pull request 2

- [ ] T058 [US2] Full suite and TDD log as T032. Push `003-themed-ui-part-2` and open "spec-003 part 2 of 3: combined components". The owner merges with a merge commit.

---

## Phase 5: User Story 3 — The play screen (Priority: P1) (pull request 3)

**Goal**: the whole play screen from combined components, with three samples.

**Independent Test**: Screens section at 375 × 667 and 320 × 568 against the Classic mockup;
`play-screen.acceptance-spec.ts` passes.

- [ ] T059 [US3] Create `003-themed-ui-part-3` from `main` (after part 2 merges) and bring over `test/acceptance/library/play-screen.acceptance-spec.ts` and `themes.acceptance-spec.ts` from `003-themed-ui`. Run them: all fail on missing samples or behaviour. TDD log.

### AC-15: the play screen, top to bottom

- [ ] T060 [US3] AC-15 RED: driver `openScreen(screen, sample)` opens the catalogue's screen view (the screen alone, filling the viewport) and `screenView()` reads the five parts' boxes by role and name. Expected failure: `Operator header is above Solutions counter — Expected: true, Received: false`.
- [ ] T061 [US3] AC-15 TDD cycles in `src/ui/screens/play-screen.ts`: arranges Operator header, Solutions counter, Puzzle grid, Keypad and the main Button top to bottom; `play-screen.css` lays out only (flex column, gaps, safe-area padding with `env(safe-area-inset-*)`). Built from those five. Catalogue: the Screens section shows the play screen with a "Screen sample" group ("Just opened", "Row 1 correct", "All found") and a way to open it alone at full size (a link to `catalogue.html#play-screen`).
- [ ] T062 [US3] AC-15 GREEN, slice refactor, checkpoint.

### AC-16: fits a phone

- [ ] T063 [US3] AC-16 RED: driver `useScreen(size)` sets the viewport before opening. Expected failure (if any) names the part off screen at 320 × 568.
- [ ] T064 [US3] AC-16 TDD cycles: sizes from the tokens scale down at narrow widths (cell height and keypad keys keep 44 px minimum; pill column and gaps shrink) so 320 × 568 fits; any size rule lives in simple components' CSS, not the screen's.
- [ ] T065 [US3] AC-16 GREEN (both sizes; ⚠️ 375 × 667 may pass at RED), checkpoint.

### AC-17: screen samples

- [ ] T066 [US3] AC-17 RED: driver `chooseScreenSample()` presses the sample button. Expected failure: `Play screen "Row 1 target" shows — Expected: "+ 8 ✓"`.
- [ ] T067 [US3] AC-17 TDD cycles: `src/catalogue/samples.ts` holds the three play-screen samples (just opened; top-right 2 so Row 1 reaches its target; Solution B after A so the counter is complete); the screen updates in place through each component's `update`, so nothing moves.
- [ ] T068 [US3] AC-17 GREEN, slice refactor, checkpoint.

### AC-18: never reaches players ⚠️

- [ ] T069 [US3] AC-18 RED: engine driver `publishedFiles()` lists `dist/` after `npm run build` and marks a file as catalogue if its path or text contains `catalogue`. Likely passes at RED (the build input excludes it): report it and prove the driver with a reverted break that adds `catalogue.html` to the game build's inputs.
- [ ] T070 [US3] AC-18 GREEN on the engine and phone projects, checkpoint.

### Edge case: long words in every theme

- [ ] T071 [US3] Edge-case scenario RED/GREEN after US4's theme switch (T074): at 320 × 568 the play screen fits in all six themes. Run it at the end of Phase 6.

---

## Phase 6: User Story 4 — Six themes (Priority: P2) (pull request 3)

**Goal**: every tier recoloured from four values, with each theme's voice; accessible in all six.

**Independent Test**: switch the catalogue through all six themes; `themes.acceptance-spec.ts`
and the theme unit tests pass.

### AC-19: switching to Midnight blue

- [ ] T072 [US4] AC-19 RED: driver `chooseTheme()` presses the theme button; `coloursInUse()` collects every computed colour, background, border and shadow colour on visible elements (ignoring transparent); `layoutOfEverySample()` maps each sample to its box. Expected failure: `#1A1A1A is one of Midnight blue's four colours`.
- [ ] T073 [US4] AC-19 TDD cycles: the catalogue's theme switch calls `applyTheme` and re-renders samples whose content depends on the theme (main button label, greeting address) through `update`; `src/catalogue/samples.ts` derives "Fill the grid, <address>." and the main button label from the current theme. `aria-pressed` follows the choice.
- [ ] T074 [US4] AC-19 GREEN (all four scenarios), then the edge case T071, slice refactor, checkpoint.

### AC-20 and AC-21: theme values and contrast (unit tests only)

- [ ] T075 [P] [US4] AC-20 TDD cycles in `src/ui/foundations/themes.spec.ts`, `describe('THEMES (spec-003 AC-20)')`: each of the six themes has exactly the spec Themes table's four colours, address, sign-off and button label; `applyTheme` sets exactly `--ink`, `--paper`, `--tile`, `--accent`.
- [ ] T076 [P] [US4] AC-21 TDD cycles: `src/ui/foundations/contrast.ts` `contrastRatio(a, b)` (WCAG 2.2 relative luminance; #1A1A1A on #FFFDF6 ≈ 17.1); `themes.spec.ts` `describe('contrast in every theme (spec-003 AC-21)')` checks research R6's pairs for all six themes (4.5:1 for ink/tile, ink/paper, paper/ink, accent/tile, tile/accent; 3:1 for accent/paper).

### AC-22: accessible in every theme

- [ ] T077 [US4] AC-22 RED: driver `accessibilityProblems()` uses `test/acceptance/support/axe.ts`'s scan, returning violation summaries. Expected failure lists any violation in a theme; ⚠️ may pass at RED if earlier work was clean: prove with a reverted low-contrast colour.
- [ ] T078 [US4] AC-22 GREEN, checkpoint.

---

## Phase 7: User Story 5 — Theme from seed (Priority: P3) (pull request 3)

**Goal**: the rule that gives each seeded puzzle its theme, ready for F7.

**Independent Test**: unit tests in `src/ui/foundations/themes.spec.ts`.

- [ ] T079 [US5] AC-23 to AC-25 TDD cycles in `themes.spec.ts`, `describe('themeForSeed (spec-003 AC-23, AC-24, AC-25)')`: `themeForSeed(undefined)` is Classic (AC-25); "4F7A21" twice and "4f7a21" give the same theme, and that theme is Plum and mint (golden, research R4) (AC-23); 600 seeds (hex "000000" to "000257") give each theme between 70 and 130 (AC-24). Implementation: 32-bit FNV-1a over the upper-cased seed, remainder by 6, index into `THEMES`.

---

## Phase 8: Polish and pull request 3

- [ ] T080 [P] Update `docs/contracts/component-library.md` to match what was built (names, samples, any decisions taken at checkpoints).
- [ ] T081 [P] `AGENTS.md`: Components gains the component library (`src/ui/`, tiers, catalogue); Build, Test and Run gains `npm run catalogue`, `npm run build:catalogue`; Repository Layout gains `src/ui/`, `src/catalogue/`, `test/acceptance/library/`; Conventions gains "the tiers are enforced by lint and `tiers.spec.ts`" and "catalogue scenarios run only on the catalogue projects", each with its why.
- [ ] T082 Run [quickstart.md](quickstart.md) sections 1, 2 and 4; ask the owner to do section 3 on a real phone (SC-301) and record the sign-off in the TDD log.
- [ ] T083 `npm run test-results -- 003-themed-ui`: `specs/003-themed-ui/test-results.md` must end `OVERALL status: PASS` with every criterion AC-1 to AC-25 covered. Commit it.
- [ ] T084 Push `003-themed-ui-part-3` and open "spec-003 part 3 of 3: play screen and themes" (what, why, how tested, rollback: revert; players unaffected; the Executable Specifications box: no changes to approved files). The owner merges with a merge commit.

---

## Dependencies & Execution Order

- **Setup (T001–T010)** needs pull request #8 merged; blocks everything.
- **Foundational (T011–T013)** blocks every story.
- **US1 (part 1)** → **US2 (part 2)** → **US3 to US5 (part 3)**: each part branches from `main` after the previous merges. US2's components are built from US1's; the play screen from US2's.
- **US4's** AC-20, AC-21 (T075, T076) and **US5** (T079) are pure unit work and can run any time after T011, but ship in part 3.
- **AC-1 across parts**: the catalogue lists every component from part 1, with placeholders for those built in parts 2 and 3 (owner decision 2026-11-06, T015), so each part can merge with `verify` green.

## Parallel Opportunities

- T003, T004, T005 (different files) in Setup.
- T075, T076 and T079 alongside any part-3 screen work (different files, unit tests only).
- Within a story, criteria run in order because every checkpoint waits for the owner.

## Implementation Strategy

- **MVP**: part 1, the foundations and simple components, visible in the catalogue.
- **Incremental**: part 2 adds the play screen's parts; part 3 assembles the screen and turns on
  the themes. Players see no change at any point; spec-004 takes the play screen to them.
