# Contract changes: Play Screen (spec-007)

**Date**: 2026-11-10. Additions to `docs/contracts/play-screen.md`, the names the UI driver and screen
readers rely on. Each takes effect with its flag. Every existing name is unchanged for the worked example.

## The Today button (`daily`)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Today | `button` | "Today's puzzles" | Opens the Today screen. Beside the counter, or in the compact bar |

## The Today screen (`daily`)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Heading | `heading` | "Today" | Receives focus on arrival |
| Way back | `button` | "Back" | Same as the phone's back gesture: to the puzzle it was opened from |
| Preset row | `button` | "Easy, found 1 of 4" / "Collector, found 3" | Opens that preset's puzzle for today. Medium and Collector with `presets`; Hard with `hard` |
| Practice row | `button` | "Practice, found 1 of 2" | Opens the worked example |

## A daily puzzle's grid (`daily`)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Puzzle | `group` | "Easy puzzle, 3 by 3" (FR-717) | As "Puzzle" for the worked example, which keeps its name |
| Cell | `button` | "Row 2 column 3 cell, empty" / "…, given 6" / "…, 4" | The worked example keeps "Top-right cell" and the other corner names |
| Pill, working | as today | "Row 2 target 14, plus" / "Row 2 working, 6 + ?" | Unchanged form, for every row and column |

## The compact screen and workings strip (`presets`, grids bigger than 3 × 3)

| Element | Role | Accessible name | Behaviour |
| --- | --- | --- | --- |
| Counter | `button` | "Found N of M" / "Found N" | In the compact bar; opens the list, as spec-006 |
| Row and column workings | text, labelled | unchanged | Visually hidden on grids wider than 3 columns; still read by name |
| Workings strip | hidden from screen readers | none | Shows the selected cell's row and column workings, or the operator's line after a Check |
| Result | `status` | unchanged | The operator's line is still announced (spec-004) |

The worked example and Easy keep the full header, counter and workings beside each line.
