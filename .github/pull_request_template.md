<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->
## What and Why

<!-- One or two sentences. Link the spec: specs/NNN-feature/spec.md -->

## Executable Specifications

- [ ] **No changes** to acceptance scenarios, step definitions or the acceptance DSL (Layers 1–2)
- [ ] **Changes included** — listed in `specs/<feature>/acceptance.md` with a new approval

<!--
  Changes to Layers 1–2 redefine what "done" means. CODEOWNERS requires the
  spec owners to approve them. AI agents never make these changes.
-->

## Evidence

- TDD log: `specs/<feature>/tdd-log.md`
- [ ] All approved acceptance scenarios pass in CI
- [ ] No new analyser or linter warnings
- [ ] ADRs, contracts and `AGENTS.md` updated where affected

## Rollback

<!-- How to return to the previous state, including any data changes. -->

---

### Review Policy

**Reviewers review the executable specifications, not every line of code.**

1. **Layers 1–2 changed?** Review them in full, as a business stakeholder
   would: do the scenarios say exactly what the product must do, with concrete
   examples? This review is mandatory and enforced by CODEOWNERS.
2. **Code:** light review only. Acceptance is decided by the approved
   scenarios passing and the automated gates (tests, analysers, security and
   dependency scanning, standards check). Raise concerns, but do not block on
   style or structure the gates already enforce.
