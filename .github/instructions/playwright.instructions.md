---
description: Playwright as the Layer 3 UI driver for acceptance scenarios — locators, waiting, isolation, authentication, accessibility scans
applyTo: '**/drivers/ui/**,**/Drivers/Ui/**,playwright.config.ts'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# Playwright UI Drivers

Playwright is the **Layer 3 UI driver** in the four-layer acceptance model
(see the acceptance-tests standard). It drives the **same approved
scenarios** as the API driver, through the user interface, so there is no
separate end-to-end test suite to keep in step. Use `playwright` in
TypeScript and `Microsoft.Playwright` in .NET. Tags show the quality dimension each rule supports: Quality, Security or Code Health.

## Scope

**A UI driver implements the same driver contract as the API driver, and contains no assertions about business outcomes.**
*Why: scenarios and the DSL decide what success means; the driver only performs actions and reads back what the user would see.* `[Quality]`

```
test/acceptance/drivers/ui/applications.ui-driver.ts      # NestJS
tests/<Product>.AcceptanceTests/Drivers/Ui/UiApplicationsDriver.cs   # .NET
```

UI drivers run after deployment to a non-production environment
(`ACCEPTANCE_DRIVER=ui`, `ACCEPTANCE_BASE_URL=…`), not on every pull request.

## Locators

**Locate elements the way users do: `getByRole`, `getByLabel`, `getByText`. Fall back to `getByTestId` only when there is no accessible name.**
*Why: user-facing locators survive refactoring and double as a basic accessibility check.*

```ts
// Avoid
await this.page.locator('#app > div:nth-child(3) .btn-primary').click();

// Prefer
await this.page.getByRole('button', { name: 'Submit application' }).click();
```

## Waiting

**Wait for what the user would see; never wait for a fixed time.**
*Why: `waitForTimeout` is the main source of flaky and slow UI tests.* `[Quality]`

```ts
// Avoid
await this.page.waitForTimeout(3000);

// Prefer
await this.page.getByRole('status').filter({ hasText: 'Application submitted' }).waitFor();
```

## Isolation and Data

- Each scenario creates the data it needs through the DSL; drivers never rely
  on data left by another scenario or on run order.
- Authenticate once per role and reuse the saved storage state; do not log in
  through the UI for every scenario.
- Never hard-code real credentials. Test accounts come from pipeline secrets
  or Key Vault. `[Security]`
- Run against non-production environments only.

## Accessibility

**Every page a UI driver visits is scanned with axe (`@axe-core/playwright` in TypeScript, `Deque.AxeCore.Playwright` in .NET), and violations fail the run.**
*Why: every user journey in the acceptance suite becomes an accessibility check, with no separate suite to maintain.* `[Quality]`

Put the scan in one helper the driver calls after each navigation, using the
`wcag2a`, `wcag2aa` and `wcag22aa` tags.

## Flakiness

- Record traces on first retry; retries are allowed in CI only to collect
  diagnostics, never to pass a flaky scenario.
- A scenario that passes only on retry is flaky: raise a work item and fix the
  driver. Never edit the scenario to work around the UI.
