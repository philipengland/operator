# Implementation Plan: Live Line Calculations

**Branch**: `002-live-calculations` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-live-calculations/spec.md`

## Summary

Each row and column shows what it currently works out to, updated on every tap. The targets
stay on the left and top. The calculated value sits at the other end of the same line: right
of each row, below each column. It reads "= ?" while the line is incomplete, "= 8 ✓" when
it reaches its target, "= −3" for a result below zero, and "✗" for a division that is not
whole (research R1, R2).

One rule changes: a step below zero is no longer a failure. Results and targets may be negative,
and Check accepts them (FR-208, research R6).

Technically, the engine gains `lineWorking` and `evaluateLine` drops its below-zero failure;
`checkEntry` is re-expressed through `lineWorking`. The app derives the four workings from the
session, `labels.ts` words them, and `view.ts` adds a result slot to each line. No new
dependencies, no new state, no pipeline change.

## Technical Context

**Language/Version**: TypeScript (strict), Node 22. Unchanged (ADR 0001).

**Primary Dependencies**: none added.

**Storage**: none. Workings are derived on every render.

**Testing**: Vitest for engine, session and labels; Playwright Test acceptance through the
engine and UI drivers; axe in every UI run. Unchanged.

**Target Platform**: current Safari on iPhone and Chrome on Android, from GitHub Pages.

**Project Type**: single-page client-side web app.

**Performance Goals**: each tap still answered within 100 ms (SC-203); ready to play within 3 s;
bundle under 30 KB gzipped (research R7).

**Constraints**: WCAG 2.2 AA; no colour-only marks; 320 × 568 with no scrolling; no new
announcements after a tap (AC-20).

**Scale/Scope**: one screen, F0's fixed puzzle, four line workings.

No NEEDS CLARIFICATION items remain.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Result |
| --- | --- | --- |
| I. Client-side and offline | Workings are worked out on the phone; no requests. | Pass |
| II. Pure puzzle engine | The rule ("does this line reach its target?") lives in the engine (`lineWorking`); the app only words and draws it (R3). | Pass |
| III. Deterministic generation | No generation. Negative targets are allowed by the rules; generating them is F7. | Not exercised |
| IV. Mobile, touch and accessible | Marks are symbols plus weight, never colour; each working has a spoken name; not a live region (R2, R4); fits 320 px (R1). | Pass |
| V. Test-first | Every new behaviour test-first. Rule-change tests are rewritten to the new rule and logged (R6). | Pass |
| VI. Executable specifications | New Layer 1 file and DSL methods drafted by `/speckit-acceptance` for approval; AC-9 rewording proposed there, not made by the agent (R5, R6). | Pass |
| Baseline 1: spec-first | spec-002 clarified; supersessions recorded in spec-001 and the brief. | Pass |
| Baseline 3: contracts | Internal engine and play-screen contracts changed first ([contracts/](contracts/)). No published contracts. | Pass |
| Baseline 4–9, Overlay P1–P5 | Unchanged from spec-001's plan; same exceptions (EXC-001, -002, -005, -006). | Pass with exceptions |

**Gate result**: pass.

### Post-design re-check

Re-checked after [data-model.md](data-model.md), [contracts/](contracts/) and
[quickstart.md](quickstart.md). No new violations. Deriving workings rather than storing them
keeps the session unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/002-live-calculations/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── engine-api.md    # Changes to the engine API
│   └── play-screen.md   # Added working elements and layout
├── checklists/requirements.md
├── acceptance.md        # /speckit-acceptance
├── tasks.md             # /speckit-tasks
└── tdd-log.md           # /speckit-implement
```

### Source Code (repository root)

```text
src/engine/
├── evaluate-line.ts         # CHANGED: below zero is a result, not a failure
├── line-working.ts          # NEW: lineWorking, and the shared "line digits in reading order"
├── check-entry.ts           # REFACTOR: uses lineWorking
├── types.ts                 # CHANGED: LineResult reason; NEW LineWorking, LineOutcome
└── index.ts                 # exports lineWorking and its types

src/app/
├── session.ts               # NEW: lineWorkings(state), derived like counterText
├── labels.ts                # NEW: workingText, workingName, resultText
├── view.ts                  # CHANGED: a result slot right of each row and below each column
└── styles.css               # CHANGED: extra grid column and row; ✓ and ✗ weights

test/acceptance/
├── play/see-line-working.acceptance-spec.ts   # NEW Layer 1, spec-002 AC-1–AC-11 (locked after approval)
├── dsl/game.dsl.ts                            # Layer 2 additions for workings (locked after approval)
└── drivers/                                   # Layer 3: GameView gains workings; ScreenLayout gains result slots
```

**Structure Decision**: same single project. One new engine file; everything else extends
existing files.

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web app (puzzle engine, play app). Owner: Philip
  England, solo developer.
- **Boundaries touched**: none outside the product.
- **Contracts added or changed**: internal only: [engine-api](contracts/engine-api.md) (rule
  change, `lineWorking` added) and [play-screen](contracts/play-screen.md) (workings added).
- **Platform capabilities used**: unchanged (GitHub Pages and Actions).
- **New technology or platform deviation**: none.
- **ADRs raised by this plan**: none. The rule change is a product decision recorded in spec-002
  and the brief.
- **Exceptions relied on**: EXC-001, EXC-002, EXC-005, EXC-006, as for spec-001.

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the `dist/` static artifact, as before.
- **Database changes**: none.
- **Feature flags**: none. Each pull request leaves the game complete and consistent.
- **Rollback**: run `ci-deploy.yml` with `workflow_dispatch` and `ref` set to the last good
  commit on `main` (today `85ee990`), or revert the merge commit through a pull request. Confirm
  the version meta at the public address. No data to migrate.

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**: none — threat model not required. Workings are written with
  `textContent`, as all other text is.

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**: unchanged (EXC-001). No runtime logs, metrics or traces.

**Test levels**

Unit tests (Vitest) cover every rule underneath: `evaluate-line.spec.ts` (rewritten for the
below-zero rule), `line-working.spec.ts` (new), `check-entry.spec.ts`, `session.spec.ts` and
`labels.spec.ts`.

| Acceptance criterion | Test level | Test location |
| --- | --- | --- |
| AC-1 to AC-7, AC-11 Working, result and mark | Acceptance, both drivers | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-8 Result below zero | Acceptance, both drivers; unit (`evaluate-line`, `line-working`) | same file |
| AC-9, AC-10 Cross for division that is not whole | Acceptance, both drivers; unit | same file |
| AC-12 Negative target | Unit only, on a test puzzle (spec-002 option A) | `src/engine/line-working.spec.ts` |
| FR-208 Check accepts results below zero | Unit (`check-entry`); spec-001 AC-9 scenario still passes | `src/engine/check-entry.spec.ts` |
| Workings fit on small screens | Acceptance, UI driver at 320 × 568 and 375 × 667 | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| SC-203 Tap budget | Existing budget scenario (Android) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| Screen reader wording; SC-201, SC-202 | Manual | [quickstart.md](quickstart.md) section 4 |
| Every spec-001 criterion (SC-204) | Existing acceptance suite, unchanged | `test/acceptance/` |

## Delivery

Two pull requests, each under 30 minutes to review, each leaving `main` deployable:

1. **Rule change** (US2's rule, FR-208, AC-12): `evaluateLine`, `checkEntry`, rewritten unit
   tests, the brief update, and the current-state engine contract. No screen change.
2. **Workings on screen** (US1, AC-8 to AC-10 display): `lineWorking`, session, labels, view,
   styles, drivers, and the current-state play-screen contract.

## Open Items for a Human

1. **Where the current contracts live**: today they sit in
   `specs/001-walking-skeleton/contracts/`. Recommended: move them to `docs/contracts/` in
   pull request 1 and update them in place, so specs record changes and `docs/contracts/`
   describes the product now (`AGENTS.md` links updated). Otherwise they are updated where they
   are.
2. **AC-9 wording (locked files)**: approve at `/speckit-acceptance` a rewording of spec-001's
   AC-9 test title and the `belowZero` comment in `examples.ts`, which give "below zero" as the
   reason (research R6). The assertions are unchanged.
3. **Your mockups**: the layout follows your description (targets left and top, results right
   and bottom). If the mockups add styling beyond that, it is a separate feature (spec-002, Out
   of Scope).
