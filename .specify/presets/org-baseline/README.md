# org-baseline Preset

The engineering baseline for Spec Kit. Install in **every**
product repository at priority 30. Non-negotiable: overlays and projects may
add to it but never weaken it.

## What It Provides

| File | Type | Strategy | Effect |
|---|---|---|---|
| `templates/constitution-baseline.md` | template `constitution-template` | append | Nine architecture principles, scope rules and the `org-baseline: vX.Y.Z` marker the standards check looks for |
| `templates/spec-additions.md` | template `spec-template` | append | Acceptance criteria as concrete examples, non-functional requirements, integration and contract impact, data impact, out of scope |
| `templates/plan-additions.md` | template `plan-template` | append | Architecture and ownership, deployment and rollback, security and threat model, observability and test strategy |
| `templates/tasks-additions.md` | template `tasks-template` | append | Acceptance-test, TDD-cycle and checkpoint tasks per acceptance criterion |
| `templates/acceptance-template.md` | template `acceptance-template` | new | Skeleton for `specs/NNN-*/acceptance.md`, the approval record that locks the executable specs |
| `templates/tdd-log-template.md` | template `tdd-log-template` | new | Skeleton for `specs/NNN-*/tdd-log.md` |
| `templates/agents-template.md` | template `agents-template` | new | Skeleton for `AGENTS.md` |
| `commands/speckit.acceptance.md` | command `speckit.acceptance` | new | Drafts Layer 1 scenarios and the Layer 2 DSL for human approval and locking |
| `commands/speckit.implement.md` | command `speckit.implement` | wrap | Runs the approved specs (never edits them) with the TDD protocol around Spec Kit's implement instructions |
| `commands/speckit.agents.md` | command `speckit.agents` | new | Drafts `AGENTS.md` from the codebase |
| `preset.yml` | manifest | — | Declares all of the above |

## Install

```bash
specify preset add --from <release-url>/org-baseline-vX.Y.Z.zip --priority 30
# or, from a local checkout of engineering-standards:
specify preset add --dev <engineering-standards>/speckit/presets/org-baseline --priority 30
```

Then run `/speckit.constitution` (or let `scripts/init_project.py` seed it).

## Releasing a Change

Bump `version` in `preset.yml` **and** the marker at the top of
`templates/constitution-baseline.md` to match `VERSION`. Product repos must
update the preset and re-run `/speckit.constitution`, or their standards check
fails — by design.
