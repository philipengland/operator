---
description: Coding principles for all C# and TypeScript — structure and layers, SOLID, abstractions, method size, readability, immutability, composition, tidying existing code
applyTo: '**/*.cs,**/*.ts'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# Coding Principles

Apply to all production code in C# and TypeScript. The aim: code a
non-developer could follow by reading the names, and a developer can change
safely. Where a rule is enforced by the build, it says so; everything else is
checked by agents and reviewers. Tags show the quality dimension each rule supports: Quality, Security or Code Health.

## 1. Structure: Clean Architecture Layers

**Every service is split into four layers, and dependencies point inward only.**
*Why: business rules stay independent of frameworks, databases and transport, so they can be tested and changed in isolation.* `[Code Health]`

| Layer | Contains | May depend on |
|---|---|---|
| **Api** | Controllers, request/response DTOs, DI wiring, middleware | Application |
| **Application** | Use cases, interfaces for external integrations and persistence | Domain |
| **Domain** | Entities, value objects, business rules | Nothing |
| **Infrastructure** | EF Core/ORM, HTTP clients, messaging, storage — implementations of Application interfaces | Application, Domain |

- **.NET:** one project per layer (`Product.Api`, `Product.Application`,
  `Product.Domain`, `Product.Infrastructure`). Project references enforce the
  direction — the compiler rejects a wrong reference.
- **NestJS:** each feature module has `api/`, `application/`, `domain/` and
  `infrastructure/` folders. The shared ESLint config fails the build if
  `domain/` imports Nest, an ORM, Azure SDKs or another layer, or if
  `application/` imports `infrastructure/` or `api/`.

## 2. SOLID, Applied Pragmatically

- **Single responsibility:** each class has one reason to change. A class
  name that needs "And", or ends in `Manager`, `Helper`, `Utils` or `Processor`,
  is a sign it does too much — split it by responsibility.
- **Open/closed:** extend behaviour by composing new classes (strategies,
  decorators, handlers), not by editing a growing `switch` or `if` chain. Do
  not build extension points before a second case exists.
- **Liskov substitution:** an implementation must honour its interface's
  contract — no `NotImplementedException`/`throw new Error('not supported')`
  for interface members.
- **Interface segregation:** keep interfaces small and shaped around what the
  caller needs (`IApplicationSearch`), not everything a class can do.
- **Dependency inversion:** the Application layer defines the interfaces it
  needs; Infrastructure implements them. This applies at boundaries — see
  section 3 — not to every class.

## 3. Abstractions

**Every external integration sits behind an interface defined in the Application layer.**
*Why: use cases can be unit tested without the real service, and the integration can be replaced without touching business logic.* `[Quality]`

This applies to:

- Third-party APIs and other products in your organisation
- Messaging: queues, event buses, email and SMS gateways
- File and blob storage
- Time, randomness and environment: inject `TimeProvider` (.NET) or a clock
  interface (TypeScript); inject ID and random generators

```csharp
// Application layer — named for what the use case needs, not the vendor
public interface ILandRegistryLookup
{
    Task<TitleDetails?> FindTitleAsync(TitleNumber title, CancellationToken ct);
}

// Infrastructure layer
internal sealed class LandRegistryHttpClient(HttpClient http) : ILandRegistryLookup { /* ... */ }
```

**Persistence:** the Application layer defines one repository interface per
aggregate, with methods named in domain language
(`IFundingApplicationRepository.FindSubmittedByLocalAuthorityAsync`).
Infrastructure implements it with EF Core or the ORM directly.

- No generic `IRepository<T>` wrapping `DbSet<T>` or an ORM repository — it
  adds a layer without adding meaning.
- Persistence is tested against a real database in integration tests, not
  through mocks.

**No speculative abstraction.** Outside the boundaries above, create an
interface only when there are two or more real implementations. A concrete
class with one implementation does not need an interface "for testing" —
test it directly, or test through the use case that owns it.

## 4. Methods

**Aim for methods that fit on one screen — about 20 lines.**
Over that, consider extracting a step with a name that explains it. Do not
split a method only to reduce its line count; every extracted method must
make the calling code read more clearly.

**Cyclomatic complexity above 10 fails the build** (.NET CA1502; ESLint
`complexity`).
*Why: each branch is another path to understand and test.* `[Code Health]`

**Parameters: aim for three or fewer; four or more suggests a parameter object; never more than six — constructors included.**
*Why: long parameter lists are hard to call correctly; more than six injected dependencies means the class has too many responsibilities and should be split.*
Enforced by ESLint `max-params` in TypeScript; checked by agents and
reviewers in .NET.

```csharp
// Avoid
Task<Result> SubmitAsync(Guid applicationId, string localAuthority, decimal amount,
    DateOnly start, DateOnly end, string contactEmail, bool urgent);

// Prefer
Task<Result> SubmitAsync(SubmitApplicationCommand command, CancellationToken ct);
```

## 5. Readability

The test: someone who cannot read code should be able to follow what a
method does from its names alone.

**Use the domain language from the spec.** Classes, methods, variables and
tests use the business terms in `specs/` and the constitution — no
abbreviations, no technical stand-ins for business concepts.

```ts
// Avoid
const apps = await this.repo.getRecs(la, 1);

// Prefer
const submittedApplications = await this.applications.findSubmittedFor(localAuthority);
```

**Return early with guard clauses; nest no more than three levels.**
Enforced by ESLint `max-depth` in TypeScript; checked by review in .NET.

```csharp
// Prefer
public Result Approve(FundingApplication application)
{
    if (application.Status != ApplicationStatus.Submitted)
    {
        return Result.Invalid("Only submitted applications can be approved.");
    }

    if (application.Amount > _limits.MaxGrantAmount)
    {
        return Result.Invalid("Amount exceeds the maximum grant.");
    }

    application.Approve(_timeProvider.GetUtcNow());
    return Result.Success();
}
```

**No magic numbers or strings.** Use named constants, enums or options
(`MaxGrantAmount`, `ApplicationStatus.Submitted`), not `250000` or
`"SUBMITTED"`. Enforced by ESLint `no-magic-numbers` in TypeScript (0, 1, -1
and 2 allowed; tests exempt).

**Comments explain why, never what.** The code says what it does. Comment
only reasons, constraints and links (`// Rounded down: grant rules §4.2 — see
ADR-0007`). No commented-out code — source control keeps history.

**Booleans read as questions:** `isEligible`, `hasSubmitted`, `canApprove`.

## 6. Immutability by Default

- **.NET:** use `record` for DTOs, commands and value objects; `readonly`
  fields; `init` setters; `IReadOnlyList<T>`/`IReadOnlyCollection<T>` on
  public surfaces. Entities change state only through methods that enforce
  their rules (`application.Approve(...)`), never public setters.
- **TypeScript:** `const` by default; `readonly` properties and
  `ReadonlyArray<T>`/`readonly T[]`; return new objects rather than mutating
  arguments.

*Why: data that cannot change unexpectedly is easier to reason about and safe to share.*

## 7. Composition Over Inheritance

Reuse behaviour by composing small classes injected through the
constructor, not by inheritance hierarchies. Use a base class only when a
framework requires one (`ControllerBase`, `BackgroundService`). Mark .NET
classes `sealed` unless they are designed for inheritance.

## 8. Working With Existing Code

**New and changed code must follow these principles. Tidy what you touch.**

- When you change a method that breaks these principles, you may refactor
  **that method** (and private methods it alone uses) to comply — behaviour
  must not change.
- Put the tidying in its own `refactor:` commit, separate from the behaviour
  change, with tests passing before and after.
- Do not refactor beyond the methods you are changing, and stop if tidying
  would push the pull request past a 30-minute review. List other breaches you
  noticed in the PR description instead.
