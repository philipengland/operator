<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->
# Shared Engineering Rules for AI Agents

These rules apply in every repository and every session. Repository-specific
context is in `AGENTS.md`. Language and testing standards are in
`.github/instructions/` (Copilot) and `.claude/rules/` (Claude Code).
Architecture principles are in `.specify/memory/constitution.md`.

## How to Work

- **Always stop and ask** when anything is ambiguous — requirements, design,
  naming, scope. Do not assume and continue. State the ambiguity and the
  options you see.
- **Spec first.** Behaviour changes trace to a spec in `specs/`. Exempt: typo
  and copy fixes, patch-level dependency updates, configuration values, and
  refactors with no behaviour change. If no spec covers the requested
  behaviour change, say so and stop.
- **Keep changes small.** Each pull request should be reviewable in under 30
  minutes. If a task will exceed that, propose how to split it first.
- **Test first.** Every behaviour change — features and bug fixes — follows
  red-green-refactor: one failing test, the smallest code to pass it, then
  refactor with tests green (see the TDD standard). `/speckit.implement`
  applies the full outer and inner loop and writes `specs/<feature>/tdd-log.md`.
- **Success is defined before code.** `/speckit.acceptance` drafts executable
  specifications (four layers — see the acceptance-tests standard) for a human
  to approve. Implementation starts only once they are approved.
- **Follow the plan.** Implement what the spec and plan describe. Do not add
  features, abstractions or "improvements" that were not asked for. The one
  exception: behaviour-preserving tidying of the methods you are changing, in
  a separate `refactor:` commit (see the coding principles standard).

## Never Do Unless the Task Explicitly Asks

- Add, remove or upgrade a dependency (NuGet, npm or any other package).
- Edit pipeline definitions (`.github/workflows/`, `azure-pipelines*.yml`) or
  infrastructure-as-code (Bicep, Terraform, ARM).
- Change a public contract or schema: OpenAPI/AsyncAPI files, event
  payloads, public DTOs, database schemas.
- Suppress, disable or downgrade an analyser, linter or security warning
  (`#pragma warning disable`, `[SuppressMessage]`, `eslint-disable`,
  `// NOSONAR`, editing `.editorconfig` or `.globalconfig` severities). Fix the
  cause instead, or stop and explain why it cannot be fixed.

## Never Do

- Create, edit, skip or delete an approved executable specification —
  acceptance scenarios, step definitions or the acceptance DSL (Layers 1 and 2;
  listed in `specs/<feature>/acceptance.md`). They define success. If one looks
  wrong, stop and ask.
- Edit a database migration that has already been applied to any shared
  environment. Add a new migration instead.
- Edit generated code. Change the generator input and regenerate.
- Commit secrets, connection strings, keys or tokens — including in tests,
  samples or comments.
- Commit directly to `main`, merge pull requests, deploy, or change branch
  protection or the organisation baseline.
- Weaken a test to make it pass, or delete a failing test without being asked.

## Branches and Commits

- Work on a short-lived branch, merged within 3 days. Feature work uses the
  branch `/speckit.specify` creates (`NNN-short-name`, e.g.
  `001-application-search`) — do not rename it. Other work (bug fixes,
  chores) uses `<type>/<work-item-id>-<short-description>`, e.g.
  `fix/1234-search-paging`. Put the work item ID in the pull request title.
- Use Conventional Commits: `<type>(<optional scope>): <summary>` where type is
  one of `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`,
  `chore`. Mark breaking changes with `!` and a `BREAKING CHANGE:` footer.
  Example: `feat(search): filter applications by local authority`.
- Commit at each green: the test and the code that passes it together
  (`feat:`/`fix:`), then any refactoring as a separate `refactor:` commit.
  Never commit a failing test on its own.

## Definition of Done

A change is done when:

1. Every approved acceptance scenario passes, and every unit of behaviour was
   written test-first; the TDD log is complete.
2. The build has no new analyser or linter warnings.
3. ADRs, API contracts, `AGENTS.md` and other docs affected by the change are
   updated in the same pull request.
4. The pull request description explains what changed, why, how it was tested,
   and how to roll it back.

## Exceptions

If following a rule or principle is genuinely not possible, do not work around
it. Stop and explain. A human may record an exception in `docs/exceptions/`
using the organisation template.
