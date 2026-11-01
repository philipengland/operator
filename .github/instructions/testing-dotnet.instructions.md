---
description: .NET testing standards — xUnit, Reqnroll acceptance tests, test levels, naming, determinism and flaky test handling
applyTo: '**/*Tests/**/*.cs,**/*.Tests/**/*.cs,**/tests/**/*.cs,**/*.feature'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# .NET Testing Standards

Tags show the quality dimension each rule supports: Quality, Security or Code Health.

## Tools and Layout

**Use one consistent stack in every product: xUnit, Reqnroll for acceptance scenarios, Playwright as the UI driver.**
*Why: one test stack per product means one set of conventions to learn and one way to run every test.* `[Quality]`

**Organise tests so a reader can go from any production class, or any acceptance criterion, straight to its tests.**

```
src/Grants.Domain/FundingApplications/FundingApplication.cs
src/Grants.Application/Search/SearchApplicationsHandler.cs

tests/
  Grants.UnitTests/                       # xUnit, no I/O — mirrors src
    Domain/FundingApplications/FundingApplicationTests.cs
    Application/Search/SearchApplicationsHandlerTests.cs
  Grants.IntegrationTests/                # xUnit + WebApplicationFactory + Testcontainers — mirrors src
    Api/Applications/ApplicationsControllerTests.cs
    Infrastructure/Persistence/FundingApplicationRepositoryTests.cs
  Grants.AcceptanceTests/                 # four layers — see the acceptance-tests standard
    Features/Applications/SearchApplications.feature   # Layer 1 (locked)
    Steps/ApplicationSteps.cs                          # Layer 1 (locked)
    Dsl/ApplicationsDsl.cs                             # Layer 2 (locked)
    Drivers/Api/, Drivers/Ui/, Stubs/                  # Layer 3
```

- **Unit and integration tests mirror the production code:** the folder path
  after the layer name matches the production folder, with one test class per
  production class named `<Class>Tests`.
- **Acceptance tests follow the four-layer model** in the acceptance-tests
  standard, organised by business capability. Their scenarios, steps and DSL
  are approved by a human and locked — agents never change them.
- **Every test is written before the code it tests** (see the TDD standard).
  `specs/<feature>/tdd-log.md` traces each acceptance criterion to the unit
  tests written for it.

## Test Levels

Follow the pyramid: many fast unit tests, fewer integration tests, few
end-to-end tests. `[Quality]`

| Level | Scope | Rules |
|---|---|---|
| Unit | One class or function | No database, network, file system or clock. Runs in milliseconds. |
| Integration | API + real dependencies | `WebApplicationFactory<Program>`; real database in a Testcontainers container, not EF in-memory. |
| Acceptance | Spec acceptance criteria | Four layers (acceptance-tests standard): approved scenarios and DSL, run through API or UI drivers. |

## Acceptance Tests (Reqnroll)

Follow the **acceptance-tests standard**: scenarios (Layer 1) and the DSL
(Layer 2) are drafted by `/speckit.acceptance`, approved by a human and
locked; drivers and stubs (Layer 3) are built during implementation. Tag every
scenario `@spec-NNN @AC-n` and run one criterion with
`dotnet test --filter "Category=AC-1"`.

## Unit and Integration Tests (xUnit)

**One test class per production class, a nested class per method, and test names of the form `When<Scenario>_<ExpectedResult>`. Structure each test Arrange / Act / Assert.**
*Why: Test Explorer then reads Class › Method › Scenario, so anyone can see what each method is specified to do.*

```csharp
public class FundingApplicationTests
{
    public class Submit
    {
        [Fact]
        public void WhenIncomplete_ReturnsValidationProblem()
        {
            // Arrange
            var application = FundingApplicationBuilder.Incomplete().Build();

            // Act
            var result = application.Submit();

            // Assert
            Assert.False(result.IsSuccess);
        }

        [Fact]
        public void WhenComplete_SetsStatusToSubmitted() { /* ... */ }
    }
}
```

Run one method's tests with
`dotnet test --filter "FullyQualifiedName~FundingApplicationTests+Submit"`.

- One behaviour per test. Use `[Theory]` with `[InlineData]` for variations.
- Mock only what you own at architectural boundaries (repositories, external
  clients). Do not mock the class under test or value objects.
- Test unhappy paths, not just the happy path: validation failures, not
  found, unauthorised, dependency failures. `[Quality]`

## Determinism and Flaky Tests

**Tests must be deterministic.**
*Why: flaky tests erode trust and train people to ignore red builds.* `[Quality]`

- No `Thread.Sleep` or `Task.Delay` to wait for things. Inject `TimeProvider`
  for time; poll with a timeout for eventual consistency.
- Each test creates the data it needs and does not depend on run order or on
  other tests' data.
- No shared mutable static state between tests.

**A flaky test is a defect: quarantine it, raise a work item, and fix it.**
Mark it `[Trait("Category", "Quarantine")]` with a comment giving the work
item ID. Quarantined tests run in a separate, non-blocking pipeline job.
Never "fix" flakiness by adding retries or longer sleeps.

## Coverage

Coverage is collected (`coverlet.collector`) and reported in pull requests;
the threshold is enforced by the pipeline. Never write assertion-free tests to
raise coverage. `[Quality]`
