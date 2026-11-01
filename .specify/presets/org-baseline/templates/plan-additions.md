## Architecture and Ownership *(mandatory — org baseline)*

<!-- Principles 2, 3, 4 and 8. -->

- **Owning component and team**: [component name — owning team]
- **Boundaries touched**: [other components or products this change interacts with]
- **Contracts added or changed**: [link to the OpenAPI/AsyncAPI file and the change]
- **Platform capabilities used**: [hosting, identity, secrets, logging, pipeline]
- **New technology or platform deviation**: [None — or ADR reference]
- **ADRs raised by this plan**: [`docs/adr/NNNN-title.md`, or None]
- **Exceptions relied on**: [`docs/exceptions/EXC-NNN`, or None]

## Deployment and Rollback *(mandatory — org baseline)*

<!-- Principle 5. -->

- **Deployment unit**: [what is deployed; confirm it deploys independently]
- **Database changes**: [None — or expand-and-contract steps, in order]
- **Feature flags**: [flag name, default state, removal plan — or None]
- **Rollback**: [exact steps to return to the previous state, and how data changes are handled]

## Security and Threat Model *(mandatory — org baseline)*

<!-- Principle 6. Lightweight STRIDE is acceptable. -->

- **New interfaces or data flows**: [list, or "None — threat model not required"]
- **Threats identified**: [Spoofing / Tampering / Repudiation / Information disclosure / Denial of service / Elevation of privilege — as relevant]
- **Mitigations**: [one per threat]
- **Access model**: [identities, roles, least-privilege permissions; secrets via Key Vault and managed identity]

## Observability and Test Strategy *(mandatory — org baseline)*

<!-- Principle 7. -->

**Telemetry**

- **Logs**: [key events logged; correlation via trace context]
- **Metrics**: [custom counters/histograms for key behaviours]
- **Traces**: [service-to-service calls covered]
- **Health checks**: [liveness; readiness including dependencies]

**Test levels**

| Acceptance criterion | Test level (unit / integration / acceptance / E2E) | Test location |
|---|---|---|
| [AC-1 from spec] | [acceptance (Reqnroll)] | [`tests/Acceptance/Features/...`] |
