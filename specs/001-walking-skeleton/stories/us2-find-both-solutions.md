# User Story 2 - Find both solutions (Priority: P2)

**Feature**: [Walking Skeleton (F0)](../spec.md)

> **Master copy**: the acceptance criteria below are copied from [spec.md](../spec.md),
> which is the source of truth. A change to a criterion must be made in both files.

> **As a** puzzle fan who has already solved the puzzle once,
> **I want to** look for a different answer and see how many answers I have found so far,
> **So that** I can keep playing until I have found every answer.

Having found one solution, the player changes the grid to find a different one. Each
distinct solution adds one to the counter. Submitting a solution already found again does not.
When both are found the counter reads "Found 2 of 2".

**Why this priority**: counting many valid answers is what makes Operator different from
Kakuro and KenKen. F0 proves the idea on the smallest puzzle that has more than one answer.

**Independent Test**: submit Solution A, then Solution B, and see "Found 2 of 2"; submit
Solution A again and see the count stay at 2.

The puzzle and its two solutions are in the spec's [The Puzzle](../spec.md#the-puzzle)
section.

## Acceptance Scenarios

1. **AC-12** — **Given** the counter reads "Found 1 of 2" after Solution A, **When** the
   player changes bottom-left to 3, Row 2 to + and Column 1 to − (Solution B) and submits,
   **Then** the game says this is a new solution and that every solution has been found,
   and the counter reads "Found 2 of 2".
2. **AC-13** — **Given** the counter reads "Found 1 of 2" after Solution A, **When** the
   player submits Solution A again, **Then** the game says this solution has already been
   found and the counter still reads "Found 1 of 2".
3. **AC-14** — **Given** the counter reads "Found 2 of 2", **When** the player submits
   Solution B again, **Then** the counter still reads "Found 2 of 2".
4. **AC-15** — **Given** the player has submitted Solution B first, **When** they then
   submit Solution A, **Then** the game says every solution has been found and the counter
   reads "Found 2 of 2" (the order does not matter).
5. **AC-16** — **Given** a solution has just been accepted, **When** the player looks at the
   grid, **Then** their digits and operators are still in place for them to change.
