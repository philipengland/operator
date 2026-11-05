# Executable Specifications — Live Line Calculations (spec-002)

<!--
  Written by /speckit.acceptance. Lists the Layer 1 scenarios and Layer 2 DSL
  that define success for this feature. Once the Approval section is filled
  in, every file listed below is LOCKED: /speckit.implement runs them but
  never changes them, and CODEOWNERS requires the spec owners to approve any
  later change.
-->

- **Spec**: `specs/002-live-calculations/spec.md`

Scenarios run with Playwright Test, as for spec-001. Untagged scenarios run through both the
in-process driver and the Playwright UI driver; `@ui` scenarios run through the UI driver only.
Every spec-001 scenario keeps running unchanged, apart from the AC-9 rewording below.

## Scenarios

| Criterion | Scenario | File |
|---|---|---|
| AC-1: the working on opening | Each line shows its given digits and operators, with ? for everything not yet filled in | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-1 | Each row's working is on its right and each column's is underneath (`@ui`) | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-2: the first digit | Top-right 2 makes Row 1 "6 + 2 = 8" and Column 2 "2 × ?" | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-3: a column with both digits | Top-right 2 and bottom-right 3 make Column 2 "2 × 3 = 6" | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-4: choosing an operator changes the working | Each tap on Row 2's operator: "2 + 3 = 5", "2 − 3 = −1", "2 × 3 = 6" | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-5: dividing in a column | Bottom-left 2 and Column 1 ÷ make "6 ÷ 2 = 3" | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-6: every line reaching its target | Solution A: all four results equal their targets and are marked; nothing counted until Check | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-7: one change, straight away | Bottom-left 3 after Solution A: Row 2 "3 × 3 = 9" and Column 1 "6 ÷ 3 = 2" unmarked, before any Check | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-11: wrong, then right | Row 1 "6 + 3 = 9" unmarked, then "6 + 2 = 8" marked | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-8: a result below zero | Column 1 "6 − 9 = −3", unmarked | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-9: a division that is not whole | Column 1 "6 ÷ 4" with a cross and no result | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| AC-10: making the division whole | Two taps to 6: Column 1 "6 ÷ 6 = 1", no cross | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| Edge case: a cell cleared again | Top-right from 2 round to empty returns Row 1 to "6 + ?" | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| Accessibility (Q3): not announced | A tap that changes Row 1's working announces nothing | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| Edge case: small screens | On 320 × 568, all four workings and everything spec-001 requires are visible (`@ui`) | `test/acceptance/play/see-line-working.acceptance-spec.ts` |
| Edge case: small screens | On 375 × 667, the same (`@ui`) | `test/acceptance/play/see-line-working.acceptance-spec.ts` |

**Checked by unit tests, not by these scenarios** (spec-002 option A):

- **AC-12**: a line with target −3 is met by 6 − 9 and not by 6 − 8. F0's puzzle has no
  negative target, so this is proved on a test puzzle in `src/engine/line-working.spec.ts`.
- **FR-208**: Check accepts results below zero. No grid in F0's puzzle can show it on screen;
  `src/engine/check-entry.spec.ts` covers it, and spec-001 AC-9 still passes.

**Checked by hand** ([quickstart.md](quickstart.md) section 4): VoiceOver and TalkBack read
each working sensibly; SC-201 and SC-202 playtests.

## Amended spec-001 file (owner decision 2026-11-05)

spec-001 AC-9 still passes, but its wording gave "below zero" as the reason, which spec-002
FR-208 removes. Only the wording changes; the steps and assertions do not.

| File | Before | After |
|---|---|---|
| `test/acceptance/play/solve-puzzle.acceptance-spec.ts` | `[spec-001 AC-9] a line that goes below zero` / "…but Column 1 goes below zero, so the puzzle is not solved" | `[spec-001 AC-9] right row, wrong column` / "…but Column 1 gives 6 − 9 = −3, not its target of 3, so the puzzle is not solved" |
| `test/acceptance/play/examples.ts` | `belowZero`: "…Column 1 gives 6 − 9, which goes below zero." | "…Column 1 gives 6 − 9 = −3, not its target of 3 (spec-002 FR-208)." |

## DSL Added or Changed

| Method | Purpose |
|---|---|
| `game.expectWorking(line, working)` | A line's working reads exactly this, e.g. "6 + 2 = 8" or "6 + ?". |
| `game.expectWorkings(workings)` | Every listed line's working reads as given. |
| `game.expectTappingOperatorShowsWorking(line, workings)` | Each tap on the operator shows the next working in the list. |
| `game.expectMarkedAsReachingTarget(lines)` | Each listed line is marked as reaching its target. |
| `game.expectNotMarked(lines)` | Each listed line carries no mark and no cross. |
| `game.expectCrossedOut(line)` | The line shows a cross: its division is not whole. |
| `phone.expectRowWorkingsOnTheRight()` | Each row's working is right of, and level with, its cells. |
| `phone.expectColumnWorkingsBelow()` | Each column's working is below, and in line with, its cells. |
| `phone.expectLineWorkingsOnScreen()` | All four workings are visible without scrolling. |

New words in `test/acceptance/dsl/vocabulary.ts`: `Working` (a line's working as text) and
`WorkingMark` ('target reached', 'not a whole number' or 'none').

## Driver Interface Required

Signatures only; `/speckit-implement` builds the drivers.

- `test/acceptance/drivers/game.driver.ts`: `GameView` gains
  `workings: Record<Line, WorkingView>`, where `WorkingView` is `{ working, mark }`. Both the
  in-process and the UI driver fill it in.
- `test/acceptance/drivers/phone.driver.ts`: `ScreenLayout` gains
  `workings: Record<Line, Box>`. The UI driver fills it in.

## Approval

- **Approved by**: Philip England, product owner and solo developer
- **Date**: 2026-11-05
- **Locked files**:
  - Layer 1 (scenarios and examples):
    - `test/acceptance/play/see-line-working.acceptance-spec.ts` (new)
    - `test/acceptance/play/solve-puzzle.acceptance-spec.ts` (AC-9 wording only)
    - `test/acceptance/play/examples.ts` (`belowZero` comment only)
  - Layer 2 (DSL):
    - `test/acceptance/dsl/game.dsl.ts` (methods added)
    - `test/acceptance/dsl/phone.dsl.ts` (methods added)
    - `test/acceptance/dsl/vocabulary.ts` (`Working`, `WorkingMark` added)

Not locked (Layer 3, built and changed by `/speckit-implement`): `test/acceptance/drivers/`,
including the `GameView` and `ScreenLayout` additions above, and `test/acceptance/support/`.
