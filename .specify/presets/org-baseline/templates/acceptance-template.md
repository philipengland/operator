# Executable Specifications — [Feature name]

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/[NNN-feature]/spec.md`

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: [criterion text] | [scenario name] | `[path]` |
| AC-1 | [unhappy-path scenario] | `[path]` |
| AC-2: [criterion text] | [scenario name] | `[path]` |

## DSL Added or Changed

| Method | Purpose |
|---|---|
| `[Applications.SubmitFor(...)]` | [what it expresses in domain terms] |

## Driver Interface Required

[Methods Layer 3 drivers must implement for these scenarios — signatures only.]

## Approval

- **Approved by**: [name, role]
- **Date**: [YYYY-MM-DD]
- **Locked files**: [list every Layer 1 and Layer 2 file approved above]
