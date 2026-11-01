# Operator Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->


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
