# Implementation Plan: Reopening the Game with No Connection

> **Parked by the owner, 2026-11-08. Not planned, and nothing here has been built.** The store apps
> (F13) carry the game inside the app, so they open with no connection without this. It would only
> help people playing in a browser. Nothing in this document changes an earlier spec: spec-001 FR-016
> and AC-21 stand. Pick it up only if the browser stays a real way to play after launch, or F13 is a
> long way off.

**Branch**: `005-offline-reopening` | **Date**: 2026-11-08 | **Spec**: [spec.parked.md](spec.parked.md)

**Input**: Feature specification from `specs/005-offline-reopening/spec.parked.md`

## Summary

A player who has opened the game once can reload or reopen it with no connection and play in full.
With a connection they always get the latest version, and a new version never disturbs a game in
progress. A bad version can be rolled back, and offline play can be withdrawn from phones that
already hold a copy.

**Technically**: a hand-written service worker with no new dependency. The page is fetched from the
network first, for up to 3 seconds, and otherwise from a saved copy. Each version is saved whole. A
build with the `offline` flag off removes any copy. See [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 6.0.x, strict; Node 22 for the tools

**Primary Dependencies**: none new. Vite 8.3.5 builds it; the browser's Service Worker and Cache
Storage APIs do the work

**Storage**: the browser's Cache Storage: one copy of the game's public files per phone

**Testing**: Vitest (unit), Playwright 1.64.1 (acceptance, iPhone SE on WebKit and Pixel 5 on
Chromium; shown by experiment to support this, research R10)

**Target Platform**: current and previous major versions of Safari on iOS and Chrome on Android

**Project Type**: static client-side web game, on GitHub Pages

**Performance Goals**: ready to play within 3 seconds with no connection or a working one; within 4
with a connection that does not answer; taps within 0.1 seconds; JavaScript and CSS under 30 KB
gzipped, including the worker

**Constraints**: no change on screen; playing makes no network requests; GitHub Pages' fixed
`max-age=600`; an origin shared with any other project pages on the account

**Scale/Scope**: one copy per phone, about 86 KB today

## Constitution Check

*GATE: passed before Phase 0, and re-checked after Phase 1.*

| Principle | Status | How |
| --- | --- | --- |
| I. Client-side and offline | Pass | Fetches only the game's own files. Constitution I requires a spec and an ADR for a network call: this spec and [ADR 0003](../../docs/adr/0003-offline-copy.md). CSP unchanged (R8). |
| II. Pure engine | Pass | The engine is not touched. |
| III. Deterministic | Pass | Not affected. |
| IV. Mobile, touch, accessible | Pass | Nothing new on screen or announced; the accessibility scan runs on the reopened game (AC-4). |
| V. Test-first | Pass | Decisions are pure functions, unit-tested first; browser wiring is proven by the scenarios. |
| VI. Executable specifications | Pass | `/speckit-acceptance` drafts them for approval. spec-001 AC-21 is changed only with the owner's approval (R12). |
| VII. Small, releasable steps | **See Complexity Tracking** | One PR per story, each with the flag off. The flag stays after release. |
| Baseline 5, reversible | Pass | Rollback and withdrawal are designed in (User Story 3). |
| Baseline 6, secure and data-aware | Pass | Threat model below; public data only. |
| Baseline 7, observable | Pass under EXC-001 | No telemetry from devices, as today. |
| Overlay P3, budgets | Pass under EXC-002 | Budgets in the spec, tested with the speed budgets. |

## Project Structure

### Documentation (this feature)

```text
specs/005-offline-reopening/
├── plan.md              # This file
├── research.md          # R1 to R12
├── data-model.md        # The saved copy and its states
├── quickstart.md        # How to check it
├── contracts/
│   └── offline-copy.md  # What a build publishes and what each open does
└── tasks.md             # Next: /speckit-tasks
```

### Source Code (repository root)

```text
src/offline/                  # New, with its own tsconfig (WebWorker types)
├── copy.ts                   # Pure: store names, which stores are old, the file list, the 3-second rule
├── copy.spec.ts
└── service-worker.ts         # Thin wiring of copy.ts to the worker's install, activate and fetch
src/app/
├── offline.ts                # Page side: registers the worker, or removes the copy when the flag is off
├── offline.spec.ts
├── features.ts               # Gains `offline`
└── main.ts                   # Calls offline.ts after load
vite.config.ts                # Second entry, file list, `flags-off` mode
package.json                  # `build:flags-off`; typecheck includes src/offline
test/acceptance/
├── play/offline.acceptance-spec.ts   # New Layer 1, approved at /speckit-acceptance
├── dsl/                              # New vocabulary, approved with it
├── drivers/ui/                       # Layer 3: reopening, versions
└── support/published-site.ts         # Layer 3: the stand-in for the public address (R10)
playwright.config.ts          # The `offline` file behind its flag; the stand-in's server
docs/adr/0003-offline-copy.md # New
```

**Structure Decision**: `src/offline/` is a separate folder because its code runs in a different
place from the game (the worker), with different browser types. The game's tiers are unchanged.

## Release order (constitution VII)

| Pull request | Delivers | Players get |
| --- | --- | --- |
| 1. User Story 1 | The worker, the copy, reopening. AC-1 to AC-5 | No change: `offline` off |
| 2. User Story 2 | Latest version, whole versions, no disturbance. AC-6 to AC-10 | No change |
| 3. User Story 3 | Rollback and withdrawal, `flags-off` build. AC-11, AC-12 | No change |
| Owner review | Flags-on build on a real iPhone and Android phone, in flight mode (SC-506) | – |
| 4. Turn on | `offline` true, and spec-001 AC-21 changed with approval | **The game reopens with no connection** |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution VII: "A flag is removed once its story has been released and signed off". `offline` stays after release. | It is the only way to withdraw a copy from phones (FR-511). Removing it would remove that rollback path, and Baseline 5, reversible, is the stricter rule. | Removing the flag and relying on rollback: a rollback cannot delete a copy already on a phone (R5). |
| Constitution VII: each story released on its own. Three stories release together. | Each still merges and deploys on its own, flag off. A copy must not reach a phone until it can be updated and withdrawn. | Releasing User Story 1 first: phones would hold copies that nothing could change. |

## Architecture and Ownership *(mandatory — org baseline)*

- **Owning component and team**: Operator web game — solo project, Philip England
- **Boundaries touched**: the browser (service worker, Cache Storage) and the files on GitHub Pages
- **Contracts added or changed**: [contracts/offline-copy.md](contracts/offline-copy.md), new. `play-screen.md` unchanged
- **Platform capabilities used**: GitHub Pages and GitHub Actions, unchanged (EXC-006)
- **New technology or platform deviation**: service workers, a browser standard; no new package. See ADR 0003
- **ADRs raised by this plan**: [`docs/adr/0003-offline-copy.md`](../../docs/adr/0003-offline-copy.md)
- **Exceptions relied on**: EXC-001, EXC-002, EXC-006

## Deployment and Rollback *(mandatory — org baseline)*

- **Deployment unit**: the static `dist/`, now with `sw.js` when `offline` is on. Deploys as today; the workflow is not changed
- **Database changes**: none
- **Feature flags**: `offline`, off until Release 4, then **kept** as the withdrawal control (Complexity Tracking)
- **Rollback**:
  - *Before Release 4*: revert the merge; no phone holds a copy.
  - *A bad version, after Release 4*: roll back as today (`workflow_dispatch` with `ref`, or revert). It reaches phones like any new version.
  - *Withdrawing offline play*: set `offline` false and publish. Each phone removes its copy on its next open with a connection.
  - **Do not roll back past the commit that first turned the flag on** (R5). Publish with the flag off instead.
  - A worker that is itself broken: the browser still checks for a new one when the page is opened, so publishing a fixed build recovers it.

## Security and Threat Model *(mandatory — org baseline)*

- **New interfaces or data flows**: the worker reading the game's own files from its own address and storing them on the phone
- **Threats identified, with mitigations**:

| Threat | Mitigation |
| --- | --- |
| Tampering: a bad or altered version is saved | HTTPS only (browsers require it for workers). Only the build's own file list is saved. FR-510 and FR-511 replace or remove it |
| Tampering: another project on the same origin alters the stores | Accepted: the origin holds only the owner's own projects. Names are prefixed (R6) |
| Denial of service: a bad worker traps players on a broken game | The page comes from the network first, so a connected player gets each fix; the browser still checks for a new worker (Deployment and Rollback) |
| Denial of service: the copy fills the phone's storage | One copy, about 86 KB; older ones are deleted on takeover |
| Information disclosure | The copy holds public files only; nothing about the player |
| Elevation of privilege | The worker's scope is the game's folder and it ignores other sites' requests. No new permission is asked for |
| Spoofing, repudiation | Not applicable: no accounts or transactions |

- **Access model**: no identities or secrets

## Observability and Test Strategy *(mandatory — org baseline)*

**Telemetry**: none from devices, by design (EXC-001). The published version can be read from the page's
`version` label, as AC-17 already does.

- **Logs, Metrics, Traces, Health checks**: none

**Test levels**

| Acceptance criterion | Test level | Test location |
|---|---|---|
| AC-1 to AC-5 | acceptance, both phones | `test/acceptance/play/offline.acceptance-spec.ts` |
| AC-6 to AC-9 | acceptance, both phones, with the stand-in | same |
| AC-10 (time limit) | acceptance, `@budget`, Android alone | same |
| AC-11, AC-12 | acceptance, both phones, with the stand-in | same |
| FR-506 file list, store names, old stores | unit | `src/offline/copy.spec.ts` |
| FR-511 register or withdraw | unit | `src/app/offline.spec.ts` |
| FR-512 | acceptance | spec-001 AC-21, unchanged until Release 4 |
| SC-506 | manual | the owner, real phones ([quickstart.md](quickstart.md)) |

All scenarios run on the UI driver: a saved copy only exists in a browser.
