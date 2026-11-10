# TDD Log — Daily Puzzles, Seeded Generator and Presets (spec-007)

- **Spec**: `specs/007-seeded-generator/spec.md`
- **Baseline**: 2026-11-10, on `main` (`e906acf`): 369 unit, 48 engine and 329 phone tests, all passing. Lint and types clean;
  9.4 KB of JavaScript and 2.3 KB of CSS gzipped.

## Part 1: library additions (T004 to T015)

Scenarios that this part makes pass: `[spec-003 AC-1]` with the new lists. The approved vocabulary, driver interfaces, catalogue
lists and design documents came over unchanged from `509e556` (the same blobs as the approval, `514187c`), confirmed by blob.

**Acceptance RED** (`npm run test:acceptance:ui -- --project=catalogue-android -g "spec-003 AC-1]"`): the combined tier lacked
`"Status bar"` and `"Workings strip"` (`- Expected - 2`), the expected failure.

Each new piece was a failing unit test on its assertion, then the smallest code:

| Behaviour | RED | Commit |
| --- | --- | --- |
| Puzzle grid: workings shown elsewhere have no place in the grid, still heard | `expected [ { row: 2, column: 6 }, …(1) ] to deeply equal [ null, null ]` | `49bfe47` |
| Workings strip: a cell's row then column working | `expected { workings: [], text: '' } to deeply equal { …(2) }` | `41a2b3f` |
| Workings strip: a line of text in their place | `expected { workings: [], text: '' } to deeply equal { workings: [], …(1) }` | `41a2b3f` |
| Status bar: a region with a Today button heard as "Today's puzzles" | `expected { name: '', todayButton: { …(2) } } to deeply equal { name: 'Status bar', …(1) }` | `05d3f0d` |
| Today list: each choice a button, after a way back | `expected { …(2) } to deeply equal { back: { label: 'Back', …(1) }, …(1) }` | `c4c323e` |
| Play screen: the compact screen shows the Status bar and the strip | `expected { header: true, …(3) } to deeply equal { header: false, …(3) }` | `be4b845` |
| Play screen: the full screen with a Today button puts it beside the counter | `expected { header: true, …(3) } to deeply equal { header: true, …(3) }` | `be4b845` |

**Not a valid red, kept as a guard**: "on the full screen with no Today button, keeps the header and the counter alone, as before"
passed at once, from the second play-screen cycle; it pins the worked example's screen as it is.

**Found along the way, and corrected:**

- **The Today list's first test broke label-in-name** (WCAG 2.5.3): a row shown as "Easy · 1 of 4" but named "Easy, found 1 of 4".
  Corrected at RED, before any code: each row shows exactly what it is heard as.
- **The Workings strip is also built from Text**, for its prompt and the operator's line; the contract change lists Surface and
  Line working only, and is corrected when the contracts are updated (T013).
- **The play screen's complexity reached 11** with the Status bar; the counter or Status bar is now made by one helper.
