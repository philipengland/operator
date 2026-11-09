# Existing unit tests changed: spec-006

Each change was agreed with the owner before it was made (2026-11-09).

| File | Test | Requirement (FR-, AC-, SC- or task) | Why the test is obsolete |
|---|---|---|---|
| `src/app/solution-list.spec.ts` | heads the screen, with a way back and what an empty list says | T060, AC-1 | Rows can now always be opened, so `canOpenRows` is true without the `reopen` flag. |
| `src/app/solution-list.spec.ts` | can be opened once the story is released | T060, AC-7 | `solutionListProps` no longer takes the flag options, because the flag is removed. The behaviour checked is unchanged. Retitled "can be opened". |
| `src/app/solution-list.spec.ts` | offers "Start again" once released, when something has been found | T060, AC-11 | `solutionListProps` no longer takes the flag options, because the flag is removed. The behaviour checked is unchanged. Retitled without "once released". |
| `src/app/solution-list.spec.ts` | does not offer "Start again" with nothing found | T060, FR-608 | `solutionListProps` no longer takes the flag options, because the flag is removed. The behaviour checked is unchanged. |
