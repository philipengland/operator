# Research: Themed Component Library

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-06

Each decision below resolves a question the plan's Technical Context raised.

## R1. Components without a UI framework

**Decision**: Components are plain TypeScript, as the play screen is today (ADR 0001). Each
component is a small module with two parts:

- a **model**: a pure function from the component's props to what it shows and says (text,
  accessible name, state flags). No DOM. Unit-tested in Node with Vitest.
- a **renderer**: `create<Component>(props)` returns `{ element, update(props) }`. It builds
  the DOM once and writes each model into it, writing text only when it changes (the
  existing `writeText` rule, AGENTS.md). Proven through the catalogue on the phones.

**Rationale**: no new dependency; matches the existing split between `labels.ts` (pure
wording, unit-tested) and `view.ts` (DOM). Vitest runs in Node with no DOM library, so the
pure model is where unit tests can reach. `update` lets spec-004 re-render on every tap
without rebuilding elements, which keeps focus and avoids repeated announcements.

**Alternatives considered**:

- *Adopt a framework (Preact, Lit, Svelte)*: easier composition, but a new dependency and an
  ADR, and spec-004 would rewrite the working play screen in it. ADR 0001 deferred this "to
  be revisited at F1"; this research is that revisit, recorded in ADR 0002. Revisit again if
  F6/F7's screens make plain DOM costly.
- *Web components (custom elements)*: no dependency, but shadow DOM complicates axe scans,
  accessible names across shadow boundaries, and the UI driver's role queries.
- *Add happy-dom or jsdom so renderers can be unit-tested*: a new dependency the owner has not
  approved; the catalogue scenarios on real browser engines are a stronger test of the DOM
  anyway. Raised as an open item, not assumed.

## R2. Where the library lives, and how the tiers are enforced

**Decision**: a new top-level `src/ui/` with one folder per tier: `foundations/`, `simple/`,
`combined/`, `screens/`. The game (`src/app/`) keeps its session, labels and wiring, and
starts using `src/ui/` in spec-004. Tiers are enforced by the build:

- **Imports** (ESLint `no-restricted-imports`, as the engine boundary is):
  `foundations` imports nothing from `src/`; `simple` imports `foundations` only;
  `combined` imports `simple` and `combined`; `screens` imports `combined` and the main
  button from `simple`. Nothing in `src/ui/` imports `src/engine/` or `src/app/`, so no
  component can work out a puzzle rule (FR-305, constitution II).
- **Styling** (FR-303, FR-304, SC-304): a unit test reads every stylesheet under
  `src/ui/combined/` and `src/ui/screens/` and fails on any colour, `background`, `border`
  (other than `none`), `box-shadow`, `font-family`, `font-size` or `border-radius`
  declaration. Those tiers may only lay out (`display`, `grid-*`, `flex*`, `gap`, `margin`,
  `padding`, `width`, `height`, `align-*`, `justify-*`, `order`, `position`).

**Rationale**: the existing engine boundary shows lint-enforced import rules work here and
fail fast. A plain-text check on CSS needs no stylelint dependency.

**Alternatives considered**: stylelint with a property allow-list (new dependency); review
only (SC-304 allows it, but drift is likely across three tiers).

## R3. Foundations and themes as data

**Decision**: the six themes are TypeScript data in `src/ui/foundations/themes.ts`: four
colours, address, sign-off and button label each (spec Themes table). `applyTheme(element,
theme)` sets four CSS custom properties (`--ink`, `--paper`, `--tile`, `--accent`) on a
root element. All other foundations (typefaces, outline width, shadow offsets, radii,
spacing, touch target) are fixed CSS custom properties in `src/ui/foundations/tokens.css`.
Every simple component's CSS uses only these properties.

**Rationale**: one source for theme values, readable by the contrast test (R6) and by the
catalogue's theme switch, with no duplication between CSS and TypeScript. Switching theme is
four property writes; layout cannot change because nothing else varies (FR-321).

**Alternatives considered**: six `[data-theme]` blocks in CSS (values duplicated for the
contrast test, which would read the CSS); CSS-in-JS (dependency, and the CSP forbids inline
style elements unless allowed).

## R4. The seed-to-theme rule

**Decision**: `themeForSeed(seed?)` upper-cases the seed, hashes it with 32-bit FNV-1a, and
takes the remainder by 6 as an index into the six themes in table order. No seed gives
Classic. Golden tests pin a few seeds to their themes ("4F7A21" → Plum and mint), so a
change to the rule or the theme order is caught: it would change how existing puzzles look
(constitution III's spirit for seeds).

**Rationale**: deterministic on every device, no dependency, a few lines. Checked on
2026-11-06 against three 600-seed sets (sequential hex, strided hex, decimal): every theme
received between 80 and 124, inside AC-24's 70–130.

**Alternatives considered**: summing character codes (poor spread on similar seeds); using the
seeded generator (F7 does not exist yet, and puzzle generation must not depend on look).

**Placement**: `src/ui/foundations/themes.ts`, not the engine. The theme is presentation, not
a puzzle rule; it uses only pure code, so it still runs in Node for tests.

## R5. Typefaces shipped with the game

**Decision**: commit WOFF2 files for Chewy (400) and Nunito (variable, used at 700 and 800),
latin subset, with their licence texts (Chewy: Apache License 2.0; Nunito: SIL Open Font
Licence (corrected 2026-11-06: Chewy is Apache 2.0, not OFL)), under `src/ui/foundations/fonts/`. `tokens.css` declares
them with `@font-face` and `font-display: swap`, with system fallbacks. Downloaded once by
the developer from the fonts' official distribution (Google Fonts); never fetched at
run time (constitution I, FR-312).

**Rationale**: same-origin files satisfy the CSP (`default-src 'self'`) and offline play.
`swap` keeps text readable while fonts load (spec edge case). In this spec the fonts are
referenced only from the catalogue, so the published game is unchanged (SC-305); spec-004
brings them to players and measures ready-to-play then.

**Alternatives considered**: `@fontsource` npm packages (a dependency to approve); Google
Fonts CSS at run time (a network call, forbidden).

**Sizes**: the latin WOFF2 files are roughly 15–30 KB each. They are not JavaScript or CSS, so
they sit outside the 30 KB bundle budget; spec-004 checks the 3-second ready-to-play budget
with them.

## R6. Contrast check for every theme

**Decision**: a unit test computes WCAG 2.2 contrast for each theme over the colour pairs the
components actually use, with the required ratio for each:

| Foreground on background | Used for | Required |
| --- | --- | --- |
| ink on tile, ink on paper | text, digits, outlines | 4.5:1 |
| paper on ink | text in ink pills, badges, given cells | 4.5:1 |
| accent on tile | digits in a correct line, "?" in open pills | 4.5:1 |
| tile on accent | main button label, selected cell | 4.5:1 |
| accent on paper | accent shadows and dashed outlines next to the page | 3:1 |

**Rationale**: AC-21 must fail the build if a theme is changed badly. Computed on 2026-11-05:
every theme passes; the closest are Midnight blue's accent on tile (4.61:1) and Bubblegum's
accent on paper (3.59:1).

## R7. The catalogue: a separate build, never published

**Decision**: a second HTML entry, `catalogue.html`, at the repository root, with its own
script `src/catalogue/main.ts`. It is built only by `npm run build:catalogue` (Vite
`--mode catalogue`, output to `catalogue-dist/`, git-ignored) and served by
`npm run catalogue` (add `--host` to open it on a phone on the same network). Corrected
2026-11-07: `npm run catalogue` first served the Vite dev server, whose injected `<style>` tags
the catalogue's content security policy blocks, so it showed no styles or fonts; it now builds
the catalogue and serves the build with `vite preview`. `npm run build` keeps its single `index.html` input, so nothing of the catalogue
reaches `dist/` (FR-328). A unit or acceptance check confirms `dist/` holds no catalogue file
and no catalogue text after a build (AC-18).

The catalogue has four sections (Foundations, Simple, Combined, Screens), a theme switch (six
buttons, `aria-pressed`), and fixed samples for every state. Each combined component and the
screen show a "Built from" line taken from the component's own metadata (AC-7), and each
screen sample can be switched (AC-17).

**Rationale**: the UI driver tests built files, not the dev server ("Build before running the
UI driver", AGENTS.md); a built catalogue is tested the same way, served by
`vite preview --outDir catalogue-dist --port 4174`. Keeping it out of `vite build`'s inputs is
the simplest guarantee it is never published.

**Alternatives considered**: a route inside the game hidden behind a flag (ships the
catalogue to players); Storybook (rejected by the owner on 2026-11-06).

## R8. Testing the catalogue

**Decision**:

- **Layer 1 and 2**: new scenarios under `test/acceptance/library/`, by story, and a new
  `catalogue.dsl.ts`, drafted by `/speckit-acceptance` for approval. Scenarios are tagged
  `@ui` and `@catalogue`, since only a browser can show the catalogue.
- **Layer 3**: a `CatalogueDriver` that reads the catalogue by role and accessible name, like
  the game's UI driver. Two new Playwright projects, `catalogue-iphone` and
  `catalogue-android`, run only `@catalogue` scenarios against the catalogue server, at 375 ×
  667 (and 320 × 568 where a scenario asks). The existing `iphone` and `android` projects
  exclude `@catalogue`.
- **Greyscale** (AC-5, AC-10): the driver screenshots each state with `filter: grayscale(1)`
  applied and checks that every pair of states differs.
- **Accessibility** (AC-22): the axe helper runs once per theme.
- **Rules proved by unit tests only** (AC-20, AC-21, AC-23 to AC-25; spec-002 option A
  precedent): their Vitest titles carry the criterion, for example
  `themeForSeed (spec-003 AC-23)`, so `npm run test-results` counts them.

**Rationale**: the same four layers and driver pattern as spec-001 and spec-002. Projects keep
the game's phones and the catalogue's phones apart, so a game run never needs the catalogue
server.

**Follow-on**: `tools/test-results.ts` (on `chore/test-results`) accepts only known Playwright
projects; the two catalogue projects are added to it when both branches meet `main`.

## R9. Delivery in pull requests

**Decision** (subject to owner approval, see plan "Open Items"): three pull requests, each
under 30 minutes to review, each carrying only the approved scenarios it makes pass:

1. Foundations, simple components, catalogue shell, fonts, tier checks (US1).
2. Combined components (US2).
3. Play screen, themes switch, seed rule, contrast (US3–US5).

All scenarios are approved together at `/speckit-acceptance`, but each Layer 1 file is added in
the pull request that makes it pass, so `verify` stays green on every merge (AGENTS.md:
"Split a feature into pull requests only where every approved scenario can pass").

**Alternative**: one branch and one pull request reviewed in parts, as spec-002 did.
