# 0001. TypeScript and Vite web stack, hosted on GitHub Pages

- **Status:** Accepted
- **Date:** 2026-11-02

## Context

Operator is a client-side puzzle game with no backend. It is played in a phone browser
first and packaged for iOS and Android with Capacitor later (constitution I, F13). The
constitution requires:

- TypeScript in strict mode.
- A pure puzzle engine that runs unchanged in Node, with the boundary enforced in the build
  (II).
- Test-first development with fast engine tests (V).
- Executable specifications run through an in-process driver and a UI driver on a
  phone-sized viewport (VI).
- WCAG 2.2 AA with automated accessibility checks (IV, Overlay P2).

The walking skeleton (F0, `specs/001-walking-skeleton/`) is the first code, so it fixes the
stack. Baseline 8 asks for an ADR when adopting technology new to the organisation, and
Baseline 4 asks for an ADR and a recorded exception when hosting or pipelines do not use the
Cloud Services / DevOps platform.

The organisation's engineering standards cover .NET and NestJS. Neither fits a static
client-side game.

## Decision

| Concern | Choice |
| --- | --- |
| Language | TypeScript, strict mode, on Node 22 LTS for tooling |
| Build | Vite. Single `index.html` entry, relative `base: './'`, output to `dist/`, so Capacitor can use `dist/` as its web root unchanged |
| UI | Plain DOM and TypeScript, with no UI framework in F0 (to be revisited at F1) |
| Engine boundary | A separate DOM-free `tsconfig` for `src/engine/`, plus ESLint `no-restricted-imports`, `no-restricted-globals` and `no-restricted-properties` |
| Unit tests | Vitest, following the TypeScript testing standard's structure, with Vitest in place of Jest |
| Acceptance runner and UI driver | Playwright Test, with an in-process engine driver and a Playwright UI driver behind one driver contract; `@axe-core/playwright` for accessibility scans |
| Pipeline | GitHub Actions: lint, type checks, unit tests, build, acceptance through both drivers, then deploy |
| Hosting | GitHub Pages, deployed with `actions/deploy-pages` using OIDC (no stored publishing secret) |
| Packaging | Capacitor, added in F13. Not a dependency until then |

## Consequences

**Easier**

- The engine and session tests run in Node in seconds. Most acceptance scenarios run
  in-process. Only layout, accessibility and offline scenarios need a browser.
- The static `dist/` output works both on Pages and inside Capacitor, with no build
  changes.
- No servers, databases or secrets to run or rotate. Hosting is free and served over HTTPS.
- Vitest and Playwright are mainstream, widely known tools.

**Harder, or accepted risk**

- **Platform deviation (Baseline 4).** GitHub Pages and GitHub Actions are not confirmed as
  Cloud Services / DevOps platform capabilities. A human must record an exception in
  `docs/exceptions/` before implementation. That exception needs a risk owner, a review
  date and an expiry date, and is proposed as EXC-006. If the organisation's platform
  offers static hosting and pipelines, this decision should be revisited and the exception
  can then lapse.
- **No staging slot.** Pages gives one site per repository. The built artifact is tested
  locally with `vite preview` before deploy, and the public site is only smoke-checked. A
  separate staging site would need a second repository.
- **Standards gap.** The organisation's TypeScript testing standard names Jest and NestJS.
  This product follows its structure with Vitest, and records the difference here. The
  standards owner may want a "static web app" profile.
- **Real devices.** Playwright emulates iPhone Safari (WebKit) and Android Chrome. It does
  not run on real devices, so real-device and screen-reader checks remain manual for F0.
- **No framework.** As grids grow (up to 8 × 6) and screens are added (presets, solution
  log), plain DOM rendering may become costly to maintain. Adopting a framework would then
  need its own ADR. The pure session and engine layers keep that change confined to the
  view.
- **TypeScript 6, not 7.** TypeScript is pinned to 6.0.3 because `typescript-eslint`, which
  enforces the engine boundary and the coding-standard limits, supports TypeScript below 6.1
  only (checked 2026-11-02). Move to TypeScript 7 once `typescript-eslint` supports it.
- **Repository visibility.** GitHub Pages on a private repository needs a paid GitHub plan.
  The repository has no remote yet, so this must be settled when it is created.
