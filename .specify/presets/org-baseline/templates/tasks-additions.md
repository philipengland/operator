## Testing Rule *(org baseline — overrides any "OPTIONAL" marking above)*

Tests are mandatory and written **test-first**. The executable specifications
(Layer 1 scenarios and Layer 2 DSL) were drafted by `/speckit.acceptance` and
approved by a human — they are listed in `specs/<feature>/acceptance.md` and
are **locked**: tasks run them, never create or change them.
`/speckit.implement` executes each acceptance criterion as an outer ATDD loop
containing red-green-refactor TDD inner loops, and records every cycle in
`specs/<feature>/tdd-log.md`.

If `acceptance.md` is missing or not approved, generate a single first task:
`- [ ] T001 Run /speckit.acceptance and obtain approval` and stop.

Generate tasks for each user story in this shape — one group per acceptance
criterion, in the order the spec lists them:

```text
- [ ] T010 [US1] AC-1 run approved scenarios (RED); add API driver methods and stubs: <driver methods, stubs>
- [ ] T011 [US1] AC-1 TDD cycles: <expected unit behaviours, e.g. "FundingApplication.Submit rejects incomplete applications; SearchApplicationsHandler filters by local authority">
- [ ] T012 [US1] AC-1 scenarios GREEN, slice refactor, checkpoint
```

- Do **not** generate separate "write unit tests" and "implement X" tasks for
  behaviour delivered by TDD cycles — each cycle produces both the test and
  the code.
- List the expected unit behaviours in each TDD-cycles task so reviewers can
  see the intended design; the actual cycles are recorded in the TDD log.
- Use the test locations from the testing standards: Layer 3 drivers and
  stubs as the acceptance-tests standard lays out, unit tests mirroring the
  production code.
- If the product has a user interface, add a task per story for the Playwright
  **UI driver** methods, so the same approved scenarios run through the UI.

Each story's tasks also include, where the plan calls for them:

- [ ] Update or add the OpenAPI/AsyncAPI contract before implementing it
- [ ] Add telemetry listed in the plan (logs, metrics, traces, health checks)
- [ ] Write or update ADRs raised by the plan
- [ ] Add the feature flag and record its removal task
- [ ] Document rollback steps in the PR description
