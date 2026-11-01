---
description: Draft the executable specifications (Layer 1 scenarios and the Layer 2 domain-specific language) from the spec's acceptance criteria, for a human to review, approve and lock before implementation.
---

## User Input

```text
$ARGUMENTS
```

Consider the user input before proceeding (it may name the acceptance
criteria to draft, or corrections to a previous draft).

## Goal

Turn the acceptance criteria in `spec.md` into **executable specifications**
that define success before any production code exists. You draft; a human
approves. Once approved, these files are locked: `/speckit.implement` runs
them but never edits them, and CODEOWNERS requires a named human to approve
any later change.

This step sits between `/speckit.plan` and `/speckit.tasks`:

```
/speckit.specify → /speckit.clarify → /speckit.plan → /speckit.acceptance → /speckit.tasks → /speckit.implement
```

## The Four Layers

Follow the acceptance-tests standard (`.claude/rules/acceptance-tests.md`,
also `.github/instructions/acceptance-tests.instructions.md`). In short:

| Layer | What | Who owns it |
|---|---|---|
| 1. Test cases | Scenarios in business language — no URLs, selectors, SQL, HTTP status codes or class names | **You draft, a human approves — then locked** |
| 2. DSL | Domain vocabulary the scenarios call (`Applications.SubmitFor(...)`, `searchByLocalAuthority(...)`), with assertions expressed in domain terms | **You draft, a human approves — then locked** |
| 3. Protocol drivers and stubs | How the DSL talks to the system (API, UI) and fakes for external systems | `/speckit.implement` builds these |
| 4. System under test | The product | `/speckit.implement` builds this |

## Steps

1. Read `spec.md`, `plan.md` (for the chosen stack and test framework) and the
   constitution. If `plan.md` does not name the stack, stop and ask the user to
   run `/speckit.plan` first.
2. For each acceptance criterion, write one or more **scenarios with concrete
   example values** ("an application for £250,000 in Liverpool"), never
   abstractions ("a valid application"). Cover the unhappy paths the criterion
   implies. Tag each with `@spec-NNN @AC-n` (Reqnroll) or `[spec-NNN AC-n]` in
   the `describe` (Jest).
3. Put scenarios in the **business-capability** folder the standard requires,
   adding to an existing capability file where one exists.
4. Write the **step definitions** (Reqnroll) so each step is one call into the
   DSL — no logic, no HTTP, no selectors.
5. Write the **DSL**: domain-named methods the scenarios need, delegating to a
   driver interface. Define the driver interface the DSL calls (method
   signatures only) — implementations come later.
6. Write `specs/<feature>/acceptance.md` from
   `.specify/presets/org-baseline/templates/acceptance-template.md`, listing every acceptance criterion,
   its scenarios and their file locations, and the DSL methods added, with an
   empty **Approval** section.
7. Run the acceptance suite. Every new scenario must **fail or be pending**
   because drivers and behaviour do not exist yet. Report the result.
8. **Stop.** Ask the user to review the scenarios and DSL — reading them as a
   business stakeholder would — and to edit anything that does not express the
   intended behaviour. Explain that once approved these files are locked.

## On Approval

When the user explicitly approves:

1. Fill in the Approval section of `acceptance.md` (approver name, date, the
   list of approved files).
2. Commit the Layer 1 and Layer 2 files and `acceptance.md` together:
   `test(acceptance): approve executable specs for spec-NNN`.
3. Tell the user the next step is `/speckit.tasks`.

## Rules

- Do **not** write production code, drivers or stubs in this step.
- Do **not** invent behaviour the spec does not state. If a criterion is
  ambiguous, stop and ask — or suggest `/speckit.clarify`.
- Keep Layers 1 and 2 free of technical detail, so the same scenarios can run
  through the API driver and the UI driver.
