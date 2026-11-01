---
description: C#/.NET coding standards — error handling, logging and observability, configuration and secrets, data access, worker services and Azure Functions
paths:
- '**/*.cs'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# C# / .NET Standards

Applies to ASP.NET Core APIs, worker services and Azure Functions. Formatting
and style are enforced by analysers and `.editorconfig` — not repeated here.
Tags show the quality dimension each rule supports: Quality, Security or Code Health.

## Error Handling

**Let exceptions flow to one global handler; do not catch and swallow.**
*Why: scattered try/catch hides failures and produces inconsistent responses.* `[Code Health]`

- APIs use `AddProblemDetails()` plus an `IExceptionHandler` that maps known
  exception types to RFC 9457 problem details (see the API design standard).
- Catch an exception only to add context, translate it to a domain error, or
  handle it completely. Never `catch (Exception) { }`.
- Never return exception messages or stack traces to callers.

```csharp
// Avoid
try { await _repo.SaveAsync(app, ct); }
catch (Exception) { return Ok(); }

// Prefer — let it propagate; the global handler logs and returns 500 problem details
await _repo.SaveAsync(app, ct);
```

**Model expected failures as results, not exceptions.**
*Why: "not found" or "validation failed" are normal outcomes, not errors.* `[Code Health]`

```csharp
// Prefer
var application = await _repo.FindAsync(id, ct);
if (application is null) return NotFound();
```

**Pass `CancellationToken` through every async call chain.**
*Why: abandoned requests otherwise keep consuming database and HTTP resources.*

## Logging and Observability

**Use `ILogger<T>` with message templates, never string interpolation.**
*Why: templates produce structured, queryable properties in Application Insights.* `[Code Health]`

```csharp
// Avoid
_logger.LogInformation($"Application {id} submitted by {userId}");

// Prefer
_logger.LogInformation("Application {ApplicationId} submitted by {UserId}", id, userId);
```

For hot paths, use the `[LoggerMessage]` source generator.

**Never log personal data, secrets or tokens.**
*Why: logs are retained widely and are not access-controlled like the data stores.* `[Security]`
Log identifiers (application ID, user object ID), not names, emails,
addresses, bank details or request bodies.

**Instrument with OpenTelemetry, exported to Application Insights.**
*Why: one standard for logs, metrics and traces; correlation across services works automatically.* `[Code Health]`

- Use the Azure Monitor OpenTelemetry distro (`UseAzureMonitor()`) in APIs and
  workers; configure the connection string from configuration, never code.
- Do not hand-roll correlation IDs; rely on W3C trace context propagation.
- Add custom metrics for key business behaviours using
  `System.Diagnostics.Metrics` (`Meter`, `Counter<T>`, `Histogram<T>`).

```csharp
private static readonly Meter Meter = new("Grants.Applications");
private static readonly Counter<long> Submitted =
    Meter.CreateCounter<long>("applications.submitted");

Submitted.Add(1, new KeyValuePair<string, object?>("scheme", scheme));
```

**Provide separate liveness and readiness health checks.**
*Why: liveness says "restart me"; readiness says "don't send me traffic yet" — conflating them causes restart loops.* `[Code Health]`

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddSqlServer(connectionString, tags: ["ready"]);

app.MapHealthChecks("/health/live", new() { Predicate = c => c.Tags.Contains("live") });
app.MapHealthChecks("/health/ready", new() { Predicate = c => c.Tags.Contains("ready") });
```

Readiness checks every hard dependency (database, queues, downstream APIs the
service cannot work without). Liveness checks nothing external.

## Configuration and Secrets

**Bind configuration to typed options classes with validation.**
*Why: misconfiguration fails at startup instead of at 2am.*

```csharp
builder.Services.AddOptions<SearchOptions>()
    .Bind(builder.Configuration.GetSection("Search"))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

Inject `IOptions<T>`/`IOptionsMonitor<T>`; never read `IConfiguration` deep
inside business code.

**Secrets come from Key Vault via managed identity — never from source, appsettings or pipeline variables in plain text.**
*Why: secrets in source travel everywhere the code goes; a central secret store can be rotated and audited.* `[Security]`

- Use `DefaultAzureCredential` for Azure SDK clients and the Key Vault
  configuration provider. No client secrets or connection strings with keys
  where managed identity is supported.
- Local development uses user secrets (`dotnet user-secrets`) or the
  developer's own Azure login — never committed files.

```csharp
// Avoid
var client = new BlobServiceClient("DefaultEndpointsProtocol=https;AccountKey=...");

// Prefer
var client = new BlobServiceClient(new Uri(options.BlobEndpoint), new DefaultAzureCredential());
```

## Data Access

**Never build SQL from strings.** Use EF Core LINQ or parameterised queries
(`FromSql` with interpolation is parameterised; `FromSqlRaw` with concatenation
is not).
*Why: SQL injection.* `[Security]`

```csharp
// Avoid
db.Applications.FromSqlRaw($"SELECT * FROM Applications WHERE Ref = '{reference}'");

// Prefer
db.Applications.Where(a => a.Reference == reference);
```

**Schema changes go through EF Core migrations, written expand-and-contract.**
*Why: old and new versions must run side by side during deployment (constitution principle 5).*

- Add columns as nullable or with defaults; backfill; then make required in a
  later migration. Never rename or drop a column in the same release that
  stops using it.
- Never edit a migration that has been applied to a shared environment.

**Use `AsNoTracking()` for read-only queries and project to DTOs.**
*Why: avoids loading whole entity graphs and accidental writes.*

**Validate input at the boundary** (FluentValidation or data annotations on
request models) and authorise every operation server-side, including access
to the specific record requested.
*Why: broken access control and unvalidated input are the most common web vulnerabilities.* `[Security]`

## Worker Services and Azure Functions

**Make message handlers idempotent.**
*Why: queues deliver at least once; duplicates will happen.*
Record processed message IDs or design operations so repeating them is
harmless.

**Respect the host's lifetime.** In `BackgroundService`, loop on
`stoppingToken`, and let unhandled exceptions surface — do not wrap the
whole loop in a catch-all that hides failures. Use `IHttpClientFactory` and
`IServiceScopeFactory` for scoped dependencies.

**Azure Functions use the isolated worker model** with dependency injection
and `ILogger<T>`, configured through options like any other host. Keep
function bodies thin; put logic in testable services.

**Use resilience pipelines for outbound calls** (`AddStandardResilienceHandler()`
on `HttpClient` registrations) rather than hand-written retry loops.
*Why: consistent timeouts, retries with jitter and circuit breaking.*
