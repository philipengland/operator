# Implementation Plan: Themed Play Screen

**Branch**: `004-themed-play-screen` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-themed-play-screen/spec.md`

## Summary

Put spec-003's component library in front of players. The game shows the library's play screen,
in Classic, on the dotted page, in place of the F0 screen. It adds a keypad: tapping a cell
selects it and still steps it, the keys set its digit, and Oops empties it. The mascot's bubble
speaks each result in the theme's voice, while a screen reader hears spec-001's words first and
the count in the same announcement. Every spec-001, spec-002 and spec-003 criterion keeps
passing.

**Technically**:
- **The game becomes a thin layer** (research R1). A new pure `playScreenProps(state, theme)`
  maps the session to the library's props, and `main.ts` only wires taps to the session and
  updates the screen.
- **Removed**: `view.ts` and `styles.css`.
- **Added to the library first** (R2), as FR-401 requires: a tick on open pills, a keypad that
  can be unavailable, tap actions on cells and pills, and one announcement region.
- **The play-screen contract is rewritten** (R3): a line's target and operator become one pill.
  The UI and phone drivers are re-pointed, and no locked scenario or DSL changes.
- **Delivered one release per user story** (R9, constitution VII): library additions, then the
  new look, the keypad and the voice. The keypad and the voice sit behind build-time flags (R10);
  the new look is unflagged, with the reason recorded in R9.

## Technical Context

**Language/Version**: TypeScript (strict), Node 22. Unchanged (ADR 0001).

**Primary Dependencies**: none added. The spec-003 component library and its committed fonts.

**Storage**: none. The selected cell lives only while the game is open.

**Testing**:
- Vitest: the session (selection, keys), the screen props, and the wording (Classic and
  Midnight blue).
- Playwright Test on iPhone SE (WebKit) and Pixel 5 (Chromium), with axe, plus the in-process
  engine driver.
- The catalogue scenarios cover the library additions.

**Target Platform**: current Safari on iPhone and Chrome on Android (SC-404).

**Project Type**: single-page client-side web app (and the development-only catalogue).

**Performance Goals**: ready to play within 3 seconds on the reference phone, and every tap and
key answered within 0.1 seconds (SC-405, spec-001 SC-003 and SC-004). JavaScript and CSS under 30
KB gzipped (spec-001 research R9). Measured headroom is in research R8.

**Constraints**:
- WCAG 2.2 AA.
- No network requests (CSP unchanged).
- 375 × 667 and 320 × 568 without scrolling.
- Classic only (FR-411).
- No styling in the game (FR-401).
- spec-001 and spec-002's locked Layer 1 and Layer 2 unchanged.

**Scale/Scope**: one screen, one fixed 2 × 2 puzzle, 19 acceptance criteria, four library
additions.

No NEEDS CLARIFICATION items remain; research R1–R10 resolve each design question.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Result |
| --- | --- | --- |
| I. Client-side and offline | Fonts, mascot and theme ship with the game; no requests; CSP unchanged (R6, R8). spec-001's offline scenario keeps running. | Pass |
| II. Pure puzzle engine | The engine is untouched. Selection and keys live in the pure session (R4); `src/ui/` still imports neither the engine nor the app. | Pass |
| III. Deterministic generation | No generation. The theme comes from `themeForSeed`, Classic for the seedless puzzle (R6). | Pass |
| IV. Mobile, touch and accessible | Real buttons, 44 × 44, `aria-pressed` for the selected cell, `aria-disabled` keys still focusable, one polite announcement per check, nothing announced on change (R2, R7); both small screens checked; axe in every state. | Pass |
| V. Test-first | Session, screen props and wording test-first in Vitest; the screen driven by approved scenarios (outer loop). | Pass |
| VI. Executable specifications | spec-004's Layer 1 and 2 drafted by `/speckit-acceptance` for approval. spec-001 and spec-002's locked files are not edited; only their Layer 3 drivers follow the new contract (R3, R5). | Pass |
| VII. Small, releasable steps | One release per user story, in the spec's Release order; each merge fit for players (R9). `keypad` and `voice` flagged at build time, no player-facing switch; User Story 1 unflagged with the reason recorded (R9). The pipeline tests what players get and each flagged story with its flag on (R10). Flags removed after sign-off. | Pass |
| Baseline 1: spec-first | spec-004 clarified 2026-11-07. | Pass |
| Baseline 3: contracts | Play-screen contract rewritten first ([contracts/play-screen.md](contracts/play-screen.md)); library additions listed ([contracts/component-library-changes.md](contracts/component-library-changes.md)). | Pass |
| Baseline 5: reversible | Each pull request reverts cleanly; no data. | Pass |
| Baseline 8: proven technology | No new technology. | Pass |
| Overlay P2: accessible | axe on the play screen in every state the criteria reach (SC-406). | Pass |
| Overlay P5: design system | EXC-005: Operator's own design system, now used by the game. | Pass with exception |
| Baseline 4, 6, 7, 9; Overlay P1, P3, P4 | Unchanged; EXC-001, -002, -005, -006. | Pass with exceptions |

**Gate result**: pass.

### Post-design re-check

Re-checked after [data-model.md](data-model.md), [contracts/](contracts/) and
[quickstart.md](quickstart.md). No new violations. The one risk is the locked spec-001 and
spec-002 scenarios meeting a renamed screen. R3 keeps every name's line words, and maps each old
reading (targets, operators, counter, result) onto the new parts in the driver, so their
meaning is unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/004-themed-play-screen/
├── spec.md
├── plan.md                                   # This file
├── research.md                               # Phase 0
├── data-model.md                             # Phase 1
├── quickstart.md                             # Phase 1
├── contracts/play-screen.md                  # Phase 1: replaces docs/contracts/play-screen.md
├── contracts/component-library-changes.md    # Phase 1: additions to the library contract
├── checklists/requirements.md
├── acceptance.md                             # /speckit-acceptance
├── tasks.md                                  # /speckit-tasks
├── tdd-log.md                                # /speckit-implement
└── test-results.md                           # npm run test-results
```

### Source Code (repository root)

```text
index.html                          # CHANGED: no F0 stylesheet link (the app imports the library's styles)

src/app/
├── session.ts                      # CHANGED: selected cell; key and clear actions (R4)
├── labels.ts                       # CHANGED: bubbleLine, announcement (R7); names unchanged
├── features.ts                     # NEW: the released state of each flag (R10)
├── screen.ts                       # NEW: playScreenProps(state, theme, features), pure (R1)
├── main.ts                         # CHANGED: theme, library play screen, wiring
├── view.ts                         # REMOVED
├── styles.css                      # REMOVED
└── *.spec.ts                       # unit tests next to each file

src/ui/                             # CHANGED (pull request 1): R2's four additions
├── simple/button.*                 # trailing decorative icon
├── combined/target-pill.*          # open pill's tick
├── combined/keypad.*               # keysAvailable
├── combined/puzzle-grid.ts         # onCell, onPill
└── screens/play-screen.*           # keysAvailable, isKeypadShown, announcement (status region), actions

src/catalogue/samples.ts, screen-samples.ts   # CHANGED: samples for the additions

test/acceptance/
├── play/*.acceptance-spec.ts       # NEW spec-004 Layer 1 files (locked after approval); spec-001/002 files unchanged
├── dsl/                            # NEW spec-004 DSL methods (keypad, bubble, ticks, selection)
├── drivers/ui/game.ui-driver.ts, screen-names.ts, phone.ui-driver.ts   # CHANGED: new contract (R3)
└── drivers/engine/game.engine-driver.ts                                # CHANGED: keypad actions (R5)

docs/contracts/play-screen.md       # REPLACED by contracts/play-screen.md (pull request 2)
docs/contracts/component-library.md # CHANGED: additions (pull request 1)
AGENTS.md                           # CHANGED: the game uses the library; app layout
```

**Structure Decision**: one project. `src/app/` shrinks to state, wording, the props mapping
and wiring; everything drawn comes from `src/ui/`.

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web app; the play screen (`src/app/`) and the
  component library (`src/ui/`). Owner: Philip England, solo developer.
- **Boundaries touched**: none outside the product. Inside it, `src/app/` now depends on
  `src/ui/` (planned in spec-003); `src/ui/` still depends on nothing in `src/`.
- **Contracts added or changed**: the internal play-screen contract (rewritten) and the
  component-library contract (additions). No published contracts.
- **Platform capabilities used**: unchanged (GitHub Pages and Actions).
- **New technology or platform deviation**: none.
- **ADRs raised by this plan**: none. ADR 0002 already records the library and its use by the
  game.
- **Exceptions relied on**: EXC-001, EXC-002, EXC-005, EXC-006.

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the `dist/` static artifact, one release per user story (Delivery). The
  library additions leave `dist/` unchanged, and a flagged story's merge changes only what the
  bundler drops.
- **Database changes**: none.
- **Feature flags**: `keypad` and `voice`, build-time (R10). Classic is the only theme the game
  can show.
- **Rollback**: a flagged story: turn its flag off (a one-line pull request). The new look, or
  anything else: revert the merge commit through a pull request. Either way the pipeline
  redeploys in about 6 minutes. No data to migrate.

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**: none. No input leaves the page, and nothing is stored.
  Every text is written with `textContent`. The CSP is unchanged and the typefaces are
  same-origin. Threat model not required.

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**: unchanged (EXC-001).

**Test levels**

| Acceptance criterion | Test level | Test location |
| --- | --- | --- |
| AC-1, AC-2 The new screen and its names | Acceptance (both phones, axe) | `test/acceptance/play/` (files named at `/speckit-acceptance`) |
| AC-3 Row 1 correct: tick, accent digit, working | Acceptance (phones); unit (screen props) | as above; `src/app/screen.spec.ts` |
| AC-4, AC-5 Counter and ticks after Solutions A and B | Acceptance (engine and phones); unit (screen props) | as above |
| AC-6 Fits 375 × 667 and 320 × 568 | Acceptance (phones) | as above |
| AC-7 Connection lost while playing, own typefaces | Acceptance (phones) | as above |
| AC-8 to AC-14 Keypad and selection | Acceptance (engine and phones); unit (session) | as above; `src/app/session.spec.ts` |
| AC-15 to AC-18 The bubble and what is heard | Acceptance (phones, announcements); unit (labels) | as above; `src/app/labels.spec.ts` |
| AC-19 Midnight blue wording | Unit only (players see Classic) | `src/app/labels.spec.ts` |
| Library additions (R2) | Unit (models); catalogue samples; existing catalogue scenarios | `src/ui/**/*.spec.ts`; `test/acceptance/library/` |
| SC-401, SC-402 Playtests | Manual | [quickstart.md](quickstart.md) section 4 |
| SC-403 Owner sign-off on a phone | Manual | quickstart section 3 |
| SC-404 Every earlier criterion | Existing acceptance suite, unchanged Layer 1 and 2 | `test/acceptance/play/`, `delivery/`, `library/` |
| SC-405 Speed | Existing Android speed-budget scenario | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| SC-406 axe in every state | Acceptance (every UI step scans) | all UI scenarios |

## Delivery

One release per user story (research R9, constitution VII). Each pull request is under 30 minutes
to review, adds only the approved Layer 1 files it makes pass, and goes live when merged.

| Release | Pull request | Players get | Flag |
| --- | --- | --- | --- |
| 1 | Library additions (R2), catalogue samples, component-library contract | No change | none needed |
| 2 | User Story 1: screen props, wiring, drivers re-pointed, play-screen contract, `AGENTS.md`, the flag mechanism and flags-on test projects (R10) | The new look; digits by tapping; plain messages | none (reason in R9) |
| 3 | User Story 2: selection and keys, driver keypad actions | No change until `keypad` is turned on, by a one-line pull request after the owner's preview | `keypad` |
| 4 | User Story 3: the voice | No change until `voice` is turned on, the same way | `voice` |

`test-results.md` reads `BLOCKED` until the last story, as across spec-003's parts; every pull
request still passes every scenario merged so far. After a story is released and signed off, its
flag is removed in the next pull request touching that area.

## Open Items for a Human

1. **How a selected cell is heard** (R4): `aria-pressed="true"`, which VoiceOver reads as
   "selected" and TalkBack as "on". Confirm on your phones during quickstart section 3, or ask
   for a name suffix (", selected") instead.
