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
