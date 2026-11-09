# Executable Specifications — Solution Log (spec-006)

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/006-solution-log/spec.md`

Scenarios run with Playwright Test, as for the earlier specs. Every spec-006 scenario is tagged `@ui`, because a
list, a view and saved data only exist in a browser. They run through the UI driver on iPhone SE (WebKit) and Pixel 5
(Chromium). AC-22, AC-23 and AC-24 are unit tests, as no puzzle can reach them through the game until F7.

**Releases** (plan, Release order): all files are approved together. Each Layer 1 file joins the pull request that
makes it pass, and the DSL additions and the change to spec-003's lists join the first.

**Flags**: `solution-list` is behind `log`, `reopen-solution` behind `reopen`, `start-again` behind `startAgain`, and
`remember-solutions` behind `remember`. While a flag is off, its file runs on the flags-on phones.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: the list before anything is found | "No calls yet, pal.", heard as "No solutions found yet" | `test/acceptance/play/solution-list.acceptance-spec.ts` |
| AC-2: a solution in the list | After Solution A, "Solution 1" | same |
| AC-3: in the order found | After A and B, "Solution 1" then "Solution 2" | same |
| AC-4: a repeat is not listed twice | Solution A put through twice shows one entry | same |
| AC-5: going back | Top-right 5 and its selection are unchanged | same |
| AC-5 | "Wrong number, pal!" stays, and nothing more is announced | same |
| AC-6: a screen reader | Heard as "Solution 1"; no accessibility problems | same |
| AC-25: the phone's back, from the list | Top-right 5 unchanged on the puzzle | same |
| Edge case | Reloading with the list open opens on the puzzle | same |
| AC-7: reopening | "Solution 1" shows the given 6, Solution A, every line reaching its target | `test/acceptance/play/reopen-solution.acceptance-spec.ts` |
| AC-8: cannot be changed | Tapping bottom-right and the Row 2 pill changes nothing; only "Back" can be tapped | same |
| AC-9: the grid is left alone | Top-right 5 and "1 of 2" unchanged | same |
| AC-10: a screen reader | Number, cells and lines heard; nothing offered to tap; no problems | same |
| AC-26: the phone's back, from a solution | The list shows | same |
| AC-27: numbers follow the order found | "Solution 2" shows Solution B | same |
| AC-11: changing your mind | "Keep them" leaves "Solution 1" | `test/acceptance/play/start-again.acceptance-spec.ts` |
| AC-12: clearing everything | "Yes, clear" empties the list, counter, grid and bubble | same |
| AC-13: finding it again | Solution A is a new solution, "1 of 2" | same |
| AC-28: a screen reader and the pop-up | Focus inside, only its two buttons reachable, no problems | same |
| AC-28 | "Keep them" returns focus to "Start again" | same |
| Edge case | With nothing found, "Start again" is not offered | same |
| Edge case | The phone's back closes the pop-up and clears nothing | same |
| Edge case | A double-tap on "Start again" does not confirm | same |
| AC-14: after a reload | Counter, Solution A, empty grid, greeting | `test/acceptance/play/remember-solutions.acceptance-spec.ts` |
| AC-15: closing and coming back | Counter reads 1 of 2 | same |
| AC-16: a repeat after a reload | "We've had that call, pal.", counter unchanged | same |
| AC-17: everything found | "All found! 2 of 2" after a reload | same |
| AC-18: starting again is remembered | 0 of 2 after a reload | same |
| AC-19: saving refused | Counted and listed; no error | same |
| AC-20: unreadable data | 0 of 2, and plays normally | same |
| AC-21: data that does not solve it | Of Solution A and a filling with top-right 9, only A | same |
| AC-22: another puzzle's log | Unit test, title `(spec-006 AC-22)` | `src/app/solution-store.spec.ts` |
| AC-23: 100 solutions | Unit test, "Found 3 of 100", title `(spec-006 AC-23)` | `src/app/session.spec.ts` |
| AC-24: over 100 solutions | Unit test, "Found 3", title `(spec-006 AC-24)` | `src/app/session.spec.ts` |

## Changes to spec-003's locked lists

`[spec-003 AC-1]` checks the exact components in each tier. The library gains four parts (plan research R12):

| File | Change |
| --- | --- |
| `test/acceptance/library/examples.ts` | `SIMPLE_COMPONENTS` gains `Dialog`; `COMBINED_COMPONENTS` gains `Confirm dialog` |
| `test/acceptance/library/simple-components.acceptance-spec.ts` | `Screens` is `Play screen`, `Solution list`, `Solution view` |
| `test/acceptance/dsl/catalogue-vocabulary.ts` | The three names added to its types |

## DSL Added or Changed

| Method | Purpose |
|---|---|
| `game.openSolutionList()` | The player taps the "Solutions found" counter |
| `game.goBack()` | The on-screen way back |
| `game.openSolution(solution)` | Opens "Solution 1" from the list |
| `game.tapInSolutionOn(place)` | Tries to change a cell or pill in the read-only view |
| `game.tapStartAgain()`, `doubleTapStartAgain()`, `confirmStartAgain()`, `keepSolutions()` | Starting again, and the pop-up's two answers |
| `game.expectOnPuzzle()`, `expectOnSolutionList()` | Which screen is showing |
| `game.expectSolutionListEmpty(shown, heardAs)` | The empty list, as seen and heard |
| `game.expectSolutionsListed(solutions)`, `expectSolutionsHeardAs(solutions)` | The list, in order, as seen and heard |
| `game.expectSolutionShown(solution, entry)` | The read-only view: the given 6, the entry, every line reaching its target |
| `game.expectSolutionHeardToInclude(phrases)` | What a screen reader hears on the view |
| `game.expectOnlyBackCanBeTapped()`, `expectStartAgainNotOffered()` | What can be tapped |
| `game.expectPopUp(question, buttons)`, `expectNoPopUp()`, `expectFocusOn(control)` | The pop-up and where focus goes |
| `phone.goBack()` | The phone's own back gesture |
| `phone.closeAndReopen()` | Closing the page and opening the game again |
| `phone.refuseSaving()`, `leaveUnreadableSavedData()`, `leaveSavedFillings(fillings)` | What is, or can be, saved on the phone |
| `phone.expectNoAccessibilityProblems()`, `expectNoErrorsOnThePage()` | No accessibility problems; no errors |
| Vocabulary: `SolutionName` | "Solution 1", "Solution 2" |
| Example: `notASolution` | Solution A with top-right 9 |

## Driver Interface Required

Signatures only. Implementations come with `/speckit-implement`:

- `test/acceptance/drivers/game.driver.ts` (`GameDriver`): `tapCounter`, `tapBack`, `tapSolution`, `tapInSolution`,
  `tapStartAgain`, `doubleTapStartAgain`, `tapPopUpButton`, `screenShowing`, `emptyList`, `solutionsShown`,
  `solutionsHeard`, `solutionView`, `solutionHeard`, `controlsOnScreen`, `popUp`, `focusedControl`; types
  `GameScreenName`, `SolutionView`, `PopUpView`.
- `test/acceptance/drivers/phone.driver.ts` (`PhoneDriver`): `goBack`, `closeAndReopen`, `refuseSaving`,
  `leaveUnreadableSavedData`, `leaveSavedFillings`, `accessibilityProblems`, `errorsOnThePage`.

## Approval

- **Approved by**: Philip England, product owner and solo developer
- **Date**: 2026-11-08
- **Locked files** (already covered by `.github/CODEOWNERS`: `**/*.acceptance-spec.ts`, `test/acceptance/dsl/` and the
  two `examples.ts` files):
  - Layer 1:
    - `test/acceptance/play/solution-list.acceptance-spec.ts` (new)
    - `test/acceptance/play/reopen-solution.acceptance-spec.ts` (new)
    - `test/acceptance/play/start-again.acceptance-spec.ts` (new)
    - `test/acceptance/play/remember-solutions.acceptance-spec.ts` (new)
    - `test/acceptance/play/examples.ts` (`notASolution` added)
    - `test/acceptance/library/simple-components.acceptance-spec.ts` (spec-003 AC-1's `Screens` list)
    - `test/acceptance/library/examples.ts` (spec-003's lists)
  - Layer 2 (additions above):
    - `test/acceptance/dsl/game.dsl.ts`
    - `test/acceptance/dsl/phone.dsl.ts`
    - `test/acceptance/dsl/vocabulary.ts`
    - `test/acceptance/dsl/catalogue-vocabulary.ts`
