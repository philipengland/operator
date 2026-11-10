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
- **The catalogue page scrolled sideways** (459 px wide at 375): two workings side by side in the strip were too wide.
  The strip now wraps.

**Catalogue lists (T011)**: three existing tests in `src/catalogue/library.spec.ts` were amended, with the owner's
agreement before the change, and recorded in `test-changes.md`. They failed on their assertions (the three lists lacked the
new names), then passed once `src/catalogue/library.ts` listed the new parts.

**Proving the fit (T012, research R9)**: measured in the catalogue with the widest pills and workings each grid can show.
The first measurement did not fit: Hard 66 px over at 375 × 667, Medium 58 px over at 320 × 568, and Hard's column pills
overlapped. Asked, the owner chose to squeeze harder before changing the spec. A compact density token set, a wrapping
strip, hidden workings that take no room and stacked column pills then gave:

| Grid | 375 × 667 | 320 × 568 |
| --- | --- | --- |
| Medium, 5 × 4 | 561: fits | 559: fits |
| Hard, 7 × 5 | 666: fits, 1 px spare | scrolls up and down only, 320 wide |

The same in Chromium and WebKit. Everything tappable is at least 44 × 44. The scenarios that prove it in the game are
AC-12 and AC-16, in parts 3 and 4.

**A driver corrected**: the catalogue driver listed every region in a tier as a component, so the Status bar's samples
(each a region "Status bar") were counted. It now lists only components' own regions, those with a heading (`74bdf05`).

**Acceptance GREEN**: `[spec-003 AC-1]` and every catalogue scenario pass on both phones. Full suite: 377 unit, 48 engine
and 329 phone tests pass. In one full run, spec-001 AC-16 timed out on the iPhone waiting for the Check button to be
stable; it passed alone three times and in a second full run, so it is noted, not changed. JavaScript 9.96 KB and CSS
2.51 KB gzipped.

**Noticed for later**: a Target pill shows a negative target with a hyphen ("− -480"), where the game writes the minus
sign elsewhere. Hard (part 4) shows negative targets, so it is fixed there.

**Commits**: `7bba210` vocabulary and stubs, `49bfe47` grid, `41a2b3f` strip, `05d3f0d` status bar, `c4c323e` Today
list, `be4b845` play screen, `74bdf05` driver, `b67f3c6` compact density, `3d50ff8` catalogue, `d31c2a3` contracts,
research and brief.
