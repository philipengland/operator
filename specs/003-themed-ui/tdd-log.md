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

## AC-2: buttons in four styles

- **Acceptance test**: `simple-components.acceptance-spec.ts` — `[spec-003 AC-2]`, five
  scenarios on both catalogue phones.
- **Driver**: `sample()` reads the sample group's ARIA snapshot (role, name, `[disabled]`,
  `[pressed]`), shown text and box; `appearance()` maps computed fill, border and shadow colours
  to ink/paper/tile/accent from the page's four custom properties
  (`drivers/ui/catalogue-reading.ts`). A missing sample is reported at once rather than timing
  out after 30 s (first RED attempt: `locator.ariaSnapshot: Test timeout of 30000ms exceeded`);
  `sample()` moved into a helper to stay under the complexity limit.
- **Acceptance RED**: `Button "Main" shows — Expected: "Put it through!", Received: ""` (and
  Key, Solid, Dashed); `Button "Unavailable" is a button — Expected: true, Received: false`.

### Cycles in `src/ui/simple/button.model.spec.ts`

1. Heard by its label "5" — RED `expected '' to be '5'`; GREEN, the name is the label.
2. Label then action, "Oops, clear cell" — RED `expected 'Oops' to be 'Oops, clear cell'`; GREEN
   `9eacde2`.
3. Says when it is unavailable — RED `expected false to be true`; GREEN.
4. Carries its style class (main, key, solid, dashed) — 4 RED `expected [] …`; GREEN `06b07ed`.
   No refactor needed in the model.

- **Renderer** (driven by the scenario): `createButton` — a real `<button type="button">`;
  `aria-label` only when the name differs from the label (the label always starts the name);
  `aria-disabled="true"` when unavailable, presses ignored. `button.css`: main (accent fill, tile
  text, 60 px, medium ink shadow), key (tile, small shadow), solid (ink, paper text), dashed
  (dashed accent border, no fill), all at least 44 × 44. Catalogue samples Main, Key, Solid,
  Dashed, Unavailable (`src/catalogue/samples.ts`), each a group named by its label.
- **Acceptance GREEN**: AC-2, 10 runs passed, axe clean. Commit `bdfa205`.
- **Found in the full run**: AC-5 "a decorative tick is not read" passed with no sample, because
  a missing sample was reported as "nothing heard". Driver fixed: a missing sample is heard as
  "this sample is not in the catalogue", so it can pass no check. Catalogue run after the fix:
  14 passed (AC-1, AC-2), 20 failed (10 scenarios not started).
- **Full suite**: 153 unit tests (lines 100%, branches 96.2%); engine 35 passed.
- **Slice refactor**: `button.ts` sets-or-removes two attributes the same way; named
  `setAttributeOrRemove`. Commit `ef1bf93`.

## AC-3: the text input has a label screen readers hear

- **Acceptance test**: `simple-components.acceptance-spec.ts` — `[spec-003 AC-3]`, one scenario
  on both catalogue phones.
- **Driver**: `typeInto()` fills the sample's textbox; `typeface()` waits for fonts, then returns
  the first family in the computed stack that has loaded (a missing font file falls back and
  fails). A sample is heard as its first node that is not plain text, so a field's visible label
  does not hide the field. `firstNodeIn` split in two to stay under the complexity limit.
- **Acceptance RED**: `Text input "Seed" is a text field — Expected: true, Received: false`.
  AC-1 and AC-2 still pass.

### Cycle 1 — the field's id comes from its label

- **RED**: `textInputModel › gives the field an id made from its label, for the label to point
  at` — `expected '' to be 'field-play-from-a-seed'`.
- **GREEN**: the label, lower-cased, non-letters to hyphens — commit `0989ff0`.
- **REFACTOR**: none needed.

- **Renderer** (driven by the scenario): `createTextInput` — a real `<label for>` and an
  `<input type="text">`; `text-input.css`: 52 px field on paper, 4 px ink outline, typed text in
  `--font-display` (Chewy). Catalogue sample "Seed" ("Play from a seed", "e.g. 4F7A21").
- **Acceptance GREEN**: AC-3, 2 runs passed, axe clean.
- **Full suite**: 154 unit tests (lines 100%, branches 96.2%); engine 35 passed; phones 103 passed
  (87 game + 16 catalogue: AC-1, AC-2, AC-3), 18 failed (9 scenarios not started).
- **Slice refactor**: none needed.

## AC-4: text in the game's own typefaces

- **Acceptance test**: `simple-components.acceptance-spec.ts` — `[spec-003 AC-4]`, two scenarios
  on both catalogue phones.
- **Driver**: `requestsToOtherSites()` counts every `http(s)` request since the page was created
  whose origin is not the catalogue's.
- **Acceptance RED**: `Text "Display" shows — Expected: "Hello, Operator!", Received: ""`.
  **Reported**: "the typefaces come with the game: nothing is fetched from another site" **passed
  at RED**, as the task predicted (⚠️), because the fonts already come from the catalogue's own
  build (T011, T012). Driver proven by a reverted break: a Google Fonts stylesheet in
  `catalogue.html` (with the CSP removed, since the CSP would block the request before the
  driver could see it): failed `requests to other sites — Expected: 0, Received: 2`. Reverted.

### Cycle 1 — text carries its display or body style

- **RED**: `textModel › carries the display style …` and `… body style …` — `expected [] to
  deeply equal [ 'text', 'text--display' ]` (and body).
- **GREEN**: classes `text` and `text--<style>` — commit `5ec9d24`.
- **REFACTOR**: none needed.

- **Renderer** (driven by the scenario): `createText` — a `<span>`; `text.css`: display in
  `--font-display` (Chewy, 28 px), body in `--font-body` (Nunito 700, 16 px). Samples Display
  ("Hello, Operator!") and Body ("Tap a dashed bubble to swap its operator.").
- **Acceptance GREEN**: AC-4, 4 runs passed, axe clean.
- **Full suite**: 156 unit tests (lines 100%, branches 96.2%); engine 35 passed; phones 107 passed
  (87 game + 20 catalogue: AC-1 to AC-4), 14 failed (7 scenarios not started).
- **Slice refactor**: none needed.

## AC-5: a tick and a cross, heard only when they mean something

- **Acceptance test**: `simple-components.acceptance-spec.ts` — `[spec-003 AC-5]`, three
  scenarios on both catalogue phones.
- **Driver**: `greyscaleContrast()` screenshots the sample and decodes the PNG in the page (from
  a Blob: the catalogue's CSP blocks `data:` images). Each pixel becomes its relative luminance,
  the grey WCAG contrast is defined on; the background is the most common grey and the result is
  the contrast of the grey that stands out most from it. (research.md R8 named a CSS
  `grayscale(1)` filter; luminance is the same view without the filter's approximation.)
- **Acceptance RED**: all 6 runs failed for the missing samples, e.g. `Icon "Tick" is heard as —
  Expected: "target reached", Received: "this sample is not in the catalogue"`. "A decorative
  tick is not read" now fails at RED too (the sentinel from AC-1's full run).

### Cycle 1 — an icon that carries meaning is heard as it

- **RED**: `iconModel › is heard as what it means when it carries meaning` — `expected { isHeard:
  false, name: null } to match object { isHeard: true, … }`.
- **GREEN**: heard, named by `spokenAs` — commit `169cb44`.
- **REFACTOR**: none needed.

### Cycle 2 — a decorative icon is hidden from screen readers

- **RED**: `iconModel › is hidden from screen readers when it is decoration` — `expected {
  isHeard: true, name: null } to match object { isHeard: false, name: null }`.
- **GREEN**: heard only when `spokenAs` is given — commit `b471ee4`.
- **REFACTOR**: none needed.

### Cycle 3 — an icon carries the shape it is drawn as

- **RED**: `iconModel › carries the tick shape …` and `… cross shape …` — `expected [] to deeply
  equal [ 'icon', 'icon--tick' ]` (and cross).
- **GREEN**: classes `icon` and `icon--<shape>` — commit `985f6d7`.
- **REFACTOR**: none needed.

- **Renderer** (driven by the scenario): `createIcon` — a `<span>`, `role="img"` named by its
  meaning or `aria-hidden="true"`, around an inline SVG (itself hidden) stroked in
  `currentColor`; `icon.css`: 28 px, ink, round 4-unit strokes. Samples Tick ("target reached"),
  Cross ("not a whole number"), Decorative tick. Driver commit `a6521b2`, icon commit `13d324c`.
- **Driver proven** by reverted breaks: the icon drawn in `--paper` failed `Icon "Tick" contrast
  in greyscale — Expected: >= 3, Received: 1.007` (Cross: `1`); the decorative tick given a
  spoken name failed `Icon "Decorative tick" is hidden from screen readers — Received: "tick"`.
  Reverted.
- **Acceptance GREEN**: AC-5, 6 runs passed, axe clean.
- **Full suite**: 160 unit tests (lines 100%, branches 96.25%); engine 35 passed; phones 113
  passed (87 game + 26 catalogue: AC-1 to AC-5), 8 failed (AC-6's 4 scenarios, not started).
- **Slice refactor**: none needed. The heard-or-hidden attribute switch in `icon.ts` repeats
  the pattern of button's `setAttributeOrRemove`; worth sharing once a third component needs it.

## AC-6: surfaces, badges and the mascot

- **Acceptance test**: `simple-components.acceptance-spec.ts` — `[spec-003 AC-6]`, four
  scenarios on both catalogue phones.
- **Driver**: nothing new. `appearance().hasTailCorner` (T029) was already read by
  `readAppearance` (bottom-left radius smaller than the other three), written with the driver
  contract.
- **Acceptance RED**: all 8 runs failed for the missing samples: `Surface "Panel" fill — Expected:
  "tile", Received: "other"` (and Bubble), `Badge "Badge" shows — Expected: "× 12", Received: ""`,
  `Mascot "Mascot" sizeInPixels — Expected: 76, Received: NaN`.

### Cycle 1 — a surface carries its panel or bubble variant

- **RED**: `surfaceModel › carries the panel variant …` and `… bubble variant …` — `expected []
  to deeply equal [ 'surface', 'surface--panel' ]` (and bubble).
- **GREEN**: classes `surface` and `surface--<variant>` — commit `594ceac`.
- **REFACTOR**: none needed.

### Cycle 2 — a badge shows its text as a pill

- **RED**: `badgeModel › shows its text as a pill` — `expected { text: '', classes: [] } to
  deeply equal { text: '× 12', classes: [ 'badge' ] }`.
- **GREEN**: the text and class `badge` — commit `3a8f1e4`.
- **REFACTOR**: none needed.

### Cycle 3 — the mascot is drawn at 76 pixels in the theme's colours

- **RED**: `mascotModel › is drawn at 76 pixels in the theme colours only …` — `expected 0 to be
  76`.
- **GREEN**: the design guide's small mascot (`ComponentLibrary`, "Small · 76px"), shape for
  shape, with its #1A1A1A, #F1E6CF and #BF1E1E mapped to ink, paper and accent so every theme
  repaints it — commit `def4e6d`.
- **REFACTOR**: none needed.

- **Renderers** (driven by the scenarios), commit `9edd358`:
  - `createSurface(props, content)` — a `<div>` holding its content; `surface.css`: tile fill,
    4 px ink outline; panel 30 px corners and a 6 px ink shadow; bubble 26 px corners with a
    6 px tail corner bottom-left and a 6 px accent shadow.
  - `createBadge` — a `<span>`: ink pill, paper text, display typeface.
  - `createMascot` — an `aria-hidden` `<span>`, 76 px, around the SVG; each shape's paint is a
    class (`mascot__fill--ink`, …) so the theme's custom properties colour it. The design guide's
    own markup is `role="img"`; FR-311 and the contract say hidden, so hidden it is.
  - Samples Panel, Bubble (each with body text inside), Badge ("× 12"), Mascot.
- **Driver proven** by reverted breaks: bubble with even corners failed `hasTailCorner — Expected:
  true, Received: false`; panel with an accent shadow failed `shadow — Expected: "ink", Received:
  "accent"`; accent badge failed `fill — Expected: "ink", Received: "accent"`; a 60 px mascot
  failed `sizeInPixels — Expected: 76, Received: 60`; and, separately, a mascot named "Operator
  mascot" failed `is hidden from screen readers — Received: "Operator mascot"`. Reverted.
- **Acceptance GREEN**: AC-6, 8 runs passed, axe clean.
- **Full suite**: 164 unit tests (lines 100%, branches 96.25%); engine 35 passed; phones 121
  passed (87 game + 34 catalogue: AC-1 to AC-6), none failed. Game bundle unchanged (same hashes).
- **Slice refactor**: none needed.

## Part 1 complete (T032)

- **Full suite** at `e41adcd`: exceptions check, lint and types clean; 164 unit tests (lines 100%,
  branches 96.25%); `dist/` unchanged; engine 35 passed; phones 121 passed, none failed.
- **Test results**: `npm run test-results -- 003-themed-ui` — `OVERALL status: BLOCKED`, as
  expected: AC-1 to AC-7 PASS (AC-7 by its unit tests; its scenarios come with part 2), AC-8 to
  AC-25 not covered until parts 2 and 3.
- **Pull request**: branch `003-themed-ui-part-1`, "spec-003 part 1 of 3: foundations and simple
  components".

## Part 2: combined components (T033)

- **Branch**: `003-themed-ui-part-2` from `main` at `36815b0` (part 1 merged, PR #9).
- **Scenarios brought over**: `test/acceptance/library/combined-components.acceptance-spec.ts`
  from `003-themed-ui`, unchanged: blob `868c4d9`, as approved in `79718d4`. The DSL and
  `examples.ts` on `main` are identical to the approved ones.
- **Baseline**: 20 scenarios, 40 runs on the two catalogue phones, all failed on their
  assertions for missing samples or driver stubs (e.g. `Solutions counter "None yet" shows`,
  `keypad keys, row by row`, `what Speech bubble is built from`); none crashed. The rest of the
  suite is as at the end of part 1.

## AC-7: each combined component says what it is built from (opened)

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-7]`, one scenario
  on both catalogue phones. By plan it goes green last in part 2 (T036), once all eight combined
  components exist; its cycles run with each component's criterion.
- **Driver** (T034): `builtFrom(component)` finds the component region's text starting "Built
  from:" and splits the rest on commas; no line gives none.
- **Acceptance RED**: `what Speech bubble is built from — Expected: ["Surface", "Text"],
  Received: []` on both phones, as T034 predicted.

## AC-8: the solutions counter

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-8]`, four
  scenarios on both catalogue phones.
- **Acceptance RED**: all 8 runs failed for the missing samples, e.g. `Solutions counter "None
  yet" shows — Expected: "Solutions found 0 of 2", Received: ""`, as T037 predicted.
- **Owner decisions (2026-11-06)**, asked before the cycles:
  1. The scenarios expect the tick in the shown text ("All found! 2 of 2 ✓"; AC-11 likewise),
     but the design guide and part 1's Icon draw it as SVG. Decision: keep the SVG and add the
     ✓ or ✗ inside the icon as visually hidden text.
  2. The design guide's count is a light pill on the accent or ink counter; part 1's Badge was
     ink only and would vanish on the ink Complete counter. Decision: Badge gets a light style.
  - Following from the tier rule (combined components add no styling): the accent and ink fills
    come from Surface (a `fill` option), and Text now inherits its colour from what it sits on.
    Reported at the checkpoint.

### Cycle 1 — an icon carries the character its drawing stands for

- **RED**: `iconModel › carries the tick as the character ✓ …` (and cross ✗) — `expected '' to
  be '✓'`. **GREEN**: `6c3d8c1`. **REFACTOR**: none needed.

### Cycle 2 — a badge can be light, for a count on a coloured surface

- **RED**: `badgeModel › can be light …` — `expected [ 'badge' ] to deeply equal [ 'badge',
  'badge--light' ]`. **GREEN**: `11275d8` (ink stays the default; AC-6 unchanged). **REFACTOR**:
  none needed.

### Cycle 3 — a surface can be filled with the accent or ink

- **RED**: `surfaceModel › can be filled with the accent …` (and ink) — `expected [ 'surface',
  'surface--panel' ] to deeply equal [ …, 'surface--accent' ]`. **GREEN**: `4fffd80`; the ink
  fill casts an accent shadow so it still stands out; `.text` now `color: inherit`.
  **REFACTOR**: none needed.

### Cycles 4 to 6 — the solutions counter model

- **4 RED**: `solutionsCounterModel › while searching shows "Solutions found" and "1 of 2" on the
  accent …` — `expected { title: '', count: '', … } to deeply equal { title: 'Solutions found', …
  }`. **GREEN**: `45cc78b`.
- **5 RED**: `… when every solution is found shows "All found!" on ink …` — received title
  "Solutions found". **GREEN**: complete when `found === total` — `05a3f16`.
- **6 RED**: `… with no total known shows the count alone …` — received count "12 of undefined".
  **GREEN**: `7ec5155`.
- **REFACTOR**: none needed.

### Cycles 7 and 8 — the catalogue shows the counter as built (AC-7)

- **7 RED**: `LIBRARY › says which part builds each component not built yet`, expectation updated
  to leave out the counter — `expected [ …(9) ] to deeply equal [ …(8) ]`. **GREEN**: `533bc24`.
- **8 RED**: `LIBRARY › says what each built combined component is built from` — `expected {
  'Solutions counter': undefined } to deeply equal { 'Solutions counter': [ …(4) ] }`. **GREEN**:
  the entry takes `builtFrom` from `solutions-counter.ts` — `43daea2`. **REFACTOR**: the file's
  description back above its imports — `6b2d718`.

- **Renderer** (driven by the scenarios), commit `9ec7799`: `createSolutionsCounter` — a Surface
  (panel, accent or ink) holding a visually hidden name ("Found 1 of 2") and an `aria-hidden`
  row of the title Text (display) and a light Badge with a decorative tick Icon after its text,
  hidden unless complete. Layout-only `solutions-counter.css`. Foundations gain `.visually-hidden`
  and `[hidden] { display: none !important }` (the Icon's own `display` would otherwise beat
  `hidden`). Icon renders its glyph as hidden text; Badge takes nodes to place after its text.
  The catalogue shows "Built from: Surface, Text, Badge, Icon". Samples None yet, In progress,
  Complete, No total.
- **Driver** (commit `c02b7b5`):
  - shown text leaves out words that are visually hidden and heard (not inside `aria-hidden` or
    an `img`), so the counter's name is not "shown" but an icon's ✓ is;
  - a group whose only content is text is written by Playwright on one line (`- group "None
    yet": Found 0 of 2`); that text is now what is heard;
  - where a sample holds only text, all of it is heard, in order (before, only the first text
    counted, so unhidden visible parts would have passed).
  - A temporary log line used to see the snapshot was removed with `git checkout`, which also
    dropped the uncommitted driver change; restored from a copy taken first.
- **Driver proven** by reverted breaks (iPhone): name made visible failed `"None yet" shows —
  Received: "Found 0 of 2 Solutions found 0 of 2"`; visible parts no longer hidden failed
  `"In progress" is heard as — Received: "Found 1 of 2 Solutions found 1 of 2"`; no glyph failed
  `"Complete" shows — Received: "All found! 2 of 2"`; complete left on the accent failed
  `"Complete" fill — Expected: "ink", Received: "accent"`.
- **Tier rules proven on a real combined component** (T035): `background: var(--accent)` in
  `solutions-counter.css` failed `combined components and screens add no styling` with that
  declaration; importing `../../app/labels` failed lint twice (FR-305, FR-303). Reverted.
- **Acceptance GREEN**: AC-8, 8 runs passed, axe clean; part-1 catalogue scenarios still pass.
- **Full suite**: 173 unit tests (lines 100%, branches 96.51%); engine 35 passed; phones 129
  passed (87 game + 42 catalogue), 32 failed (the 16 part-2 scenarios not started). Game JS and
  CSS unchanged (same hashes).
- **Slice refactor**: none beyond `6b2d718`.

## AC-9: the target pill

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-9]`, four
  scenarios on both catalogue phones.
- **Acceptance RED**: all 8 runs failed for the missing samples: `Target pill "Add" shows —
  Expected: "+ 16", Received: ""`, as T040 predicted.
- **Design note**: the look check reads a sample's outermost element, which must be the ink badge
  itself, so the pill cannot wrap it. Badge therefore gains `spokenAs` (as Icon has): its visible
  text is hidden from screen readers and a visually hidden name speaks. Icon now takes the colour
  of what it sits on, so the tick shows on the ink badge.

### Cycle 1 — a badge can be heard as something other than its text

- **RED**: `badgeModel › can be heard as something other than its text` — `expected '+ 16' to be
  'Row 1 target 16, plus'`. (The first badge test now also states it is heard as its text.)
  **GREEN**: `369575c`. **REFACTOR**: none needed.

### Cycles 2 to 4 — the target pill model

- **2 RED**: `targetPillModel › a shown operator is a badge showing "+ 16", heard by its line's
  name` — `expected { kind: 'button', text: '', … } to deeply equal { kind: 'badge', text: '+ 16',
  … }`. **GREEN**: `908bfe2`.
- **3 RED**: `… an open operator not yet chosen is a button showing "? 12"` — received the badge.
  **GREEN**: open is a button; no operator shows "?" — `d68b80a`. A chosen open operator ("× 12"
  on the button) follows from the same rule; a test for it would pass at once, so none was added.
- **4 RED**: `… a line that reaches its target gains a tick, heard with "target reached"` —
  received `hasTick: false`. **GREEN**: tick, and ", target reached" (spec-002's wording) —
  `fc5d4ad`.
- **REFACTOR**: none needed.

### Cycle 5 — the catalogue shows the pill as built (AC-7)

- **RED**: `LIBRARY › says which part builds each component not built yet` without the pill, and
  `… what each built combined component is built from` with `'Target pill': ['Badge', 'Button',
  'Icon']` — both describe the pill being built, so both changed in one RED: `expected [ …(8) ] to
  deeply equal [ …(7) ]` and `expected { 'Solutions counter': … } to deeply equal { …, 'Target
  pill': … }`. **GREEN**: `cf16154`. **REFACTOR**: none needed.

- **Renderer** (driven by the scenarios), commit `24a0c5f`: `createTargetPill(props, onChoose?)`
  — shown: a Badge spoken by the line's name with a decorative tick Icon inside, hidden unless
  the line reaches its target; open: a dashed Button labelled "? 12" whose name is "? 12, Row 2
  target 12, operator not chosen" (label first, WCAG 2.5.3), calling `onChoose` when tapped.
  Shown or open is fixed for a puzzle, so it is chosen at creation. Layout-only
  `target-pill.css` sizes the tick to the pill. Badge renders its spoken name; `aria-hidden` set
  to `"true"` (a first try with `toggleAttribute` wrote `""`, which hides nothing; fixed before
  the run). Samples Add, Subtract, Multiply, Divide, Open, Line correct.
  - **Known limit**: an open pill whose line reaches its target is heard with "target reached"
    but shows no tick, since Button holds only its label. The play screen shows the ✓ in the
    line's working (AC-11); raised at the checkpoint.
- **Driver proven** by reverted breaks (iPhone): no tick failed `"Line correct" shows — Received:
  "+ 9"`; open pill as a key failed `"Open" outline — Expected: "dashed", Received: "solid"`;
  badge not spoken by name failed `"Add" is heard to include "plus" — Received: "+ 16"`; light
  badge failed `"Add" fill — Expected: "ink", Received: "tile"`.
- **Acceptance GREEN**: AC-9, 8 runs passed, axe clean; earlier catalogue scenarios still pass.
- **Full suite**: 177 unit tests; engine 35 passed; phones 137 passed (87 game + 50 catalogue),
  24 failed (the 12 part-2 scenarios not started). Game JS and CSS unchanged.
- **Slice refactor** (`60cb210`): setting or removing an attribute, now in Button, Icon and Badge,
  moves from `button.ts` to `component.ts` as `setAttributeOrRemove`. Full suite green again.
  Unit line coverage 100% → 98.9% (branches 95.6%): the helper now sits in a unit-covered file
  but is exercised through the components; above the 90% threshold.

## AC-10: the grid cell in five states

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-10]`, six
  scenarios on both catalogue phones.
- **Driver** (T043): `greyscaleImage()` sets `filter: grayscale(1)` on the sample, screenshots
  it, and restores the filter (research R8). Committed with the RED.
- **Acceptance RED**: all 12 runs failed for the missing samples: `Grid cell "Given" shows —
  Expected: "2", Received: ""`, as T043 predicted; "told apart" failed because two missing
  samples give the same empty image.
- **Design note**: combined components add no styling, so the cell's looks live in Button: two
  styles, `cell` and `cell-correct` (design guide: 72 px tall, 22 px corners, 44 px digit; given
  solid ink; selected accent with a caret when empty; correct-line accent digit and shadow), a
  selected state (`aria-pressed`), and an optional whole `name`, so a cell is heard "Top-right
  cell, 8" (play-screen contract) rather than "8, Top-right cell, 8".

### Cycles 1 and 2 — Button: selected, and a whole name

- **1 RED**: `buttonModel › says when it is selected` — `expected false to be true`. **GREEN**:
  `isSelected`, rendered as `aria-pressed="true"` — `8313bbe`.
- **2 RED**: `buttonModel › can be given its whole name, which contains its label` — `expected
  '8' to be 'Top-right cell, 8'`. **GREEN**: `4645b45`.
- **REFACTOR**: none needed. (The two new styles need no logic: the class is `button--<style>`
  already, so a test would pass at once; none added.)

### Cycles 3 to 7 — the grid cell model (the Button props that show a cell)

- **3 RED**: `gridCellModel › a given cell shows its digit, cannot be changed, and is heard as
  "given 2"` — `expected { label: '', style: 'cell' } to deeply equal { label: '2', … }`.
  **GREEN**: `af628a7`.
- **4 RED**: `… an empty cell shows nothing and is heard as "empty"` — `expected { label: 'null',
  … }`. **GREEN**: `heardValue` gives "given 2", "empty" or the digit — `c443b67`. The player's
  digit ("Top-right cell, 8") follows from the same rule; a test would pass at once, so none.
- **5 RED**: `… a selected cell is heard as selected` — `expected false to be true`. **GREEN**:
  `e5d815e`.
- **6 RED**: `… a cell in a line that reaches its target has the correct-line look` — `expected
  'cell' to be 'cell-correct'`. **GREEN**: `da0fe83`.
- **7 RED**: `… a selected cell in a correct line shows the selected look: selected wins` —
  received style `cell-correct`. **GREEN**: `e841802`.
- **REFACTOR**: none needed.

### Cycle 8 — the catalogue shows the cell as built (AC-7)

- **RED**: both library tests (not built yet without the cell; built from with `'Grid cell':
  ['Button']`) — `expected [ …(7) ] to deeply equal [ …(6) ]` and the built-from map. **GREEN**:
  `45c658d`.

- **Renderer** (driven by the scenarios), commit `ffe5853`: `createGridCell(props, onTap?)` — a
  Button from `gridCellModel`. Cell styles in `button.css`. Samples Given, Empty, Selected, Your
  digit, In a correct line, and Selected, in a correct line.
- **Driver proven** by reverted breaks (iPhone): given cell left changeable failed `"Given" fill —
  Expected: "ink", Received: "tile"`; selected not selected failed `"Selected" fill — Expected:
  "accent", Received: "tile"`; correct look lost failed `"In a correct line" shadow — Expected:
  "accent", Received: "ink"`; Empty drawn as Given failed `"Given" and "Empty" look the same in
  greyscale`. The first two failed on the fill before the state was read, so the states were
  proven alone, keeping the look (CSS matching the attribute whatever its value, the button
  writing `"false"`): `"Given" is heard as unavailable — Received: false` and `"Selected" is
  heard as selected — Received: false`. Reverted.
- **Acceptance GREEN**: AC-10, 12 runs passed, axe clean; earlier catalogue scenarios still pass.
- **Full suite**: 184 unit tests (lines 98.9%, branches 96.0%); engine 35 passed; phones 149
  passed (87 game + 62 catalogue), 12 failed (the 6 part-2 scenarios not started). Game JS and
  CSS unchanged.
- **Slice refactor**: none needed.

## AC-11: the line working

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-11]`, two
  scenarios on both catalogue phones.
- **Acceptance RED**: all 4 runs failed for the missing samples: `Line working "Incomplete" shows
  — Expected: "= ?", Received: ""`, as T046 predicted.
- **Owner decision (2026-11-06)**: T047 carried over spec-002's "marked slots heavier as well as
  the symbol", but Chewy, the display face, has one weight. Decision: the result slot is display
  text like the pills and cells beside it, and a mark is shown by its ✓ or ✗ only (already more
  than colour alone).

### Cycles 1 to 3 — the line working model

- **1 RED**: `lineWorkingModel › shows an unmarked result slot with no icon, heard by the whole
  working` — `expected { result: '', icon: null, heardAs: '' } to deeply equal { result: '= ?', …
  }`. **GREEN**: `6c18afd`.
- **2 RED**: `… shows a tick after the result when the line reaches its target` — `expected null
  to be 'tick'`. **GREEN**: `bcbd0b1`.
- **3 RED**: `… shows a cross when a division is not whole` — `expected null to be 'cross'`.
  **GREEN**: the mark is the icon, none is no icon — `3301fda`.
- **REFACTOR**: none needed.

### Cycle 4 — the catalogue shows the working as built (AC-7)

- **RED**: both library tests (not built yet without it; built from with `'Line working':
  ['Text', 'Icon']`) — `expected [ …(6) ] to deeply equal [ …(5) ]` and the built-from map.
  **GREEN**: `9599056`.

- **Renderer** (driven by the scenarios), commit `0c818ed`: `createLineWorking` — a visually
  hidden name ("Row 1 working, 6 + 2 = 8, target reached") and an `aria-hidden` row of the result
  as display Text and the mark Icon (decorative, its ✓ or ✗ kept as text), hidden when there is
  no mark. Layout-only `line-working.css`. Samples Incomplete, Target reached, Below zero, Not
  whole, named in the play-screen contract's wording. The data model's prop is `result`.
- **Driver proven** by reverted breaks (iPhone): no tick failed `"Target reached" shows —
  Received: "= 8"`; no spoken name failed `"Target reached" is heard to include "6 + 2 = 8" —
  Received: ""`; no cross failed `"Not whole" shows — Received: ""`.
- **Acceptance GREEN**: AC-11, 4 runs passed, axe clean; earlier catalogue scenarios still pass.
- **Full suite**: 187 unit tests (lines 98.9%, branches 96.0%); engine 35 passed; phones 153
  passed (87 game + 66 catalogue), 8 failed (the 4 part-2 scenarios not started). Game JS and
  CSS unchanged.
- **Slice refactor**: none. The hidden name speaking for a hidden visible row now appears in the
  solutions counter and the line working; worth sharing if a third combined component needs it.

## AC-12: the puzzle grid

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-12]`, one
  scenario on both catalogue phones.
- **Driver** (T049): `gridLayout()` finds the group named "Puzzle" in the sample and reads each
  part's box by its accessible name (play-screen contract): a button with that name (open pills,
  cells) or else the element holding a visually hidden name with that text (shown pills,
  workings); the helper line is the grid's last paragraph.
  - **Found at RED**: with no puzzle the first draft returned no cells, so the DSL's position
    checks looped over nothing and only the helper line failed; a grid with no cells and the
    right helper would have passed. The driver now always reports the fixed 2 × 2 structure,
    each missing part an unknown box, so every check runs.
- **Acceptance RED**: `column pill 1 is above the cell at row 1, column 1 — Expected: true,
  Received: false` on both phones (T049 predicted `No box at position 1`; the same cause, a
  missing part, reported by the first check).

### Cycles 1 to 3 — where each part sits (`puzzleGridPlaces`)

- **1 RED**: `puzzleGridPlaces › puts the cells below the row of column pills and right of the
  column of row pills` — `expected [ { row: +0, column: +0 }, … ] to deeply equal [ { row: 2,
  column: 2 }, … ]`. **GREEN**: `3757a68`. (The size parameter, unused until cycle 3, failed
  lint, so it came in with the cycle that needs it.)
- **2 RED**: `… puts each column pill on top, above its column, and each row pill at the left,
  beside its row` — received `{ row: +0, column: +0 }`. **GREEN**: `1185b61`.
- **3 RED**: `… puts each row's working at the far right of its row, and each column's working
  below its column` — received `{ row: +0, column: +0 }`. **GREEN**: the line just past the last
  cell — `be33c98`.
- **REFACTOR**: none needed.

### Cycle 4 — the catalogue shows the grid as built (AC-7)

- **RED**: both library tests (not built yet without it; built from with `'Puzzle grid':
  ['Surface', 'Target pill', 'Grid cell', 'Line working', 'Text']`). **GREEN**: `15f0119`.

- **Renderer** (driven by the scenario), commit `54754c1`: `createPuzzleGrid` — a panel Surface
  named "Puzzle" (`role="group"`), a CSS grid whose parts are placed by `puzzleGridPlaces`
  (`gridRow` and `gridColumn` set from script, which the CSP allows), and the helper line, a
  paragraph of body Text. Layout-only `puzzle-grid.css`: a pill column of at least 64 px, cell
  columns from 44 px (touch target) to 84 px (design guide), the working column; cells fill
  their column. Sample Fixed puzzle: spec-001's puzzle just opened, in the play-screen contract's
  wording.
  - **Looked at on a phone** (screenshots at 375 and 320 px, no horizontal scroll at either): at
    320 px the open pill's "? 3" and the workings' "= ?" wrapped onto two lines; the grid now
    keeps its parts' text on one line (`white-space: nowrap`) and the cells give way.
- **Driver proven** by reverted breaks (iPhone): row workings placed on the left failed `row 1's
  working is right of the cell at row 1, column 1`; column pills placed below failed `column pill
  1 is above the cell at row 1, column 1`; no helper line failed `helper line — Received: ""`.
- **Acceptance GREEN**: AC-12, 2 runs passed, axe clean; earlier catalogue scenarios still pass.
- **Full suite**: 190 unit tests (lines 99.0%, branches 96.0%); engine 35 passed; phones 155
  passed (87 game + 68 catalogue), 6 failed (AC-7, AC-13, AC-14 not finished). Game JS and CSS
  unchanged.
- **Slice refactor** (`a863bc8`): the helper line's construction named as `createHelperLine`,
  shortening `createPuzzleGrid`. Catalogue scenarios and unit tests green again.

## AC-13: the keypad

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-13]`, one
  scenario on both catalogue phones.
- **Driver** (T052): `keypadRows()` reads each button in the sample by name (its `aria-label`,
  or its text) and box, groups them into rows by top edge, top to bottom, and orders each row
  left to right.
- **Acceptance RED**: `keypad keys, row by row — Received: []` on both phones, as T052 predicted.

### Cycle 1 — the keypad's keys

- **RED**: `keypadKeys › are the digits 1 to 9 as keys, then a solid "Oops" that clears the cell`
  — `expected [] to deeply equal [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 'clear' ]`. **GREEN**: digit keys
  from 1 to the largest digit, then the Oops key (`no-magic-numbers` refused a literal list of
  digits) — `5ba7228`. **REFACTOR**: none needed.

### Cycle 2 — the catalogue shows the keypad as built (AC-7)

- **RED**: both library tests (not built yet without it; built from with `Keypad: ['Button']`).
  **GREEN**: `2a054d5`. Only the speech bubble and operator header (AC-14) and the play screen
  (part 3) still say where they are built.

- **Renderer** (driven by the scenario), commit `33a84e6`: `createKeypad(onKey?)` — a group named
  "Keypad", a five-column grid of the key Buttons, each calling `onKey` with its digit or
  'clear'. Layout-only `keypad.css`: columns share the width and never go below the 44 px touch
  target; keys keep their label on one line. Sample Keypad. Screenshots at 375 and 320 px: two
  rows of five, "Oops" fits its key, no horizontal scroll.
- **Driver proven** by reverted breaks (iPhone): Oops first failed `keypad keys, row by row` with
  "Oops, clear cell" at the start of row 1; ten columns failed with one row instead of two.
- **Acceptance GREEN**: AC-13, 2 runs passed, axe clean; earlier catalogue scenarios still pass.
- **Full suite**: 191 unit tests (lines 99.0%, branches 96.0%); engine 35 passed; phones 157
  passed (87 game + 70 catalogue), 4 failed (AC-7 and AC-14). Game JS and CSS unchanged.
- **Slice refactor**: none needed.

## AC-14: the operator header

- **Acceptance test**: `combined-components.acceptance-spec.ts` — `[spec-003 AC-14]`, one
  scenario on both catalogue phones.
- **Driver** (T055): `mascotAndBubble()` reads the header's two parts. The mascot is hidden from
  screen readers by design and has no name to find it by, so the header's hidden part is the
  mascot and its heard part the bubble; anything else gives unknown boxes.
- **Acceptance RED**: `the mascot is beside the speech bubble — Expected: true, Received: false`
  on both phones (the scenario's first check; T055 named the "shows" check after it, same cause).
- Neither component has logic of its own, so there is no model to unit-test; their unit cycles
  are the catalogue's, and the scenario drives the renderers.

### Cycles 1 and 2 — the catalogue shows the bubble and the header as built (AC-7)

- **1 RED**: library tests without "Speech bubble: Built in part 2." and with `'Speech bubble':
  ['Surface', 'Text']`. **GREEN**: `fbb861a`.
- **2 RED**: without "Operator header: Built in part 2." (`expected [ …(2) ] to deeply equal [
  'Play screen: Built in part 3.' ]`) and with `'Operator header': ['Mascot', 'Speech bubble']`.
  **GREEN**: every combined component is now built — `d9ba0d2`.

- **Renderers** (driven by the scenario), commit `1a8628b`: `createSpeechBubble({ title,
  message })` — a bubble Surface stacking display Text over body Text; `createOperatorHeader` —
  the Mascot at its fixed size beside the bubble, which takes the rest of the width. Layout-only
  stylesheets. Samples: Speech bubble "Row through" (the design guide's "Row one's through, pal.
  Keep 'em coming!"), Operator header "Greeting" ("Hello, Operator!", "Fill the grid, pal.").
  - **Looked at on a phone**: no horizontal scroll at 375 or 320 px. At 375 px it matches the
    design guide; at 320 px the title wraps to two lines ("Hello, / Operator!"), which part 3
    must allow for when the play screen has to fit 320 × 568 without scrolling.
- **Driver proven** by reverted breaks (iPhone): mascot after the bubble failed `the mascot is
  beside the speech bubble`; no message failed `"Greeting" shows — Received: "Hello, Operator!"`;
  words only a screen reader gets, added inside the bubble, failed `"Greeting" is heard as —
  Received: "Hello, Operator! Fill the grid, pal. Operator mascot"`. (Giving the mascot a name
  failed earlier, on "beside": the driver could no longer tell the parts apart.)
- **Acceptance GREEN**: AC-14, 2 runs passed, axe clean.
- **Slice refactor** (`d3229e8`): the catalogue library's imports sorted.

## AC-7: each combined component says what it is built from (closed)

- **Acceptance GREEN** (T036, T057): with all eight combined components built, the scenario
  passes on both phones. Its cycles ran with each component (AC-8 to AC-14): every module
  exports `builtFrom`, the catalogue lists it, and the tier rules were proven on a real combined
  stylesheet and import in AC-8.
- **Driver proven** by a reverted break: the keypad claiming `['Button', 'Text']` failed `what
  Keypad is built from` with "Text" received but not expected.
- **Full suite** (part 2's criteria all green): 191 unit tests (lines 99.0%, branches 96.0%);
  engine 35 passed; phones 161 passed (87 game + 74 catalogue), none failed. Game JS and CSS
  unchanged.

## Part 2 complete (T058)

- **Full suite** at `5ba3108`: lint and types clean; 191 unit tests (lines 99.0%, branches
  96.0%); `dist/` JS and CSS unchanged; engine 35 passed; phones 161 passed, none failed.
- **Test results**: `npm run test-results -- 003-themed-ui` — `OVERALL status: BLOCKED`, as
  expected: AC-1 to AC-14 PASS, AC-15 to AC-25 not covered until part 3.
- **Pull request**: branch `003-themed-ui-part-2`, "spec-003 part 2 of 3: combined components".

## Part 3: the play screen and themes (T059)

- **Branch**: `003-themed-ui-part-3` from `main` at `095b318` (part 2 merged, PR #10).
- **Scenarios brought over**: `play-screen.acceptance-spec.ts` (blob `534052c`) and
  `themes.acceptance-spec.ts` (blob `2610b08`) from `003-themed-ui`, unchanged, as approved in
  `79718d4`. The DSL and `examples.ts` on `main` are identical to the approved ones.
- **Baseline** on the two catalogue phones: 22 runs, 18 failed on their assertions for missing
  samples or behaviour (e.g. `Operator header is above Solutions counter`, `Button "Main" shows —
  Expected: "Connect me!", Received: "Put it through!"`, `not read yet is one of Classic's four
  colours`).
  - **Reported — 4 runs passed at baseline** (⚠️): AC-17 "nothing moves between 'Just opened',
    'Row 1 correct' and 'All found'" and AC-19 "nothing moves or changes size", on both phones.
    AC-19 compares `layoutOfEverySample()` before and after a change, a stub returning `{}`, so
    nothing is compared with nothing. AC-17 compares `screenView()`, a stub giving every part an
    unknown (NaN) position, and the equality check treats NaN as equal to NaN. (First logged as
    both being `layoutOfEverySample()`; corrected in AC-15.) Not behaviour that exists; their
    drivers are made unable to pass while empty and proven with breaks in AC-17 and AC-19.

## AC-15: the play screen, top to bottom

- **Acceptance test**: `play-screen.acceptance-spec.ts` — `[spec-003 AC-15]`, one scenario on
  both catalogue phones.
- **Driver** (T060), commit `4a47b4a`:
  - `openScreen(screen, sample)` opens `catalogue.html#play-screen` (the screen alone at full
    size), presses the sample in the "Screen sample" switch, and scans with axe;
    `chooseScreenSample` presses the button, waits for it to be pressed, and returns to the top
    of the page (the switches sit below the screen); with no such button it leaves the screen as
    it is, so the scenario's checks decide.
  - `useScreen(size)` sets the viewport; `screenView()` reads the viewport and the five parts'
    boxes, each found by its contract name: the header around the "Hello, Operator!" bubble, the
    counter by its "Found N…" name, the "Puzzle" and "Keypad" groups, the main button as the one
    named "…, Check". A part found more or less than once has an unknown box.
  - `sample()` for the play screen reads a part the same way (`readPartView`), so
    `expectShows('Play screen', 'Solutions counter', …)` and `'Row 1 target'` work.
- **Acceptance RED**: `Operator header is above Solutions counter — Expected: true, Received:
  false` on both phones, as T060 predicted.

### Cycle 1 — the catalogue shows the play screen as built (AC-7 for screens)

- **RED**: `LIBRARY › says what the play screen is built from` — `expected [ { name: 'Play
  screen', … } ] to deeply equal [ { name: 'Play screen', builtFrom: [ 'Operator header', …,
  'Button' ] } ]`; the placeholder test now expected none left — `expected [ 'Play screen: Built in
  part 3.' ] to deeply equal []`. **GREEN**: `src/ui/screens/play-screen.ts` declares `builtFrom`;
  the unused part-placeholder helper goes — `d841b9f`.
- **REFACTOR** (`dad7308`): every component is built, so the placeholder idea goes: the
  `notBuiltYet` field, the catalogue's placeholder paragraph, and the library test that only
  checked none were left (its subject no longer exists; it was passing).

- **Renderer** (driven by the scenario), commit `6d43597`: `createPlayScreen(props, actions)` —
  the operator header, solutions counter, puzzle grid, keypad and main Button ("Put it through!",
  named "…, Check"), top to bottom, with safe-area padding (layout-only `play-screen.css`);
  `onKey` and `onCheck` for spec-004 to connect. Samples in `src/catalogue/screen-samples.ts`:
  Just opened, Row 1 correct (top-right 2), All found (Solution B), in the play-screen contract's
  wording. The catalogue's Screens section shows the "Built from:" line, a link to
  `#play-screen`, a "Screen sample" switch and the screen; `#play-screen` shows the screen alone
  filling the viewport, with the theme switch, the sample switch and a link back below it. The
  theme switch and the sample switch share one `switchGroup`.
  - **Looked at on a phone**: in order and as the design guide draws it, but too tall: the main
    button ends at 776 px on a 667 px screen and 832 px on 568. Fitting is AC-16.
- **Driver proven** by reverted breaks (iPhone): the counter above the header failed `Operator
  header is above Solutions counter`; the main button reading "Check it!" failed `Play screen
  "Main button" shows — Received: "Check it!"`.
- **Acceptance GREEN**: AC-15, 2 runs passed, axe clean; earlier catalogue scenarios still pass.
  - **Reported**: AC-17's first scenario ("Row 1 correct" ticks Row 1, "All found" completes the
    counter) now passes too, since the switchable samples it uses came with AC-15. Real
    behaviour, not a stub; its readings are proven with breaks at AC-17.
- **Full suite**: 191 unit tests (lines 99.0%, branches 96.0%); engine 36 passed (AC-18 now
  included); phones 171 passed, 14 failed (AC-16, AC-19, AC-22 and the long-words edge case, not
  started). Game JS and CSS unchanged.
- **Slice refactor**: none beyond `dad7308`.

## AC-16: the play screen fits a phone

- **Acceptance test**: `play-screen.acceptance-spec.ts` — `[spec-003 AC-16]`, two scenarios
  (375 × 667 and 320 × 568) on both catalogue phones.
- **Driver** (T063): `useScreen(size)` was written with AC-15; the scenario sets the size, then
  opens the screen.
- **Acceptance RED**: both sizes failed — 375 × 667 `Keypad is on screen without scrolling`;
  320 × 568 `Puzzle grid is on screen without scrolling` (T065's "375 × 667 may pass at RED"
  did not happen: the main button ended at 776 px).
- **No unit cycles**: these are style changes, which unit tests cannot see (Vitest does not load
  CSS); the scenarios drove them, measured at each step (each part's top and height, every
  sample, both sizes) and looked at in screenshots.
  - **Round 1**: sizes become foundation tokens (`--size-cell`, `--size-key`, `--size-main`,
    `--size-dashed`, `--text-display`, `--space-surface`, `--space-screen`, `--space-between`)
    with smaller values for screens up to 700 px tall (667 px phones) and up to 600 px (568 px
    phones), never below the 44 px touch target; the simple components use them; the bubble takes
    the design guide's own padding (8 px 14 px). 375 × 667 then fitted (main button ends 617 px)
    and stayed put across samples; 320 × 568 ended at 579 px, the "Row 1 correct" message wrapped
    (+16 px) and "All found" ticks made the working rows taller (+11 px).
  - **Round 2**: `--text-body` 14 px and `--text-display` 22 px on screens under 360 px wide (the
    design guide's bubble message is 14 px); `--space-grid` for the grid, keypad and helper
    gaps, 4 px on 568 px phones; a working's icon is the size of its result. 320 × 568 then ends
    at 528–536 px across the samples.
  - **Looked at**: at 375 close to the design guide, room to spare; at 320 tighter but clear,
    every tap target at least 44 px, helper line on one line.
- Commit `a37845d`.
- **Driver proven** by reverted breaks (iPhone): without the 667 px sizes, 375 × 667 failed
  `Keypad is on screen without scrolling`; without the 568 px sizes, 320 × 568 failed the same.
- **Acceptance GREEN**: AC-16, 4 runs passed; AC-1 to AC-17 still pass.
  - **Reported**: the long-words edge case (fits at 320 × 568 in all six themes) passes too, but
    only because `chooseTheme` does nothing yet, so it checks Classic six times. It becomes a real
    check with AC-19.
- **Full suite**: 191 unit tests; engine 36 passed; phones 177 passed, 8 failed (AC-19 and AC-22,
  not started). Game JS and CSS unchanged.
- **Slice refactor**: none needed.

## AC-17: switching the play screen's samples

- **Acceptance test**: `play-screen.acceptance-spec.ts` — `[spec-003 AC-17]`, two scenarios on
  both catalogue phones. Both already passed: the first with real behaviour since AC-15 (its
  samples and in-place updates came then; they live in `src/catalogue/screen-samples.ts`, not
  `samples.ts` as T067 says), the second falsely at the part-3 baseline.
- **Driver** (T066): `chooseScreenSample()` was written with AC-15. The false pass is closed:
  - **Shown first**: with the play screen removed from the full-size view, "nothing moves between
    'Just opened', 'Row 1 correct' and 'All found'" still passed — every part's position was
    unknown (NaN), and the equality check treats NaN as equal to NaN.
  - **Fixed** (`dc44d34`): an unreadable part's box now carries its own number as well as NaN
    edges, so it fails every position check and never equals another unknown box. With the same
    break the scenario then failed (`the play screen's layout is the same for Just opened, Row 1
    correct, All found`); with the screen restored, AC-15 to AC-17 passed.
- **No cycles**: no new behaviour was needed.
- **Driver proven** by reverted breaks (iPhone): a "Row 1 correct" message long enough to wrap
  failed `the play screen's layout is the same for …`; Row 1's pill without its tick failed `Play
  screen "Row 1 target" shows — Expected: "+ 8 ✓", Received: "+ 8"`; "All found" counting 1 of 2
  failed `Play screen "Solutions counter" shows — Received: "Solutions found 1 of 2"`.
- **Acceptance GREEN**: AC-17, 4 runs passed.

## AC-18: the catalogue never reaches players

- **Acceptance test**: `play-screen.acceptance-spec.ts` — `[spec-003 AC-18]`, one scenario, run
  by the engine driver and on both game phones (not a catalogue scenario).
- **Acceptance RED**: **reported — passes at RED** (⚠️), as T069 predicted: the game's build has
  only `index.html` as input (research R7), so `dist/` never held the catalogue. The driver
  (`publishedFiles()`, shared by both drivers since part 1) lists `dist/` and marks any path or
  text containing "catalogue".
- **Driver proven** by a reverted break: `catalogue.html` added to the game build's inputs in
  `vite.config.ts` put `dist/catalogue.html` and its assets in the build, and the scenario failed
  `dist\catalogue.html is part of the catalogue — Expected: false, Received: true`. Reverted and
  rebuilt: `dist/` holds `index.html` and `assets/` only, same hashes as before.
- **Acceptance GREEN** (T070): engine 1 passed; phones (iPhone SE, Pixel 5) 2 passed.

- **Full suite** after AC-17 and AC-18: 191 unit tests; engine 36 passed; phones 177 passed, 8
  failed (AC-19 and AC-22, not started). Game JS and CSS unchanged.
