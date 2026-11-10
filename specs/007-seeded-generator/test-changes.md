# Existing unit tests changed: spec-007

Each change was agreed with the owner before it was made (2026-11-10).

| File | Test | Requirement (FR-, AC-, SC- or task) | Why the test is obsolete |
|---|---|---|---|
| `src/catalogue/library.spec.ts` | lists every component by tier, in the design guide's order | T011, spec-003 AC-1, FR-701, FR-718, FR-719 | The approved catalogue lists gain Status bar and Workings strip (combined) and Today list (screens). No existing entry changes. |
| `src/catalogue/library.spec.ts` | says what each built combined component is built from | T011, FR-718, FR-719 | The two new combined components are listed with their parts. No existing entry changes. |
| `src/catalogue/library.spec.ts` | says what the play screen is built from | T011, FR-701, FR-719 | The play screen now includes the Status bar and the Workings strip, and Today list is a new screen. The other screens are unchanged. |
