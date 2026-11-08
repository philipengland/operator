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
