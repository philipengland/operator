# User Story 1 - Solve the puzzle on a phone (Priority: P1)

**Feature**: [Walking Skeleton (F0)](../spec.md)

> **Master copy**: the acceptance criteria below are copied from [spec.md](../spec.md),
> which is the source of truth. A change to a criterion must be made in both files.

> **As a** puzzle fan playing on my phone,
> **I want to** fill in the empty squares, choose the missing operators and check my answer,
> **So that** I can find out whether I have solved the puzzle.

A player opens the game in their phone's browser and sees the 2 × 2 puzzle, with each row's
target on its left and each column's target above it. They tap the three empty cells to step
each one to the digit they want, tap the two open operators to choose them, and submit. If
every row and column reaches its target, the game accepts the answer and the counter reads
"Found 1 of 2". If not, the game says the puzzle is not solved yet and the counter does not
change.

**Why this priority**: this is the whole game loop in its smallest form: read the grid, fill
it, choose operators, check. Every later feature builds on it.

**Independent Test**: open the game on a phone, enter Solution A, submit, and see "Found 1 of 2".

The puzzle, its cell names and its two solutions are in the spec's
[The Puzzle](../spec.md#the-puzzle) section.

## Acceptance Scenarios

1. **AC-1** — **Given** the game has just opened, **When** the player looks at the grid,
   **Then** they see the given 6 in the top-left cell, three empty cells, row targets 8 and 6,
   column targets 3 and 6, + on Row 1, × on Column 2, Row 2 and Column 1 shown as not yet
   chosen, and the counter reading "Found 0 of 2".
2. **AC-2** — **Given** the top-right cell is empty, **When** the player taps it once,
   **Then** it shows 1; **When** they tap it 6 more times, **Then** it shows 7.
3. **AC-3** — **Given** the bottom-left cell shows 9, **When** the player taps it,
   **Then** the cell is empty again.
4. **AC-4** — **Given** the top-left cell holds the given 6, **When** the player taps it,
   **Then** it still shows 6 and looks visibly different from cells the player can change.
5. **AC-5** — **Given** an empty cell, **When** the player taps it ten times, **Then** it
   shows 1, 2, 3, 4, 5, 6, 7, 8, 9 and then is empty again, and never shows 0 or any other
   character.
6. **AC-6** — **Given** Row 2's operator is not yet chosen, **When** the player taps it
   five times, **Then** it shows +, then −, then ×, then ÷, then + again.
7. **AC-7** — **Given** the player taps Row 1's + or Column 2's ×, **Then** the operator
   does not change.
8. **AC-8** — **Given** the player has entered top-right 2, bottom-left 2, bottom-right 3,
   Row 2 × and Column 1 ÷ (Solution A), **When** they submit, **Then** the game says the
   puzzle is solved and the counter reads "Found 1 of 2".
9. **AC-9** — **Given** the player has entered top-right 2, bottom-left 9, bottom-right 3,
   Row 2 − and Column 1 − (Row 2 gives 9 − 3 = 6, but Column 1 gives 6 − 9, which goes below
   zero), **When** they submit, **Then** the game says the puzzle is not solved yet and the
   counter still reads "Found 0 of 2".
10. **AC-10** — **Given** the player has entered top-right 2, bottom-left 4, bottom-right 3,
    Row 2 + and Column 1 ÷ (Column 1 gives 6 ÷ 4, which is not a whole number), **When** they
    submit, **Then** the game says the puzzle is not solved yet and the counter does not change.
11. **AC-11** — **Given** the bottom-right cell is empty, or Column 1's operator is not yet
    chosen, **When** the player submits, **Then** the game says every cell and every open
    operator must be filled before checking, and the counter does not change.
12. **AC-20** — **Given** the game has just said the puzzle is not solved yet, **When** the
    player taps the bottom-left cell, **Then** the message disappears without anything being
    announced and the counter does not change; **When** they instead tap the given 6,
    **Then** the message stays.
