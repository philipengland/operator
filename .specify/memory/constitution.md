# Operator Constitution

## Core Principles

### I. Client-Side and Offline

Operator is a client-side web game. The same build is packaged for iOS and Android with
Capacitor.

- The packaged apps MUST be fully playable with no network connection.
- The web build is served as static files. After it has loaded, gameplay MUST NOT need the
  network.
- The MVP MUST NOT make any runtime server calls: no APIs, analytics, telemetry, remote
  configuration, fonts or other third-party requests. Every asset ships in the bundle.
- Adding a network call is a behaviour change. It needs a spec and an ADR. The brief puts
  the first backend in Phase 3 (solution rarity).

*Rationale: the game needs no server. Seeds stand in for stored puzzles, so staying offline
keeps the product simple, private and always available.*

### II. Pure Puzzle Engine

All puzzle rules live in a pure TypeScript library, the puzzle engine. The rules are line
evaluation, the whole-number rule, checking, solution counting, puzzle generation and
difficulty scoring.

- The engine MUST NOT import or reference UI frameworks, the DOM, browser or Web APIs,
  Capacitor, storage or timers. It MUST run unchanged in Node.
- Engine functions take data and return data. Side effects stay outside the engine.
- The UI depends on the engine; the engine never depends on the UI. The UI MUST NOT
  reimplement any rule the engine owns.
- A solution is checked by calculating each line against its target. It is never compared
  with a stored answer.
- Rule settings, such as the operator-order rule, are parameters to the engine. They are
  not hard-coded.
- This boundary MUST be enforced automatically in the build, for example with lint import
  rules or a separate package that has no DOM type library.

*Rationale: the rules are the product. Keeping them pure makes them fast to test, reusable
for a future backend or daily puzzle, and independent of any UI choice.*

### III. Deterministic, Seeded Generation

All randomness comes from a seeded pseudo-random generator that is implemented in, or
injected into, the engine.

- The same seed and generation parameters (grid size, preset) MUST always produce the same
  puzzle, on every device and platform.
- The engine MUST NOT use `Math.random`, `crypto`, the clock or any other source of
  non-determinism.
- Search limits, such as the generator's time-box on solution counting, MUST be expressed
  as deterministic work budgets (for example, a count of search steps). They MUST NOT use
  wall-clock time, which would let a slow device produce a different puzzle from the same
  seed.
- Golden-seed tests pin the output for a fixed set of seeds.
- A change that alters the puzzle for an existing seed is a breaking change. It MUST be
  deliberate, versioned and called out in the pull request.

*Rationale: seeds replace a puzzle backend. A daily puzzle and share-by-seed (Phase 3) only
work if a seed means the same puzzle everywhere and for good.*

### IV. Mobile-First, Touch-First and Accessible

Operator is designed for a phone held in the hand first. Larger screens are an adaptation.

- Every interaction MUST work by touch alone. Nothing may depend on hover, a keyboard or
  a mouse. Keyboard and screen-reader access MUST still be supported.
- Touch targets MUST be at least 44 × 44 CSS pixels.
- Layouts MUST respect device safe areas (notches, home indicators, rounded corners) on iOS
  and Android.
- The packaged apps MUST NOT show browser behaviour: no pinch or double-tap zoom, no
  pull-to-refresh, no text-selection callouts and no overscroll bounce on the game surface.
- The game MUST meet WCAG 2.2 AA (Overlay P2). Line states (correct, invalid, unsolved) MUST
  NOT rely on colour alone. Every cell, target and operator has an accessible name. The game
  MUST honour the reduced-motion setting.

*Rationale: the audience plays on phones. A grid game that fights the touch screen, hides
under a notch or excludes screen-reader users fails its players.*

### V. Test-First (NON-NEGOTIABLE)

Every behaviour change, including bug fixes, follows red-green-refactor, as set out in the
TDD standard (`.claude/rules/tdd.md`):

1. Write one failing test.
2. Write the smallest code that makes it pass.
3. Refactor while the tests stay green.

- Engine behaviour is unit-tested in Node, with no browser.
- UI behaviour is tested at the lowest level of the test pyramid that can prove it.
- A failing test is never weakened or deleted to get a green build.
- `/speckit.implement` records each cycle in `specs/<feature>/tdd-log.md`.

*Rationale: tests written first state the intended behaviour before the code exists, so the
code is shaped by the rules, not the other way round.*

### VI. Executable Specifications Define Success

Acceptance criteria become executable specifications in four layers, as set out in the
acceptance-tests standard (`.claude/rules/acceptance-tests.md`). A human approves them before
implementation starts.

- Approved Layer 1 scenarios and the Layer 2 DSL are listed in `specs/<feature>/acceptance.md`
  and locked. AI agents MUST NOT create, edit, skip or delete them. A specification that looks
  wrong is raised with a human.
- Scenarios are written in the game's own language: lines, targets, operators, seeds,
  solutions found.
- Puzzle-rule scenarios SHOULD run through an in-process engine driver. Play scenarios run
  through a UI driver on a phone-sized viewport.

*Rationale: executable specifications define success independently of the code, so success
cannot be quietly redefined to match what was built (Baseline principle 1).*

### VII. Small, Releasable Steps

Work moves in the smallest steps a person can review, and `main` is always releasable.

- Every merge to `main` deploys, so every merge MUST be fit for players. Players never see a
  half-built feature.
- Each user story MUST merge and deploy on its own, depending only on stories already released,
  and MUST sit behind a feature flag until released. A plan MAY leave a story unflagged by
  recording why.
- Flags are fixed at build time. Off means players cannot reach the feature; there is no remote,
  URL or player-facing switch (Principle I).
- The pipeline MUST test what players get, and each flagged story with its flag on.
- A flag is removed once its story has been released and signed off, in the next pull request
  that touches that area.
- Plans MUST give the release order and what players get at each release.
- Within a story, each acceptance criterion is a review checkpoint. A pull request MUST be
  reviewable in under 30 minutes; a story too big for that is split into smaller releasable
  stories.

*Rationale: small, flagged releases are easy to review and reverse, and separate merging code
from releasing it (Baseline principle 5).*

## Platform Constraints

- **Language:** TypeScript in strict mode for the engine and the app.
- **Shell:** Capacitor packages the web build for iOS and Android. Native code is used only
  where Capacitor plugins cannot meet a spec. Every native addition needs an ADR.
- **Data:** the device is the only data store in the MVP. It holds the solution log,
  settings and progress. Under Baseline principle 6, each stored item needs a classification
  and defined deletion behaviour (cleared when the player resets or uninstalls). Stored
  formats MUST stay readable after an app update.
- **Privacy:** the MVP collects no personal data (Overlay P4). Store privacy declarations
  MUST say that no data is collected, and stay true.
- **Performance:** specs declare on-device budgets for critical journeys, such as cold
  start, puzzle generation per preset and input response (Overlay P3). Budgets are checked
  in automated tests against a stated reference device class.

## Baseline Applicability

Operator is an offline client app with no server in the MVP. The Organisation Baseline and
the Public-Facing Service Overlay below stay in force unchanged. This section records how
each of them meets the product.

**Applies in full:** Baseline 1 (spec-first), 2 (boundaries and ownership: the engine and
the app are separate components; owner Philip England, solo developer, as this is a
personal project), 8 (proven technology) and 9 (recorded
exceptions). Overlay P1 (user needs), P2 (accessibility) and P4 (privacy).

**No subject in the MVP, so no exception needed.** These apply as soon as a backend arrives
(Phase 3):

- Baseline 3 (contract-first integration): there are no HTTP APIs or events. The engine's
  TypeScript API is a boundary inside one product, not a published contract.
- Baseline 5, database clause: there is no server database.
- Baseline 6, central identity clause: there are no accounts or identity. Threat modelling
  and data classification still apply.

**Exceptions to record.** A human MUST record each of these in `docs/exceptions/`, using the
organisation template, before the work it covers starts (Baseline Scope and principle 9):

| ID | Deviates from | Deviation | Record before |
| --- | --- | --- | --- |
| EXC-001 | Baseline 7 (observable) | The offline MVP sends no logs, metrics, traces or health checks from devices. | Implementation starts |
| EXC-002 | Overlay P3 (budgets) | There is no service to monitor, so availability targets cannot be alerted on. Performance budgets still apply. | Implementation starts |
| EXC-005 | Overlay P5 (design system) | A personal project has no shared design system. Operator keeps its own design values and accessibility checks instead. | Implementation starts |
| EXC-006 | Baseline 4 (platform) | The web build is hosted on GitHub Pages and built by GitHub Actions (ADR 0001). | Implementation starts |
| EXC-003 | Baseline 4 (platform) | Apps are distributed through Apple App Store Connect and Google Play Console, with native build tooling (Xcode on macOS) where the platform does not provide it. | Store packaging (F13) starts |
| EXC-004 | Baseline 5 (reversible) | A released store binary cannot be rolled back. Rollback means halting a phased rollout and shipping a fixed build. | Store packaging (F13) starts |

The store signing secrets MUST use platform capabilities (Baseline 4); the exceptions above
do not cover them. The web build's hosting and pipelines are covered by EXC-006.

## Governance

This constitution governs Operator alongside the Organisation Baseline and overlay below.
Where they conflict, the stricter rule wins. Project principles MAY add to the baseline but
MUST NOT weaken it.

- **Amendments:** made by pull request through `/speckit-constitution`, approved by a code
  owner, and recorded with a Sync Impact Report during review.
- **Versioning:** semantic versioning. MAJOR means a principle is removed or redefined in a
  backward-incompatible way. MINOR means a principle or section is added, or guidance is
  materially expanded. PATCH means a clarification or wording fix.
- **Compliance:** every plan includes a Constitution Check against Principles I–VII and the
  baseline. Every pull request review confirms it. The build enforces the engine boundary
  (II), golden seeds (III), accessibility checks (IV) and the expiry of exceptions
  (Baseline 9).
- **Runtime guidance:** `AGENTS.md` and `.github/copilot-instructions.md`.

**Version**: 1.1.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-08

<!-- org-baseline: v2.0.0 -->
## Organisation Baseline (v2.0.0) — Architecture Principles

### Scope

These principles apply to all new components and to any significant change
to an existing one. Existing non-compliance is recorded as an exception
(principle 9) and addressed when the component is next materially changed.

New products MUST meet every principle from their first commit. A new
product that cannot meet one carries a recorded exception (principle 9),
agreed before work starts by whoever owns these standards for the product.

A project constitution MAY add stricter principles. It MUST NOT weaken or
remove any principle below.

### 1. Spec-First and Traceable

Every change to behaviour traces to a spec with testable acceptance criteria.
Acceptance criteria are expressed as **executable specifications** — scenarios
with concrete examples, written in business language — that a human approves
before implementation starts. Approved executable specifications are changed
only with code-owner approval; AI agents never alter them. Significant design
choices are recorded as Architecture Decision Records in `docs/adr/`.

Exempt from needing a spec: typo and copy fixes, patch-level dependency
updates, configuration value changes, and refactors with no change in
behaviour.

*Rationale: executable specifications define success independently of the
code that achieves it, so neither a person nor an agent can redefine success
to match what was built; ADRs keep the reasoning available after the people
who made the decision have moved on.*

### 2. Clear Boundaries and Ownership

Every component has a defined responsibility and a named owning product team.
Products do not share databases or reach into another product's internals.

*Rationale: shared databases and hidden coupling make change slow and risky,
and leave nobody accountable for the whole.*

### 3. Contract-First Integration

Components integrate only through published, versioned contracts (OpenAPI for
HTTP APIs, AsyncAPI or schema definitions for events), written before
implementation. Contract changes are backward compatible by default; a
breaking change needs a new version and a migration path for consumers.

*Rationale: contracts let teams change independently and make breaking
changes visible before they ship.*

### 4. Platform Before Bespoke

Hosting, identity, secrets, logging, monitoring and pipelines use the
capabilities provided by the Cloud Services / DevOps platform. Until an
approved list of platform capabilities exists, any alternative requires an
ADR and a recorded exception.

*Rationale: every bespoke capability is something this team must secure,
patch and support on its own.*

### 5. Independently and Reversibly Deployable

Each component can be deployed on its own. Database changes use
expand-and-contract so old and new versions can run side by side. Incomplete
work sits behind feature flags. Every plan states how the change is rolled
back.

*Rationale: small, reversible deployments are what allow routine changes to
follow a standard release path rather than full change control.*

### 6. Secure and Data-Aware by Design

Plans include a threat model (STRIDE or similar) for new interfaces and data
flows. Access follows least privilege, and identity comes from the central
identity provider. Every data store has a classification, a named system of
record, and defined retention and deletion behaviour.

*Rationale: security and data handling decided at design time are cheaper
and more effective than controls bolted on later.*

### 7. Observable and Testable by Design

Components emit structured logs, metrics, traces and meaningful health
checks so production behaviour can be diagnosed from telemetry. The design
allows every acceptance criterion to be verified by an automated test at the
appropriate level of the test pyramid.

*Rationale: a component that cannot be observed or tested cannot be operated
or changed with confidence.*

### 8. Simple, Proven Technology

Prefer mainstream, supported technology the team and the hiring market can
sustain. Until an approved technology list exists, adopting a language,
framework, data store or major library new to the organisation requires an
ADR.

*Rationale: technology choices determine whether the product can be staffed
and maintained for its whole life.*

### 9. Recorded Exceptions

Any deviation from these principles is recorded in `docs/exceptions/` in the
repository, using the organisation exception template. Each exception has a
named risk owner, a reason, the mitigating controls in place, a review date
and an expiry date — never indefinite. Repository exceptions are compiled into
a single exception register across all products. An expired exception
fails the build.

*Rationale: conscious, time-bound risk acceptance is acceptable; silent
non-compliance is not.*


<!-- overlay: public-facing-service v2.0.0 -->
## Public-Facing Service Overlay (v2.0.0)

Adds to, and never relaxes, the Organisation Baseline.

### P1. User Needs First
Specs state the user need and the evidence for it before describing a solution.

### P2. Accessible By Default
User-facing work meets WCAG 2.2 AA. Accessibility acceptance criteria are written
into the spec, and accessibility tooling (axe-core or pa11y) is run against
every changed journey.

### P3. Performance And Availability Budgets
Specs declare performance and availability targets for each critical user
journey. Plans show how they are measured and alerted on.

### P4. Privacy By Design
Personal data collection is minimised and justified in the spec. Retention and
deletion behaviour is defined before implementation.

### P5. Content And Design Consistency
User-facing changes use the shared design system and pass content review.
