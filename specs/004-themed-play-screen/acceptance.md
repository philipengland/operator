# Executable Specifications — Themed Play Screen (spec-004)

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/004-themed-play-screen/spec.md`

Scenarios run with Playwright Test, as for the earlier specs. Scenarios tagged `@ui` read the
screen, so they run only through the UI driver, on iPhone SE (WebKit) and Pixel 5 (Chromium).
Untagged scenarios (the keypad) run through both the in-process engine driver and the UI driver.
Every spec-001, spec-002 and spec-003 scenario keeps running unchanged.

**Releases** (constitution VII, plan Delivery): all files are approved together. Each Layer 1 file
joins the pull request that makes it pass: `themed-look` with User Story 1, `keypad` with User
Story 2, `operator-voice` with User Story 3. The DSL additions join User Story 1.

**Flags**: User Stories 2 and 3 sit behind the `keypad` and `voice` flags (research R10). While a
flag is off, its file runs on the flags-on phone projects as well as the engine driver for
`keypad`; which file needs which flag is set in `playwright.config.ts` (Layer 3), so releasing a
story changes no locked file. Scenarios in `themed-look` pass with both flags off.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: the new screen | From top to bottom: header, counter, puzzle, main button | `test/acceptance/play/themed-look.acceptance-spec.ts` |
| AC-1 | Bubble "Hello, Operator!" and counter "Solutions found 0 of 2" | same |
| AC-1 | Pills "+ 8", "× 6", and dashed "? 6" and "? 3" | same |
| AC-1 | The given 6 is a solid ink cell; three cells are empty | same |
| AC-1 | Each line's "= ?", the helper line and "Put it through!" | same |
| AC-1 | Everything in Classic's four colours, on the dotted page | same |
| AC-2: what a screen reader hears | "Found 0 of 2", "Top-left cell, given 6", a button beginning "Put it through!" and including "Check" | same |
| AC-3: a line reaching its target | Top-right 2: "+ 8 ✓", the 2 in accent with an accent shadow, working "6 + 2 = 8" marked, "= 8 ✓" | same |
| AC-4: the first solution | Solution A: "Solutions found 1 of 2"; the result, and one announcement ending "Found 1 of 2" | same |
| AC-5: every solution found | Solution B after A: "All found! 2 of 2 ✓"; all four pills ticked, dashed ones too; the result, and one more announcement ending "Found 2 of 2" | same |
| AC-6: fits a phone | 375 × 667: everything visible without scrolling | same |
| AC-6 | 320 × 568: everything visible without scrolling | same |
| AC-7: losing the connection while playing | Text stays in Chewy and Nunito; no network request | same |
| AC-8: tapping a cell selects it | Top-right is selected and shows 1 | `test/acceptance/play/keypad.acceptance-spec.ts` |
| AC-9: a key sets the cell | Key 7: top-right 7, still selected, working "6 + 7 = 13" | same |
| AC-10: Oops | Top-right empty, working "6 + ?" | same |
| AC-11: one cell at a time | Bottom-right selected and shows 1; top-right keeps its 7 | same |
| AC-12: before a selection | The keys and Oops are unavailable, and key 5 changes nothing | same |
| AC-12 | Selecting a cell makes the keys available | same |
| AC-13: the given 6 | Tapping it leaves it unchanged, and bottom-left stays selected | same |
| AC-14: a solution by keypad | Solution A with the keypad for every digit: new solution, "Found 1 of 2" | same |
| AC-20: the keypad on the screen | Between the grid and the main button; keys 1 to 9 and Oops in two rows of five | same |
| AC-20 | 375 × 667: the whole screen with its keypad is visible without scrolling | same |
| AC-20 | 320 × 568: the same | same |
| Edge case | Tapping the selected cell steps its value and keeps it selected | same |
| Edge case | An open operator changes and the selection stays | same |
| Edge case | Checking leaves the selection and every digit in place | same |
| Edge case (FR-407) | A key that makes a line reach its target marks it, and counts nothing | same |
| AC-15: the greeting | "Hello, Operator!" and "Fill the grid, pal."; nothing announced | `test/acceptance/play/operator-voice.acceptance-spec.ts` |
| AC-16: a result in the operator's voice | Solution A: "You're connected! Keep 'em coming, pal!"; announced once, spec-001's words first | same |
| AC-16 | Solution B after A: "Every line connected, pal!"; announced with spec-001's words first and the count | same |
| AC-16 | Solution A again: "We've had that call, pal."; no count in the announcement | same |
| AC-16 | Bottom-right empty: "Line's busy, pal: fill every cell and operator first." | same |
| AC-17: not a solution | Inexact division: "Wrong number, pal!", heard "Not solved yet. Wrong number, pal!" | same |
| AC-18: the message goes | Tapping bottom-left returns to the greeting; nothing more is announced | same |

**Checked by unit tests, not by these scenarios**. Each test title names the criterion, such as
`(spec-004 AC-19)`, so `npm run test-results` counts it:

- **AC-19**: the Midnight blue wording, "Fill the grid, chief." and "You're connected! Next,
  please, chief!": `src/app/labels.spec.ts`. Players see only Classic until F7.

**Checked by hand** ([quickstart.md](quickstart.md) section 3): how VoiceOver and TalkBack say a
selected cell; the screen beside the mockup on a real phone (SC-403); the playtests (SC-401,
SC-402).

**Counted, not separately scripted**: FR-403 (the helper line while an operator is open) is in
AC-1; the fixed puzzle's operators are always open, so it cannot go away. FR-413's plain messages
before the voice are in AC-4 and AC-5 (the result reads as spec-001's) and in the unit tests.

## DSL Added or Changed

`test/acceptance/dsl/game.dsl.ts`, class `GameDsl` (an approved file, changed only by adding
these, for approval):

| Method | Purpose |
|---|---|
| `tapKey(digit)` / `tapOops()` | Tap a digit key, or Oops. |
| `fillInWithKeypad(entry)` | Enter each digit by selecting its cell and tapping the key; then choose the operators. |
| `expectSelected(cell)` | This cell is the selected one. |
| `expectKeysAvailable()` / `expectKeysUnavailable()` | All ten keys are, or are not, available. |
| `expectKeypadRows(rows)` | The keys a screen reader hears, row by row. |
| `expectBubble(title, line)` | What the speech bubble says. |
| `expectAnnounced(words)` / `expectNothingAnnounced()` | The announcement, word for word, or none. |
| `expectAnnouncementEndsWith(words)` | The announcement ends with these words, whatever the bubble's voice. |
| `expectCounterShows(text)` | The counter as the player sees it, e.g. "Solutions found 1 of 2". |
| `expectPillShows(line, text)` | A target pill as the player sees it, e.g. "+ 8 ✓". |
| `expectWorkingSlotShows(line, text)` | A working's visible slot, e.g. "= 8 ✓". |
| `expectHelperLine(text)` | The helper line under the grid. |
| `expectMainButton(label)` | Shows these words; heard beginning with them and including "Check". |

`test/acceptance/dsl/phone.dsl.ts`, class `PhoneDsl` (the same):

| Method | Purpose |
|---|---|
| `expectPartsTopToBottom(parts)` / `expectPartsOnScreen(parts)` | The screen's parts, in order, and all visible without scrolling. |
| `expectCellLook(cell, look)` | Fill, digit and shadow in the theme's colour names. |
| `expectPillDashed(line)` | The pill has a dashed outline. |
| `expectOnlyThemeColours(theme, colours)` | Every colour drawn is one of the theme's four (the dots excepted, spec-003 AC-27). |
| `expectPageDots(dots)` | The page's dots: colour within one level per channel, paper, size and spacing. |
| `expectShownIn(text, typeface)` | This text is in Chewy or Nunito. |

`test/acceptance/dsl/vocabulary.ts` gains `KeypadKey` and `TypefacedText`.

## Driver Interface Required

Signatures only. Implementations come with `/speckit-implement`:

- `test/acceptance/drivers/game.driver.ts` (`GameDriver`): `tapKey`, `selectedCell`, `keypad`,
  `bubble`, `announcement`, `counterShown`, `pillShown`, `workingSlot`, `helperLine`,
  `mainButton`, and a `KeypadKeyView` type. The engine driver implements `tapKey`, `selectedCell`
  and `keypad`, which the untagged keypad scenarios need; the rest are read only on the phones.
- `test/acceptance/drivers/phone.driver.ts` (`PhoneDriver`): `playScreenParts`, `cellAppearance`,
  `isPillDashed`, `coloursInUse`, `pageDots`, `typeface`, and a `CellAppearance` type.

The drivers do not implement them yet, so `npm run typecheck` fails on those drivers until the
first implementation task adds them. Separately, the UI and phone drivers are re-pointed to the
new play-screen contract in Layer 3 (plan research R3). No spec-001 or spec-002 Layer 1 file
changes.

**RED run, 2026-11-08**: every new scenario fails because the driver readings do not exist yet,
for example `TypeError: this.driver(...).bubble is not a function`. Engine driver: 12 of 12 failed
(the untagged keypad scenarios). Phones: 70 of 70 failed (35 scenarios × 2). None passed.

## Approval

- **Approved by**: Philip England, product owner and solo developer
- **Date**: 2026-11-08
- **Locked files** (already covered by `.github/CODEOWNERS`: `**/*.acceptance-spec.ts` and
  `test/acceptance/dsl/`):
  - Layer 1:
    - `test/acceptance/play/themed-look.acceptance-spec.ts` (new)
    - `test/acceptance/play/keypad.acceptance-spec.ts` (new)
    - `test/acceptance/play/operator-voice.acceptance-spec.ts` (new)
  - Layer 2 (additions above):
    - `test/acceptance/dsl/game.dsl.ts`
    - `test/acceptance/dsl/phone.dsl.ts`
    - `test/acceptance/dsl/vocabulary.ts`

## Changes after approval

| Date | File | Change | Why |
| --- | --- | --- | --- |
| 2026-11-08 | `test/acceptance/play/themed-look.acceptance-spec.ts`, `[spec-004 AC-3]` | One added step: after top-right 2, tap bottom-left. | Approved by Philip England. With the keypad released, the cell just tapped stays selected, and the selected look wins (spec edge case "Selected cell in a correct line"), so the correct-line look only shows once another cell is selected. The tick and "= 8 ✓" are checked as before. |
