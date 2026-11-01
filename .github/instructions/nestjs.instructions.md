---
description: TypeScript/NestJS backend standards — error handling, logging and observability, configuration and secrets, data access
applyTo: src/**/*.ts,apps/**/src/**/*.ts,libs/**/src/**/*.ts
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# TypeScript / NestJS Standards

Formatting and lint rules are enforced by the shared ESLint and Prettier
configuration — not repeated here. Tags show the quality dimension each rule supports: Quality, Security or Code Health.

## Structure

**Organise by feature module; keep controllers thin.**
*Why: business logic in controllers cannot be reused or unit tested easily.*
Controllers handle HTTP concerns only (routing, validation, mapping) and
delegate to injectable services.

**TypeScript `strict` is on. Do not use `any`; use `unknown` and narrow.**
*Why: `any` silently disables type checking for everything it touches.*

## Error Handling

**Throw Nest HTTP exceptions or domain errors; handle them in one global exception filter.**
*Why: consistent RFC 9457 problem-details responses and a single place to log.* `[Code Health]`

- Register one global `ExceptionFilter` that maps errors to problem details
  (see the API design standard) and logs unexpected errors once.
- Never swallow errors (`catch {}`) or return raw error messages or stacks to
  callers.
- Always `await` promises or return them; no floating promises (the linter
  enforces this).

```ts
// Avoid
try { await this.repo.save(app); } catch { return { ok: true }; }

// Prefer
const application = await this.repo.findOne(id);
if (!application) throw new NotFoundException();
```

## Logging and Observability

**Use a structured JSON logger (`nestjs-pino`) through Nest's `Logger`; never `console.log`.**
*Why: structured logs are queryable in Application Insights; console output is not.* `[Code Health]`

```ts
// Avoid
console.log(`Application ${id} submitted by ${userId}`);

// Prefer
this.logger.log({ applicationId: id, userId }, 'Application submitted');
```

**Never log personal data, secrets, tokens or request bodies.** Log
identifiers only. Configure `redact` paths in the logger for headers such as
`authorization` and `cookie`. `[Security]`

**Instrument with OpenTelemetry, exported to Application Insights.**
*Why: correlated traces across .NET and Node services.* `[Code Health]`

- Initialise the Azure Monitor OpenTelemetry distro
  (`@azure/monitor-opentelemetry`) before the Nest app is created
  (first import in `main.ts`).
- Rely on W3C trace context; do not invent correlation headers.
- Add custom metrics with the OpenTelemetry metrics API for key business
  behaviours.

**Expose separate liveness and readiness endpoints with `@nestjs/terminus`.**
`/health/live` checks nothing external; `/health/ready` checks the database
and other hard dependencies. `[Code Health]`

## Configuration and Secrets

**Load configuration through `@nestjs/config` with a validation schema; fail at startup if invalid.**
*Why: misconfiguration should stop the deployment, not break a user journey.*
Inject `ConfigService` (typed) — never read `process.env` outside the config
module.

**Secrets come from Key Vault via managed identity.** Use
`DefaultAzureCredential` from `@azure/identity` for Azure SDK clients. Never
commit `.env` files containing secrets; `.env` stays in `.gitignore`.
`[Security]`

```ts
// Avoid
const client = BlobServiceClient.fromConnectionString('DefaultEndpointsProtocol=https;AccountKey=...');

// Prefer
const client = new BlobServiceClient(config.get('blob.endpoint'), new DefaultAzureCredential());
```

## Data Access and Input

**Never build queries from strings.** Use the ORM's query builder or
parameterised queries.
*Why: SQL injection.* `[Security]`

```ts
// Avoid
repo.query(`SELECT * FROM applications WHERE ref = '${ref}'`);

// Prefer
repo.findOne({ where: { reference: ref } });
```

**Schema changes go through migrations, written expand-and-contract;** never
edit an applied migration, and never use schema auto-sync (`synchronize: true`)
outside local development.

**Validate every request with DTO classes and a global `ValidationPipe`**
(`whitelist: true, forbidNonWhitelisted: true, transform: true`), and enforce
authorisation with guards — including checks that the caller may access the
specific record. `[Security]`

**Make queue and event handlers idempotent;** delivery is at least once.
