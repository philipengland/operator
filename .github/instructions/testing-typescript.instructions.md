---
description: NestJS testing standards — Jest unit and integration tests, test levels, naming, determinism and flaky test handling
applyTo: '**/*.spec.ts,**/*.test.ts,**/*.e2e-spec.ts,**/*.acceptance-spec.ts,test/**/*.ts'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# TypeScript / NestJS Testing Standards

Tags show the quality dimension each rule supports: Quality, Security or Code Health. User-interface journeys run the same acceptance
scenarios through the Playwright UI driver (see the acceptance-tests and
Playwright standards).

## Tools and Layout

**Use Jest for unit and API integration tests in every NestJS product.** `[Quality]`

**Organise tests so a reader can go from any production file, or any acceptance criterion, straight to its tests.**

```
src/applications/domain/funding-application.ts
src/applications/domain/funding-application.spec.ts        # unit — next to the code
src/applications/application/search-applications.handler.spec.ts
test/integration/applications/applications.controller.e2e-spec.ts   # API integration — mirrors src
test/acceptance/                                           # acceptance — four layers (see acceptance-tests standard)
```

- **Unit tests sit next to the file they test,** named `<file>.spec.ts`.
- **API integration tests mirror `src/`** under `test/integration/`, named
  `<file>.e2e-spec.ts` (`npm run test:e2e`).
- **Acceptance tests follow the four-layer model** in the acceptance-tests
  standard: scenarios by business capability (`<behaviour>.acceptance-spec.ts`)
  and the DSL are approved by a human and locked; drivers and stubs are built
  during implementation (`npm run test:acceptance`).
- **Every test is written before the code it tests** (see the TDD standard).
  `specs/<feature>/tdd-log.md` traces each acceptance criterion to the unit
  tests written for it.

## Test Levels

| Level | Scope | Rules |
|---|---|---|
| Unit | One provider or function | Build with `Test.createTestingModule`; replace collaborators at boundaries with mocks. No network or database. |
| Integration | Nest app over HTTP | Start the app with `createNestApplication()`; call it with Supertest; use a real database in a Testcontainers container. |
| Acceptance | Spec acceptance criteria | Four layers (acceptance-tests standard): approved scenarios and DSL, run through API or UI drivers. |

## Acceptance Tests

Follow the **acceptance-tests standard**: scenarios (Layer 1) and the DSL
(Layer 2) are drafted by `/speckit.acceptance`, approved by a human and
locked; drivers and stubs (Layer 3) are built during implementation. Put the
spec and criterion in each `describe` — `[spec-001 AC-1] …` — and run one with
`npm run test:acceptance -- -t "spec-001 AC-1"`. Scenarios never contain
URLs, HTTP calls or status codes.

## Unit Tests

**`describe` the class, nested `describe` per method, `it` the scenario in plain English; Arrange / Act / Assert.**
*Why: test output reads Class › method › scenario, so anyone can see what each method is specified to do.*

```ts
describe('FundingApplication', () => {
  describe('submit', () => {
    it('rejects an incomplete application', () => {
      const application = buildApplication({ complete: false });

      const result = application.submit();

      expect(result.isSuccess).toBe(false);
    });

    it('marks a complete application as submitted', () => { /* ... */ });
  });
});
```

- One behaviour per test; use `it.each` for variations.
- Test unhappy paths: validation failures, not found, forbidden, dependency
  errors. `[Quality]`
- Reset mocks between tests (`clearMocks: true` in Jest config).

## Determinism and Flaky Tests

**Tests must be deterministic.** `[Quality]`

- No real timers or arbitrary waits: use `jest.useFakeTimers()` and inject a
  clock.
- Each test creates its own data; no dependence on run order.
- Always `await` async assertions (`await expect(...).rejects...`).

**A flaky test is a defect: quarantine it, raise a work item, and fix it.**
Rename it to `*.quarantine.spec.ts` with a comment giving the work item ID;
quarantined tests run in a separate, non-blocking job. Never add retries to
hide flakiness.

## Coverage

Coverage is collected with `--coverage` and reported in pull requests; the
threshold is enforced by the pipeline. No assertion-free tests.
