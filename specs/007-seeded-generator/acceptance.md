# Executable Specifications — Daily Puzzles, Seeded Generator and Presets (spec-007)

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/007-seeded-generator/spec.md`

Scenarios run with Playwright Test, as for the earlier specs. Those without a tag run on the engine driver and on
both phones (iPhone SE on WebKit, Pixel 5 on Chromium); those tagged `@ui` run on the phones only, because they need
a screen, a reload or saved data. The phone's date is set by the scenario ("10 November 2026"), so every run sees the
same puzzles.

**Unit tests, not scenarios**: AC-3, AC-5, AC-11 and AC-15 check every date of 2027 against the presets, which is
a rule on the engine's output and too many puzzles to play through a phone (plan R12). They are unit tests in
`src/engine/`, titled `(spec-007 AC-n)`.

**Releases** (plan, Release order): all files are approved together. Each Layer 1 file joins the pull request that
makes it pass. The DSL, the vocabulary, the driver interface and the change to spec-003's lists join the first.

**Flags**: `daily-easy` is behind `daily`, `medium-and-collector` behind `presets`, `hard` behind `hard`, and
`new-day` behind `newDay`. While a flag is off, its file runs on the flags-on phones.

**Days that depend on the generator**: AC-10 needs a Collector puzzle with more than 100 solutions, which cannot be
known before the generator exists, so the scenario takes the first day from 10 November 2026 that has one (about 19
in 20 Collector puzzles do, research R3). Every other scenario uses 10 or 11 November 2026 directly.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: today's Easy puzzle | From the worked example: 3 × 3, every operator shown, from +, −, × and ÷, 4 or 5 given, targets 1 to 100, "Found 0 of M" with M 1 to 10, empty grid | `test/acceptance/play/daily-easy.acceptance-spec.ts` |
| AC-1 | The Today screen and the puzzle have no accessibility problems (`@ui`) | same |
| AC-2: the same puzzle everywhere | Easy for 10 November, made twice, is the same, and the same as the engine alone makes; run on the engine, the iPhone and the Android phone | same |
| AC-4: the filling it was made from | Accepted, and the counter reads "Found 1 of M" | same |
| AC-6: the theme | Easy for 10 November is shown in its seed's theme (`@ui`) | same |
| AC-7: a new puzzle each day | Easy for 11 November differs from Easy for 10 November | same |
| AC-22: Practice | After Solution A and a visit to Easy, the Today screen says "Practice, found 1"; Practice opens the worked example at "Found 1 of 2" with Solution A in its list | same |
| AC-8: Medium | 5 × 4, only +, −, × and ÷, 4 or 5 lines open, 10 given, targets 1 to 100, M 2 to 20 | `test/acceptance/play/medium-and-collector.acceptance-spec.ts` |
| AC-9: Collector | 4 × 3, all 7 lines open, none given, targets −29 to 29 and not 0, M 21 or more | same |
| AC-10: more than 100 | On the first day from 10 November with more than 100: after 3 found, "Found 3", and never "All found!" | same |
| AC-12: fitting the screen | Collector at 375 × 667 and 320 × 568, and Medium at 375 × 667: puzzle, keypad and button on screen with no scrolling. Medium at 320 × 568: scrolls up and down only. Collector: everything to tap at least 44 × 44. Medium: cells at least 36 × 36, everything else 44 × 44. No accessibility problems (`@ui`, four scenarios; amended 2026-11-12) | same |
| AC-13: switching | Easy keeps "Found 1" and "Solution 1" after a visit to Medium (which is at "Found 0"), with an empty grid | same |
| AC-14: Hard | The Today screen lists Easy, Medium, Hard, Collector, Practice; Hard is 7 × 5, 1 or 2 lines open, 21 or 22 given, targets −500 to 500 and not 0, M 1 to 3 | `test/acceptance/play/hard.acceptance-spec.ts` |
| AC-16: Hard at 375 × 667 | Fits with no scrolling; cells at least 36 × 36, everything else to tap 44 × 44; no accessibility problems (`@ui`; amended 2026-11-12) | same |
| AC-16: Hard at 320 × 568 | Scrolls up and down only, never sideways; cells at least 36 × 36, everything else to tap 44 × 44; no accessibility problems (`@ui`; amended 2026-11-12) | same |
| AC-23: results beside lines | Medium for 10 November: "?" at every row's right and below every column; after its own filling is checked, each line's target with a tick (`@ui`; added 2026-11-12) | `test/acceptance/play/medium-and-collector.acceptance-spec.ts` |
| AC-17: Hard's speed | On the reference phone, ready within 1 second of choosing it (`@ui`, `@budget`, Android) | same |
| AC-18: the same day | After a reload, and after closing and coming back, Medium opens at "Found 1" with an empty grid (`@ui`) | `test/acceptance/play/new-day.acceptance-spec.ts` |
| AC-19: the next day | On 11 November, a different Medium at "Found 0"; Practice keeps "Found 1 of 2"; back on 10 November, the same Medium as before at "Found 0" (`@ui`) | same |
| AC-20: a phone that has never played | Opens the worked example at "Found 0 of 2" | same |
| AC-21: an unreadable record | 10 November's Easy opens, and no error appears (`@ui`) | same |
| AC-3, AC-5 | Every date of 2027 with Easy matches the preset, is solved by its filling, and its count equals the count by trying every filling | `src/engine/sweep-easy.spec.ts` (unit) |
| AC-11 | Every date of 2027 with Medium, and with Collector | `src/engine/sweep-medium.spec.ts`, `sweep-collector.spec.ts` (unit) |
| AC-15 | Every date of 2027 with Hard | `src/engine/sweep-hard.spec.ts` (unit) |

## DSL Added or Changed

| Method | Purpose |
|---|---|
| `daily.setPhoneDate(day)` | The phone's own calendar date, "10 November 2026" |
| `daily.openTodayScreen()`, `daily.choose(choice)`, `daily.open(choice)` | The Today screen, and choosing Easy, Medium, Hard, Collector or Practice |
| `daily.expectTodayLists(choices)`, `daily.expectTodayRowFound(choice, n)` | What the Today screen lists, and a row heard with its count |
| `daily.expectWorkedExampleShowing()` | The worked example is on the play screen |
| `daily.expectPuzzle(preset, rows, columns)` | Heard as "Easy puzzle, 3 by 3", with that many rows and columns |
| `daily.expectEveryOperatorShown()`, `expectEveryOperatorOpen()`, `expectOpenLines(fewest, most)` | Which lines show their operator |
| `daily.expectOperatorsOnlyFrom(operators)` | Every shown operator is one the preset allows |
| `daily.expectGivenCells(fewest, most)` | How many cells are given |
| `daily.expectTargetsFrom(lowest, highest)` | Every target whole, in range and not 0 |
| `daily.expectSolutionTotalFrom(fewest, most?)`, `expectSolutionTotalOver100()` | The counter's total M; "Found N" alone means more than 100 |
| `daily.expectFound(n)`, `daily.expectNeverAllFound()` | The counter's found count, and never complete when capped |
| `daily.expectEmptyGrid()` | Every cell the player fills is empty |
| `daily.enterTheFillingItWasMadeFromAndCheck()`, `daily.findSolutions(n)` | Putting through the puzzle's own filling, or its first n solutions |
| `daily.rememberThisPuzzle()`, `expectSamePuzzleAsRemembered()`, `expectDifferentPuzzleFromRemembered()` | Comparing puzzles across reopening and days |
| `daily.expectSameAsTheEngineAloneMakes(day, preset)` | The game shows what the engine alone makes for that day and preset |
| `daily.expectThemeOfItsSeed()` | The theme worked out from the puzzle's seed (spec-003) |
| `daily.openFirstDayWithMoreThan100(preset, from)` | Moves the phone's date day by day to the first puzzle with more than 100 solutions |
| `daily.expectOpensWithin(choice, seconds)` | Speed of opening a puzzle from the Today screen |
| `phone.expectDailyPuzzleFitsWithoutScrolling()` | Puzzle, keypad and main button on screen, and the page no larger than the screen |
| `phone.expectDailyPuzzleScrollsOnlyUpAndDown()` | Nothing wider than the screen |
| `phone.expectEveryTapTargetAtLeast(pixels)` | Every cell, pill, key and the main button at least that size |
| `phone.leaveUnreadableRecordOfLastPuzzle()` | Before opening: a record of the last puzzle played that makes no sense |
| Vocabulary (`dsl/daily-vocabulary.ts`) | `Preset`, `TodayChoice`, `CalendarDay`, `DailyPuzzle`, `DailyCell`, `DailyLine`, `TodayRow`, `PhoneSize` |
| Catalogue lists | `Status bar` and `Workings strip` join the combined components; `Today list` joins the screens (spec-003 AC-1) |

## Driver Interface Required

`test/acceptance/drivers/daily.driver.ts` (new, signatures only): `setDate`, `tapToday`, `todayRows`, `tapTodayRow`,
`puzzle`, `isWorkedExampleShowing`, `counterTitle`, `counter`, `enterBuiltFromFillingAndCheck`,
`enterSolutionsAndCheck`, `madeByTheEngineAlone`, `themeShown`, `themeForThePuzzlesSeed`, `secondsToOpen`.

`test/acceptance/drivers/phone.driver.ts` (changed): `dailyLayout`, `leaveUnreadableRecordOfLastPuzzle`.

Layer 3 adds the `daily` fixture in `test/acceptance/support/acceptance.ts`, an engine and a UI daily driver, and the
two phone methods. Until then the new files cannot load ("Test has unknown parameter daily"), which is why each joins
the pull request that builds its drivers.

## Approval

- **Approved by**: Philip England
- **Date**: 2026-11-10
- **Locked files**:
  - `test/acceptance/play/daily-easy.acceptance-spec.ts`
  - `test/acceptance/play/medium-and-collector.acceptance-spec.ts`
  - `test/acceptance/play/hard.acceptance-spec.ts`
  - `test/acceptance/play/new-day.acceptance-spec.ts`
  - `test/acceptance/play/daily-examples.ts`
  - `test/acceptance/dsl/daily.dsl.ts`
  - `test/acceptance/dsl/daily-vocabulary.ts`
  - `test/acceptance/dsl/phone.dsl.ts` (the daily layout methods and `leaveUnreadableRecordOfLastPuzzle`)
  - `test/acceptance/dsl/catalogue-vocabulary.ts`, `test/acceptance/library/examples.ts` and
    `test/acceptance/library/simple-components.acceptance-spec.ts` (spec-003's lists gain `Status bar`,
    `Workings strip` and `Today list`)

### Amendment 2026-11-10: every operator on every difficulty

- **Approved by**: Philip England, 2026-11-10, before Easy was released (spec Clarifications; FR-705).
- **Changes**:
  - `test/acceptance/play/daily-easy.acceptance-spec.ts`, AC-1: the title reads "from +, −, × and ÷" and "targets 1 to 100";
    `expectOperatorsOnlyFrom(['+', '−', '×', '÷'])` and `expectTargetsFrom(1, 100)`.
  - `test/acceptance/play/medium-and-collector.acceptance-spec.ts`, AC-8: the title reads "only +, −, × and ÷";
    `expectOperatorsOnlyFrom(['+', '−', '×', '÷'])`. Applied when part 3 brings the file in from `514187c` (task T034).
- The DSL is unchanged.

### Amendment 2026-11-12: results beside each line, the header back, and smaller cells on Medium and Hard

- **Approved by**: Philip England, 2026-11-12 (spec Clarifications, Sessions 2026-11-11 and 2026-11-12; FR-713, FR-718,
  FR-719, FR-720, AC-12, AC-16, AC-23; exception EXC-007).
- **Changes**:
  - `test/acceptance/play/medium-and-collector.acceptance-spec.ts`, AC-12: Collector's two scenarios are unchanged.
    Medium at 375 × 667 still fits with no scrolling; Medium at 320 × 568 now scrolls up and down only, never
    sideways. Medium's cells are checked at 36 × 36, everything else to tap at 44 × 44.
  - `test/acceptance/play/hard.acceptance-spec.ts`, AC-16: at both sizes, cells are checked at 36 × 36 and
    everything else to tap at 44 × 44. Fitting and scrolling are unchanged.
  - `test/acceptance/dsl/phone.dsl.ts`: `phone.expectEveryCellAtLeast(pixels)` and
    `phone.expectEveryTapTargetOtherThanCellsAtLeast(pixels)`. `expectEveryTapTargetAtLeast` stays, for Collector.
  - `test/acceptance/play/medium-and-collector.acceptance-spec.ts`: a new scenario, `[spec-007 AC-23]` (`@ui`). On
    10 November 2026's Medium puzzle, every row shows "?" at its right and every column "?" below it, with no mark;
    after the filling it was made from is entered and checked, each shows its line's target with a tick.
  - `test/acceptance/dsl/daily.dsl.ts`: `daily.expectEachLineShowsBesideIt(shown)` and
    `daily.expectEachLineShowsItsTargetTickedBesideIt()`. Both also check that each row's result is at the right of
    its row and each column's below its column.
  - `test/acceptance/dsl/daily-vocabulary.ts`: `ResultBesideLine` and `ResultPlace`.
- **Driver interface**: `resultsBesideLines()` joins `test/acceptance/drivers/daily.driver.ts`. It is read on the
  phones only, like the theme. `DailyLayout` in `test/acceptance/drivers/phone.driver.ts` gains `cells`.
- **Not in a scenario**: the header on Medium and Hard (FR-719), the space between panels and cells (FR-713) and the
  given cells' shadow (FR-720) are reviewed by the owner on a phone. spec-001's check that a given cell is marked
  by more than colour still runs on every phone.
