---
description: Draft or refresh this repository's AGENTS.md from the codebase, using the organisation template.
---

## User Input

```text
$ARGUMENTS
```

Consider the user input before proceeding (it may name areas to focus on or
say which sections to refresh).

## Goal

Produce an accurate `AGENTS.md` at the repository root that gives AI coding
agents the repository-specific context they need. The lead developer reviews
it before it is committed.

## Steps

1. Load the template from
   `.specify/presets/org-baseline/templates/agents-template.md`.
2. If `AGENTS.md` already exists, read it. Preserve human-written content
   that is still accurate, and only update sections that are wrong, missing or
   stale.
3. Gather facts from the repository — never invent them:
   - Purpose: README, `.specify/memory/constitution.md`, existing specs in `specs/`.
   - Architecture: solution/project files, `package.json`, folder structure,
     OpenAPI/AsyncAPI files, `docs/adr/`.
   - Commands: build scripts, `package.json` scripts, `*.sln`/`*.csproj`,
     pipeline definitions under `.github/workflows/`, README instructions.
   - Layout: top-level and `src/`/`tests/` folders.
   - Owners and environments: CODEOWNERS, README, pipeline environment names.
4. Fill every section of the template. Where a fact cannot be found in the
   repository, leave the placeholder in square brackets and add
   `<!-- TODO: confirm with lead developer -->` — do not guess.
5. Do NOT copy organisation-wide rules (from `.github/copilot-instructions.md`
   or `.github/instructions/`) into `AGENTS.md`. Only record repository-specific
   conventions, each with a reason.
6. Keep the file under about 150 lines.
7. Write the result to `AGENTS.md`, then report:
   - which sections were filled from evidence (cite the files used),
   - which placeholders remain for the lead developer to confirm.

Do not commit the file. The lead developer reviews and commits it.
