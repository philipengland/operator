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
