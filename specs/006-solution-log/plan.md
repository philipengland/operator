# Implementation Plan: Solution Log

**Branch**: `006-solution-log` | **Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-solution-log/spec.md`

## Summary

A player can tap the counter to see a list of the solutions they have found, open any of them in a
read-only view, start again after a confirmation, and find their solutions still there when they come
back. The counter leaves out the total when it is over 100.

**Technically**: found solutions are kept in order in the session, and saved per puzzle in `localStorage`
behind a small store. Every saved solution is re-checked by the engine when read. The new screens share
one page with the play screen, and browser history drives the phone's back gesture. See
[research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 6.0.x, strict; Node 22 for the tools

**Primary Dependencies**: none new

**Storage**: the browser's `localStorage`: one small record per puzzle

**Testing**: Vitest (unit), Playwright 1.64.1 (acceptance, iPhone SE on WebKit and Pixel 5 on Chromium)

**Target Platform**: current and previous major versions of Safari on iOS and Chrome on Android

**Project Type**: static client-side web game, on GitHub Pages

**Performance Goals**: list, back and view within 0.1 seconds; ready to play within 3 seconds; JavaScript and
CSS under 30 KB gzipped (about 9 KB today)

**Constraints**: nothing leaves the phone; the engine stays pure; a stored format that outlives every release;
the play screen has no room for a new control

**Scale/Scope**: at least 200 solutions per puzzle; grids up to 8 × 6 after F7

## Constitution Check

*GATE: passed before Phase 0, and re-checked after Phase 1.*

| Principle | Status | How |
| --- | --- | --- |
| I. Client-side and offline | Pass | No network call; the log is on the phone. |
| II. Pure engine | Pass | One data field added (`Puzzle.id`). Storage stays in `src/app/`. Saved solutions are re-checked by the engine (R3). |
| III. Deterministic | Pass | Not affected. |
| IV. Mobile, touch, accessible | Pass | Real buttons at 44 × 44; focus moves are specified (R11); the scan runs on each new screen. |
| V. Test-first | Pass | Pure session, labels, decode and models, unit-tested first. |
| VI. Executable specifications | Pass | `/speckit-acceptance` drafts them. spec-003's locked lists change only with the owner's approval (R12). |
| VII. Small, releasable steps | Pass | One PR per story, each behind its flag. User Story 5 is unflagged, recorded in R13. |
| Platform: Data | Pass | Classified and deletable (spec Data Impact); the format stays readable (R2, R4). |
| Baseline 6, secure and data-aware | Pass | Threat model below. |
| Baseline 7, observable | Pass under EXC-001 | No telemetry from devices, as today. |
| Overlay P2, accessible | Pass | Acceptance criteria AC-6, AC-10, AC-28. |
| Overlay P3, budgets | Pass under EXC-002 | Budgets in the spec, tested. |

## Project Structure

### Documentation (this feature)

```text
specs/006-solution-log/
├── plan.md              # This file
├── research.md          # R1 to R16
├── data-model.md        # Session changes, saved format, states
├── quickstart.md        # How to check it
├── contracts/
│   ├── saved-solutions.md          # The saved format
│   ├── play-screen-changes.md      # New screens: roles, names, wording
│   └── component-library-changes.md
└── tasks.md             # Next: /speckit-tasks
```

### Source Code (repository root)

```text
src/engine/
├── types.ts                  # Puzzle gains `id`
└── puzzles/worked-example.ts # id: 'worked-example'
src/app/
├── session.ts                # found in order; place; start again
├── solution-store.ts         # New: decode, encode, add, clear; pure, given a store
├── solution-store.spec.ts
├── browser-store.ts          # New: the localStorage store, try/catch only
├── navigation.ts             # New: place to and from a history entry
├── screen.ts                 # Counter rule; props for the list and the view
├── labels.ts                 # "No calls yet", row and heading names
├── features.ts               # log, reopen, startAgain, remember
└── main.ts                   # Shows the right screen; history; saving
src/ui/simple/
├── dialog.ts                 # New: native <dialog>
├── surface.ts                # Optional tap action (R8)
└── button.ts                 # Read-only form (R9)
src/ui/combined/
├── confirm-dialog.ts         # New
└── grid-cell, puzzle-grid    # isReadOnly
src/ui/screens/
├── solution-list.ts          # New
└── solution-view.ts          # New
src/catalogue/                # Lists and samples for the new parts
test/acceptance/play/
├── solution-list.acceptance-spec.ts     # New Layer 1, one file per flag
├── reopen-solution.acceptance-spec.ts
├── start-again.acceptance-spec.ts
└── remember-solutions.acceptance-spec.ts
test/acceptance/dsl/, drivers/ui/        # New vocabulary and its drivers
docs/adr/0004-saved-solutions.md         # New
```

**Structure Decision**: the existing tiers and `src/app/` are extended; there is no new top-level folder.

## Release order (constitution VII)

| Pull request | Delivers | Players get |
| --- | --- | --- |
| 1. Library additions | Dialog, Confirm dialog, the two screens, read-only cells, the tappable Surface; catalogue. Includes the approved change to spec-003's lists | No change |
| 2. User Story 1 | The list. AC-1 to AC-6, AC-25 | No change until `log` is on |
| 3. User Story 2 | The read-only view. AC-7 to AC-10, AC-26, AC-27 | No change until `reopen` is on |
| 4. User Story 3 | Start again. AC-11 to AC-13, AC-28 | No change until `startAgain` is on |
| 5. User Story 4 | Remembering. AC-14 to AC-22 | No change until `remember` is on |
| 6. User Story 5 | Very large totals. AC-23, AC-24 | Nothing visible until F7 |

Each flag is turned on by a one-line pull request after the owner's phone review. `log` and `reopen` can be
reviewed and turned on together, as a list of bare numbers has little to see on its own. `remember` must not
be turned on before `startAgain`.

## Complexity Tracking

No violations.

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web game — solo project, Philip England
- **Boundaries touched**: engine (one data field), component library (R8, R9, R10, R12), the browser's storage and history
- **Contracts added or changed**: [saved-solutions.md](contracts/saved-solutions.md) (new), [play-screen-changes.md](contracts/play-screen-changes.md), [component-library-changes.md](contracts/component-library-changes.md); `engine-api.md` gains `Puzzle.id`
- **Platform capabilities used**: GitHub Pages and GitHub Actions, unchanged (EXC-006)
- **New technology or platform deviation**: none
- **ADRs raised by this plan**: [`docs/adr/0004-saved-solutions.md`](../../docs/adr/0004-saved-solutions.md)
- **Exceptions relied on**: EXC-001, EXC-002, EXC-006

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the static `dist/`; deploys as today, and the workflow is not changed
- **Database changes**: none. The saved format starts at 1. A later change adds a new `format`; old records stay readable (FR-614)
- **Feature flags**: `log`, `reopen`, `startAgain`, `remember`, each off until released, then removed once signed off
- **Rollback**: set the flag false in a one-line pull request, or revert the merge. Saved solutions stay on the phone and are simply unused, and come back if the flag is turned on again. A build too old to know a record's `format` leaves it untouched (R4)

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**: the game reading and writing its own record on the phone
- **Threats identified, with mitigations**:

| Threat | Mitigation |
| --- | --- |
| Tampering: saved data is edited, by the player or by another project on the origin | Treated as untrusted: shape-checked and re-checked by the engine (R3). At worst a player can fake their own progress, which affects nobody else |
| Elevation of privilege: script injection through saved data | Saved values are validated as digits and known operators, and written as text only |
| Denial of service: a huge or broken record | Decoding is bounded by the shape check and ignored on failure (FR-612) |
| Denial of service: the store is full or refused | Caught; the game carries on (AC-19) |
| Information disclosure | Game progress only; no personal data; nothing is sent anywhere |
| Spoofing, repudiation | Not applicable: no accounts or transactions |

- **Access model**: no identities or secrets

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**: none from devices, by design (EXC-001).

- **Logs, Metrics, Traces, Health checks**: none

**Test levels**

| Acceptance criterion | Test level | Test location |
|---|---|---|
| AC-1 to AC-6, AC-25 | acceptance, both phones | `test/acceptance/play/solution-list.acceptance-spec.ts` |
| AC-7 to AC-10, AC-26, AC-27 | acceptance, both phones | `…/reopen-solution.acceptance-spec.ts` |
| AC-11 to AC-13, AC-28 | acceptance, both phones | `…/start-again.acceptance-spec.ts` |
| AC-14 to AC-21 | acceptance, both phones | `…/remember-solutions.acceptance-spec.ts` |
| AC-22 | unit | `src/app/solution-store.spec.ts`, title `(spec-006 AC-22)` |
| AC-23, AC-24 | unit | `src/app/session.spec.ts`, `screen.spec.ts`, titles `(spec-006 AC-23)`, `(spec-006 AC-24)` |
| Decode, merge, newer format | unit | `src/app/solution-store.spec.ts` |
| Models of new components | unit | next to each model; catalogue scenarios for the renderers |
| SC-602 | manual | five hallway playtests |
| SC-606 | manual | the owner, on a real phone |

The list and the screens need a browser, so the scenarios run on the UI driver, tagged `@ui`.
