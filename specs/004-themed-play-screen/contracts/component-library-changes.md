# Contract changes: Component Library (spec-004)

**Date**: 2026-11-07. Additions to `docs/contracts/component-library.md` (spec-003), made in
spec-004's first pull request (research R2). Nothing existing changes meaning; every catalogue
scenario still passes.

| Component | Tier | Addition | Accessible behaviour |
| --- | --- | --- | --- |
| Button | simple | optional trailing decorative `icon` (`tick`), drawn after the label | none: the icon is hidden; the name is unchanged |
| Target pill | combined | an open pill whose line reaches its target shows the tick (Button's `icon`) | name ends ", target reached", as a shown pill's |
| Keypad | combined | prop `keysAvailable: boolean` (default true); `update` changes it | while false, every key and Oops is `aria-disabled="true"`, still focusable, and calls nothing |
| Puzzle grid | combined | actions `onCell(row, column)` and `onPill(axis, index)` | taps on a given cell or a shown pill are not sent |
| Play screen | screen | props `isKeypadShown` (default true), `keysAvailable` and `announcement`; actions `onCell`, `onPill` passed to the grid | a visually hidden polite `status` holding `announcement`, written only when it changes; while it is not empty, the bubble's line is hidden from screen readers |

**Catalogue samples added**:
- Target pill: "Open, line correct".
- Keypad: "Unavailable".
- Play screen: the screen samples gain the keypad's availability and an announcement. Their
  wording follows spec-004's Messages table: "Row 1 correct" shows the greeting, and "All found"
  shows "Every line connected, pal!".
  - The locked spec-003 scenarios check only the Greeting sample's words ("Fill the grid, pal."),
    which do not change.
  - spec-003 AC-17 requires the play screen's layout to stay the same across the samples, so the
    new lines must take the same number of lines in the bubble. AC-17 fails if they do not.

Simple components keep taking every colour from the four theme colours. Combined components and
the screen still only lay out (spec-003 FR-302 to FR-304, `tools/ui-tiers.spec.ts`).
