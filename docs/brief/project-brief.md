# Operator: Project Brief

Nov 1, 2026 · @Philip

## Overview

Operator is a number puzzle where players fill a grid with digits 1-9 so that every row and every column reaches the target number shown beside it. Each row and column (together, a line) has one operator (+, −, × or ÷), which is either shown or left for the player to choose. Several answers are usually valid, so the game counts how many different solutions the player finds.

**Four ideas carry the game**

- Targets sit on both rows and columns, so every cell has to satisfy two lines at once.
- Operator visibility is a difficulty dial: shown, mixed or open.
- Any valid answer is accepted, and the number of distinct solutions found is tracked and displayed.
- Whole numbers only: every step in a line must produce a whole number.

**How it differs from existing games** (from memory, not yet checked against app stores)

- Kakuro: digits fill runs to match sums. Addition only, no repeats in a run, one intended answer.
- KenKen / Calcudoku: each cage has its own operator, but the grid is a Latin square with one answer.
- Digits-style games: combine given numbers to reach a target, with no grid to fill.
- Nerdle / Mathler: guess a hidden equation, with tile feedback after each guess.

**Audience:** puzzle fans who enjoy Kakuro or KenKen, and people practising mental arithmetic. Platform: mobile-first web app, packaged for iOS and Android with Capacitor; works fully offline.

## Core rules

A puzzle is solved when every row and every column reaches its target.

- **Grid:** rows and columns of cells. Each row has a target to its left and each column has a target above it. MVP grids run from 3 rows × 3 columns up to 8 rows × 6 columns.
- **Lines:** a row or a column is a line. Every line has one operator, +, −, × or ÷, applied between each pair of cells in it.
- **Cells:** each empty cell takes one digit from 1 to 9 and counts in both its row and its column. Pre-filled cells are greyed out and cannot be changed.
- **Evaluation:** rows are worked left to right and columns top to bottom. For example 8 − 3 − 2 is 5 − 2, which is 3.
- **Whole numbers only:** every step must give a whole number. Division must be exact, and subtraction may not go below zero.
- **Repeats:** digits may repeat within a line and across lines.
- **Valid answers:** any filling that hits every target counts. The app checks by calculating, not by comparing with a stored answer.

Going below zero and repeated digits follow the defaults agreed under Open questions and risks.

## Operator modes

Operator visibility is the main difficulty dial, and it works in three modes.

| Mode | Operators | Player finds | Effect on play |
| --- | --- | --- | --- |
| Fixed | Every line shows its operator | Digits only | Baseline; difficulty comes from the numbers |
| Mixed | Some lines show it, some are open | Digits, plus the open operators | Shown lines anchor the reasoning; tune by how many stay open |
| Open | No line shows it | Digits and every operator | Many more valid answers per line |

Because any valid answer is accepted, open operators make one solution easier to find, not harder. On its own, a two-cell line with target 3 has 13 valid fillings once the operator is free, and crossing lines then narrow them. Open mode suits collecting many solutions. Harder single-solve puzzles come from fixed operators, few solutions overall and larger targets.

**Operator order**

Operator order is a setting that only matters when one line mixes operators between cells.

- **Left to right (default):** 2 + 3 × 4 is 5 × 4, which is 20.
- **Standard precedence (option):** × and ÷ come before + and −, so 2 + 3 × 4 is 2 + 12, which is 14.

In the MVP each line has one operator, so the setting has no effect. The evaluator takes the order rule as a parameter from the start, and Phase 2 adds lines with a different operator between each pair of cells. The whole-number rule applies at every step, in whichever order the rule dictates.

## Difficulty system

Difficulty comes from five levers that the generator sets together; Phase 2 adds a custom mode that exposes each one.

| Lever | Easier | Harder |
| --- | --- | --- |
| Grid size (rows × columns) | 3 × 3 | 8 × 6 |
| Pre-filled cells | About half | None |
| Operators in play | + only | + − × ÷ |
| Target size | Under 30 | 300 or more |
| Total solutions | Many | Few, down to exactly one |

Operator visibility sits beside these levers. It changes how many solutions exist, so its effect on difficulty shows up through the last row of the table. Targets are capped by what the operator can reach: a five-cell line sums to at most 45, so large targets only appear on × lines.

**Presets**

| Preset | Grid | Operators | Visibility | Pre-filled | Targets |
| --- | --- | --- | --- | --- | --- |
| Easy | 3 × 3 | + − | All shown | About half | Under 30 |
| Medium | 5 × 4 | + − × | Mixed, about half open | About a quarter | Up to 100 |
| Hard | 7 × 5 | + − × ÷ | Shown, one or two open | About 10% | Up to 500 |
| Collector | 4 × 3 | + − × ÷ | All open | None | Under 30 |

Grid is rows × columns, and every row and column carries a target. Collector is built for finding many solutions rather than one.

**Difficulty score**

Each puzzle also gets a score so custom puzzles can be labelled. This first-guess formula needs calibrating by playtests:

- 1 point per empty cell
- 1 point per − or × line, and 2 points per ÷ line, counting rows and columns
- 0 to 3 points for the largest target: under 30, 30-99, 100-299, or 300 and over
- 0 to 3 points for scarcity: 0 for more than 100 solutions, 1 for 11-100, 2 for 2-10, 3 for exactly one

The cut-offs between Easy, Medium and Hard are set after playtests; none are fixed yet.

## Multiple solutions

Any filling that hits every target is a valid solution, and the game logs how many distinct ones the player finds.

- **Distinct:** two solutions differ if any player-entered digit or chosen operator differs. In an open line, 3 × 1 and 3 ÷ 1 both reach 3 and count separately.
- **Counting:** rows and columns share cells, so counting is a search. The generator tries digit fillings by backtracking and, for each one that works, multiplies in the number of operators that hit each open line's target. It stops at 101.
- **Display:** the counter reads "Found N of M" when M is 100 or less, and "Found N" otherwise, so a huge total does not discourage players.
- **Repeats:** resubmitting a known solution does not raise the count.
- **Log:** each found solution is stored and can be reopened from a list.
- **Scoring:** the first solution earns the base score and each extra distinct solution adds a bonus. Hints reduce the score.
- **Later:** a rarity stat such as "4% of players found this one" needs a backend, so it waits for Phase 3.

Stopping the count at 101 is enough, because the exact total is only shown when it is 100 or fewer.

## Puzzle generation

The generator builds each puzzle backwards from a known solution, so every puzzle has at least one answer and every target is a whole number.

1. Take a seed, a grid size and a preset. The same seed always produces the same puzzle.
2. Fill the whole grid with digits 1-9. This is the known solution.
3. For each row and each column, pick an operator that gives a whole, non-negative result on its digits, favouring the preset's operator set, and compute the target. Reject a target of 0. If the preset's mix cannot be met, redraw the grid.
4. Grey out a share of the cells to match the preset, keeping their digits as given values.
5. Count solutions by backtracking over the empty cells, stopping at 101. For each digit filling that works, multiply in the number of operators that hit each open line's target. Time-box the search and discard puzzles that count too slowly.
6. Keep the puzzle only if the count falls inside the preset's band; otherwise regenerate. Store the seed, targets, operators, greyed cells and the capped count.

A seed means the MVP needs no backend, and a daily puzzle later is just a date-derived seed.

## Worked example

This 2 × 2 puzzle shows how a pre-filled cell, shown and open operators, and crossing lines work together. Rows read left to right and columns top to bottom.

| Grid | Column 1: open, target 3 | Column 2: × shown, target 6 |
| --- | --- | --- |
| Row 1: + shown, target 8 | 6 (given) | empty |
| Row 2: open, target 6 | empty | empty |

**Working it out**

1. Row 1 is 6 + ? = 8, so the top-right cell is 2.
2. Column 2 is 2 × ? = 6, so the bottom-right cell is 3.
3. The bottom-left cell, call it c, sits in two open lines. Row 2 is c ? 3 = 6, which works for c = 2 (×), 3 (+) and 9 (−). Column 1 is 6 ? c = 3, which works for c = 2 (÷) and 3 (−).
4. Only c = 2 and c = 3 satisfy both lines, so the puzzle has 2 solutions.

| Solution | Top row | Bottom row | Row 2 operator | Column 1 operator |
| --- | --- | --- | --- | --- |
| 1 | 6, 2 | 2, 3 | × | ÷ |
| 2 | 6, 2 | 3, 3 | + | − |

After the player submits both, the counter reads "Found 2 of 2".

## Scope

The MVP is a single-player, mobile-first web game with targets on rows and columns and one operator per line.

- **MVP:** grid play with row and column targets, line evaluation with the whole-number rule, Fixed / Mixed / Open modes, any-valid checking, the solution log and counter, Easy / Medium / Hard / Collector presets, and a seeded generator with capped solution counting.
- **Phase 2:** hints (reveal an operator or fill one cell), lines with mixed operators and the order setting, and custom difficulty with a live score.
- **Phase 3:** a daily puzzle and share-by-seed, global solution-rarity stats, and optional negative-number and no-repeat variants.
- **Out of scope:** fractions and decimals, real-time multiplayer, accounts and monetisation.

The platform is decided: a client-side web app with no backend, packaged for iOS and Android with Capacitor, so it works fully offline. Seeded puzzles need no server.

## Feature map and acceptance criteria

Fourteen features: a walking skeleton (F0), seven MVP features, store packaging before launch (F13), and five later features. Each has a testable pass condition.

| ID | Feature | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| F0 | Walking skeleton | The 2 × 2 worked example plays end to end on a phone browser: digits 1-9 go in empty cells, the given cell cannot change, open operators cycle on tap, and any valid filling is accepted. After both solutions are submitted the counter reads "Found 2 of 2". The pipeline builds and deploys it to a public URL. | Skeleton |
| F1 | Grid and entry | Each row shows its target on the left and each column shows its target above. Empty cells accept only digits 1-9. Pre-filled cells are greyed and reject input. | MVP |
| F2 | Line evaluation | A row or column is marked correct when its result equals its target. A step that is not a whole number, or goes below zero, marks the line invalid and names the step. | MVP |
| F3 | Operator modes | Fixed lines cannot change operator. Open lines cycle through + − × ÷ on tap. A Mixed puzzle contains both kinds, across rows and columns. | MVP |
| F4 | Any-valid checking | The puzzle is solved when all rows and columns hit their targets, whether or not the grid matches the generator's own answer. | MVP |
| F5 | Solution log and counter | Each distinct solution is added once. Resubmitting a known solution leaves the count unchanged. The counter shows "Found N of M" when M is 100 or less, otherwise "Found N". | MVP |
| F6 | Presets | Easy, Medium, Hard and Collector set the levers in the preset table. | MVP |
| F7 | Seeded generator | The same seed gives the same puzzle. Every puzzle has at least one solution, whole-number targets and no target of 0. Solutions are counted by search, capped at 101, and fall inside the preset's band. | MVP |
| F13 | Store packaging | The game is packaged with Capacitor for Android and iOS, works fully offline, respects safe areas and shows no browser behaviour. Builds reach an Android internal testing track and TestFlight, with icon, launch screen and privacy details ready for store submission. | Before launch |
| F8 | Hints | "Reveal an operator" and "Fill one cell" work on unsolved puzzles. Each hint used is shown with the result and lowers the score. | Phase 2 |
| F9 | Mixed operators in a line | A line can have a different operator between each pair of cells. The order setting switches between left to right and standard precedence, so 2 + 3 × 4 gives 20 or 14. | Phase 2 |
| F10 | Custom difficulty | Each lever can be set by hand and the difficulty score updates live. | Phase 2 |
| F11 | Daily puzzle and share | A date-derived seed gives one puzzle per day. A share link reproduces any puzzle from its seed. | Phase 3 |
| F12 | Solution rarity | After solving, the player sees what share of players found each solution. | Phase 3 |

## Open questions and risks

All the points below are settled.

- [x] Targets sit on rows and on columns.
- [x] "Operator order" means mixing operators within a line: one operator per line in the MVP, mixed lines in Phase 2.
- [x] A step cannot go below zero; results stay at zero or above.
- [x] Digits may repeat within a line.
- [x] 3 × 1 and 3 ÷ 1 count as two solutions, because the operator is part of a solution.
- [x] The total number of solutions is shown only when it is 100 or fewer.
- [x] The audience is puzzle fans, on a mobile-first web platform.
- [x] Game name: Operator (working title).
- [x] Columns have their own operators, worked top to bottom, with the same shown / open modes as rows.

**Risks**

- Instant line feedback could turn Open mode into trial and error. Consider checking only on submit, or limiting checks.
- The difficulty score is a guess until playtests calibrate it.
- Prior art was checked from memory only; a search of app stores is still needed.
- Counting solutions is now a search, so large open grids may count slowly. The generator needs a time limit and a ceiling on solutions per preset.
