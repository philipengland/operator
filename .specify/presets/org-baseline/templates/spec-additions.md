## Acceptance Criteria as Examples *(org baseline)*

<!--
  Every acceptance scenario in the user stories above must use concrete
  example values — "an application for £250,000 in Liverpool submitted on
  3 March" — not abstractions like "a valid application". Concrete examples
  become the executable specifications drafted by /speckit.acceptance and
  approved before implementation. Number each criterion (AC-1, AC-2, …).
-->

## Non-Functional Requirements *(mandatory — org baseline)*

<!--
  State each target measurably. Write "None beyond platform defaults" only
  where that is genuinely true, and say why.
-->

- **Performance**: [e.g. p95 response time under 500 ms for the search journey at 50 requests/second]
- **Availability**: [e.g. 99.5% in working hours; tolerable downtime for maintenance]
- **Security**: [e.g. authentication required; roles that may perform each action]
- **Accessibility**: [user-facing only — WCAG 2.2 AA unless an exception is recorded]
- **Capacity and scale**: [expected volumes now and in 12 months]

## Integration and Contract Impact *(mandatory — org baseline)*

<!-- Principle 3: contracts are written before implementation. -->

| Contract (API, event, file, schema) | New / Changed / Removed | Breaking? | Consumers affected |
|---|---|---|---|
| [e.g. `GET /v1/applications`] | [Changed] | [No] | [Grants portal] |

If any change is breaking: [new version, migration path, deprecation date].
If there is no integration impact, state "None" and why.

## Data Impact *(mandatory if the feature stores, moves or exposes data)*

<!-- Principle 6. -->

- **Data items**: [what is created, read, updated or deleted]
- **Classification**: [e.g. OFFICIAL, OFFICIAL-SENSITIVE; personal data yes/no]
- **System of record**: [which component owns each data item]
- **Retention and deletion**: [how long it is kept; how it is deleted]
- **Lawful basis / DPIA**: [reference, or "not required" with reason]

## Out of Scope *(mandatory — org baseline)*

<!-- Explicit exclusions stop the agent and the team from over-building. -->

- [e.g. Bulk upload — planned for a later feature]
- [e.g. Changes to the reporting dashboard]
