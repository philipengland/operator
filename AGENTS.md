# AGENTS.md — Operator

<!--
  Repository-specific context for AI coding agents (GitHub Copilot, Claude Code).
  Organisation-wide rules live in .github/copilot-instructions.md and
  .github/instructions/ — do NOT repeat or contradict them here.
  Owned by the lead developer. Keep under ~150 lines.
-->

## Product Purpose and Users

Operator is a number puzzle: players fill a grid with digits 1–9 so that every row and
column reaches the target beside it, using that line's operator (+, −, × or ÷), which is
either shown or chosen by the player. Several answers are usually valid, and the game counts
the distinct solutions found. It is for puzzle fans (Kakuro, KenKen) and people practising
mental arithmetic, played in a phone browser first and packaged for iOS and Android with
Capacitor later. Feature F0, the walking skeleton, plays one fixed 2 × 2 puzzle
(`specs/001-walking-skeleton/`). Spec-002 (`specs/002-live-calculations/`) shows each line's
working as the player taps ("6 + 2 = 8 ✓", "6 ÷ 4 ✗"); results may go below zero, and only a
division that is not whole fails a line. Spec-003 (`specs/003-themed-ui/`) builds a themed
component library (six colour themes, a puzzle's theme worked out from its seed) and a
development-only catalogue; spec-004 (`specs/004-themed-play-screen/`) applies it to the game,
with a keypad and the operator's voice after each check. Spec-006 (`specs/006-solution-log/`) lists the solutions found,
reopens them read-only, clears them with "Start again", and remembers them on the phone. Spec-007
(`specs/007-seeded-generator/`) makes new puzzles each day from the date alone, the same on every phone, chosen from a
Today screen, with the worked example kept as "Practice"; so far today's Easy puzzle, behind the `daily` flag. Sources: `docs/brief/project-brief.md`, the constitution.

## Architecture and Key Decisions

- **Components**:
  - Puzzle engine — `src/engine/` — pure TypeScript rules: line evaluation, the whole-number
    rule, checking, and (spec-007) the seeded daily generator (`daily-puzzle.ts`, `presets.ts`, `random.ts`)
    and solution counting (`count-solutions.ts`). No DOM, browser APIs, timers or `Math.random`: its
    randomness is seeded from the date and preset (constitution II).
  - Play screen — `src/app/` — session state (`session.ts`), wording and accessible names
    (`labels.ts`), the mapping from state to what the library shows (`screen.ts`, `solution-list.ts`,
    `solution-view.ts`, `today-list.ts`), today's puzzles and switching between them (`daily.ts`), the phone's date
    (`today.ts`), history (`navigation.ts`), the saved format (`solution-store.ts`), the only code touching
    `localStorage` (`browser-store.ts`), build-time feature flags (`features.ts`), wiring (`main.ts`). The game adds no styling of its own.
  - Component library — `src/ui/` — in tiers: `foundations/` (themes, `themeForSeed`,
    `contrastRatio`, `blend`, `tokens.css`, and `page.css`: the page's paper with Ben-Day dots), `simple/`, `combined/`, `screens/`. Each component has a pure
    `*.model.ts` and a renderer `create<Name>(props) → { element, update }`. Draws everything the
    game shows.
  - Catalogue — `src/catalogue/`, `catalogue.html` — every component in every state and theme,
    and the play screen alone at `catalogue.html#play-screen`. Development only, never published.
  - Deployable unit: the static `dist/` build, published to GitHub Pages.
- **Boundaries and integrations**: none at runtime. After loading, the game makes no network
  requests (constitution I; CSP `connect-src 'none'` in `index.html`). Found solutions stay in the
  phone's `localStorage` and are re-checked by the engine when read.
- **Contracts**: no OpenAPI/AsyncAPI. The internal contracts are
  `docs/contracts/engine-api.md` (engine), `docs/contracts/play-screen.md`
  (accessible names and wording the UI driver reads) and `docs/contracts/component-library.md`
  (the component library's tiers, roles and names; spec-003), and `docs/contracts/saved-solutions.md`
  (what is saved on the phone; every released version's format must stay readable, SC-604).
- **Key ADRs**: `docs/adr/0001-web-stack-and-hosting.md` — TypeScript and Vite (Capacitor-ready),
  Vitest, Playwright as the UI driver, GitHub Pages deployed by GitHub Actions; TypeScript is
  pinned to 6.0.x because typescript-eslint does not yet support 6.1+.
  `docs/adr/0002-component-library.md` — a tiered component library in plain TypeScript (no
  framework), themes as data, self-hosted fonts, and a catalogue that is never published.
  `docs/adr/0004-saved-solutions.md` — one versioned `localStorage` record per puzzle; a newer format is never overwritten.
- **Active exceptions**: see `docs/exceptions/` (EXC-001, -002, -005, -006).

## Build, Test and Run

Node 22 (`.nvmrc`).

```bash
# Restore and build (build fails if JS + CSS exceed 30 KB gzipped)
npm ci
npm run build

# Checks the pipeline runs first
npm run exceptions:check        # no recorded exception has expired
npm run tests:guard             # no existing unit test changed without a recorded reason (compares with origin/main)
npm run lint
npm run typecheck               # app, engine (no DOM types), acceptance, tools

# Unit tests (Vitest, with coverage; 90% lines and branches on engine, session, labels, tools)
npm test

# Integration tests
# none: there is no server, database or external system

# Acceptance tests — in-process engine driver, then the UI driver on two phones
npm run test:acceptance
npm run test:acceptance:engine                     # fast, no browser
npm run test:acceptance:ui                         # iPhone SE (WebKit) and Pixel 5 (Chromium) at 375 × 667; run npm run build first
npm run test:acceptance:engine -- -g "spec-001 AC-8]"   # one acceptance criterion
# After deploy only: ACCEPTANCE_PUBLIC_URL=<url> npm run test:acceptance:engine   (AC-17)
# A scenario that fails locally keeps its trace: npx playwright show-trace test-results/<scenario>/trace.zip

# Test evidence: runs every suite and writes specs/<feature>/test-results.md, which the
# Spec Kit Dashboard shows under Supporting Artifacts (last line: "OVERALL status: PASS")
npm run test-results -- <feature-folder> [--public-url <url>] [--note "<text>"]

# Component catalogue (development only; never in dist/)
npm run catalogue               # builds it, then serves the build at http://localhost:4173/catalogue.html
                                # (add -- --host to view on a phone: http://<this computer's address>:4173/catalogue.html)
npm run build:catalogue         # builds to catalogue-dist/ (git-ignored); the UI driver serves it on its own port

# Run locally
npm run dev                     # builds the game, then serves the build at http://localhost:4173
npm run preview                 # the built dist/ at http://localhost:4173 (what the UI driver uses)
npm run build:flags-on          # the game with every feature flag on, in dist-flags-on/; previewed with
                                # npx vite preview --outDir dist-flags-on --host
```

## Repository Layout

| Path | Contents |
|---|---|
| `src/engine/` | Pure puzzle engine; `puzzles/` holds puzzle data. Unit tests sit next to each file (`*.spec.ts`). |
| `src/app/` | Session, labels, the state-to-screen mapping, feature flags and entry point for the game. |
| `src/ui/` | Component library by tier: `foundations/`, `simple/`, `combined/`, `screens/`. Unit tests next to each model. |
| `src/catalogue/` | The catalogue: what it lists (`library.ts`), component and screen samples, entry point. |
| `catalogue.html` | The catalogue's page; built only by `npm run build:catalogue`. |
| `index.html` | Page shell, CSP, viewport and the `version` meta written at build time. |
| `test/acceptance/play/`, `delivery/`, `library/` | Layer 1 scenarios by capability, tagged `[spec-NNN AC-n]` — **locked** (`library/` is spec-003's catalogue) |
| `test/acceptance/dsl/` | Layer 2 DSL and vocabulary — **locked** |
| `test/acceptance/drivers/` | Layer 3: engine driver, UI drivers (Playwright), delivery driver |
| `test/acceptance/support/` | Driver selection (`ACCEPTANCE_DRIVER=engine|ui`) and the axe scan helper |
| `tools/` | Build version lookup, exceptions check, acceptance launcher |
| `.github/workflows/ci-deploy.yml` | `verify` on every PR and push; `deploy` to Pages from `main` only |
| `specs/NNN-*/` | Per feature: spec, stories, plan, contracts, acceptance approval, tasks, `tdd-log.md`, `test-results.md` |
| `docs/adr/` | Architecture Decision Records |
| `docs/exceptions/` | Recorded exceptions to the organisation baseline |
| `docs/brief/` | Product brief |

## Owners and Environments

- **Owning team**: solo personal project — **Lead developer**: Philip England (`.github/CODEOWNERS`: `@philipengland`)
- **Environments**: production only — https://philipengland.github.io/operator/ (GitHub Pages,
  environment `github-pages`, deploys from `main`). Pull requests are verified, never deployed.
- **Where to find logs and dashboards**: GitHub Actions runs for `ci-deploy`. There is no runtime
  telemetry by design (EXC-001) and no availability alerting (EXC-002).

## Repository-Specific Conventions

- **Engine boundary is enforced by tooling.** `src/engine/tsconfig.json` has no DOM types,
  and ESLint stops engine code importing anything outside `src/engine/` or using browser
  globals, `Date`, timers or `Math.random`. Why: the engine must run unchanged in Node and stay deterministic (constitution II, III).
- **The screen is read by accessible name.** The UI driver finds and reads everything through
  roles and `aria-label`s defined in `docs/contracts/play-screen.md`; changing wording in `labels.ts`
  can break the driver. Why: the same names are what VoiceOver and TalkBack users hear.
- **Write live-region text only when it changes** (`writeText` in `src/ui/component.ts`). Why: rewriting
  identical text makes screen readers announce it again (found by AC-20).
- **A scenario that passes at RED is reported, and its driver proven** by a deliberate,
  reverted break before it is recorded as delivered. Why: several stubs passed vacuously
  early on; `tdd-log.md` records each proof.
- **Build before running the UI driver.** It serves the built `dist/`, not the source. Why: a
  stale build gave a false failure during spec-002 AC-1.
- **Marks and announcements are tested by the phones, not the engine driver.** The engine
  driver takes a line's ✓/✗ from the engine's outcome and counts an announcement itself when
  Check shows a message. Why: only the UI driver reads the app's own names and live region, so
  a break meant to prove those must be run on the phones (spec-002 AC-6, T030).
- **Split a feature into pull requests only where every approved scenario can pass.** Why:
  `verify` runs every approved scenario and `main` requires it, so spec-002's first part
  stayed a draft until the second was done.
- **Merge pull requests with a merge commit.** Why: `tdd-log.md` cites commit hashes, which
  rebase and squash merges rewrite. The `main` ruleset allows merge commits only and requires `verify`.
- **The build is labelled with the checked-out commit** (`tools/build-version.ts`), not
  `GITHUB_SHA`. Why: rollback runs (`workflow_dispatch` with `ref`) check out an older commit.
- **Speed budgets run on Android only, alone, after the other phone runs, with no trace.** Why:
  throttling to the reference phone uses Chromium's DevTools protocol, and run alongside other
  browsers they measure the machine's load, not the game.
- **The library's tiers are enforced by lint and `tools/ui-tiers.spec.ts`.** ESLint stops a tier
  importing a higher one (and `src/ui/` importing the engine or the app); the tools test fails if
  combined or screen CSS declares colours, fills, outlines, shadows, radii or type. Why: a theme
  must restyle everything through the simple components and four colours alone (spec-003 AC-7).
- **Catalogue scenarios run only on the catalogue projects.** They are tagged `@catalogue`, the
  game's phone projects skip them, and `catalogue-iphone` / `catalogue-android` run only them
  against the catalogue build on its own port. Why: the catalogue is a separate build that must
  never reach `dist/` (spec-003 AC-18, research R8).
- **The game and the catalogue are served from their builds, never by Vite's dev server.** Why: their
  content security policy (`default-src 'self'`) blocks the `<style>` tags the dev server injects, so
  under `vite` it showed no styles or fonts (found on a phone, 2026-11-07;
  `tools/catalogue-script.spec.ts`).
- **User stories ship behind build-time feature flags** (`src/app/features.ts`; constitution VII).
  `playwright.config.ts` says which scenario file needs which flag: while a flag is off, that file
  runs on `iphone-flagged` and `android-flagged` against `dist-flags-on/`, and releasing a story
  changes no locked file. Behind a flag at present: `daily` (spec-007 User Story 1, today's Easy puzzle), released on 2026-11-11; to be removed once signed off. Why: every merge deploys, so `main` must always be fit for players.
- **Existing unit tests are protected.** Amend or delete one only when a specific change in functionality makes it
  obsolete, and record it in `specs/<feature>/test-changes.md`: `| File | Test | Requirement (FR-, AC-, SC- or task) | Why the test is obsolete |`.
  `verify` fails a pull request that removes or changes a line of an existing `*.spec.ts` without a new row for that file. Adding tests is
  always allowed. Why: a script overwrote an existing test during spec-006, and neither `verify` nor coverage noticed (2026-11-09).
- **Run TypeScript tools with** `node --experimental-strip-types` (see `exceptions:check`).
  Why: no extra dependency is needed to run a `.ts` tool on Node 22.
- **Upgrading Playwright also changes the image in `ci-deploy.yml`**: `verify` runs in
  `mcr.microsoft.com/playwright`, pinned by tag and digest, which must match `@playwright/test`. Why: the image
  holds the browsers and their libraries; installing them took up to 5m 44s of a 20-minute ceiling (2026-11-09).
