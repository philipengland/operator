# Research: Themed Play Screen (spec-004)

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-07

The stack is unchanged (ADR 0001, ADR 0002): TypeScript, Vite, Vitest, Playwright, the spec-003
component library. Nothing here needed a new dependency. Each decision below resolves a design
question the spec leaves to the plan.

## R1. How the game uses the library

**Decision**: the game becomes a thin layer over the library's play screen.

- **`src/app/screen.ts`** (new, pure, unit-tested): `playScreenProps(state, theme)` turns the
  session's state into the library's `PlayScreenProps`. It sets the header, the counter, the
  pills, cells and workings, the keypad's availability, the announcement and the main
  button's label.
- **`src/app/main.ts`** (wiring only):
  - applies the theme (R6) and creates the library's play screen;
  - turns each tap into a session action;
  - after each action, calls `update(playScreenProps(state, theme))`.
- **`src/app/labels.ts`** keeps every accessible name and message from spec-001 and spec-002.
  It gains the bubble's lines and the heard announcement (R7).
- **`src/app/view.ts` and `src/app/styles.css` are removed.** The library draws everything,
  and the game adds no styling of its own (FR-401).

**Rationale**: the mapping is the only new logic, and it is pure, so it is unit-tested in Node
like `session.ts` and `labels.ts`. Rendering is the library's, already proven in the catalogue.
The game has one place where state becomes screen.

**Alternatives considered**:
- **Keep `view.ts` and restyle it**: it would duplicate the library and break FR-401.
- **Give the library the session**: it would break spec-003 FR-305. Components are told what to
  show; they never work it out.

## R2. What the library needs first (FR-401)

**Decision**: four additions to the library, each with a unit-tested model change and a
catalogue sample, delivered before the game uses them. Combined components still add no styling
of their own (spec-003 AC-7).

| Addition | Component | What changes |
| --- | --- | --- |
| A tick on an open pill (FR-402) | Button (simple), Target pill | Button can carry a trailing decorative Icon. The open pill passes the tick when its line reaches its target. Heard as before: "…, target reached". |
| Taps reach the game | Puzzle grid, Play screen | `onCell(row, column)` and `onPill(axis, index)` actions, alongside the existing `onKey` and `onCheck`. |
| The keypad can be unavailable (FR-405), or left out (FR-413) | Keypad, Play screen | A `keysAvailable` prop; while false, every key and Oops is `aria-disabled="true"`, still focusable, and calls nothing. `update` switches it. The play screen's `isKeypadShown` prop leaves the keypad out while its flag is off. |
| One announcement per check (FR-409) | Play screen | A visually hidden polite `status` region, holding `announcement` text. Written only when it changes; emptied silently. |

While an announcement holds the result, the bubble's visible line is hidden from screen
readers. The status region already says those words, so moving through the screen does not
read them twice. The greeting is read as normal.

**Rationale**: FR-401 requires every new visual part to be added to the library first. These
four are the gaps found when the library's play screen is fed real game state. The catalogue
gets a sample of each, so the owner sees them in every theme.

**Alternatives considered**:
- **A separate live region in the game**: it would be a visual-free part outside the library,
  and the library's play screen would not be the whole screen.
- **The bubble as the live region**: its text cannot carry the count (FR-409), and the greeting
  would be announced when the grid changes, against spec-001 AC-20.

## R3. Accessible names: the play-screen contract changes

**Decision**: [contracts/play-screen.md](contracts/play-screen.md) replaces
`docs/contracts/play-screen.md` when this feature merges. The main change: a line's target and
operator become one pill.

| Part | Before (spec-001) | After |
| --- | --- | --- |
| Shown operator and target | text "Row 1 target 8" + disabled button "Row 1 operator, plus" | text "Row 1 target 8, plus" (an ink pill; not a button, so tapping does nothing, as FR-005 requires) |
| Open operator and target | text "Row 2 target 6" + button "Row 2 operator, not chosen" | button "Row 2 target 6, operator not chosen" / "…, plus" |
| Line reaching its target | working's name ends ", target reached" | the same, and the pill's name ends ", target reached" too |
| Cells | "Top-right cell, empty" / "…, 7" / "Top-left cell, given 6" | unchanged; selected adds `aria-pressed="true"` |
| Submit | "Check" | "Put it through!, Check" (still found by "Check") |
| Counter | text in the status region | its own text, "Found N of 2", not a live region |
| Status | message and counter | the heard announcement only (R7) |
| Keypad (new) | – | group "Keypad", buttons "1"…"9" and "Oops, clear cell" |

**Rationale**: the pills are the design's. Every name keeps its line's words, so a
screen-reader user still hears the target and the operator together.

**What the UI driver changes** (Layer 3; the locked spec-001 and spec-002 scenarios and DSL do
not change):
- **Targets and operators** are both read from the pill: the number from its name, the choice
  from the words after the target.
- **Whether an operator is open**: it is open when its pill is a button.
- **Tapping an operator** taps the pill. A shown pill is not a button, so a tap on it does
  nothing, as before.
- **The counter** is read from the counter's name, not the status.
- **The result** is read from the status, as before. Its text still starts with spec-001's
  words.

**Alternatives considered**:
- **Keep separate operator buttons**: the design has none, and it would mean a second operator
  control the player can see.

## R4. Selection and the keypad (User Story 2)

**Decision**: the session gains `selected: CellPosition | null` and two actions, `key(digit)`
and `clear`.

- **Tapping a changeable cell** selects it and steps it, as spec-001 FR-002 already does.
- **Tapping a given cell** changes nothing, and the selection stays.
- **A key or Oops** sets or empties the selected cell. With nothing selected it changes
  nothing.
- **Any change to a cell** clears the message, as a tap does today (spec-001 FR-014).
- **Check** leaves the selection as it is.

`playScreenProps` makes the keypad available exactly when `selected` is set.

**Rationale**: all in the pure session, so every rule is unit-tested, and the engine driver sees
the same behaviour as the phones.

**How a selected cell is heard**: `aria-pressed="true"` on the cell button, as the library
already does. iOS VoiceOver reads it as "selected" and TalkBack as "on". This is checked by
hand (quickstart). The approved scenarios read it as selected.

## R5. The engine driver

**Decision**: the engine driver keeps driving the session in-process. It gains the keypad
actions and reads the selection and the announcement from `playScreenProps`. It therefore
checks the same mapping the phones render, except for marks and announcements, which only the
phones read (AGENTS.md convention).

## R6. Theme

**Decision**: `main.ts` applies the puzzle's theme to the page root once, at start, through
`themeForSeed`. The fixed puzzle has no seed (the engine's puzzle data has no seed field until
F7), so it passes `undefined` and the theme is Classic (spec-003 AC-25). There is no switch, URL
parameter or setting (FR-411). The game imports the foundations' `tokens.css` (fonts and sizes)
and `page.css` (the dotted page, FR-412).

## R7. What is said and heard (FR-408 to FR-410)

**Decision**: `labels.ts` gains two pure functions, unit-tested for Classic and Midnight blue
(AC-19).

- **`bubbleLine(kind | null, theme, isVoiceOn)`**: the bubble's line from the Messages table, with
  the theme's address and sign-off. `null` gives the greeting. With the voice off, a result
  gives spec-001's message (FR-413).
- **`announcement(kind, theme, isVoiceOn, countChanged, counter)`**: spec-001's message as today,
  then (with the voice on) the bubble's line, then "Found N of 2" when the count changed. Empty
  when there is no message.

The status region's text is written only when it changes (AGENTS.md). When the grid changes,
the message clears and the region is emptied, which announces nothing (spec-001 AC-20). The
greeting is never placed in the status, so opening the game announces nothing (FR-410).

## R8. Size and speed

**Measured on 2026-11-07**:
- The catalogue's whole build is 6.6 KB of JavaScript and 2.3 KB of CSS gzipped, and the game
  will use less of the library than that. Today's game is 3.3 KB and 1.0 KB. The 30 KB budget
  (spec-001 research R9) holds with room to spare.
- The typefaces add 59 KB of WOFF2 (Chewy 20 KB, Nunito 39 KB). They load with
  `font-display: swap`, so text shows at once in a fallback and the grid is ready to play
  without waiting for them.

**Check**: the Android speed-budget scenario (ready within 3 seconds, each tap within 0.1
seconds) runs unchanged and must still pass.

## R9. Delivery: one release per user story (constitution VII)

**Decision**: four pull requests, one per step in the spec's Release order. Each merges and
deploys on its own, is under 30 minutes to review, and adds only the approved Layer 1 files it
makes pass.

1. **Library additions** (R2): models, renderers, catalogue samples, the component-library
   contract. The game's files are unchanged.
2. **User Story 1, the new look** (AC-1 to AC-7), unflagged:
   - `screen.ts`, `labels.ts`, `main.ts`; `view.ts` and `styles.css` removed;
   - the UI and phone drivers re-pointed;
   - the play-screen contract replaced;
   - the flag mechanism (R10), with `keypad` and `voice` off.

   Every spec-001, spec-002 and spec-003 scenario must pass.
3. **User Story 2, the keypad** (AC-8 to AC-14, AC-20), behind `keypad`.
4. **User Story 3, the voice** (AC-15 to AC-19), behind `voice`.

Turning a flag on is a further one-line pull request, once the owner has previewed the story.

**Why User Story 1 has no flag** (recorded as constitution VII allows): it replaces the whole
screen. A flag would keep `view.ts`, `styles.css` and the old screen in the source, and make the
UI and phone drivers read both screens for all of spec-001 and spec-002's scenarios, for one
release. Reverting the merge restores the old screen as fast as turning a flag off would (a pull
request and a deploy, about 6 minutes).

**Alternative**: keypad and look in one release. Rejected: each user story releases on its own.

## R10. Feature flags

**Decision**: flags fixed at build time, listed in one file.

- **`src/app/features.ts`** holds each flag's released state: `keypad` and `voice`, both false
  at first. Releasing a story is a one-line change here.
- **The build reads them through Vite's `define`**, so an off flag is a constant `false` and the
  bundler drops its code. A build can turn flags on with the environment variable
  `OPERATOR_FLAGS_ON=keypad,voice`. Only the flags-on test build sets it; `npm run build` and the
  deploy never do.
- **Pure code takes the flags as a value**: `playScreenProps(state, theme, features)`. Unit tests
  cover both states without any build.
- **No URL, setting or stored switch** (constitution VII, Principle I), so players cannot reach a
  feature that is off.

**What each flag does**:
- `keypad` off: `playScreenProps` asks the library to leave the keypad out, and no cell shows as
  selected. The session keeps its selection logic, which nothing can see.
- `voice` off: the bubble shows spec-001's message after a check, the status announces it (with
  the count when it changed), and the greeting stays.

**How flags are tested** (constitution VII: the pipeline tests what players get, and each flagged
story with its flag on):
- The game's phone projects (`iphone`, `android`) keep testing `npm run build`, what players get.
- Two new projects, `iphone-flagged` and `android-flagged`, test a flags-on build
  (`dist-flags-on/`, git-ignored, its own port). The test runner builds and serves it, as it does
  the catalogue, so the workflow file should need no change.
- **Which scenarios need a flag is decided by file, in `playwright.config.ts`** (Layer 3): while a
  flag is off, its Layer 1 file runs only on the flagged projects. `keypad.acceptance-spec.ts` is
  `keypad`, and `operator-voice.acceptance-spec.ts` is `voice`. Layer 1 stays free of flags, and
  releasing a story changes no locked file.
- The pull request that turns a flag on runs every scenario on `npm run build` with the flag on,
  which catches any interaction with what is already live.
- `tools/test-results.ts` learns the two new projects.

The flags are product flags, not test switches: the acceptance standard forbids test-only flags,
and these only choose which released features a build contains.

**Removing a flag**: once its story is released and signed off, in the next pull request that
touches that area (constitution VII). Removing it deletes the off path and its file rule.

**Alternatives considered**:
- **A URL parameter or stored setting**: players could reach unfinished work (against FR-414 and
  FR-411).
- **Remote configuration**: forbidden by Principle I.
- **A flag file edited by hand for tests**: `verify` could not test both states in one run.
