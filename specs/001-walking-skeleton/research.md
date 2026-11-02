# Research: Walking Skeleton (F0)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-01

The stack was given as planning input: TypeScript with Vite, built so Capacitor can package
it later; Vitest for the rules library; Playwright as the UI driver; GitHub Pages deployed
from GitHub Actions. This file resolves the open points that input leaves, and records the
reasoning. The stack itself is recorded in
[ADR 0001](../../docs/adr/0001-web-stack-and-hosting.md).

## R1. UI rendering: framework or plain DOM

- **Decision**: plain TypeScript and the DOM, with no UI framework. One render function
  rebuilds the grid's text and attributes from a pure session state after each action.
- **Rationale**: F0 has seven buttons, two lines of text and one live region. A framework
  adds a dependency, an ADR-worthy choice (Baseline 8) and bundle weight against the
  3-second budget (SC-004), for no gain at this size. The session logic is pure (R3), so a
  framework can be adopted later without touching the rules or the session.
- **Alternatives considered**: Preact or Lit (small, but a new dependency now for a
  problem F0 does not have; revisit at F1 when grids grow to 8 × 6). React (too heavy for
  the budget and the need).

## R2. Enforcing the engine boundary (constitution II)

- **Decision**: two checks, both run in the build.
  1. `src/engine/tsconfig.json` compiles the engine on its own with `lib: ["ES2022"]` and
     `types: []`. Any use of `document`, `window`, timers or other DOM or Node globals
     fails type-checking.
  2. ESLint `no-restricted-imports` on `src/engine/**` forbids imports from outside the
     engine folder and from any package. This catches imports of pure UI files that the
     type check alone would allow.
- **Rationale**: the constitution asks for automatic enforcement "for example with lint
  import rules or a separate package that has no DOM type library". Doing both is cheap and
  closes the gap each leaves alone. `Math.random` and `Date` are also banned in the engine
  through `no-restricted-properties` and `no-restricted-globals` (constitution III), even
  though F0 has no generator, so the rule is in place before F7.
- **Alternatives considered**: a separate npm workspace package for the engine (stronger,
  but adds workspace tooling to a single-page skeleton; revisit when a second consumer,
  such as a backend, appears). `eslint-plugin-boundaries` (one more dependency for what
  built-in rules already do).

## R3. Where session behaviour lives

- **Decision**: three layers.
  - `src/engine/`: the rules only: line evaluation, the whole-number rule, checking, what
    makes solutions distinct, and the digit and operator cycles.
  - `src/app/session.ts`: a pure reducer `(state, action) → state` holding the current
    entry, the found solutions and the last result message. It uses the engine and has
    no DOM access.
  - `src/app/view.ts` and `main.ts`: the DOM. These turn taps into actions and render the
    state.
- **Rationale**: nearly every acceptance criterion (AC-2 to AC-16) then runs in Node
  through an in-process driver in milliseconds, as constitution VI prefers. The UI layer
  stays thin enough that the Playwright driver only needs to prove the wiring, layout,
  accessibility and offline behaviour. The cycles go in the engine because the cycle
  order is a game rule (FR-002, FR-006), and the UI must not reimplement rules.
- **Alternatives considered**: session state inside the engine (it is app state, not a
  rule, and would grow the engine's surface for later features). Session state in the
  view (only testable through a browser).

## R4. Acceptance runner and drivers

- **Decision**: Playwright Test (`@playwright/test`) runs the Layer 1 scenarios for both
  drivers. `ACCEPTANCE_DRIVER=engine` (the default) uses an in-process driver over the
  session module. `ACCEPTANCE_DRIVER=ui` uses a Playwright page against a base URL. Vitest
  runs unit tests only.
- **Rationale**: one runner means one scenario file runs through either driver unchanged
  (acceptance-tests standard). Playwright Test gives the UI driver device emulation,
  traces on retry and a `webServer` option for `vite preview`. The engine driver needs
  nothing from a browser, so it runs fine inside the same runner.
- **UI-only scenarios**: AC-1 (layout), AC-4 (visibly different), AC-18 (offline), the
  small-screen edge case and the accessibility scans need a real page. They are tagged
  `@ui` and skipped by the engine driver; every other scenario runs through both.
- **Alternatives considered**: Vitest for Layer 1 with the `playwright` library inside it
  (loses Playwright Test's device projects, traces and web server handling). Cucumber
  (the standard's TypeScript layout uses `*.acceptance-spec.ts`, not Gherkin).

## R5. Where the UI driver runs (Playwright standard)

- **Decision**: on every pull request and on `main`, the UI driver runs against
  `vite preview` serving the exact `dist/` artifact that will be deployed, in two
  Playwright projects: WebKit with iPhone emulation and Chromium with Android (Pixel)
  emulation, both at 375 × 667 (SC-002). It never runs against the public address.
  After deploy, a smoke check fetches the public address and confirms the page's
  `<meta name="version">` equals the merged commit (AC-17).
- **Rationale**: the Playwright standard says UI drivers run against non-production only.
  GitHub Pages gives one site per repository and no staging slot, so the locally served
  build artifact is the non-production environment. Testing the identical artifact before
  deploy proves what ships. The post-deploy check reads one meta tag and drives no UI.
- **Gap**: emulation is not real Safari on an iPhone or real Chrome on Android. SC-002 and
  SC-006 (VoiceOver, TalkBack) also need a manual pass on real phones before F0 is
  declared done. [quickstart.md](quickstart.md) lists the steps.
- **Alternatives considered**: a cloud device farm (cost and a third-party service, out
  of proportion for F0). A second Pages site as staging (needs a second repository).

## R6. Offline and "no network requests" (FR-016, AC-18)

- **Decision**: Vite bundles all JavaScript, CSS and the system font stack into `dist/`.
  There are no web fonts, images from other origins or runtime fetches. A
  `Content-Security-Policy` meta tag sets `default-src 'self'; connect-src 'none'`. The UI
  driver records every request after load and fails if there are any. For AC-18 it calls
  `context.setOffline(true)` and then plays Solution A. There is no service worker, as
  clarified.
- **Rationale**: once the page has loaded, the only thing that could reach the network is
  code we write. The CSP makes an accidental fetch fail loudly in the browser as well as
  in tests.
- **Alternatives considered**: a service worker (ruled out in clarification: offline
  opening comes from F13 packaging).

## R7. Capacitor readiness without Capacitor

- **Decision**: Vite `base: './'` (relative asset paths), a single `index.html` entry,
  output to `dist/`, no client-side routing, no server features and no absolute URLs.
  Capacitor is not added in F0.
- **Rationale**: relative paths work both under the Pages sub-path
  (`https://<owner>.github.io/<repo>/`) and from Capacitor's local web root, so F13 points
  `webDir` at `dist/` with no build changes. Adding Capacitor now would add dependencies
  outside F0's scope.

## R8. Pipeline shape (GitHub Actions to GitHub Pages)

- **Decision**: one workflow, `.github/workflows/ci-deploy.yml`.
  - **On pull request and push to `main`**: the `verify` job runs `npm ci`, a check that
    no exception in `docs/exceptions/` has expired (Baseline 9), lint, the engine type
    check, the app type check, Vitest with coverage, `vite build`, and the
    acceptance scenarios with both drivers against `vite preview`. It then uploads `dist/`
    with `actions/upload-pages-artifact`.
  - **On push to `main` only**: the `deploy` job, `needs: verify`, in the protected
    `github-pages` environment. It runs `actions/deploy-pages` with `pages: write` and
    `id-token: write`, then runs the smoke check.
  - `workflow_dispatch` with a `ref` input is used for rollback.
- **Rationale**: `deploy` only runs if `verify` succeeds, so a failed build or test never
  replaces the live site (AC-19, FR-017). Pages deploys use short-lived OIDC tokens, so
  there are no stored publishing secrets. Workflow-level permissions default to
  `contents: read`. Third-party actions are pinned to commit SHAs.
- **AC-19 testing**: the guarantee comes from the job dependency, which a unit-level check
  cannot prove alone. The plan proposes (a) an automated pipeline-structure check that
  reads the workflow and asserts that `deploy` runs only on `main` and only after `verify`
  succeeds, and (b) a manual confirmation, recorded in the TDD log, that the public
  address was unchanged after the first `verify` failure. How AC-19 is approved as an
  executable specification is settled at `/speckit-acceptance`.
- **Time budget (SC-005)**: `npm ci` with cache, Playwright browsers cached, and both
  acceptance projects run in parallel. The expected total is under 8 minutes, well inside
  15.

## R9. Performance budgets (SC-003, SC-004)

- **Decision**:
  - **Bundle budget**: under 30 KB of gzipped JavaScript and CSS combined. A build step
    fails if this is exceeded.
  - **Load (SC-004)**: in the Chromium project, a budget scenario emulates 4G (CDP network
    conditions: about 9 Mbps down, 170 ms latency) and 4× CPU slowdown, as a stand-in for
    the 2023 mid-range Android reference device. It asserts that the grid is interactive
    within 3 s.
  - **Response (SC-003)**: the same scenario measures the time from a tap to the rendered
    change with `performance.now()` marks and asserts it is under 100 ms.
- **Rationale**: Overlay P3 and the constitution want budgets checked automatically
  against a stated device class. The emulation factors are the commonly used Lighthouse
  mobile profile.
- **Alternatives considered**: Lighthouse CI (another dependency and service; the
  Playwright measurement covers the two budgets F0 states).

## R10. Accessibility approach (SC-006, NFR Accessibility)

- **Decision**: every cell and operator is a native `<button>` with an accessible name that
  includes its position and value, for example "Top-right cell, 7", "Top-left cell, given
  6" and "Row 2 operator, not chosen". Given cells use `aria-disabled="true"` (not
  `disabled`), so they stay focusable and readable. Targets are text with labels.
  - The result message and the counter sit together in one `role="status"` region, so new
    text is announced politely. Clearing the message removes text, which screen readers do
    not announce, which meets "disappears silently" (FR-014).
  - Given cells differ by a pattern and a "given" label, not colour alone. Touch targets
    are at least 48 × 48 CSS px. The layout uses `env(safe-area-inset-*)`, `viewport-fit=
    cover` and `touch-action: manipulation`, and animation is disabled under
    `prefers-reduced-motion`.
  - Every UI driver navigation runs an axe scan with `@axe-core/playwright` and the tags
    `wcag2a`, `wcag2aa` and `wcag22aa` (Playwright standard).
- **Rationale**: native buttons give touch, keyboard (Enter and Space) and screen-reader
  activation for free, which meets constitution IV with no custom key handling.

## R11. Toolchain versions

- **Decision**: Node 22 LTS (the version on the development machine; pinned with
  `.nvmrc` and `engines`). TypeScript, Vite, Vitest, Playwright, `@axe-core/playwright`,
  ESLint with `typescript-eslint`: current stable releases at implementation time, pinned
  exactly in `package-lock.json`.
- **Rationale**: every one of these is mainstream and widely supported (Baseline 8).
  Exact versions are chosen when `/speckit-implement` adds them, which is the task that
  explicitly adds dependencies.

## R12. Testing standard fit

- **Finding**: the organisation's TypeScript testing standard is written for NestJS and
  names Jest. This product is not NestJS, and the planning input names Vitest. Vitest
  keeps Jest's `describe`/`it`/`expect` style, so the standard's structure, naming
  (`<file>.spec.ts` next to the code), determinism and coverage rules all apply
  unchanged. Only the tool name differs. ADR 0001 records this.
