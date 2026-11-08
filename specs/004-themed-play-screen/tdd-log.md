# TDD Log — Themed Play Screen (spec-004)

- **Spec**: `specs/004-themed-play-screen/spec.md`
- **Acceptance**: `specs/004-themed-play-screen/acceptance.md` (approved by Philip England, 2026-11-08)
- **Baseline**: 2026-11-08, branch `004-themed-play-screen-part-1` at `main` `4f82304` plus the
  spec-004 documents:
  - `npm run lint`, `npm run typecheck`: clean.
  - `npm test`: 251 unit tests passing; coverage lines 99%, branches 93.69%.
  - `npm run build`: passes; game files `index-BUmz0kWH.js`, `index-CT2KBeTK.css`.
  - Engine acceptance: 36 passed. Phone acceptance: 197 passed.
  - Reached after two fixes the first baselines exposed, each its own pull request: spec-001 AC-12
    ran out of the 30-second limit under load (#17), and the speed budget measured machine load
    when run beside other browsers (#18).

## Phase 1: Library additions (T002 to T009)

The library's four additions (research R2). Players see no change: the game's files build
unchanged (`index-BUmz0kWH.js`, `index-CT2KBeTK.css`).

- **T002, T003, a tick on an open pill** (`0d90693`):
  - **Changed from the plan**: Button does not take an `icon` prop. Simple components use only the
    foundations, so Button cannot create an Icon. It shows nodes after its label, as Badge does,
    and Target pill supplies the tick. A cell's caret relies on an empty button (`:empty`), so the
    label only gets its own element when nodes are passed.
  - **Unit test**: an open pill that reaches its target has a tick and is heard ", target reached".
    **Reported — passed on its first run**: `hasTick` never depended on the pill's kind. It pins
    the open case; AC-5 proves the drawn tick.
  - Catalogue sample "Open, line correct", checked by eye.
- **T004, the keypad can be unavailable** (`f7e3ec0`): `keypadKeys(false)` marks every key and Oops
  unavailable. RED: `expected [ undefined, undefined, …(8) ] to deeply equal [ true, true, … ]`.
  Catalogue sample "Unavailable".
- **T005, T006, taps and the announcement** (`316cec2`): the grid reports `onCell` and `onPill`; the
  play screen gains `isKeypadShown`, `keysAvailable` and a visually hidden `status` region written
  only when it changes.
  - `headerWithAnnouncement` (`play-screen.model.ts`), two cycles. RED 1: `expected undefined to
    be false`; hard-coded GREEN. RED 2: `expected false to be true`; the real rule.
  - The grid's taps are wiring, exercised by the game's scenarios in Phase 2.
- **Unavailable keys look** (`2af67c5`): first faded with `opacity`. A screenshot showed the page's
  dots through them, which FR-329 forbids. Now flat with a thin outline, on a solid tile fill: told
  by shape, not colour alone, and only theme colours.
- **T007, the samples' wording** (`5f022b1`): `screenSamplesFor` gives the greeting for "Row 1
  correct" and "Every line connected, chief!" for "All found". RED: the old lines. spec-003 AC-17
  (layout the same across samples) still passes.
- **T008, driver fault found**: spec-003 AC-13 read 20 keys, because `keypadRows` matched every group
  named "Keypad", and the new "Unavailable" sample holds one. It now reads the first match, the
  sample itself. Layer 3 only; the locked scenario is unchanged.
- **Full suite**: 255 unit tests (lines 99%, branches 93.77%); engine 36 passed; phones 197 passed.
  Game JS and CSS unchanged.

## Before AC-1 (T010 to T013a)

- **T010, T011** (`17b575e`): the approved `themed-look` file, DSL additions and driver signatures
  brought over unchanged (blobs match `f4da139`); placeholder readings so they compile.
- **T012** (`5c1b64e`): `src/app/features.ts`, `featuresForBuild(mode, released)`. RED: `expected {
  keypad: true, voice: false } to deeply equal { keypad: true, voice: true }`. **Changed from the
  plan**: a Vite mode (`npm run build:flags-on`) replaces an environment variable, which cannot
  be set the same way on Windows and in CI without a new dependency.
- **T013** (`59756d1`): `iphone-flagged` and `android-flagged` projects on the flags-on build, built
  by the test runner, so the workflow file needed no change. Which file needs a flag is set in
  `playwright.config.ts`. `tools/test-results.ts` counts them as the same phones. RED: `Unknown
  Playwright project "iphone-flagged"`.
- **T013a** (`a13f18d`): `npm run test-results -- <feature> --criterion AC-n` prints one criterion
  from its real results, with **NOT COVERED** when no test names it. RED: `expected '' to contain
  'AC-99: NOT COVERED'`.

## AC-1: the new screen

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-1]`, six scenarios on both
  phones.
- **Driver** (T014, `c3413e1`): real readings for the bubble, counter, pills, working slots, helper
  line, main button, screen parts, cell looks, dashed pills, colours and dots.
- **Acceptance RED** (both phones, 12 of 12): `Operator header is above Solutions counter —
  Received: false`, `the speech bubble — Received: "not read yet"`, `Row 1 pill shows`, `top-left
  cell's fill — Received: "other"`, `the helper line`, `#FFFFFF is one of Classic's four colours`.
- **Cycles** (T015), in `src/app/screen.spec.ts` and `labels.spec.ts`, each RED on its assertion, then
  GREEN and committed: the greeting in the theme's voice (`023d47f`); header, counter and main
  button (`cb9791d`); target pills (`a30c682`); cells (`9382a96`); workings (`af4e974`); the helper
  line and no keypad with its flag off (`24879e7`).
- **Before the swap** (T016), because spec-001's locked "what the game says" scenarios read the
  status: the bubble shows the existing message after a check (`5d23ec2`); the announcement, with
  the count when it changed (`9bdbf9a`); the props carry it (`2d31616`).
  - **Reported**: the announcement's cycle added three tests at once, not one at a time. One of them
    (no result, no announcement) passed against the stub.
- **`npm run dev`** (`a98ae71`, test-first): the page's security policy blocks injected styles, as
  in the catalogue (#12), so it now builds and serves.
- **The swap** (T016, `946fe54`), as one commit: `main.ts` uses the library; `view.ts` and `styles.css`
  are gone; the drivers read the new contract; `view()` reads the whole screen in one browser call
  (the root cause of #17). A full phone run fell from about 2.3 minutes to 1.6.
  - 13 unit tests were removed with `operatorName` and `resultText`, which nothing uses any more;
    `pillName` and `workingSlot` replace them.
  - **Every spec-001, spec-002 and spec-003 scenario passed, with no locked file changed**, after
    two fixes:
    - spec-001 AC-4 ("not by colour alone"): the given cell differs by having no raised shadow, but
      the driver's list of markings never read shadows. Added to the reading (Layer 3).
    - AC-1 found `#000000`: the page root kept the browser's black. `page.css` now sets the ink there.
- **Contract**: an open pill's name begins with what it shows ("? 6, Row 2 target 6, …"), as the
  library's name does (label in name, WCAG 2.5.3); the plan's contract had the line first.
- **Acceptance GREEN** (T017): AC-1, 12 runs passed. Screen checked by eye (375 × 667).
- **Full suite**: 260 unit tests (lines 98.47%, branches 91.8%, now counting `screen.ts` and
  `features.ts`); engine 36 passed; phones 216 passed, 6 failed (AC-3, AC-5 and AC-7, not started),
  and the speed check waits behind them.
- **Slice refactor**: none needed.

## AC-2: what a screen reader hears when the game opens

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-2]`, one scenario on both phones.
- **Acceptance RED**: **reported — passes at RED** (⚠️, as T018 predicted). AC-1's swap brought the
  names.
- **Driver proven** by reverted breaks (Pixel 5):
  - The main button named "Check the grid, Put it through!" failed `the main button is heard
    beginning "Put it through!"`.
  - The counter heard as "Got 0 of 2" failed `counter — Received: ""`.
- **No cycles**: no new behaviour was needed.
- **Acceptance GREEN** (T018): AC-2, 2 runs passed. No product code changed, so AC-1's full-suite
  numbers stand.

## AC-3: a line that reaches its target

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-3]`, one scenario on both phones.
- **Acceptance RED** (both phones): `Row 1 pill shows — Expected: "+ 8 ✓", Received: "+ 8"`.
- **Cycle 1** (`12d815c`): a line that reaches its target ticks its pill, and no other. RED on its
  assertion (`reachesTarget` was always false). GREEN: `reachesTarget` from the line's outcome.
- **Cycle 2** (`21e66a3`): the player's digits in a correct line take its look; the given 6 does not
  (FR-402 says the player's own digits). RED on its assertion.
- **Unit test** (`eecb367`): each working's slot and mark. **Reported — passed on its first run**:
  `workingSlot` came through the swap without a direct test. Proven by a reverted break: dropping
  the tick failed `expected { result: '= 8', mark: 'none' } to deeply equal { …, mark: 'tick' }`.
- **Acceptance GREEN** (T019): AC-3, 2 runs passed. Screen checked by eye: tick on "+ 8", an accent 2
  with an accent shadow, "= 8 ✓".
- **Full suite**: 266 unit tests (lines 99.09%, branches 93.25%); engine 36 passed; phones 220
  passed, 2 failed (AC-7, not started), and the speed check waits behind them.
- **Reported**: AC-4 and AC-5 now pass as well, ahead of their own checkpoints: the swap and these
  cycles brought their behaviour. Each is proven at its own checkpoint.
- **Slice refactor**: none needed.

## Fix before AC-4: nothing on the grid moves

Noticed at AC-3's checkpoint: the cells shifted when a tick appeared. Fixed at the owner's request
(`ba533f8`), layout only:

- The tick keeps its space in every pill and working (`showKeepingItsPlace`).
- The workings column has room for "= 13 ✓" from the start.
- A cell fills its row, and the digit fits the smallest cell (`--text-cell`), so a cell that gets a
  digit does not change height.
- At 320 px a pill with its tick was wider than its column, which squashed the tick on dashed
  pills. Pills get smaller text, tick and padding there (`--text-pill`, `--size-pill-tick`,
  `--space-pill`), and the tick cannot shrink.
- Measured across every digit and operator on both screen sizes: the cells move by at most 1.5 px
  (the operators differ slightly in width), against about 7 px and a change of size before.
- No scenario covers this; it was measured directly. Spec-003's and spec-004's scenarios still pass.

## AC-4: the first solution

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-4]`, one scenario on both phones.
- **Acceptance RED**: **reported — passes at RED** (⚠️). The behaviour came in before AC-1's swap,
  because spec-001's locked scenarios needed the status (T016's cycles).
- **Unit test**: `announcement` says the result, then the count (spec-004 AC-4), from `9bdbf9a`.
- **Driver proven** by reverted breaks (Pixel 5):
  - No count in the announcement failed `what is announced ends "Found 1 of 2": "New solution found!"`.
  - The counter stuck at 0 failed `the counter shows — Received: "Solutions found 0 of 2"`.
  - A second write of the announcement, one task later, failed `announcements to screen-reader
    users`. A first attempt, two writes in the same task, did not fail: they are one change, and a
    screen reader hears one. It proved nothing and is recorded here.
- **Acceptance GREEN** (T020): AC-4, 2 runs passed. Screen checked by eye.

## AC-5: every solution found

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-5]`, one scenario on both phones.
- **Acceptance RED**: **reported — passes at RED** (⚠️). The ticks came with T003 and AC-3, and the
  count with T016's cycles.
- **Driver proven** by reverted breaks (Pixel 5):
  - An open pill that never shows its tick failed `Row 2 pill shows — Expected: "+ 6 ✓", Received: "+ 6"`.
  - A counter that is never complete failed `the counter shows — Expected: "All found! 2 of 2 ✓",
    Received: "Solutions found 2 of 2"`.
  - The all-found result without its count failed `what is announced ends "Found 2 of 2": "New
    solution found! You've found every solution."`.
- **No cycles**: no new behaviour was needed.
- **Acceptance GREEN** (T021): AC-5, 2 runs passed. Screen checked by eye.

## AC-6: the screen fits a phone

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-6]`, two scenarios on both phones.
- **Acceptance RED**: **reported — passes at RED** (⚠️, as T022 predicted): spec-003 AC-16 sized the
  screen, and without a keypad it has room to spare.
- **Driver proven** by reverted breaks (Pixel 5):
  - Cells 200 px tall failed `Puzzle grid is on screen without scrolling`, at both sizes.
  - Columns 200 px wide failed `top-right cell is on screen without scrolling`, at both sizes.
- **Measured**: with the longest message (the two-line "Fill every cell…") at 320 × 568, the main
  button ends at 449 of 568 px, so 119 px are spare for the keypad (AC-20).
- **No cycles**: no new behaviour was needed.
- **Acceptance GREEN** (T022): AC-6, 4 runs passed.

## AC-7: losing the connection while playing

- **Acceptance test**: `themed-look.acceptance-spec.ts` — `[spec-004 AC-7]`, one scenario on both phones.
- **Driver**: `typeface(text)` waits for `document.fonts.ready`, then reads the first loaded family.
- **Acceptance RED**: against the placeholder reading, `the speech bubble title is shown in —
  Received: "not read yet"`. With the real reading: **reported — passes at RED** (⚠️, as T023
  predicted), because the typefaces ship with the game and it makes no requests.
- **Driver proven** by reverted breaks (Pixel 5):
  - Chewy's `@font-face` renamed failed `the speech bubble title is shown in — Received: "sans-serif"`.
  - An image requested on each tap failed `network requests after opening — Received: 15`.
- **No cycles**: no new behaviour was needed.
- **Acceptance GREEN** (T023): AC-7, 2 runs passed.

## Release 2: the new look is live (T026)

- **Merged** as #20 (`9abfc6e`); deployed, and the public site serves that commit.
- **CI found what a local run could not**: WebKit on the slower CI machine requested the two font
  files just after the `load` event, so spec-001 AC-18's "no network requests" counted them. The
  driver now treats the game's typefaces as part of opening (`65ce023`); any other request counts
  (proved: an image on each tap failed with 15). `<link rel="preload">` was tried and reverted:
  WebKit then fetched each font twice.
- **One-off, not acted on**: in one local full run, spec-001 AC-3 on the iPhone timed out waiting for
  WebKit to report the cell stable; the page was correct. 30 of 30 repeats passed, as did CI.
- **Owner's review of the real build on a phone**: 2026-11-08, "I'm happy" (SC-403, first visible
  release).

## User Story 2: the keypad

## AC-8: tapping a cell selects it

- **Acceptance test**: `keypad.acceptance-spec.ts` — `[spec-004 AC-8]`, one scenario, on the engine
  driver and the flags-on phones.
- **Driver** (T028): `tapKey`, `selectedCell` and `keypad` on the UI and engine drivers.
- **Acceptance RED** (all three): `the selected cell — Received: null`.
- **Cycle 1** (`51b7e59`): tapping a changeable cell selects it and still steps its value. RED on its
  assertion. **Slip**: the first GREEN stored the whole tap action, so its test still failed and
  the commit went in red; fixed and amended before anything was pushed.
- **Cycle 2** (`219551b`): the selected cell shows only with the keypad flag on. RED on its assertion.
- **Refactor** (`f7ff7f4`): `isSamePosition`, as lint flagged the function as too complex.
- **Acceptance GREEN** (T029): AC-8, 3 runs passed. Screen checked by eye.
- **Full suite**: 268 unit tests; engine 43 passed, 5 failed; phones 241 passed, 12 failed. Every
  failure is a keypad scenario not started; with the flag off the game's own runs still pass.
- **Slice refactor**: as above.

## AC-9: a key sets the selected cell

- **Acceptance test**: `keypad.acceptance-spec.ts` — `[spec-004 AC-9]`, one scenario, on the engine
  driver and the flags-on phones.
- **Acceptance RED** (engine and phones): `top-right cell — Expected: 7, Received: 1`.
- **Cycle 1** (`605c3dd`): a key sets the selected cell and keeps it selected. RED on its assertion.
- **Cycle 2** (`89e3b53`): a key clears the last message, as any change to the grid does. RED on its
  assertion.
- **Wiring**: `main.ts` sends keys to the session (the phones prove it).
- **Acceptance GREEN** (T030): AC-9, 3 runs passed. Screen checked by eye.
- **Slice refactor**: none needed.

## AC-10: Oops empties the selected cell

- **Acceptance RED** (engine and phones): the cell stayed at 7.
- **Cycle** (`bfe7ad8`): `clear` empties the selected cell. RED: `expected 7 to be null`.
- **Acceptance GREEN** (T031).

## AC-11: one cell is selected at a time

- **Reported — passes at RED** (⚠️): AC-8's `selected` already follows the last tap. Proven by a
  reverted break: the first cell staying selected failed `the selected cell — Expected:
  "bottom-right", Received: "top-right"`. **GREEN** (T032).

## AC-12: the keypad before a cell is selected

- **Cycle** (`4fa79e8`): the keys are available only once a cell is selected. RED on its assertion.
- **Unit test** (`33cfa98`): a key with nothing selected changes nothing. **Reported — passed on its
  first run** (the guard came with AC-9). A first break, removing the guard, proved nothing: with
  no position to match, no cell changes anyway. Proven properly: a key with nothing selected filling
  top-right failed `top-right cell — Expected: "empty", Received: 5`.
- **Proven on the phones**: keys that are never unavailable failed `"1" is unavailable`.
- **GREEN** (T033).

## AC-13, AC-14 and the edge cases

**Reported — all passed at RED** (⚠️), from AC-8 to AC-12's behaviour. Each proven by a reverted break:

| Criterion | Break | Failure |
| --- | --- | --- |
| AC-13 | the given 6 can be selected | `the selected cell — Expected: "bottom-left", Received: "top-left"` |
| AC-14 | every key enters a 1 | `what the game says — Expected: "new solution", Received: "not solved yet"` |
| Edge | tapping the selected cell deselects it | `the selected cell — Received: null` |
| Edge | an operator tap clears the selection | `the selected cell — Received: null` |
| Edge | checking clears the selection | `the selected cell — Received: null` |
| Edge (FR-407) | a key says something | `what the game says — Received: "not solved yet"` |

**GREEN** (T034, T035, T037).

## AC-20: the keypad on the screen

- **Reported — passes at RED** (⚠️): the keypad was already in the play screen, sized by spec-003.
- **Proven** by a reverted break: keys 200 px tall failed `Keypad is on screen without scrolling`, at
  both screen sizes.
- **Measured**, with the longest message: the main button ends at 660 of 667 px and 545 of 568 px.
- **GREEN** (T036). Screens checked by eye at 375 × 667 and 320 × 568.

## Flag off (T038)

The `npm run build` game shows no keypad group and no selected cell after a tap, so players see no
change on merging. The game's own phone projects pass with the flag off.

- **Slice refactor**: none needed beyond AC-8's.

## Release 3: the keypad (T039)

- **Merged with its flag off** as #21 (`458737e`); players saw no change.
- **Owner's review of the flags-on build on a phone**: 2026-11-08, "its great".
- **Released** by setting `keypad` true in `src/app/features.ts`. `verify` then runs the keypad's
  scenarios on the game's own phones, with everything already live.
- **Found by turning the flag on**: spec-004 AC-3 failed `top-right cell's digit — Expected: "accent",
  Received: "tile"`. With the keypad live, the cell just tapped stays selected, and the selected
  look wins, as the spec says. Three options were put to the owner, who approved rewording the
  locked scenario: one added step, tapping another cell first (recorded in `acceptance.md`).

# User Story 3: the voice (part 4)

Scenarios: `operator-voice.acceptance-spec.ts` brought over unchanged from `f4da139` (blob
`cd3acfb` on both sides). They run on `iphone-flagged` and `android-flagged` until the voice is
released.

## AC-15: the greeting

- **Reported — passes at RED** (⚠️): the greeting and the silent status came with User Story 1.
- **Proven** by two reverted breaks: the greeting placed in the status failed `what is announced —
  Expected: "", Received: "Fill the grid, pal."`; a greeting with no address failed `the speech
  bubble`. Both on both phones.
- **GREEN** (T041). No production code.

## AC-16: the result, in the operator's voice

- **Acceptance RED** on the flags-on phones (8 failed): `the speech bubble` showed spec-001's
  message, not the operator's line.
- **Cycle** (`8c4e93d`): `bubbleLine` with the voice on gives each line of the Messages table,
  with the theme's address and sign-off. RED: `expected 'New solution found!' to be "You're
  connected! Keep 'em coming, …"`.
- **Cycle** (`58be893`): what is heard is spec-001's message, the operator's line, then the count
  when it changed. RED: `expected 'New solution found! Found 1 of 2' to be 'New solution found!
  You're connected…'`.
- **Cycle** (`8ea0af0`): `playScreenProps` uses both when the voice is on. RED: `expected 'New
  solution found!' to be "You're connected!…"`.
- **Refactor** (`c2fbbdc`): the keypad flag removed (T040), once released and signed off. It
  waited for the cycle above: without the voice wired in, `features` was unused and lint failed.
- **Acceptance GREEN** on both phones (T042).

## AC-17: a grid that is not a solution

- **Reported — passes at RED** (⚠️), from AC-16. Proven by reverted breaks: the plain message in
  the bubble failed `the speech bubble`; spec-001's words dropped failed `what is announced —
  Expected: "Not solved yet. Wrong number, pal!", Received: "Wrong number, pal!"`. **GREEN** (T043).

## AC-18: the message goes once the grid changes

- **Reported — passes at RED** (⚠️): a tap already cleared the message. Proven by reverted breaks: a
  tap leaving the message failed `the speech bubble`; a status that keeps speaking failed `what is
  announced — Expected: "", Received: "Not solved yet. Fill the grid, pal."`. **GREEN** (T044).

## AC-19: another theme's words

- **Unit test** (`ad61153`). **Reported — passed on its first run**, from AC-16's use of the theme.
  Proven by reverted breaks: the sign-off fixed to Classic failed `expected "You're connected! Keep
  'em coming, …" to be "You're connected! Next, please, chie…"`; the address fixed to Classic failed
  `expected "You're connected! Next, please, pal!" to be "…chie…"`. **GREEN** (T045).

## Flag off (T046)

The `npm run build` game shows "Fill every cell and choose every operator before checking." after
Check on an empty grid, so players see no change on merging.

**For the owner's phone review**: the voice's lines take one or two lines in the bubble, so the
grid moves down when the line wraps: top of the grid 246 px (greeting) and 268 px (longest line)
at 375 × 667; 212 px and 223 px at 320 × 568. Nothing leaves the screen: the main button ends at 639
of 667 px and 526 of 568 px. No requirement covers this; it is the owner's call.

- **Slice refactor**: none needed beyond the flag removal.

## Release 4: the voice (T047)

- The flags-on build was served for the owner's phone review on 2026-11-08.
- **Owner's decision**: the grid moving when the bubble's line wraps is left as it is for now
  (2026-11-08). No requirement covers it; it can be its own small change later.
- `voice` set true in `src/app/features.ts`. `operator-voice.acceptance-spec.ts` now runs on the
  game's own phones.
