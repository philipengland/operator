# AGENTS.md — [Product / repository name]

<!--
  Repository-specific context for AI coding agents (GitHub Copilot, Claude Code).
  Organisation-wide rules live in .github/copilot-instructions.md and
  .github/instructions/ — do NOT repeat or contradict them here.
  Owned by the lead developer. Keep under ~150 lines.
-->

## Product Purpose and Users

[Two to four sentences: what this product does, who uses it, and why it matters.]

## Architecture and Key Decisions

- **Components**: [component — responsibility — deployable unit]
- **Boundaries and integrations**: [upstream/downstream systems and the contracts used]
- **Contracts**: [paths to OpenAPI/AsyncAPI files]
- **Key ADRs**: [`docs/adr/NNNN-title.md` — one-line summary each]
- **Active exceptions**: see `docs/exceptions/`

## Build, Test and Run

```bash
# Restore and build
[command]

# Unit tests
[command]

# Integration tests (prerequisites: [e.g. Docker running])
[command]

# Acceptance tests
[command]

# End-to-end tests (Playwright)
[command]

# Run locally
[command — URL/port]
```

## Repository Layout

| Path | Contents |
|---|---|
| [`src/Product.Api/`] | [controllers, DTOs, DI wiring] |
| [`src/Product.Application/`] | [use cases; interfaces for external integrations and repositories] |
| [`src/Product.Domain/`] | [entities and business rules — no dependencies] |
| [`src/Product.Infrastructure/`] | [EF Core, HTTP clients, messaging, storage] |
| [`tests/Product.UnitTests/`] | [unit tests — folders mirror `src/`, one `<Class>Tests` per class] |
| [`tests/Product.IntegrationTests/`] | [API and infrastructure tests — folders mirror `src/`] |
| [`tests/Product.AcceptanceTests/`] | [Reqnroll features by business capability, tagged `@spec-NNN @AC-n`] |
| [`specs/NNN-feature/tdd-log.md`] | [trace from each acceptance criterion to its TDD cycles] |
| [`docs/adr/`] | Architecture Decision Records |
| [`docs/exceptions/`] | Recorded exceptions to the organisation baseline |

## Owners and Environments

- **Owning team**: [team name] — **Lead developer**: [name]
- **Environments**: [dev / test / pre-prod / prod — URLs or resource groups]
- **Where to find logs and dashboards**: [Application Insights resource / dashboard link]

## Repository-Specific Conventions

[Only conventions that differ from or add to the organisation standards, with a reason for each. Leave empty if none.]
