# Operator

Set up with engineering-standards v2.0.0 and GitHub Spec Kit.
The technology stack has not been chosen yet.

## Getting started

1. Open this folder in VS Code.
2. Run `/speckit.constitution` to add this product's own principles. The organisation
   baseline is already in `.specify/memory/constitution.md`.
3. Run `/speckit.specify` for the first feature, then `/speckit.plan`. Record the
   technology choice as an ADR in `docs/adr/`.
4. Run `/speckit.acceptance`, review and approve the executable specifications,
   then `/speckit.tasks` and `/speckit.implement`.
5. Once the stack is chosen, re-run `init_project.py --stack dotnet|nestjs` to add the
   app structure and lint package (add `--no-scaffold` for lint only).
