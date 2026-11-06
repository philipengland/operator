# Implementation Plan: Themed Component Library

**Branch**: `003-themed-ui` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-themed-ui/spec.md`

## Summary

Build the "Hello, Operator!" component library in three tiers on shared foundations: simple
components (text, button, text input, icon, surface, badge, mascot), combined components
(speech bubble, operator header, solutions counter, target pill, grid cell, line working,
puzzle grid, keypad) and the play screen, with six themes and the seed-to-theme rule. A
development-only catalogue shows everything in every state and theme. Players see no change;
spec-004 puts the play screen into the game.

Technically: plain TypeScript components (no framework), each a pure **model** unit-tested in
Node plus a DOM **renderer** proven through the catalogue on both phones (research R1). The
library lives in `src/ui/`, one folder per tier, with tier boundaries enforced by ESLint
import rules and a styling check (R2). Themes are TypeScript data applied as four CSS custom
properties (R3). The catalogue is a second HTML entry built only by `npm run build:catalogue`,
so it never reaches `dist/` (R7). Fonts are committed WOFF2 files (R5). No new dependencies.

## Technical Context

**Language/Version**: TypeScript (strict), Node 22. Unchanged (ADR 0001).

**Primary Dependencies**: none added. Fonts Chewy and Nunito are committed assets under the SIL
Open Font Licence, not packages.

**Storage**: none. The catalogue's theme choice is not remembered (FR-325).

**Testing**: Vitest for component models, themes, seed rule, contrast and the tier styling
check; Playwright Test for catalogue scenarios on iPhone SE (WebKit) and Pixel 5 (Chromium),
with axe per theme. The game's existing suite runs unchanged.

**Target Platform**: current Safari on iPhone and Chrome on Android; the catalogue on a
development machine or a phone on the same network.

**Project Type**: single-page client-side web app, plus a development-only catalogue page.

**Performance Goals**: no change to the published game: same `dist/`, same size, same
ready-to-play (SC-305). Components re-render in place within 100 ms (spec-001 SC-003),
measured when spec-004 uses them.

**Constraints**: WCAG 2.2 AA in all six themes; states never by colour alone; 44 × 44 targets;
reduced motion; 375 × 667 and 320 × 568 without scrolling; no network requests (CSP
unchanged); no framework or new dependency.

**Scale/Scope**: 7 simple components, 8 combined components, 1 screen, 6 themes, 1 catalogue
page.

No NEEDS CLARIFICATION items remain; research R1–R9 resolve each design question.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Result |
| --- | --- | --- |
| I. Client-side and offline | Fonts committed and served from the same origin; no requests; CSP unchanged (R5). | Pass |
| II. Pure puzzle engine | `src/ui/` may not import the engine or the app (lint, R2); components are told what to show and never work out a rule (FR-305). The engine is untouched. | Pass |
| III. Deterministic generation | No generation. The seed-to-theme rule is pure and pinned by golden tests (R4). | Pass |
| IV. Mobile, touch and accessible | Real buttons, 44 × 44, `aria-disabled` and `aria-pressed`; states by fill and shadow, not colour; contrast checked for every theme (R6); axe per theme; reduced motion; small screens checked. | Pass |
| V. Test-first | Every model test-first in Vitest; renderers driven by approved catalogue scenarios (outer loop). | Pass |
| VI. Executable specifications | Layer 1 and 2 drafted by `/speckit-acceptance` for approval; unit-only criteria named in test titles (R8). | Pass |
| Baseline 1: spec-first | spec-003 complete; ADR 0002 records the library architecture. | Pass |
| Baseline 3: contracts | Internal component contract written first ([contracts/](contracts/component-library.md)). No published contracts. | Pass |
| Baseline 5: reversible | Nothing published changes; rollback is a revert (below). | Pass |
| Baseline 8: proven technology | No new technology; ADR 0002 records staying frameworkless (ADR 0001 asked to revisit at F1). | Pass |
| Overlay P2: accessible | axe on every catalogue section in all six themes (AC-22). | Pass |
| Overlay P5: design system | EXC-005 still applies: Operator keeps its own design system, which this feature builds. | Pass with exception |
| Baseline 4, 6, 7, 9; Overlay P1, P3, P4 | Unchanged from spec-002; same exceptions (EXC-001, -002, -005, -006). | Pass with exceptions |

**Gate result**: pass.

### Post-design re-check

Re-checked after [data-model.md](data-model.md), [contracts/](contracts/component-library.md)
and [quickstart.md](quickstart.md). No new violations. The tier rules are enforced by the
build, not by review alone, which also meets SC-304.

## Project Structure

### Documentation (this feature)

```text
specs/003-themed-ui/
├── spec.md
├── plan.md                         # This file
├── research.md                     # Phase 0
├── data-model.md                   # Phase 1
├── quickstart.md                   # Phase 1
├── contracts/component-library.md  # Phase 1
├── checklists/requirements.md
├── acceptance.md                   # /speckit-acceptance
├── tasks.md                        # /speckit-tasks
├── tdd-log.md                      # /speckit-implement
└── test-results.md                 # npm run test-results
```

### Source Code (repository root)

```text
catalogue.html                      # NEW: second entry, development only (R7)

src/ui/                             # NEW: the component library
├── foundations/
│   ├── tokens.css                  # typefaces, outline, shadows, radii, spacing, touch target
│   ├── fonts/                      # Chewy 400, Nunito 700 and 800 (WOFF2) + OFL.txt
│   ├── themes.ts                   # THEMES, applyTheme, themeForSeed
│   └── contrast.ts                 # contrastRatio
├── simple/                         # text, button, text-input, icon, surface, badge, mascot
│   └── <name>.ts, <name>.css       # model + renderer; styles from tokens only
├── combined/                       # speech-bubble, operator-header, solutions-counter,
│   └── <name>.ts, <name>.css       #   target-pill, grid-cell, line-working, puzzle-grid, keypad
├── screens/
│   └── play-screen.ts, play-screen.css
├── component.ts                    # the Component<Props> shape and writeText
└── *.spec.ts                       # unit tests next to each file; tiers.spec.ts (styling check)

src/catalogue/                      # NEW: the catalogue page (development only)
├── main.ts                         # sections, theme switch, screen samples
├── samples.ts                      # sample props for every state
└── catalogue.css                   # catalogue's own layout

src/app/, src/engine/               # UNCHANGED (spec-004 connects the play screen)

test/acceptance/
├── library/*.acceptance-spec.ts    # NEW Layer 1, by story (locked after approval)
├── dsl/catalogue.dsl.ts            # NEW Layer 2 (locked after approval)
└── drivers/ui/catalogue.ui-driver.ts   # NEW Layer 3

eslint.config.js                    # CHANGED: tier import rules
vite.config.ts                      # CHANGED: catalogue mode (input catalogue.html, outDir catalogue-dist)
playwright.config.ts                # CHANGED: catalogue-iphone and catalogue-android projects and server
vitest.config.ts                    # CHANGED: coverage includes src/ui models and foundations
package.json                        # CHANGED: catalogue and build:catalogue scripts
.gitignore                          # CHANGED: catalogue-dist/
docs/adr/0002-component-library.md  # NEW
docs/contracts/component-library.md # NEW (current-state copy of the contract)
AGENTS.md                           # CHANGED: library layout, catalogue commands, tier rules
```

**Structure Decision**: one project. The library is a new `src/ui/` beside the engine and the
app, so spec-004 changes only `src/app/` to use it.

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web app: new component library (`src/ui/`). Owner:
  Philip England, solo developer.
- **Boundaries touched**: none outside the product. Inside it, `src/ui/` depends on nothing in
  `src/`; the app will depend on it (spec-004).
- **Contracts added or changed**: internal [component library](contracts/component-library.md).
  The play-screen contract is unchanged until spec-004.
- **Platform capabilities used**: unchanged (GitHub Pages and Actions). The catalogue is not
  hosted.
- **New technology or platform deviation**: none.
- **ADRs raised by this plan**: `docs/adr/0002-component-library.md`: tiered, framework-free
  components; themes as data; catalogue as a separate, unpublished build; self-hosted fonts.
  Revisits ADR 0001's "no framework, to be revisited at F1".
- **Exceptions relied on**: EXC-001, EXC-002, EXC-005, EXC-006.

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the `dist/` static artifact, unchanged in content by this feature.
- **Database changes**: none.
- **Feature flags**: none. The catalogue is excluded by build input, not a flag.
- **Rollback**: revert the merge commit through a pull request. The published game does not
  change, so no redeploy is needed to restore players' experience.

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**: none reach players. The catalogue is local only, and its
  text input is connected to nothing. Components write text with `textContent`, never
  `innerHTML`; the mascot SVG is static markup in the source. Threat model not required.

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**: unchanged (EXC-001).

**Test levels**

| Acceptance criterion | Test level | Test location |
| --- | --- | --- |
| AC-1 to AC-6 Simple components | Acceptance (catalogue, both phones); unit (models) | `test/acceptance/library/simple-components.acceptance-spec.ts`; `src/ui/simple/*.spec.ts` |
| AC-7 Built from, no own styling | Acceptance (Built from line); unit (styling check, R2); lint (imports) | `test/acceptance/library/combined-components.acceptance-spec.ts`; `src/ui/tiers.spec.ts` |
| AC-8 to AC-14 Combined components | Acceptance (catalogue, both phones, greyscale for AC-10); unit (models) | `test/acceptance/library/combined-components.acceptance-spec.ts`; `src/ui/combined/*.spec.ts` |
| AC-15 to AC-17 Play screen | Acceptance (catalogue, both phones, 375 × 667 and 320 × 568) | `test/acceptance/library/play-screen.acceptance-spec.ts` |
| AC-18 Not published | Acceptance (engine driver reads `dist/` after build) | `test/acceptance/library/play-screen.acceptance-spec.ts` |
| AC-19, AC-22 Theme switch, axe per theme | Acceptance (catalogue, both phones) | `test/acceptance/library/themes.acceptance-spec.ts` |
| AC-20 Theme sets only its values | Unit | `src/ui/foundations/themes.spec.ts` |
| AC-21 Contrast | Unit | `src/ui/foundations/themes.spec.ts`, `contrast.spec.ts` |
| AC-23 to AC-25 Seed rule | Unit (golden seeds and spread) | `src/ui/foundations/themes.spec.ts` |
| SC-301 Owner sign-off on a phone | Manual | [quickstart.md](quickstart.md) section 3 |
| SC-302 Every spec-001 and spec-002 criterion | Existing acceptance suite, unchanged | `test/acceptance/play/`, `delivery/` |
| SC-305 Game unchanged | Build comparison | [quickstart.md](quickstart.md) section 4 |

## Delivery

Three pull requests on this branch's line of work, each under 30 minutes to review (research
R9), each adding only the approved Layer 1 files it makes pass:

1. **Foundations and simple components** (US1, AC-1 to AC-6): `src/ui/foundations/`,
   `src/ui/simple/`, fonts, tier lint rules, styling check, catalogue shell and build,
   Playwright catalogue projects, ADR 0002.
2. **Combined components** (US2, AC-7 to AC-14).
3. **Play screen and themes** (US3 to US5, AC-15 to AC-25), the current-state contract in
   `docs/contracts/`, `AGENTS.md`, and `test-results.md`.

## Open Items for a Human

All decided by the owner on 2026-11-06, as recommended:

1. **Pull requests** (R9): all scenarios are approved at once; each Layer 1 file is added in the
   pull request that makes it pass. Three pull requests, as in Delivery.
2. **Fonts** (R5): download Chewy (400) and Nunito (700, 800) latin WOFF2 from Google Fonts
   once, and commit them with their OFL licence.
3. **DOM unit tests** (R1): no `happy-dom`; renderers are proven through the catalogue on the
   phones.
4. **`chore/test-results`**: merged before this feature's first pull request; the catalogue's
   two Playwright projects are then added to the generator's known projects (R8).
