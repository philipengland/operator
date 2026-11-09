# Executable Specifications — Themed Component Library (spec-003)

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/003-themed-ui/spec.md`

Scenarios run with Playwright Test, as for spec-001 and spec-002. Scenarios tagged `@ui @catalogue`
browse the catalogue, so they run only through the UI driver, on iPhone SE (WebKit) and Pixel 5
(Chromium), against the built catalogue (plan research R7, R8). AC-18 is untagged: it reads the
game's build and runs through the engine driver too. Every spec-001 and spec-002 scenario keeps
running unchanged.

**Pull requests** (plan, Delivery): all files are approved together. Each Layer 1 file joins the
pull request that makes it pass: `simple-components` in the first, `combined-components` in the
second, `play-screen` and `themes` in the third. The DSL, vocabulary and examples join the first.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: organised by tier | Foundations, Simple components, Combined components and Screens, in that order | `test/acceptance/library/simple-components.acceptance-spec.ts` |
| AC-1 | Every component is listed by name in its tier | same |
| AC-2: buttons in four styles | Main "Put it through!": accent, heard as "Put it through!, Check" | same |
| AC-2 | Key "5": tile, heard as "5" | same |
| AC-2 | Solid "Oops": ink, heard as "Oops, clear cell" | same |
| AC-2 | Dashed "? 12": dashed accent outline | same |
| AC-2 | Unavailable: still a button, heard as unavailable | same |
| AC-3: labelled text input | "Play from a seed" heard; hint "e.g. 4F7A21"; typed "4F7A21" in Chewy | same |
| AC-4: the game's typefaces | "Hello, Operator!" in Chewy; body text in Nunito | same |
| AC-4 | Nothing fetched from another site | same |
| AC-5: tick and cross | Tick heard as "target reached", visible in greyscale | same |
| AC-5 | Cross heard as "not a whole number", visible in greyscale | same |
| AC-5 | A decorative tick is not read | same |
| AC-6: surfaces, badges, mascot | Panel: tile, solid outline, ink shadow, no tail | same |
| AC-6 | Bubble: tile, accent shadow, tail corner | same |
| AC-6 | Badge "× 12" on ink | same |
| AC-6 | Mascot 76 pixels, not read | same |
| AC-7: built from | Each of the eight combined components names its parts (contract table) | `test/acceptance/library/combined-components.acceptance-spec.ts` |
| AC-8: solutions counter | "0 of 2" on accent, heard "Found 0 of 2" | same |
| AC-8 | "1 of 2", heard "Found 1 of 2" | same |
| AC-8 | "All found! 2 of 2 ✓" on ink, heard "Found 2 of 2" | same |
| AC-8 | "12" with no total, heard "Found 12" | same |
| AC-9: target pill | "+ 16", "− 7", "× 12", "÷ 2" in ink | same |
| AC-9 | "+ 16" heard with "plus" and "16" | same |
| AC-9 | Open "? 12": dashed accent button, heard "not chosen" and "12" | same |
| AC-9 | "+ 9 ✓" heard with "target reached" | same |
| AC-10: grid cell | Given 2: ink, unavailable, heard "given 2" | same |
| AC-10 | Selected: accent, heard as selected | same |
| AC-10 | Your digit 8: tile, ink shadow | same |
| AC-10 | 4 in a correct line: tile, accent shadow | same |
| AC-10 (edge case) | Selected in a correct line: selected style wins | same |
| AC-10 | All five states told apart in greyscale | same |
| AC-11: line working | "= ?", "= 8 ✓", "= −3", "✗" | same |
| AC-11 | Heard as "6 + 2 = 8, target reached" | same |
| AC-12: puzzle grid | Pills top and left, workings at far ends, helper line "Tap a dashed bubble to swap its operator." | same |
| AC-13: keypad | 1–5, then 6–9 and "Oops, clear cell" | same |
| AC-14: operator header | Mascot beside bubble; "Hello, Operator! Fill the grid, pal." shown and heard | same |
| AC-15: play screen order | Just opened: header, counter "0 of 2", grid, keypad, "Put it through!" | `test/acceptance/library/play-screen.acceptance-spec.ts` |
| AC-16: fits a phone | 375 × 667, no scrolling | same |
| AC-16 | 320 × 568, no scrolling | same |
| AC-17: screen samples | "Row 1 correct" ticks "+ 8"; "All found" completes the counter | same |
| AC-17 | Nothing moves between the three samples | same |
| AC-18: never reaches players | The published game contains nothing of the catalogue | same |
| Edge case: long words | 320 × 568 fits in all six themes | same |
| AC-19: Midnight blue | Only Midnight blue's four colours are drawn | `test/acceptance/library/themes.acceptance-spec.ts` |
| AC-19 | Button "Connect me!", bubble "…chief." | same |
| AC-19 | Nothing moves or changes size | same |
| AC-19 | Back to Classic restores Classic | same |
| AC-22: accessible in every theme | axe finds nothing in any of the six themes | same |

**Checked by unit tests, not by these scenarios** (as spec-002 option A). Each test title names
the criterion, such as `(spec-003 AC-23)`, so `npm run test-results` counts it:

- **AC-7, second half**: combined components and screens add no colours, typefaces, outlines or
  shadows of their own: `tools/ui-tiers.spec.ts` (styling check; moved from `src/ui/tiers.spec.ts`
  on 2026-11-06 with the owner's agreement, because Vitest empties CSS imports) and ESLint tier
  import rules.
- **AC-20**: each theme sets exactly its four colours, address, sign-off and button label:
  `src/ui/foundations/themes.spec.ts`.
- **AC-21**: contrast in every theme (research R6 pairs): `src/ui/foundations/themes.spec.ts`.
- **AC-23 to AC-25**: the seed rule, "4F7A21" and "4f7a21", the 600-seed spread, no seed →
  Classic: `src/ui/foundations/themes.spec.ts`.

**Checked by hand** ([quickstart.md](quickstart.md) section 3): the play screen inside safe areas
on a real phone (AC-16; emulated phones have no notch); VoiceOver and TalkBack; SC-301 sign-off.

**Not drafted as a scenario**: AC-2's "does nothing when tapped". The catalogue is view-only
(FR-327), so no sample does anything when tapped; a scenario could not fail. Unavailable is
checked by what a screen reader hears.

## DSL Added or Changed

New file `test/acceptance/dsl/catalogue.dsl.ts`, class `CatalogueDsl`:

| Method | Purpose |
|---|---|
| `open()` | Open the catalogue. |
| `expectSectionsInOrder(sections)` | The catalogue's sections, in order. |
| `expectComponentsIn(section, components)` | The components listed in a section. |
| `expectBuiltFrom(component, parts)` | What a combined component or screen says it is built from. |
| `expectShows(component, label, text)` | A sample shows exactly this text. |
| `expectHeardAs(component, label, heard)` | A screen reader hears exactly this. |
| `expectHeardToInclude(component, label, words)` | What is heard contains each word. |
| `expectNotHeard(component, label)` | The sample is hidden from screen readers. |
| `expectButton(component, label)` | A real button, at least 44 × 44 pixels. |
| `expectTextbox(component, label)` | A text field. |
| `expectUnavailable(component, label)` | Heard as unavailable. |
| `expectSelected(component, label)` | Heard as selected. |
| `expectTypeface(component, label, typeface)` | Shown in Chewy or Nunito. |
| `typeInto(component, label, text)` | Type into a text field. |
| `expectLook(component, label, look)` | Fill, outline, outline colour, shadow, tail corner or size, in the theme's colour names. |
| `expectVisibleInGreyscale(component, label)` | Stands out 3:1 with colour removed. |
| `expectToldApartInGreyscale(component, labels)` | No two samples look alike without colour. |
| `expectNoRequestsToOtherSites()` | Nothing fetched from another site. |
| `expectPuzzleGridLayout(label, helperText)` | Pills top and left, workings at far ends, the helper line. |
| `expectKeypadRows(label, rows)` | The keys a screen reader hears, row by row. |
| `expectMascotBesideBubble(label)` | The mascot is beside the speech bubble. |
| `openScreen(screen, sample)` / `chooseScreenSample(sample)` | Show the play screen with a sample. |
| `useScreen(width, height)` | Use a phone screen of this size. |
| `expectPlayScreenTopToBottom(parts)` | The screen's parts, top to bottom. |
| `expectScreenFitsWithoutScrolling()` | Every part is on screen. |
| `expectScreenLayoutSameFor(samples)` | No part moves between samples. |
| `chooseTheme(theme)` | Switch the catalogue's theme. |
| `expectOnlyThemeColours(theme, colours)` | Every colour drawn is one of the theme's four. |
| `rememberLayout()` / `expectNothingMoved()` | No sample moves or resizes. |
| `expectNoAccessibilityProblems(theme)` | axe finds nothing. |
| `expectNotPublished()` | The game's build contains nothing of the catalogue. |

New file `test/acceptance/dsl/catalogue-vocabulary.ts`: `CatalogueSection`, `SimpleComponent`,
`CombinedComponent`, `LibraryScreen`, `LibraryComponent`, `PlayScreenPart`, `ScreenSample`,
`ThemeName`, `ColourToken`, `ThemeColours`, `Typeface`, `Sample`, `Look`.

New Layer 1 example data `test/acceptance/library/examples.ts`: `THEME_COLOURS` (spec Themes
table), `ALL_THEMES`, `SIMPLE_COMPONENTS`, `COMBINED_COMPONENTS`.

## Driver Interface Required

Signatures only, in `test/acceptance/drivers/catalogue.driver.ts` (`CatalogueDriver`, with
`SampleView`, `SampleAppearance`, `GridLayout`, `ScreenView`, `PublishedFile`).
`/speckit-implement` builds the Playwright driver; only `publishedFiles()` is also needed in
engine runs. `test/acceptance/support/acceptance.ts` registers a `catalogue` fixture whose driver
is not built yet, so every scenario fails for that reason until it is.

**RED run, 2026-11-06**: all 49 scenarios fail with "The catalogue driver is not built yet":
1 on the engine driver (AC-18) and 98 on the phones (49 × 2).

## Approval

- **Approved by**: Philip England, product owner and solo developer
- **Date**: 2026-11-06
- **Locked files**:
  - Layer 1 (scenarios and examples):
    - `test/acceptance/library/simple-components.acceptance-spec.ts`
    - `test/acceptance/library/combined-components.acceptance-spec.ts`
    - `test/acceptance/library/play-screen.acceptance-spec.ts`
    - `test/acceptance/library/themes.acceptance-spec.ts`
    - `test/acceptance/library/examples.ts`
  - Layer 2 (DSL):
    - `test/acceptance/dsl/catalogue.dsl.ts`
    - `test/acceptance/dsl/catalogue-vocabulary.ts`

Not locked (Layer 3, built and changed by `/speckit-implement`): `test/acceptance/drivers/`,
including `catalogue.driver.ts`, and `test/acceptance/support/`.

`.github/CODEOWNERS` gains `/test/acceptance/library/examples.ts` in the approval commit, so the
new example data is locked like `play/examples.ts` (owner's approval, 2026-11-06).

---

# User Story 6 — Ben-Day dots on the page (added 2026-11-07)

Drafted after the owner's review of part 3 (spec clarifications, session 2026-11-07; plan
research R10). Delivered in a fourth pull request (R11). Same projects and tags as the rest of
spec-003: `@ui @catalogue`, run on iPhone SE and Pixel 5 against the built catalogue.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-26: dots behind the play screen | In Classic, #D1C7B4 dots 3 pixels across, every 9 pixels, on #F1E6CF paper | `test/acceptance/library/page-background.acceptance-spec.ts` |
| AC-26 | The header, counter, grid, keypad and main button show no dots | same |
| AC-26 | On a long page (the whole catalogue), the dots reach the very bottom (spec edge case "A long page") | same |
| AC-27: the dots follow the theme | Choosing Midnight blue turns the dots #BCCAD7 on #D8E6F0 paper | same |
| AC-27 | Apart from the dots, every colour drawn is still one of Midnight blue's four | same |
| AC-28: the dotted page stays accessible | In each of the six themes, dots are drawn and the accessibility scan finds no problems | same |

**Checked by unit tests, not by these scenarios**:

- **AC-28, contrast half**: ink on the dot colour reaches 4.5:1 in all six themes:
  `src/ui/foundations/themes.spec.ts`, with the dot colour from `blend(ink, paper, 0.15)`
  (`src/ui/foundations/contrast.spec.ts` checks `blend` gives AC-26's and AC-27's values).

**Values**: from the spec's Acceptance Criteria as Examples ("Dots"). A drawn dot colour within
one level of red, green and blue counts as the spec's colour, because a browser may round a mixed
colour (research R10); the DSL says so where it checks.

**Not drafted as a scenario**: "accent next to the page reaches 3:1 against the paper, not the
dots" (clarification, 2026-11-07). AC-21's unit tests already check accent on paper in every
theme, and the dots change nothing there.

## DSL Added or Changed

`test/acceptance/dsl/catalogue.dsl.ts`, class `CatalogueDsl` (an approved file, changed only by
adding these, for approval):

| Method | Purpose |
|---|---|
| `expectPageDots(place, dots)` | At the top or bottom of the page, dots of this colour (within one level per channel), size and spacing are drawn on this paper. |
| `expectPageDotsShown(theme)` | Some dots are drawn, so an accessibility scan is of the dotted page. |
| `expectNoDotsOn(parts)` | None of these play-screen parts shows a dot. |

`test/acceptance/dsl/catalogue-vocabulary.ts` gains `PagePlace` ("top of the page", "bottom of
the page") and `PageDots` (dot colour, paper, size, spacing).

## Driver Interface Required

`test/acceptance/drivers/catalogue.driver.ts` (`CatalogueDriver`) gains two signatures:

- `pageDots(place)`: the dots as drawn at that place, or null when none are drawn there.
- `showsDots(part)`: whether a dot shows on a play-screen part; true when the part cannot be found,
  so a missing part never passes.

The engine and UI drivers do not implement them yet, so `npm run typecheck` fails on those two
drivers until the first implementation task adds them.

**RED run, 2026-11-07** (phones): 12 runs, 10 failed and 2 passed.
- Failed: `TypeError: this.driver(...).pageDots is not a function` (8) and `…showsDots is not a
  function` (2), because the driver readings are not built.
- **Passed (reported)**: AC-27's "apart from the dots, every colour drawn is still one of Midnight
  blue's four", on both phones. It re-checks AC-19's colour rule, which already holds. It is kept
  because, once the dots exist, it shows they add no colour the rule would catch and change
  nothing else on the page. During implementation it is proven by a deliberate, reverted break.

## Approval (User Story 6)

- **Approved by**: Philip England, product owner and solo developer
- **Date**: 2026-11-07
- **Locked files** (already covered by `.github/CODEOWNERS`: `**/*.acceptance-spec.ts` and
  `test/acceptance/dsl/`):
  - Layer 1: `test/acceptance/library/page-background.acceptance-spec.ts` (new)
  - Layer 2: `test/acceptance/dsl/catalogue.dsl.ts`, `test/acceptance/dsl/catalogue-vocabulary.ts`
    (additions above)

## Changes after approval

| Date | File | Change | Why |
| --- | --- | --- | --- |
| 2026-11-08 | `test/acceptance/library/examples.ts`, `test/acceptance/library/simple-components.acceptance-spec.ts`, `test/acceptance/dsl/catalogue-vocabulary.ts`, `[spec-003 AC-1]` | The exact lists gain Dialog (simple), Confirm dialog (combined), and Solution list and Solution view (screens). | Approved by Philip England. spec-006 adds these parts to the library, and the catalogue lists every component. |
