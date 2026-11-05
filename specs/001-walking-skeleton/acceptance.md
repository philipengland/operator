# Executable Specifications — Walking Skeleton (F0)

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/001-walking-skeleton/spec.md`

Scenarios run with Playwright Test. Untagged scenarios run through both the in-process
driver and the Playwright UI driver. `@ui` scenarios need a real page and run through the UI
driver only. `@after-publish` runs once the pipeline has published. `@budget` runs on the
Chromium (Android) project only. Shared example entries are in `test/acceptance/play/examples.ts`,
copied from the spec's examples table.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: the opening grid | Shows the given 6, three empty cells, the targets, the shown operators and "Found 0 of 2" | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-1 | Shows each row target on the left and each column target above (`@ui`) | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-2: tapping an empty cell | One tap shows 1, and six more show 7 | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-3: clearing a cell | Tapping a cell that shows 9 empties it | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-4: the given cell | Tapping the given 6 leaves it showing 6 | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-4 | The given 6 looks different from a changeable cell, not by colour alone (`@ui`) | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-5: only 1 to 9 or nothing | Ten taps show 1 to 9 in order and then empty, never 0 | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-6: choosing an open operator | Five taps on Row 2 show +, −, ×, ÷ and then + again | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-7: shown operators cannot change | Tapping Row 1's + leaves it as + | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-7 | Tapping Column 2's × leaves it as × | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-8: a correct grid | Solution A is accepted and the counter reads "Found 1 of 2" | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-9: below zero | Bottom-left 9 meets Row 2 but Column 1 goes below zero, so not solved | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-10: inexact division | Column 1 gives 6 ÷ 4, so not solved | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-11: checking too early | With bottom-right empty, the game asks for everything to be filled first | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-11 | With Column 1's operator not chosen, the game asks for everything to be filled first | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-20: the message goes once the grid changes | Tapping bottom-left after "not solved yet" removes the message silently | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-20 | Tapping the given 6 after "not solved yet" leaves the message in place | `test/acceptance/play/solve-puzzle.acceptance-spec.ts` |
| AC-12: a second, different solution | Solution B after A is new, every solution is found, "Found 2 of 2" | `test/acceptance/play/find-solutions.acceptance-spec.ts` |
| AC-13: the same solution twice | Solution A again is already found, counter stays at "Found 1 of 2" | `test/acceptance/play/find-solutions.acceptance-spec.ts` |
| AC-14: a found solution after all are found | Solution B again leaves the counter at "Found 2 of 2" | `test/acceptance/play/find-solutions.acceptance-spec.ts` |
| AC-15: order does not matter | Solution A after B finds every solution, "Found 2 of 2" | `test/acceptance/play/find-solutions.acceptance-spec.ts` |
| AC-16: the grid stays filled | After Solution A is accepted, the player's digits and operators are still in place | `test/acceptance/play/find-solutions.acceptance-spec.ts` |
| AC-17: a merged change goes live | Once the pipeline finishes, the public address serves the merged version (`@after-publish`) | `test/acceptance/delivery/publish.acceptance-spec.ts` |
| AC-18: playing with no connection | With no connection, Solution A is still accepted, "Found 1 of 2" (`@ui`) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| AC-18 | Playing to a solution makes no network requests after the game opens (`@ui`, FR-016) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| AC-19: a failed change never goes live | Only changes merged to main are published | `test/acceptance/delivery/publish.acceptance-spec.ts` |
| AC-19 | Publishing happens only after the build, unit tests and acceptance tests succeed | `test/acceptance/delivery/publish.acceptance-spec.ts` |
| AC-21: reloading with no connection | After opening once, reloading with no connection does not load the game (`@ui`) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| Edge case: small screens | On 320 × 568, everything needed to play is visible without scrolling (`@ui`) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| Edge case: small screens | On 375 × 667, everything needed to play is visible without scrolling (`@ui`) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |
| SC-003, SC-004: speed | Ready within 3 s, every tap answered within 0.1 s, on the reference phone over 4G (`@ui`, `@budget`) | `test/acceptance/play/play-on-a-phone.acceptance-spec.ts` |

**Checked by hand, not by these scenarios** (recorded in `tdd-log.md`, see
[quickstart.md](quickstart.md) section 6):

- **AC-19**: after the first failing pipeline run on `main`, confirm the public address
  still serves the previous version.
- **Edge case**: nothing sits under a notch, rounded corner or home indicator, on real
  phones.
- **SC-001, SC-002, SC-006**: playtests, real devices, VoiceOver and TalkBack.

Accessibility scans (axe, WCAG 2.2 AA) run automatically on every page the UI driver
visits, as the Playwright standard requires. They live in the driver, not in these scenarios.

## DSL Added or Changed

| Method | Purpose |
|---|---|
| `game.open()` | Opens the game fresh. |
| `game.tapCell(cell, times?)` | Taps a cell once, or several times. |
| `game.tapOperator(line, times?)` | Taps a line's operator once, or several times. |
| `game.fillCell(cell, value)` | Taps a cell until it shows the value. Fails if the value can't be reached. |
| `game.chooseOperator(line, choice)` | Taps an operator until it shows the choice. |
| `game.fillIn(entry)` | Fills the three cells and two open operators to match an entry. |
| `game.check()` | Presses Check. |
| `game.fillInAndCheck(entry)` | Fills in an entry, then presses Check. |
| `game.announcementsSoFar()` | How many announcements screen-reader users have heard. |
| `game.expectCell(cell, value)` | A changeable cell shows the value (a digit or empty). |
| `game.expectEmptyCells(cells)` | Each listed changeable cell is empty. |
| `game.expectGivenCell(cell, digit)` | A cell is given and shows the digit. |
| `game.expectTappingCellShows(cell, values)` | Each tap shows the next value in the list. |
| `game.expectTargets(targets)` | Every row and column shows its target. |
| `game.expectShownOperator(line, operator)` | A line's operator is shown (fixed) and is the operator. |
| `game.expectOpenOperator(line, choice)` | A line's operator is open and shows the choice, or "not chosen". |
| `game.expectTappingOperatorShows(line, operators)` | Each tap shows the next operator in the list. |
| `game.expectEntryShown(entry)` | The grid still shows the entry's digits and operators. |
| `game.expectGameSays(result)` | The game's message is this result. |
| `game.expectGameSaysNothing()` | No message is showing. |
| `game.expectCounter(text)` | The counter reads exactly this, e.g. "Found 1 of 2". |
| `game.expectAnnouncementsStillAt(count)` | Nothing new has been announced. |
| `phone.useScreen(width, height)` | Uses a screen of this size before opening. |
| `phone.useReferencePhoneOn4G()` | Behaves like the 2023 mid-range reference phone on 4G. |
| `phone.loseConnection()` | Cuts the phone's connection. |
| `phone.reload()` | Reloads the page. |
| `phone.expectGameNotShowing()` | The game did not load. |
| `phone.expectNoNetworkRequestsSinceOpening()` | Nothing was fetched after the game opened. |
| `phone.expectGivenCellStandsOut(given, changeable)` | The given cell is marked differently, not by colour alone. |
| `phone.expectRowTargetsOnTheLeft()` | Each row's target is to the left of, and level with, its cells. |
| `phone.expectColumnTargetsAbove()` | Each column's target is above, and in line with, its cells. |
| `phone.expectEverythingOnScreen()` | Grid, targets, operators, counter and Check are visible without scrolling. |
| `phone.expectReadyToPlayWithin(seconds)` | Ready-to-play time is within budget. |
| `phone.expectEveryTapAnsweredWithin(milliseconds)` | The slowest tap is within budget. |
| `delivery.expectPublicAddressServesMergedVersion()` | The public address serves the version just merged. |
| `delivery.expectPublishingOnlyFrom(branches)` | Only these branches can publish. |
| `delivery.expectPublishingOnlyAfter(stages)` | These stages must succeed before publishing. |

The words the scenarios use (cells, lines, digits, operators, results, entries) are in
`test/acceptance/dsl/vocabulary.ts`.

## Driver Interface Required

Layer 3 contracts, signatures only. `/speckit-implement` builds the drivers.

- `test/acceptance/drivers/game.driver.ts`: `GameDriver`, implemented by the in-process
  driver (over the session module) and the Playwright UI driver.
  - `open()`, `tapCell(cell)`, `tapOperator(line)`, `check()`, `view(): GameView`,
    `announcementCount(): number`.
- `test/acceptance/drivers/phone.driver.ts`: `PhoneDriver`, implemented by the Playwright
  UI driver only.
  - `useScreen(size)`, `useReferencePhoneOn4G()`, `loseConnection()`, `reload()`,
    `isGameShowing()`, `networkRequestsSinceOpening()`, `look(cell): CellLook`,
    `layout(): ScreenLayout`, `secondsUntilReadyToPlay()`,
    `tapResponseTimesInMilliseconds()`.
- `test/acceptance/drivers/delivery.driver.ts`: `DeliveryDriver`, which reads the
  workflow and the public address.
  - `mergedVersion()`, `versionAtPublicAddress()`, `publishingRoute(): PublishingRoute`.
- `test/acceptance/support/acceptance.ts`: Playwright fixtures `game`, `phone` and
  `delivery`, choosing the driver from `ACCEPTANCE_DRIVER`.

## Approval

- **Approved by**: Philip England, product owner and solo developer
- **Date**: 2026-11-02
- **Locked files**:
  - Layer 1 (scenarios and examples):
    - `test/acceptance/play/solve-puzzle.acceptance-spec.ts`
    - `test/acceptance/play/find-solutions.acceptance-spec.ts`
    - `test/acceptance/play/play-on-a-phone.acceptance-spec.ts`
    - `test/acceptance/delivery/publish.acceptance-spec.ts`
    - `test/acceptance/play/examples.ts`
  - Layer 2 (DSL):
    - `test/acceptance/dsl/game.dsl.ts`
    - `test/acceptance/dsl/phone.dsl.ts`
    - `test/acceptance/dsl/delivery.dsl.ts`
    - `test/acceptance/dsl/vocabulary.ts`

Not locked (Layer 3, built and changed by `/speckit-implement`): `test/acceptance/drivers/`,
`test/acceptance/support/`.

## Amendments

- **2026-11-05, AC-9 wording** — approved by Philip England with spec-002's executable
  specifications ([spec-002 acceptance.md](../002-live-calculations/acceptance.md)). The test
  title and the `belowZero` comment now give the reason as "6 − 9 = −3, not its target of 3",
  since spec-002 FR-208 allows results below zero. Steps and assertions unchanged.
