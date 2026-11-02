# Implementation Plan: Walking Skeleton (F0)

**Branch**: `001-walking-skeleton` | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-walking-skeleton/spec.md`

## Summary

A player opens a static web page on their phone and plays the 2 × 2 worked example:

- Tapping a cell steps it empty → 1 … 9 → empty.
- Tapping an open operator steps it + → − → × → ÷.
- **Check** calculates every line.
- The counter reads "Found N of 2", counting each distinct solution once.

The build has three layers:

- **Engine**: a pure, DOM-free TypeScript rules engine.
- **Session**: a pure reducer for app state.
- **View**: a thin plain-DOM layer.

Vite builds the page to a relative-path `dist/` that Capacitor can package later. Vitest
tests the engine and session. Playwright Test runs the acceptance scenarios through an
in-process driver and a Playwright UI driver. GitHub Actions builds and tests, then deploys
the same artifact to GitHub Pages. The stack is recorded in
[ADR 0001](../../docs/adr/0001-web-stack-and-hosting.md). The reasoning for each choice is
in [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript, strict mode; Node 22 LTS for tooling

**Primary Dependencies**:
- Runtime: none (plain DOM).
- Development: Vite, TypeScript, Vitest, `@playwright/test`, `@axe-core/playwright`,
  ESLint with `typescript-eslint`.
- Exact versions are pinned when `/speckit-implement` adds them (research R11).

**Storage**: none. State is in memory for the current visit only.

**Testing**:
- Vitest for unit tests (engine and session).
- Playwright Test for acceptance, with engine and UI drivers (research R4).
- axe scans inside the UI driver.

**Target Platform**: current and previous Safari on iOS and Chrome on Android. Static files
served over HTTPS by GitHub Pages.

**Project Type**: single-page client-side web app (later packaged as a mobile app).

**Performance Goals**: ready to play under 3 s on a 2023 mid-range Android over 4G
(SC-004); every tap rendered under 100 ms (SC-003); JavaScript and CSS under 30 KB gzipped.

**Constraints**:
- No network requests after load (FR-016), and no service worker.
- WCAG 2.2 AA.
- Usable at 320 px wide with no scrolling.
- 48 px touch targets.
- Safe areas respected.

**Scale/Scope**: one screen, one fixed puzzle, up to 50 playtesters. Static, so it scales
with the CDN.

No NEEDS CLARIFICATION items remain. Research R1 to R12 resolve the points the planning
input left open.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Result |
| --- | --- | --- |
| I. Client-side and offline | Static files only. No runtime calls; a CSP blocks `connect-src`. All assets bundled, system fonts. Capacitor-ready `dist/` (R6, R7). | Pass |
| II. Pure puzzle engine | `src/engine/` has no DOM or Node, enforced by a DOM-free tsconfig and lint (R2). Checks by calculation. `Rules.operatorOrder` is a parameter. UI rules come from the engine (`nextCellValue`, `nextOperator`). | Pass |
| III. Deterministic, seeded generation | No generation in F0. The ban on `Math.random` and `Date` in the engine is added now (R2). Golden seeds arrive with F7. | Pass (not yet exercised) |
| IV. Mobile, touch and accessible | Native buttons, 48 px targets, safe areas, `touch-action: manipulation`, reduced motion, names on every element, a polite live region, given cells not marked by colour alone, axe on every UI-driver page (R10, [play-screen](contracts/play-screen.md)). | Pass |
| V. Test-first | Vitest unit tests next to the code, red-green-refactor, TDD log written by `/speckit-implement`. | Pass |
| VI. Executable specifications | Four-layer acceptance under `test/acceptance/`. Rule scenarios through the in-process driver; play scenarios through the UI driver at 375 × 667 (R4, R5). Layers 1 and 2 are drafted by `/speckit-acceptance` and locked. | Pass |
| Baseline 1: spec-first | Spec clarified; this ADR is raised. | Pass |
| Baseline 2: ownership | Engine and app are separate components. Owner: Philip England, solo developer (personal project), recorded in constitution 1.0.1. | Pass |
| Baseline 3: contracts | No HTTP APIs or events. The engine API is an internal boundary ([engine-api](contracts/engine-api.md)). | No subject |
| Baseline 4: platform | GitHub Pages and Actions are not organisation platform capabilities. ADR 0001 (Accepted) and exception EXC-006 cover the deviation. | Justified (Complexity Tracking) |
| Baseline 5: reversible | Static artifact; redeploy the previous commit to roll back (see Deployment and Rollback). No database, no flags needed. | Pass |
| Baseline 6: secure by design | Threat model below. No data stored. OIDC deploy, least-privilege workflow permissions. | Pass |
| Baseline 7: observable and testable | Every AC maps to an automated test, except the manual parts of AC-19, SC-001, SC-002 and SC-006 (see Test levels). No device telemetry, covered by EXC-001. | Pass with EXC-001 |
| Baseline 8: proven technology | Mainstream tools; ADR 0001. | Pass |
| Baseline 9: recorded exceptions | EXC-001, EXC-002, EXC-005 and EXC-006 are recorded in `docs/exceptions/`. The `verify` job fails once any has expired. | Pass |
| Overlay P1: user needs | Brief and spec give the need. | Pass |
| Overlay P2: accessible | Accessibility criteria in the spec, axe in every UI run. | Pass |
| Overlay P3: budgets | Budgets declared and tested (R9). Availability alerting is covered by EXC-002. | Pass with EXC-002 |
| Overlay P4: privacy | No personal data. | Pass |
| Overlay P5: design system | There is no shared design system for a personal project, covered by EXC-005. | Pass with EXC-005 |

**Gate result**: pass. Implementation starts once the executable specifications from
`/speckit-acceptance` are approved.

### Post-design re-check

Re-checked after writing [data-model.md](data-model.md), [contracts/](contracts/) and
[quickstart.md](quickstart.md). No new violations. Splitting session state from the engine
(R3) keeps principle II narrow, and the play-screen contract satisfies principle IV point by
point.

## Project Structure

### Documentation (this feature)

```text
specs/001-walking-skeleton/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── engine-api.md    # Internal engine boundary
│   └── play-screen.md   # Roles, names and layout the UI driver relies on
├── checklists/requirements.md
├── acceptance.md        # /speckit-acceptance (lists locked Layer 1–2 files)
├── tasks.md             # /speckit-tasks
└── tdd-log.md           # /speckit-implement
```

### Source Code (repository root)

```text
index.html                         # Single entry; version meta and CSP
vite.config.ts                     # base './', outDir dist, bundle budget
tsconfig.json                      # App (DOM lib), strict
eslint.config.js                   # Includes engine boundary rules
playwright.config.ts               # engine/ui drivers; iPhone-WebKit and Android-Chromium projects
vitest.config.ts                   # Unit tests and coverage threshold
.nvmrc                             # 22

src/
├── engine/                        # Pure rules: no DOM, no Node, no imports from outside
│   ├── tsconfig.json              # lib ES2022, types [] (boundary check)
│   ├── index.ts                   # Public API (contracts/engine-api.md)
│   ├── types.ts
│   ├── cycles.ts                  # nextCellValue, nextOperator
│   ├── cycles.spec.ts
│   ├── evaluate-line.ts           # Whole-number rule, reading order
│   ├── evaluate-line.spec.ts
│   ├── check-entry.ts             # incomplete / not-solved / solved + SolutionKey
│   ├── check-entry.spec.ts
│   └── puzzles/
│       └── worked-example.ts
└── app/
    ├── session.ts                 # Pure reducer: tapCell, tapOperator, submit
    ├── session.spec.ts
    ├── view.ts                    # Renders SessionState into the DOM (contracts/play-screen.md)
    ├── main.ts                    # Wires DOM events to session actions
    └── styles.css                 # Safe areas, touch targets, reduced motion

test/acceptance/                   # Four layers (acceptance-tests standard)
├── play/
│   ├── solve-puzzle.acceptance-spec.ts      # Layer 1, US1, AC-1–AC-11, AC-20 (locked)
│   ├── find-solutions.acceptance-spec.ts    # Layer 1, US2, AC-12–AC-16 (locked)
│   └── play-offline.acceptance-spec.ts      # Layer 1, AC-18, AC-21, small screen, budgets (locked)
├── delivery/
│   └── publish.acceptance-spec.ts           # Layer 1, AC-17, AC-19 (locked; see R8)
├── dsl/
│   └── game.dsl.ts                          # Layer 2 (locked)
├── drivers/
│   ├── game.driver.ts                       # Layer 3 contract
│   ├── engine/game.engine-driver.ts         # In-process, over src/app/session.ts
│   └── ui/game.ui-driver.ts                 # Playwright, roles and names only
└── support/
    ├── acceptance.ts                        # Driver selection by ACCEPTANCE_DRIVER
    └── axe.ts                               # Scan helper (wcag2a, wcag2aa, wcag22aa)

.github/workflows/ci-deploy.yml    # verify (PR and main) → deploy (main only)
docs/adr/0001-web-stack-and-hosting.md
```

**Structure Decision**: a single project with the engine in its own folder, enforced as a
boundary by lint and tsconfig. A separate workspace package is deferred until a second
consumer of the engine exists (R2). Acceptance tests follow the standard's TypeScript layout
under `test/acceptance/`, which the existing `CODEOWNERS` entries already protect.

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
| --- | --- | --- |
| Baseline 4: hosting and pipeline on GitHub Pages and Actions, not confirmed platform capabilities | The planning input chose them. The repository will live on GitHub. Pages gives free HTTPS static hosting with OIDC deploys and no secrets. | No platform static-hosting capability has been identified for this product. The ADR records the revisit trigger. Exception EXC-006 is required. |

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web app (components: puzzle engine, play app).
  Owner: Philip England, solo developer.
- **Boundaries touched**: none outside the product.
- **Contracts added or changed**: none published. Internal engine boundary:
  [contracts/engine-api.md](contracts/engine-api.md).
- **Platform capabilities used**: hosting on GitHub Pages; pipeline on GitHub Actions;
  identity and secrets not needed (OIDC token issued per deploy); logging and monitoring
  none (EXC-001, EXC-002).
- **New technology or platform deviation**: TypeScript, Vite, Vitest, Playwright and GitHub
  Pages. See [ADR 0001](../../docs/adr/0001-web-stack-and-hosting.md).
- **ADRs raised by this plan**: `docs/adr/0001-web-stack-and-hosting.md` (Accepted).
- **Exceptions relied on**: EXC-001 (no device telemetry), EXC-002 (no availability
  alerting), EXC-005 (no shared design system) and EXC-006 (GitHub Pages and Actions), all
  in `docs/exceptions/`. The `verify` job fails when any exception in
  `docs/exceptions/` has passed its `expires` date (Baseline 9).

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the `dist/` static artifact, built once in `verify`, tested, and
  deployed unchanged to GitHub Pages. It deploys independently, since it has no other
  components.
- **Database changes**: none.
- **Feature flags**: none. F0 is the whole product, so there is no incomplete work to hide.
- **Rollback**:
  1. Run `ci-deploy.yml` with `workflow_dispatch`, setting `ref` to the last good commit on
     `main`. This rebuilds, re-verifies and redeploys that commit.
  2. Or revert the merge commit on `main` through a pull request; the normal pipeline
     redeploys.
  3. Confirm the version meta at the public address matches the intended commit.

  There is no data to migrate. Players get the previous version on their next page load.

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**:
  1. Pipeline to GitHub Pages (publishing).
  2. Public address to player's browser (static files over HTTPS).
  3. npm registry to the build (dependencies).

  There is no player data and nothing is sent from the page.

| STRIDE | Threat | Mitigation |
| --- | --- | --- |
| Spoofing | A look-alike site, or a deploy from an unexpected branch | HTTPS enforced on `github.io`. The `github-pages` environment only accepts deployments from `main`. |
| Tampering | A compromised third-party Action or npm package alters the shipped bundle | Actions pinned to commit SHAs. `npm ci` from the committed lockfile. The deploy job has no write access to repository contents. The bundle-size budget flags unexpected growth. |
| Tampering | Script injection into the page | No user-supplied HTML: the view sets `textContent` only. CSP `default-src 'self'`. |
| Repudiation | An untraceable change to the live site | Every deploy is tied to a commit and a workflow run. The version meta exposes the commit. Merges need a reviewed pull request (branch protection, CODEOWNERS). |
| Information disclosure | Leaked credentials | No stored secrets: the deploy uses a short-lived OIDC token. No personal data exists. |
| Denial of service | The site is unavailable | Accepted: GitHub's CDN default, with no availability target (EXC-002). Once loaded, play needs no network. |
| Elevation of privilege | A pull request workflow gains deploy rights | Workflow default `permissions: contents: read`. `pages: write` and `id-token: write` only on the `deploy` job, which never runs for pull requests. |

- **Access model**: maintainers merge through protected `main`. The `deploy` job's OIDC
  identity can deploy Pages only. No Key Vault is needed, since there are no secrets.

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**

- **Logs**: none from devices (EXC-001). Pipeline run logs are kept by GitHub Actions.
- **Metrics**: none at runtime. Budgets are measured in CI (R9), and the merge-to-live time
  is visible on each run.
- **Traces**: not applicable; there are no service calls.
- **Health checks**: the post-deploy smoke step confirms the public address serves the
  merged commit (AC-17).

**Test levels**

The unit tests (Vitest) also cover every rule underneath these scenarios:
`evaluate-line.spec.ts`, `check-entry.spec.ts`, `cycles.spec.ts` and `session.spec.ts`.

| Acceptance criterion | Test level | Test location |
| --- | --- | --- |
| AC-1 Opening grid | Acceptance, UI driver (`@ui`) | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-2, AC-3, AC-5 Cell cycle | Acceptance, both drivers | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-4 Given cell | Acceptance, UI driver (`@ui`) for "visibly different"; engine driver for "unchanged" | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-6, AC-7 Operators | Acceptance, both drivers | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-8 to AC-11 Checking | Acceptance, both drivers | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-20 Message clears on the next change | Acceptance, both drivers; the UI driver also checks the status region announces nothing new | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-12 to AC-16 Distinct solutions | Acceptance, both drivers | `test/acceptance/play/find-solutions.acceptance-spec.ts` |
| AC-17 Published on merge | Acceptance against the pipeline: post-deploy version smoke check | `test/acceptance/delivery/publish.acceptance-spec.ts`, run by `ci-deploy.yml` |
| AC-18 Offline after load | Acceptance, UI driver (`@ui`), `setOffline` and request recording; plus a manual phone check | `test/acceptance/play/play-offline.acceptance-spec.ts` |
| AC-19 Failed build keeps the old version | Pipeline-structure check, plus a manual confirmation in the TDD log (R8; settled at `/speckit-acceptance`) | `test/acceptance/delivery/publish.acceptance-spec.ts` |
| AC-21 No offline reload | Acceptance, UI driver (`@ui`): load, `setOffline`, reload, and the grid is absent | `test/acceptance/play/play-offline.acceptance-spec.ts` |
| Small screens and safe areas (edge case) | Acceptance, UI driver at 320 px and 375 × 667 | `test/acceptance/play/play-offline.acceptance-spec.ts` |
| SC-003, SC-004 Budgets | Acceptance, UI driver (Chromium, 4G and 4× CPU) | `test/acceptance/play/play-offline.acceptance-spec.ts` |
| SC-006 Accessibility | axe in every UI-driver page (automated); VoiceOver and TalkBack (manual) | `test/acceptance/support/axe.ts`; [quickstart.md](quickstart.md) section 6 |
| SC-001, SC-002 Playtests and real devices | Manual | [quickstart.md](quickstart.md) section 6 |

## Open Items for a Human

1. **GitHub repository**: none is configured yet (no git remote). Pages needs the
   repository on GitHub, with Pages set to "GitHub Actions" as its source. A private
   repository needs a paid plan. Needed before the first deploy.
2. **AC-19 approach**: approve the structure check plus manual confirmation at
   `/speckit-acceptance`, or ask for something stronger.
