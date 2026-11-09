# Research: Solution Log (spec-006)

**Date**: 2026-11-08. Each section gives the decision, why, and what else was considered.

## R1. Where solutions are saved

**Decision**: the browser's `localStorage`, behind a small two-method store (`read`, `write`) that
`main.ts` supplies. Only that store touches the browser.

**Why**: one small record per puzzle, read once on opening, so a synchronous key-value store is
enough. It needs no dependency. The store being passed in means the rest is tested in Node, and F13
can supply a different store if the store apps need one.

**Alternatives**: IndexedDB (asynchronous and much more code, for a few kilobytes); cookies (sent to
the server, and the game sends nothing).

## R2. The saved format (FR-613, FR-614)

**Decision**: one key per puzzle, `operator.solutions.<puzzle id>`, holding
`{ "format": 1, "solutions": [ <Entry>, … ] }`. Solutions are in the order found, each the engine's
`Entry` (cells and chosen operators).

- **`Puzzle` gains `id`**: the fixed puzzle's is `worked-example`. A seeded puzzle's id will be built
  from its seed and settings (F7). The id is only ever a string, so seeded puzzles simply add new keys
  and nothing already saved moves. That is the "no migration" the owner asked for.
- `Entry` already holds cells as rows and columns, so it fits every grid size up to 8 × 6.
- The `operator.` prefix matters because `localStorage` belongs to the whole
  `philipengland.github.io` origin, shared with any other project pages on the account.

**Alternatives**: one key for all puzzles (every save rewrites everything, and a corrupt record loses
every puzzle); saving the solution's key string (it would have to be parsed back, and its layout is
private to the engine).

## R3. Saved data is not trusted (FR-611, FR-612)

**Decision**: reading goes through a pure `decode`: it checks the shape (grid size, digits 1–9, known
operators), then runs each entry through the engine's `checkEntry`, keeping only `solved` ones and
dropping duplicates by their key. Anything else is ignored, without an error.

**Why**: constitution II says a solution is checked by calculating its lines. It also covers a puzzle
whose definition changes. The list shows only numbers and the view shows validated digits, so saved
text never reaches the page.

## R4. Writing (FR-609, FR-612, two tabs)

**Decision**: when a new solution is found: read the record, add that one solution, write it back.
"Start again" removes this puzzle's key.

- Adding only the new solution means another tab's solutions are kept, and one that started again is
  not undone.
- **A record with a newer `format` is left alone.** An older build, after a rollback, plays for the
  session without saving, so it cannot destroy newer data. Unreadable data is overwritten by the next
  save (AC-20).
- Every browser call is in a `try`/`catch` in the store: reading can throw in some private modes.

## R5. The session

**Decision**: `found` stays as it is, and `solutions` sits beside it, holding each entry in the order found.
The owner chose this on 2026-11-09, so that existing tests of `found` are not amended. The session gains
`place` (`play`, `list` or a solution number) and `isConfirming`. Actions `openList`, `openSolution`, `showPlace`,
`askToStartAgain`, `startAgain` and `keepSolutions` stay pure.

## R6. Three screens in one page

**Decision**: the play screen stays in the page, hidden, while the list or a solution is shown. There is
no router or framework.

**Why**: nothing about the game is lost, and it stays within ADR 0002.

## R7. The phone's back gesture (FR-604)

**Decision**: opening the list, a solution or the pop-up adds a browser history entry (`pushState`). The
on-screen way back calls `history.back()`, so there is a single route, and `popstate` sets `place`. On
opening, the game replaces the current entry with the play screen.

**Accepted**: after reloading on the list, one press of back does nothing visible, because the old entry
is still behind it. Nothing is lost.

## R8. The counter as something to tap (FR-601)

**Decision**: `Surface` gains an optional tap action, and renders as a real `<button>` when it has one.
The counter passes it through.

**Why**: the counter's look and its parts are unchanged, its spoken name stays "Found 1 of 2", and its
locked "built from" list stays correct. A `<button>` can hold the counter's spans. Styles stay in the
simple tier, as `tools/ui-tiers.spec.ts` requires.

## R9. The read-only view (FR-606, AC-8, AC-10)

**Decision**: `playScreenProps`' grid mapping is reused with the found entry. The view passes
`isReadOnly`, which makes each cell a plain element with the same look and a text name instead of a
`<button>`. Open pills are shown as shown pills with the player's operator. The helper line is empty.

**Why**: the look and the workings come free, and it is the same mapping as the live grid. `inert` was
rejected because it also hides the content from screen readers.

## R10. The pop-up (FR-608, AC-28)

**Decision**: a new simple component, Dialog, on the native `<dialog>` with `showModal()`, inside a
combined Confirm dialog.

**Why**: the browser provides the focus trap, the inert background and the return of focus, which are
the error-prone parts. It is available in every browser the game supports. The backdrop's colour is
declared in the simple tier, as the tier rules require. "Yes, clear" is placed in the dialog, away from
where "Start again" sits, so a double-tap cannot confirm.

## R11. Where a screen reader goes

**Decision**: on arriving at the list or a solution, focus moves to its heading. Going back returns it
to what opened that screen: the counter or the row. This closes the item deferred from clarification.

## R12. The catalogue's locked lists

**Finding**: spec-003's `[AC-1]` scenario checks the exact components in each tier, and `Screens` is
exactly `['Play screen']`. Listing new components would fail it, and the library must list everything.

**Decision**: the smallest set of new parts: **Dialog** (simple), **Confirm dialog** (combined), **Solution
list** and **Solution view** (screens). The change to `examples.ts` and that scenario needs the owner's
approval at `/speckit-acceptance`. Rows use the existing Button.

## R13. Flags and scenarios

**Decision**: one flag per story, `log`, `reopen`, `startAgain` and `remember`, with one scenario file per
story, so the existing rule in `playwright.config.ts` applies. Off means:

| Flag | Off |
| --- | --- |
| `log` | The counter is not a button |
| `reopen` | Rows are text, not buttons |
| `startAgain` | "Start again" is not shown |
| `remember` | Nothing is read or written |

User Story 5 has no flag, as constitution VII allows when recorded: no puzzle reaches it until F7.

## R14. Very large totals (FR-616)

**Decision**: `counterText` and the screen's counter leave out the total when it is over 100. The library
already shows a count with no total. AC-23 and AC-24 are unit tests, as no playable puzzle has such a
total yet.

## R15. Testing saved data

**Decision**: the UI driver sets up saved data before the page loads (`addInitScript`), and for AC-19
makes saving throw, which is what a refused write does in a browser. AC-22 is a unit test, as the game has
one puzzle.

## R16. Safari's clearing of saved data

As found for spec-005: WebKit announced in 2020 that script-writable storage is deleted after seven days of
Safari use without interaction with the site. No current source confirmed it is unchanged. It is recorded
as an assumption in the spec.
