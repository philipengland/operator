# TDD Log — [Feature name]

<!--
  Written by /speckit.implement as it works, one section per acceptance
  criterion and one entry per red-green-refactor cycle. Reviewed in the pull
  request; it is the trace from each acceptance criterion to the unit tests
  that delivered it.
-->

- **Spec**: `specs/[NNN-feature]/spec.md`
- **Baseline**: [date] — [N] tests, all passing

## AC-1: [acceptance criterion text from the spec]

- **Acceptance test**: `[path]` — `[scenario / test name]`
- **Acceptance RED**: [failure message]

### Cycle 1 — [behaviour, one sentence]

- **RED**: `[test name]` in `[test file]` — failed: [assertion message]
- **GREEN**: [change made] — commit `[sha]`
- **REFACTOR**: [what changed, or "none needed"] — commit `[sha]`

### Cycle 2 — [behaviour]

- **RED**:
- **GREEN**:
- **REFACTOR**:

- **Acceptance GREEN**: full suite [N] passing
- **Slice refactor**: [summary, or "none needed"]
- **Checkpoint**: approved by [name] on [date]
