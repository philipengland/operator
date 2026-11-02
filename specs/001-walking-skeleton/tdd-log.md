# TDD Log — Walking Skeleton (F0)

<!--
  Written by /speckit.implement as it works, one section per acceptance
  criterion and one entry per red-green-refactor cycle. Reviewed in the pull
  request; it is the trace from each acceptance criterion to the unit tests
  that delivered it.
-->

- **Spec**: `specs/001-walking-skeleton/spec.md`
- **Baseline**: 2026-11-02. Lint clean; type checks clean (app, engine, acceptance); 0 unit
  tests; build passes (JavaScript and CSS 0.5 KB gzipped). Approved scenarios, all red as
  expected (they are the outer-loop targets, not baseline failures):
  - `npm run test:acceptance:engine`: 22 of 22 fail (every untagged scenario).
  - `npm run test:acceptance:ui`: 55 of 55 fail (27 on `iphone`, 28 on `android`).
  - Every failure is an assertion against a default stub (for example
    `Error: top-right cell … Expected: 1, Received: "empty"`), not a missing driver.

## Setup notes

- **TypeScript pinned to 6.0.3** (owner's decision, option A): `typescript-eslint` 8.72.1
  supports TypeScript below 6.1 only. Recorded in ADR 0001.
- **npm audit**: 11 moderate findings, all one advisory (a `minimatch` denial-of-service
  weakness) in ESLint's and `typescript-eslint`'s dependency chain. These are development
  tools only; the game ships no dependencies (`npm ls --omit=dev` is empty). The only "fix"
  offered is a downgrade to ESLint 4, so no action was taken.
- **Engine boundary proven (T007)**. A scratch file in `src/engine/` importing
  `../app/main` and using `document`, `Math.random` and `Date` failed:
  - `npx tsc --project src/engine/tsconfig.json`: `error TS2584: Cannot find name 'document'.`
  - `npx eslint`: `no-restricted-imports` (outside import), `no-restricted-globals`
    (`document`, `Date`), `no-restricted-properties` (`Math.random`). 4 errors.
  - After deleting the file, both are clean.
- **Stub fix during the baseline**: the UI phone driver's stub layout first reported zero-sized
  boxes on a 0 × 0 screen. The two small-screen scenarios then passed vacuously in both phone
  projects. The stub now reports unknown (NaN) positions, and they fail as they should.
  Observation for the owner: `phone.expectEverythingOnScreen()` does not check that boxes
  have size. The real UI driver must report a missing element as an unknown position, never
  as a zero-sized box.
