# TDD Log — Themed Component Library (spec-003)

- **Spec**: `specs/003-themed-ui/spec.md`
- **Acceptance**: `specs/003-themed-ui/acceptance.md` (approved by Philip England, 2026-11-06)
- **Baseline**: 2026-11-06, branch `003-themed-ui-part-1` at `main` `7235b69` plus the part-1
  documents and scenarios:
  - `npm run lint`, `npm run typecheck`: clean.
  - `npm test`: 125 unit tests passing; coverage lines 100%, branches 95.97%.
  - `npm run build`: passes, bundle within budget.
  - Engine acceptance: 35 passed (every spec-001 and spec-002 scenario).
  - Phone acceptance: 87 passed (every spec-001 and spec-002 scenario); 34 failed: the 17
    approved spec-003 scenarios in `test/acceptance/library/simple-components.acceptance-spec.ts`
    on both phones, each with "The catalogue driver is not built yet (spec-003,
    /speckit-implement)". This is the approved RED state, not a failing baseline.

## Setup (part 1)

- **T001**: branch `003-themed-ui-part-1` from `main` after PR #8 merged; part-1 files brought from
  `003-themed-ui` (only the simple-components scenario file). Commit `docs(spec-003): …`.
- **T002**: this log and the baseline above.
- **T003, T004**: ADR 0002 and `docs/contracts/component-library.md`, linked from `AGENTS.md`.
- **T005**: fonts downloaded from Google Fonts on 2026-11-06 (sources and SHA-256 in
  `src/ui/foundations/fonts/README.md`): `chewy-400.woff2` 19,920 bytes; `nunito-variable.woff2`
  39,128 bytes (one variable file covers 700 and 800). **Found**: Chewy is under the Apache
  License 2.0, not the SIL OFL as spec, plan, research and ADR assumed; Nunito is OFL. Both
  allow bundling with their licence texts, which are committed. Documents corrected; raised
  with the owner at the next checkpoint.
- **T006**: `catalogue.html` and `src/catalogue/main.ts`; Vite `catalogue` mode builds only
  `catalogue.html` into `catalogue-dist/`. Game build compared file by file (SHA-256) before and
  after: identical (`index.html`, `index-BUmz0kWH.js`, `index-CT2KBeTK.css`).
- **T007**: Playwright projects `catalogue-iphone` and `catalogue-android` (`grep: /@catalogue/`,
  base URL the catalogue preview on port 4174), a second web server that builds and serves the
  catalogue, and `@catalogue` excluded from the game's `iphone` and `android`. `--list`: 17
  library scenarios on each catalogue project, 43 and 44 game scenarios on the game's phones.
  Run: 87 game scenarios pass; the 34 catalogue runs fail on the missing driver, as before.
- **T008**: test-results generator, two cycles in `tools/test-results.spec.ts`:
  - RED "records the catalogue phones (spec-003) as runs of their own": `Error: Unknown Playwright
    project "catalogue-iphone"` (the generator's own guard). GREEN: two run names and projects.
    `020cf88`. The columns were first added in the same step with no test asking for them; taken
    out again so they were driven by their own cycle.
  - RED "shows catalogue results in their own columns, after the game's phones": heading missing.
    GREEN: two columns. `06564f5`. 27 tests.
- **T009** tier rules:
  - ESLint `no-restricted-imports` per tier (`eslint.config.js`). Proved with throwaway files in
    each tier, then deleted: 10 bad imports rejected, each naming its rule (a higher tier, the
    engine, the app, a package); every allowed import passed.
  - Styling check, five cycles. Started in `src/ui/tiers.spec.ts` with `import.meta.glob`; found
    that Vitest replaces CSS imports with empty strings (`{ './combined/zz-probe.css': '' }`,
    also with `css.include` and `?inline`), so the check moved to `tools/ui-tiers.ts` and reads
    stylesheets from disk with Node, as the exceptions check does. Cycles: finds `color` (RED
    `expected [] to deeply equal [ 'color: red' ]`); finds the ten other styling declarations
    (10 RED); allows layout and `border: none` (RED `[ 'border: none' ]`); `stylesheetsIn` reads
    folders recursively, missing folder none (RED `expected [] …`); the check over
    `src/ui/combined` and `src/ui/screens` passed vacuously (no folders yet), proved by a reverted
    `box-shadow` in `src/ui/screens/zz-probe.css`: failed naming the file and declaration.
    Commits `db3ee69`, `62e043b`. **To raise**: `acceptance.md` (owner-locked) names
    `src/ui/tiers.spec.ts` for AC-7's second half; the test is now `tools/ui-tiers.spec.ts`, with
    the same title, so `npm run test-results` still counts it.
- **T010**: coverage gains `src/ui/component.ts`, `src/ui/foundations/**/*.ts` and
  `src/ui/**/*.model.ts`. Decision: each component splits into a pure `<name>.model.ts`
  (unit-tested, counted) and a `<name>.ts` renderer (proven through the catalogue on the phones,
  not counted), so the 90% threshold measures what Node can run.

## Foundational (part 1)

- **T011** `src/ui/component.ts`: `writeText` writes new text (RED `expected 'Found 0 of 2' to be
  'Found 1 of 2'`), and leaves the same text alone (RED `expected 1 to be +0`, one write counted);
  `Component<Props>` type. `src/ui/foundations/themes.ts`: `applyTheme` sets Classic's four
  colours and only those (RED `expected {} to deeply equal { '--ink': '#1A1A1A', …(3) }`).
  Only Classic, and only its colours: the other themes and each theme's voice are added when a
  test asks (AC-14, US4). `tokens.css`: fonts by `@font-face` with `font-display: swap`, outline,
  shadow, radius, gap and touch-target values; reduced motion turns off transitions.
  `src/css.d.ts` declares CSS side-effect imports for TypeScript 6.
- **T012** catalogue shell: title, a "Theme" switch (Classic pressed), four section regions.
  `npm run build:catalogue` bundles both fonts (19.92 kB, 39.12 kB); `npm run build` unchanged.
- **T013** drivers: `UiCatalogueDriver` (`open()` goes to `catalogue.html`, waits for the title
  and scans with axe, per the Playwright standard; every other method returns a value that
  cannot pass), `engineCatalogueDriver` (reads `dist/` only; browsing throws "Browse the
  catalogue only with ACCEPTANCE_DRIVER=ui"), shared `published-files.ts`; fixtures wired.
  Checkpoint run on both catalogue projects: 34 failed, all on assertions (e.g. AC-1 "catalogue
  sections, in order" and "components in Simple components"; `Received: ""`, `"other"`, `NaN`),
  none on a missing driver.

## AC-1: the catalogue is organised by tier

- **Acceptance test**: `test/acceptance/library/simple-components.acceptance-spec.ts` —
  `[spec-003 AC-1]`, two scenarios, on `catalogue-iphone` and `catalogue-android`.
- **Driver**: `sections()` and `componentsIn(section)` read region names in document order.
- **Acceptance RED**: "every component is listed by name in its tier" failed: `components in
  Simple components — Expected - 9, Received + 1` (an empty list). **Reported**: "it shows
  Foundations, Simple components, Combined components and Screens, in that order" **passed at
  RED**, because the T012 shell already draws the four sections. Driver proven by a reverted
  break (Simple and Combined swapped in `src/catalogue/main.ts`): failed with "catalogue
  sections, in order". Reverted; no diff.

### Cycle 1 — the catalogue lists the library by tier

- **RED**: `LIBRARY › lists every component by tier, in the design guide's order` in
  `src/catalogue/library.spec.ts` — failed: `expected { Foundations: [], …(3) } to deeply equal
  …` (all tiers empty).
- **GREEN**: `LIBRARY` lists 7 simple, 8 combined and 1 screen — commit `2b07c7f`.
- **REFACTOR**: none needed.

### Cycle 2 — placeholders for parts 2 and 3 (owner decision 2026-11-06)

- **RED**: `says which part builds each component not built yet` — failed: `expected [] to
  deeply equal [ …(9) ]`.
- **GREEN**: combined components "Built in part 2.", play screen "Built in part 3." — commit
  `92f42b5`.
- **REFACTOR**: none needed.

- **Renderer** (driven by the scenario): one `region` per component inside its tier, named by
  the component, with an `h3` and the placeholder line.
- **Acceptance GREEN**: AC-1, 4 runs passed (axe clean on each open). Full suite: 146 unit tests
  (lines 100%, branches 96.12%); engine 35 passed; phones 91 passed (87 game + 4 AC-1) and 30
  failed (the 15 part-1 scenarios not yet started, on two phones).
- **Slice refactor**: none needed.
