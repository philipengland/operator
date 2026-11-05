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
division that is not whole fails a line. Sources: `docs/brief/project-brief.md`, the constitution.

## Architecture and Key Decisions

- **Components**:
  - Puzzle engine — `src/engine/` — pure TypeScript rules: line evaluation, the whole-number
    rule, checking. No DOM, browser APIs, timers or randomness (constitution II).
  - Play screen — `src/app/` — session state (`session.ts`), wording and accessible names
    (`labels.ts`), DOM rendering (`view.ts`), wiring (`main.ts`).
  - Deployable unit: the static `dist/` build, published to GitHub Pages.
- **Boundaries and integrations**: none at runtime. After loading, the game makes no network
  requests (constitution I; CSP `connect-src 'none'` in `index.html`).
- **Contracts**: no OpenAPI/AsyncAPI. The internal contracts are
  `docs/contracts/engine-api.md` (engine) and `docs/contracts/play-screen.md`
  (accessible names and wording the UI driver reads).
- **Key ADRs**: `docs/adr/0001-web-stack-and-hosting.md` — TypeScript and Vite (Capacitor-ready),
  Vitest, Playwright as the UI driver, GitHub Pages deployed by GitHub Actions; TypeScript is
  pinned to 6.0.x because typescript-eslint does not yet support 6.1+.
- **Active exceptions**: see `docs/exceptions/` (EXC-001, -002, -005, -006).

## Build, Test and Run

Node 22 (`.nvmrc`).

```bash
# Restore and build (build fails if JS + CSS exceed 30 KB gzipped)
npm ci
npm run build

# Checks the pipeline runs first
npm run exceptions:check        # no recorded exception has expired
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

# Run locally
npm run dev                     # http://localhost:5173
npm run preview                 # the built dist/ at http://localhost:4173 (what the UI driver uses)
```

## Repository Layout

| Path | Contents |
|---|---|
| `src/engine/` | Pure puzzle engine; `puzzles/` holds puzzle data. Unit tests sit next to each file (`*.spec.ts`). |
| `src/app/` | Session, labels, view and entry point for the play screen; `styles.css`. |
| `index.html` | Page shell, CSP, viewport and the `version` meta written at build time. |
| `test/acceptance/play/`, `delivery/` | Layer 1 scenarios by capability, tagged `[spec-001 AC-n]` — **locked** |
| `test/acceptance/dsl/` | Layer 2 DSL and vocabulary — **locked** |
| `test/acceptance/drivers/` | Layer 3: engine driver, UI drivers (Playwright), delivery driver |
| `test/acceptance/support/` | Driver selection (`ACCEPTANCE_DRIVER=engine|ui`) and the axe scan helper |
| `tools/` | Build version lookup, exceptions check, acceptance launcher |
| `.github/workflows/ci-deploy.yml` | `verify` on every PR and push; `deploy` to Pages from `main` only |
| `specs/001-walking-skeleton/` | Spec, stories, plan, contracts, acceptance approval, tasks, `tdd-log.md` |
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
- **Write live-region text only when it changes** (`writeText` in `view.ts`). Why: rewriting
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
- **Speed budgets run on Android only.** Why: throttling to the reference phone uses
  Chromium's DevTools protocol.
- **Run TypeScript tools with** `node --experimental-strip-types` (see `exceptions:check`).
  Why: no extra dependency is needed to run a `.ts` tool on Node 22.
