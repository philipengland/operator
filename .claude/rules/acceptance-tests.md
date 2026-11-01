---
description: Executable specifications in four layers (test cases, DSL, protocol drivers and stubs, system under test) — what each layer may contain, who owns it, folder layout for .NET and NestJS, driver selection
paths:
- '**/*AcceptanceTests/**'
- '**/*.feature'
- test/acceptance/**
- '**/*.acceptance-spec.ts'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# Acceptance Tests: Executable Specifications in Four Layers

Acceptance tests are the **executable specification** of the product: they
define success before the code exists, and AI agents are judged against them.
They follow Dave Farley's four-layer model so that the definition of success
(what) is separated from how the system is driven (how).
`[Quality]`

| Layer | Contains | Never contains | Owned by |
|---|---|---|---|
| **1. Test cases** | Scenarios in business language with concrete example values; step definitions that each make one DSL call | URLs, selectors, SQL, HTTP status codes, class or table names, waits | Drafted by `/speckit.acceptance`, **approved by a human, then locked** |
| **2. DSL** | Domain-named actions and assertions (`givenSubmitted`, `searchByLocalAuthority`, `expectReferences`), delegating to a driver interface | Transport or UI detail | Drafted by `/speckit.acceptance`, **approved by a human, then locked** |
| **3. Protocol drivers and stubs** | API driver (HTTP), UI driver (Playwright), stubs for external systems — the only place transport detail appears | Business rules or assertions about outcomes | Built by `/speckit.implement` |
| **4. System under test** | The product | Any knowledge that it is being tested | Built by `/speckit.implement` |

## The Lock

- Approved Layer 1 and 2 files are listed in `specs/<feature>/acceptance.md`.
- `.github/CODEOWNERS` assigns those folders to the spec owners, and branch
  protection requires their approval for any change.
- **Agents never create, edit, skip or delete Layer 1 or 2 files during
  implementation.** If a scenario looks wrong, stop and ask.

## Layout

**NestJS**

```
test/acceptance/
  applications/search-applications.acceptance-spec.ts   # Layer 1 — by business capability (locked)
  dsl/applications.dsl.ts                                # Layer 2 (locked)
  drivers/applications.driver.ts                         # Layer 3 contract
  drivers/api/applications.api-driver.ts                 # Layer 3 — HTTP (Supertest)
  drivers/ui/applications.ui-driver.ts                   # Layer 3 — Playwright (products with a UI)
  stubs/                                                 # Layer 3 — fakes for external systems
  support/acceptance.ts                                  # driver selection and lifecycle
```

**.NET**

```
tests/Grants.AcceptanceTests/
  Features/Applications/SearchApplications.feature       # Layer 1 — by business capability (locked)
  Steps/ApplicationSteps.cs                              # Layer 1 — one DSL call per step (locked)
  Dsl/ApplicationsDsl.cs                                 # Layer 2 (locked)
  Drivers/IApplicationsDriver.cs                         # Layer 3 contract
  Drivers/Api/ApiApplicationsDriver.cs                   # Layer 3 — HttpClient
  Drivers/Ui/UiApplicationsDriver.cs                     # Layer 3 — Microsoft.Playwright (products with a UI)
  Stubs/                                                 # Layer 3 — fakes for external systems
  Support/DriverHooks.cs                                 # driver selection and lifecycle
```

## Layer 1 — Test Cases

**Concrete examples in business language. A non-developer must be able to read
every line.**

```ts
// test/acceptance/applications/search-applications.acceptance-spec.ts
import { useAcceptance } from '../support/acceptance';

describe('[spec-001 AC-1] find funding applications by local authority', () => {
  const { applications } = useAcceptance();

  it('returns only the applications for the requested local authority', async () => {
    await applications.givenSubmitted([
      { reference: 'APP-1001', localAuthority: 'Liverpool', amount: 250_000 },
      { reference: 'APP-1002', localAuthority: 'Leeds', amount: 120_000 },
    ]);

    const found = await applications.searchByLocalAuthority('Liverpool');

    applications.expectReferences(found, ['APP-1001']);
  });
});
```

```gherkin
# tests/Grants.AcceptanceTests/Features/Applications/SearchApplications.feature
Feature: Search funding applications

  @spec-001 @AC-1
  Scenario: Only applications for the requested local authority are returned
    Given these applications have been submitted:
      | Reference | Local authority | Amount  |
      | APP-1001  | Liverpool       | 250000  |
      | APP-1002  | Leeds           | 120000  |
    When I search for applications in "Liverpool"
    Then only application "APP-1001" is returned
```

```csharp
// tests/Grants.AcceptanceTests/Steps/ApplicationSteps.cs — each step is one DSL call
[Binding]
public sealed class ApplicationSteps(ApplicationsDsl applications)
{
    private IReadOnlyList<ApplicationSummary> _found = [];

    [Given("these applications have been submitted:")]
    public Task GivenSubmitted(DataTable table) =>
        applications.GivenSubmitted(table.CreateSet<ApplicationDetails>());

    [When("I search for applications in {string}")]
    public async Task WhenISearch(string localAuthority) =>
        _found = await applications.SearchByLocalAuthority(localAuthority);

    [Then("only application {string} is returned")]
    public void ThenOnly(string reference) => applications.ExpectReferences(_found, reference);
}
```

## Layer 2 — DSL

**The vocabulary of the domain. It decides *what* happens and what counts as
success; the driver decides *how*.**

```ts
// test/acceptance/dsl/applications.dsl.ts
export class ApplicationsDsl {
  constructor(private readonly driver: () => ApplicationsDriver) {}

  async givenSubmitted(applications: readonly ApplicationDetails[]): Promise<void> {
    for (const application of applications) {
      await this.driver().submit(application);
    }
  }

  searchByLocalAuthority(localAuthority: string): Promise<readonly ApplicationSummary[]> {
    return this.driver().searchByLocalAuthority(localAuthority);
  }

  expectReferences(found: readonly ApplicationSummary[], references: readonly string[]): void {
    expect(found.map((a) => a.reference).sort()).toEqual([...references].sort());
  }
}
```

- One DSL class per business capability, reused by every scenario — when a
  flow changes, it changes in one place.
- Assertions live here, in domain terms, never in drivers.
- The DSL receives its driver lazily (`() => driver`) so scenarios can use it
  directly inside `describe`.

## Layer 3 — Protocol Drivers and Stubs

**The only layer that knows URLs, payloads, status codes and selectors. Every
driver implements the same contract, so scenarios run unchanged through the
API or the UI.**

```ts
// test/acceptance/drivers/applications.driver.ts
export interface ApplicationsDriver {
  submit(application: ApplicationDetails): Promise<void>;
  searchByLocalAuthority(localAuthority: string): Promise<readonly ApplicationSummary[]>;
}

// test/acceptance/drivers/api/applications.api-driver.ts
export class ApplicationsApiDriver implements ApplicationsDriver {
  constructor(private readonly target: Target) {}

  async submit(application: ApplicationDetails): Promise<void> {
    await request(this.target).post('/v1/funding-applications').send(application).expect(201);
  }
  // ...
}
```

- **API driver first.** It is fast and runs on every pull request.
- **UI driver** for products with a user interface: Playwright, following the
  Playwright standard. It implements the same contract, so no scenario
  changes.
- **Stubs** fake external systems (other products, third-party APIs):
  - In-process runs: replace the Infrastructure adapter through dependency
    injection (`ConfigureTestServices` in .NET, `overrideProvider` in NestJS)
    with a stub that implements the same Application-layer interface.
  - Deployed runs: point the deployed system at a stub service (WireMock.Net,
    or an equivalent HTTP stub) configured by the driver.

## Layer 4 — System Under Test

The product, unaware it is being tested: no test-only endpoints, flags or
branches in production code. Agents have full freedom here, within the
coding principles, as long as the locked specifications pass.

## Choosing the Driver

The same scenarios run in every stage; only configuration changes.

| Stage | Settings | Runs |
|---|---|---|
| Pull request | *(none)* | API driver against the app started in-process |
| After deploy to non-production | `ACCEPTANCE_BASE_URL=https://…` | API driver against the deployed environment |
| After deploy, products with a UI | `ACCEPTANCE_DRIVER=ui`, `ACCEPTANCE_BASE_URL=https://…` | UI driver (Playwright) against the deployed environment |

## Running

- NestJS: `npm run test:acceptance` (one criterion: `-- -t "spec-001 AC-1"`).
- .NET: `dotnet test tests/<Product>.AcceptanceTests` (one criterion:
  `--filter "Category=AC-1"`).
