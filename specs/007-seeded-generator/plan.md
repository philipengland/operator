# Implementation Plan: Daily Puzzles, Seeded Generator and Presets

**Branch**: `007-seeded-generator` | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-seeded-generator/spec.md`

## Summary

Every day brings four puzzles, Easy, Medium, Hard and Collector, the same for every player on that date.
A Today screen lists them, with each one's count and the worked example as "Practice". The game reopens
on the preset last played, and a new day clears the last day's solutions.

**Technically**: the engine gains a seeded generator. A date and a preset form a seed; a small random
number generator draws candidate puzzles from it, the brief's way, and the first whose solution count
(counted by a search with a fixed work budget, capped at 101) falls inside the preset's band is the day's
puzzle. The app reads the phone's date and passes it in. Grids bigger than 3 × 3 use a compact screen with
the workings in one strip. A prototype measured on 2026-11-10 showed the brief's given cells could not meet
the bands, and the real screen could not fit the larger grids; the owner's decisions on both are in the spec.
See [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 6.0.x, strict; Node 22 for the tools

**Primary Dependencies**: none new. The random number generator is written in the engine (R1)

**Storage**: the browser's `localStorage`: spec-006's solution records, and one new record, `operator.today` (R10)

**Testing**: Vitest (unit, golden dates and the sweep of every date of 2027), Playwright 1.64.1 (acceptance, iPhone SE on WebKit and Pixel 5 on Chromium, with the phone's date set by Playwright's clock)

**Target Platform**: current and previous major versions of Safari on iOS and Chrome on Android

**Project Type**: static client-side web game, on GitHub Pages

**Performance Goals**: each of today's puzzles ready within 1 second on the reference device (Chromium at 4× slower CPU); input within 0.1 seconds; JavaScript and CSS under 30 KB gzipped (about 12 KB today)

**Constraints**: the engine stays pure and deterministic, with no clock (constitution II, III); a date's puzzles never change once released (R13); 44-pixel targets; no scrolling except Hard at 320 × 568

**Scale/Scope**: four puzzles a day, grids up to 7 × 5; one day's solutions kept at a time

## Constitution Check

*GATE: passed before Phase 0, and re-checked after Phase 1.*

| Principle | Status | How |
| --- | --- | --- |
| I. Client-side and offline | Pass | Puzzles are made on the phone; no network call (FR-716). |
| II. Pure engine | Pass | The generator and counting are pure; the date arrives as text from the app (R2, R6). |
| III. Deterministic | Pass | A seeded generator in the engine (R1); a work budget, not a time limit (R4); golden dates pinned, and a version in every seed (R2, R13). |
| IV. Mobile, touch, accessible | Pass | 44-pixel targets everywhere; Hard scrolls only at 320 × 568, by the owner's decision; every working still heard (R8). |
| V. Test-first | Pass | Generator, counting, presets, date and records unit-tested first; golden and sweep tests (R12, R13). |
| VI. Executable specifications | Pass | `/speckit-acceptance` drafts them. spec-003's locked catalogue lists gain the new parts only with the owner's approval. |
| VII. Small, releasable steps | Pass | One library pull request and four story pull requests, each story behind its flag (R11). |
| Platform: Data | Pass | One new record, classified and deleted on a new day (R10). |
| Platform: Performance | Pass, with a risk | Budgets per preset, measured on the reference device. Hard is the risk; R5 says what happens if it is over. |
| Baseline 6, secure and data-aware | Pass | Threat model below. |
| Baseline 7, observable | Pass under EXC-001 | No telemetry from devices, as today. |
| Overlay P2, accessible | Pass | AC-12, AC-16; the accessibility scan on the Today screen and every grid size. |
| Overlay P3, budgets | Pass under EXC-002 | AC-17 and SC-701, tested. |

## Project Structure

### Documentation (this feature)

```text
specs/007-seeded-generator/
├── spec.md
├── plan.md              # this file
├── research.md          # R1 to R15
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── engine-api-changes.md
│   ├── play-screen-changes.md
│   ├── component-library-changes.md
│   └── saved-data-changes.md
├── acceptance.md        # /speckit-acceptance
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/engine/
├── random.ts               # mulberry32 and FNV-1a seeding (R1, R2)
├── presets.ts              # the four presets: grid, operators, open lines, givens, targets, band, budget
├── count-solutions.ts      # the search with bounds and a work budget (R4)
├── daily-puzzle.ts         # dailyPuzzle(date, preset) → { puzzle, builtFrom } (R3, R14)
├── *.spec.ts               # unit tests next to each file
├── golden-dates.spec.ts    # pinned puzzles, first of each month of 2027 (R13)
├── sweep-*.spec.ts         # every date of 2027, one file per preset (R12)
└── types.ts                # Puzzle gains optional seed and preset

src/app/
├── today.ts                # the phone's local date as text (R6)
├── today-record.ts         # operator.today: read, write, new-day clearing (R10)
├── today-list.ts           # the Today screen's props
├── daily.ts                # making and keeping today's puzzles for the session (R5)
├── session.ts, screen.ts, navigation.ts, labels.ts, main.ts   # switching puzzles, compact screen, Today place
└── features.ts             # daily, presets, hard, newDay

src/ui/
├── screens/today-list.*    # the Today screen (R7)
├── combined/workings-strip.*  # the strip (R8)
├── combined/status-bar.*   # the compact bar: counter and Today (R9)
├── screens/play-screen.*   # compact arrangement for grids bigger than 3 × 3
└── combined/puzzle-grid.*  # leaves out workings beside lines on grids wider than 3 columns

test/acceptance/play/       # new scenario files per story, locked once approved
test/acceptance/drivers/    # setting the phone's date; the Today screen; larger grids
```

**Structure Decision**: the existing layout. The generator joins the engine; the date, the Today record and
the switching join the app; the new parts join the library by tier.

## Release order (constitution VII)

| Pull request | Delivers | Players get |
| --- | --- | --- |
| 1. Library additions | The Today list, the Today button, the Status bar and the Workings strip, and the compact play screen proved in the catalogue with Medium and Hard grids at both sizes (R9). The approved change to spec-003's locked lists. The brief updated (R15) | No change |
| 2. User Story 1 | The generator, Easy, the Today screen in the game. AC-1 to AC-7, AC-22 | No change until `daily` is on |
| 3. User Story 2 | Medium and Collector. AC-8 to AC-13 | No change until `presets` is on |
| 4. User Story 3 | Hard. AC-14 to AC-17 | No change until `hard` is on |
| 5. User Story 4 | A new day. AC-18 to AC-21 | No change until `newDay` is on |

Each flag is turned on by a one-line pull request after the owner's phone review (SC-706), in order:
`daily`, `presets`, `hard`, `newDay`. A preset's generator is fixed for good when its flag is turned on
(R13), so its golden dates are pinned in that story's pull request and reviewed there.

## Complexity Tracking

No violations.

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web game — solo project, Philip England
- **Boundaries touched**: engine (generator, counting, presets), app (date, record, switching), component library (R7, R8, R9), the browser's storage and history
- **Contracts added or changed**: [engine-api-changes.md](contracts/engine-api-changes.md), [play-screen-changes.md](contracts/play-screen-changes.md), [component-library-changes.md](contracts/component-library-changes.md), [saved-data-changes.md](contracts/saved-data-changes.md)
- **Platform capabilities used**: GitHub Pages and GitHub Actions, unchanged (EXC-006)
- **New technology or platform deviation**: none
- **ADRs raised by this plan**: `docs/adr/0005-daily-puzzles.md` (drafted with the plan, Proposed): the seed, the version, the random numbers and the work budget, and that a date's puzzles are fixed for good
- **Exceptions relied on**: EXC-001, EXC-002, EXC-006

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the static `dist/`; deploys as today, and the workflow is not changed
- **Database changes**: none. `operator.today` starts at `format` 1 (R10)
- **Feature flags**: `daily`, `presets`, `hard`, `newDay`, each off until released, then removed once signed off
- **Rollback**: set the flag false, or revert the merge. Solutions found stay on the phone, unused, and come back if the flag returns. A generator change is never rolled out under the same version (R13), so rolling back never changes a released day's puzzle

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**: the phone's clock read by the app; one new record on the phone

| Threat | Mitigation |
| --- | --- |
| Tampering: the record is edited | Read as untrusted (R10): an unknown date or preset is ignored and today's Easy opens (AC-21) |
| Tampering: the phone's date is changed | Accepted (spec Assumptions): the player gets that date's puzzles, which affects nobody else |
| Denial of service: a puzzle that takes too long to make | The work budget bounds every count (R4), and 2,000 candidates bound every puzzle (R3) |
| Elevation of privilege | No new input is shown as markup; the record holds a date and one of four names |
| Information disclosure | The filling a puzzle was built from is never shown (FR-711); no personal data |
| Spoofing, repudiation | Not applicable: no accounts or transactions |

- **Access model**: no identities or secrets

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**: none from devices, by design (EXC-001).

| Acceptance criterion | Test level | Test location |
|---|---|---|
| AC-1, AC-4, AC-6, AC-7, AC-22 | acceptance, engine and both phones | `test/acceptance/play/daily-easy.acceptance-spec.ts` |
| AC-2 | acceptance, engine and both phones (same puzzle) | same file |
| AC-3, AC-5 | unit, every date of 2027 | `src/engine/sweep-easy.spec.ts` |
| AC-8 to AC-10, AC-12, AC-13 | acceptance, both phones | `…/medium-and-collector.acceptance-spec.ts` |
| AC-11 | unit, every date of 2027 | `src/engine/sweep-medium.spec.ts`, `sweep-collector.spec.ts` |
| AC-14, AC-16 | acceptance, both phones | `…/hard.acceptance-spec.ts` |
| AC-15 | unit, every date of 2027 | `src/engine/sweep-hard.spec.ts` |
| AC-17 | speed budget, Android, reference throttling | `…/hard.acceptance-spec.ts`, tagged `@budget` |
| AC-18 to AC-21 | acceptance, both phones | `…/new-day.acceptance-spec.ts` |
| SC-702 | unit, golden dates | `src/engine/golden-dates.spec.ts` |
| SC-703, SC-704 | manual | five hallway playtests |
| SC-706 | manual | the owner, on a real phone |

**Existing tests**: the plan adds props and parts rather than changing existing ones, so existing unit tests
should not need changing. Where one must change (most likely a play-screen or puzzle-grid model test once
the compact screen exists), the owner is told which test, the exact change and why, before it is changed,
and it is recorded in `test-changes.md`.
