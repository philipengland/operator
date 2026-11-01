---
description: Execute the implementation plan test-first against the human-approved executable specifications — an acceptance-driven outer loop per acceptance criterion, with red-green-refactor inner loops — narrating each step and recording it in the TDD log.
strategy: wrap
---

## Organisation TDD Protocol (org-baseline)

This protocol governs **how** tasks are executed. The core instructions further
below still apply for loading context, checklists, extension hooks, project
setup, progress tracking and the completion report. Where they conflict with
this protocol — in particular any instruction to write tests in batches, or
to implement before a failing test exists — **this protocol wins**.

### Before Starting

0. Open `specs/<feature>/acceptance.md`. Its **Approval** section must be
   filled in. If the file is missing or unapproved, **stop** and ask the user
   to run `/speckit.acceptance` and approve the executable specifications.
   The files it lists — Layer 1 scenarios, step definitions and the Layer 2
   DSL — are **locked**: you run them, you never create, edit, skip or delete
   them.
1. Create `specs/<feature>/tdd-log.md` from
   `.specify/presets/org-baseline/templates/tdd-log-template.md` if it does not
   exist; otherwise continue the existing log.
2. Run the full test suite once and record the result in the log as the
   baseline. If anything is already failing, **stop and report** — never start
   on a red baseline.

### Outer Loop — One Acceptance Criterion at a Time

For each acceptance criterion (AC) of the current user story, in order:

1. **Acceptance RED.** Run the approved scenarios for this AC only (filter by
   the `@AC-n` tag or `[spec-NNN AC-n]`). Build the Layer 3 protocol driver
   methods and stubs they need, following the acceptance-tests standard — the
   API driver first. Run again: the scenarios must now fail **because the
   behaviour does not exist**, not because a driver is missing. Quote the
   failure. If a scenario passes, stop and report: the behaviour already
   exists or the scenario does not test what the AC says. If you believe a
   scenario or DSL method is wrong, **stop and ask** — never change it.
2. **Inner loop** (below), repeated until the acceptance test passes.
3. **Acceptance GREEN.** Run the acceptance test — it passes. Run the full
   suite — everything passes.
4. **Slice REFACTOR.** Review all production code and tests changed for this
   AC against the coding principles. Refactor without changing behaviour; run
   the full suite again. Commit any changes as `refactor:`.
5. **Checkpoint.** Complete this AC's section of the TDD log, then summarise
   to the user: the AC, each cycle, tests added, refactors made, anything
   noticed. **Wait for the user's approval before starting the next AC.**

### Inner Loop — One Unit Behaviour at a Time

Pick the next smallest behaviour needed to move the acceptance test forward
and announce it in one sentence.

**RED — write one failing test**

- Write exactly **one** test for that behaviour, in the location and naming
  the testing standard requires. Do not write production code in this step.
- If the type or member under test does not exist, add the minimal stub so the
  code compiles. A stub returns a default (`null`, `false`, `0`, empty) — never
  `throw new NotImplementedException()` or `throw new Error('not implemented')`.
- Run the test. It must fail **on its assertion, for the reason you expect**.
  Quote the failure message. A compile error, a missing-type error or an
  exception thrown by a stub is **not** a valid red: fix the stub and re-run.
- Explain what behaviour the test specifies and why this failure proves it is
  testing real behaviour, not passing falsely.

**GREEN — the smallest change that passes**

- Write the minimum production code that makes this one test pass. A simple
  or even hard-coded answer is acceptable if a later test will force the
  general solution. Add no behaviour that no test requires.
- Run the unit tests (and integration tests for any area touched). All pass,
  except the in-progress acceptance test, which may still be red.
- Never change the test to make it pass. If the test is wrong, say so and go
  back to RED.
- Explain the change in one or two sentences.
- Commit the test and the code together: `feat(<scope>): <behaviour>` (or
  `fix(<scope>): ...`).

**REFACTOR — improve with all tests green**

- Improve the code **and** the test just written: remove duplication, use the
  spec's domain language, apply the coding principles (method size,
  parameters, nesting, no magic values). No behaviour change, no new tests.
- Run the tests again — still green. If there is nothing worth changing, say
  so and move on.
- Commit separately as `refactor(<scope>): <what>` if anything changed.
- Append the cycle to the TDD log.

Integration tests (database, HTTP, messaging) for behaviour that lives in the
Infrastructure layer follow the same red-green-refactor cycle.

### Narration

Report every phase to the user as it happens, briefly: the phase, the test or
change, the command run, and the result. For example:

> **RED** — `FundingApplicationTests.Submit.WhenIncomplete_ReturnsValidationProblem`
> specifies that an incomplete application cannot be submitted. Ran
> `dotnet test --filter "FullyQualifiedName~FundingApplicationTests+Submit"`:
> failed — `Assert.False() Failure: Expected False, Actual True` (stub returns
> success). This is the expected failure.
>
> **GREEN** — `Submit` now returns a validation problem when required fields
> are missing. 14 unit tests pass; acceptance test AC-1 still red (expected).
> Committed `feat(applications): reject incomplete submissions`.
>
> **REFACTOR** — extracted the required-field check into
> `FundingApplication.IsComplete`; renamed `fa` to `application` in the test.
> 14 tests pass. Committed `refactor(applications): name completeness rule`.

### Non-Negotiables

- Never create, edit, skip or delete an approved Layer 1 or Layer 2 file
  (scenarios, step definitions, DSL). They define success; they are changed
  only by a human, through a pull request approved by the code owners.
- Never write a test and the code that satisfies it in the same step.
- Never write more than one new failing test at a time.
- Never weaken, skip or delete an existing test to get to green.
- A test that passes the first time it runs is not a valid red — report it.
- The shared rules still apply: stop and ask on any ambiguity; never add
  dependencies, change contracts or suppress warnings unless the task says so.

---

## Core Implementation Instructions

{CORE_TEMPLATE}
