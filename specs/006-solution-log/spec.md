# Feature Specification: Solution Log

**Feature Branch**: `006-solution-log`

**Created**: 2026-11-08

**Status**: Draft

**Input**: User description: "F5 solution log and counter, from docs/brief/project-brief.md: each
distinct solution is added once, resubmitting a known solution leaves the count unchanged, the
counter shows 'Found N of M' when M is 100 or less and otherwise 'Found N', and each found solution
is stored on the phone and can be reopened from a list. The owner chose to build F5 before the
seeded generator (F7), so the stored format must allow for seeded puzzles later without a
migration."

## Context

This feature builds on specs [001](../001-walking-skeleton/spec.md),
[002](../002-live-calculations/spec.md), [003](../003-themed-ui/spec.md) and
[004](../004-themed-play-screen/spec.md). Everything in them still holds unless this spec says
otherwise. It plays the same fixed 2 × 2 puzzle.

**User need (Overlay P1).** The game is about finding every answer, not just one. Today that effort
is lost: closing or reloading the page puts the counter back to "0 of 2", and a player cannot look
back at what they have found. Evidence: the brief makes the log part of the MVP (F5), and spec-001
deferred saving to it.

**What is already done.** Each distinct solution counts once and a repeat does not raise the count
(spec-001 AC-12, AC-13), and the counter reads "Found N of M". This spec adds the list, reopening,
starting again and remembering, and "Found N" for very large totals.

**Solutions**: Solution A is top-right 2, bottom-left 2, bottom-right 3, Row 2 ×, Column 1 ÷.
Solution B is top-right 2, bottom-left 3, bottom-right 3, Row 2 +, Column 1 −.

### Release order (constitution VII)

Every merge to `main` deploys, so each step is fit for players and goes live on its own.

| Release | What players get | Flag |
| --- | --- | --- |
| 1. User Story 1: the list | A list of the solutions found since the game was opened | `log` |
| 2. User Story 2: reopening | Tap a solution to see it in full, read-only | `reopen` |
| 3. User Story 3: starting again | Clear the list and the counter | `startAgain` |
| 4. User Story 4: remembering | Solutions and the counter survive reloading and closing | `remember` |
| 5. User Story 5: very large totals | Nothing visible until F7, which brings large totals | none: players cannot reach it yet |

**Why remembering comes last.** Once found solutions are saved, a player who has found both answers
would see "All found!" every time they came back, for good, unless they can start again. So starting
again must be live first.

### Changes to earlier specs

| Earlier item | Change |
| --- | --- |
| spec-001 Assumption "No saving" | **Changed** by User Story 4: found solutions are kept. The current entry is still lost on reload. |
| spec-001 Edge case "Reload: reloading the page starts the puzzle afresh at 'Found 0 of 2'" | **Changed** by User Story 4: the counter keeps its value; the grid is still empty. |
| spec-001 Out of Scope "the solution log list, and saving progress or found solutions (F5)" | **Delivered here**, for found solutions. |
| spec-001 AC-12, AC-13 (a repeat does not raise the count) | **Still hold**, including after a reload (AC-16). |
| spec-001 FR-016 (the game keeps no copy of itself) | **Still holds.** Found solutions are the player's progress, not a copy of the game. |
| spec-001 FR-013, spec-003 (the counter) | **Extended**: "Found N" when the total is over 100 (FR-616). |
| spec-004 FR-404 and the screen | **Still hold**, except as FR-601 says for the counter. |
| spec-003 AC-1 (the catalogue lists every component, in exact lists per tier) | **Extended**: the new parts are added. The locked lists change only with the owner's approval, at `/speckit-acceptance`. |

## Clarifications

### Session 2026-11-08

- Q: What happens when a player taps a solution in the list? → A: It opens in a read-only view. The
  grid in progress is not touched (FR-606, FR-607).
- Q: How does a player get to the list? → A: By tapping the "Solutions found" counter, which opens a
  screen of its own with a way back (FR-601).
- Q: Can a player start again? → A: Yes: "Start again" on the list, with a confirmation, clears the
  list, the counter and the grid (FR-608).
- Q: When the list or a solution is open and the player uses the phone's own back gesture or button,
  what should happen? → A: It works like the on-screen way back: from a solution to the list, from the
  list to the puzzle. On the puzzle itself it leaves the game, as today (FR-604).
- Q: What should each solution look like as a row in the list? → A: Only its number: "Solution 1",
  "Solution 2". The digits and operators are in the read-only view (FR-602).
- Q: When a player taps "Start again", how should the game ask them to confirm? → A: A themed pop-up
  over the screen (FR-608).
- Q: Should the new screens speak in the operator's voice, or in plain words? → A: In character where it
  is light, plain where it matters. The empty list says "No calls yet, pal.", with the theme's address.
  "Solution 1", the pop-up and what a screen reader hears stay plain (FR-603).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The list of solutions found (Priority: P1)

A player can open a list of the solutions they have found, and come back to the puzzle exactly as
they left it.

**Why this priority**: it is what a "log" is, and everything else builds on it.

**Independent Test**: find Solution A, open the list and read it; go back and see the grid unchanged.

**Acceptance Scenarios**:

1. **AC-1** — **Given** the game has just opened, **When** the player opens the list, **Then** it
   says "No calls yet, pal.", and a screen reader hears "No solutions found yet".
2. **AC-2** — **Given** the player has found Solution A, **When** they open the list, **Then** it
   shows one entry, "Solution 1".
3. **AC-3** — **Given** the player has found Solution A and then Solution B, **When** they open the
   list, **Then** it shows two entries, "Solution 1" and then "Solution 2".
4. **AC-4** — **Given** the player has found Solution A and put it through again, **When** they open
   the list, **Then** it still shows one entry.
5. **AC-5** — **Given** the grid shows top-right 5 and the list is open, **When** the player goes
   back, **Then** the play screen shows, with top-right still 5 and the selection and message as they
   were.
6. **AC-6** — **Given** the list shows "Solution 1", **When** a screen reader reads the entry, **Then**
   it hears "Solution 1", and the accessibility scan finds no problems.
25. **AC-25** — **Given** the grid shows top-right 5 and the list is open, **When** the player uses the
    phone's own back gesture, **Then** the play screen shows with top-right still 5.

---

### User Story 2 - Reopening a solution (Priority: P1)

A player can tap a solution in the list to see it in full again, with its targets and workings,
without losing the grid they are working on.

**Why this priority**: the brief asks for it, and it is what makes the list more than a tally.

**Independent Test**: find Solution A, start another entry, reopen Solution A from the list, then go
back and see the entry unchanged.

**Acceptance Scenarios**:

7. **AC-7** — **Given** the player has found Solution A, **When** they tap "Solution 1" in the list,
   **Then** a read-only view shows the given 6, top-right 2, bottom-left 2, bottom-right 3, Row 2 × and
   Column 1 ÷, with every line marked as reaching its target.
8. **AC-8** — **Given** Solution A is open in the read-only view, **When** the player taps bottom-right
   and the Row 2 pill, **Then** nothing changes, and there is no keypad and no button to put it through.
9. **AC-9** — **Given** the grid shows top-right 5 and Solution A is open in the read-only view, **When**
   the player goes back to the list and then to the play screen, **Then** top-right still shows 5 and
   the counter still reads "1 of 2".
10. **AC-10** — **Given** Solution A is open in the read-only view, **When** a screen reader reads it,
    **Then** it hears "Solution 1", each cell's value and each line's result, no cell or pill is
    offered as something to tap, and the accessibility scan finds no problems.
26. **AC-26** — **Given** Solution A is open in the read-only view, **When** the player uses the phone's
    own back gesture, **Then** the list shows.
27. **AC-27** — **Given** the player has found Solution A and then Solution B, **When** they tap
    "Solution 2", **Then** the read-only view shows top-right 2, bottom-left 3, bottom-right 3, Row 2 +
    and Column 1 −.

---

### User Story 3 - Starting again (Priority: P1)

A player can clear what they have found and hunt for the answers again.

**Why this priority**: without it, a player who has found everything has nothing left to do, and it
must be live before solutions are remembered.

**Independent Test**: find Solution A, start again, and find Solution A once more.

**Acceptance Scenarios**:

11. **AC-11** — **Given** the list shows "Solution 1", **When** the player taps "Start again" and then
    "Keep them" in the pop-up, **Then** the list still shows "Solution 1".
12. **AC-12** — **Given** the list shows "Solution 1", **When** the player taps "Start again" and
    then "Yes, clear" in the pop-up, **Then** the list says "No calls yet, pal."; back on the play screen the grid is
    empty, the counter reads "0 of 2" and the bubble says "Fill the grid, pal."
13. **AC-13** — **Given** the player has started again, **When** they enter and put through Solution A,
    **Then** the bubble says "You're connected! Keep 'em coming, pal!" and the counter reads "1 of 2".
28. **AC-28** — **Given** the pop-up asking "Clear all solutions?" is open, **When** a screen reader reads
    the screen, **Then** focus is inside the pop-up, it hears the question, only "Yes, clear" and "Keep
    them" can be reached, focus returns to "Start again" on "Keep them", and the accessibility scan
    finds no problems.

---

### User Story 4 - Remembering what was found (Priority: P1)

A player who comes back later still has the solutions they found.

**Why this priority**: it is the reason to have a log at all. It comes last only because of the order
above.

**Independent Test**: find Solution A, reload, and read the counter and the list.

**Acceptance Scenarios**:

14. **AC-14** — **Given** the player has found Solution A, **When** they reload the page, **Then** the
    counter reads "1 of 2", the list shows "Solution 1", opening it shows Solution A, the grid is empty
    and the bubble says "Fill the grid, pal."
15. **AC-15** — **Given** the player has found Solution A, **When** they close the page and open the
    game again, **Then** the counter reads "1 of 2".
16. **AC-16** — **Given** Solution A was found before a reload, **When** the player enters and puts
    through Solution A, **Then** the bubble says "We've had that call, pal." and the counter stays at
    "1 of 2".
17. **AC-17** — **Given** the player has found Solutions A and B, **When** they reload, **Then** the
    counter reads "All found!" and "2 of 2".
18. **AC-18** — **Given** the player has found Solution A and started again, **When** they reload,
    **Then** the counter reads "0 of 2".
19. **AC-19** — **Given** the phone will not let the game save, **When** the player finds Solution A,
    **Then** the counter reads "1 of 2", the list shows "Solution 1", and no error appears.
20. **AC-20** — **Given** the saved data cannot be read, **When** the game opens, **Then** the counter
    reads "0 of 2" and the game plays normally.
21. **AC-21** — **Given** the saved data holds a filling that does not solve the puzzle (top-right 9,
    bottom-left 2, bottom-right 3, Row 2 ×, Column 1 ÷), **When** the game opens, **Then** it is not
    counted or listed.
22. **AC-22** — **Given** Solution A is saved for this puzzle, and another puzzle with its own identity
    is opened, **When** that puzzle's log is read, **Then** it is empty, and this puzzle's still holds
    Solution A.

---

### User Story 5 - The counter with a very large total (Priority: P3)

When a puzzle has more than 100 solutions, the counter leaves out the total, so a huge number does
not put the player off.

**Why this priority**: no puzzle can reach it until the generator (F7). It is small and the brief asks
for it here.

**Independent Test**: proved below the screen, with sample totals, until F7 brings such a puzzle.

**Acceptance Scenarios**:

23. **AC-23** — **Given** a puzzle with 100 solutions and 3 found, **When** the counter is worked out,
    **Then** it reads "Found 3 of 100".
24. **AC-24** — **Given** a puzzle whose count is capped at 101 and 3 found, **When** the counter is
    worked out, **Then** it reads "Found 3".

---

### Edge Cases

- **Two tabs of the game open**: a solution found in one is not lost when the other saves. The other
  shows it the next time it is opened.
- **Storage full or refused** (private browsing, for example): the game behaves as today; the list
  and counter work until the page is closed (AC-19).
- **The list or a read-only view is open when the page reloads**: the game opens on the play screen.
- **A player wants to change a solution they have reopened**: they cannot, in the view. They go back
  and enter it on the grid, where it is an ordinary entry.
- **The phone's back gesture while the pop-up is open**: it closes the pop-up and clears nothing, as
  "Keep them" does.
- **A double-tap on "Start again"**: the second tap must not confirm (FR-608).
- **A long list**: it scrolls within the screen. The way back stays reachable without scrolling.
- **Saved data from an earlier version**: still read (FR-614).
- **The puzzle's definition changes in a later version**: saved fillings that no longer solve it are
  dropped when read (AC-21).

## Requirements *(mandatory)*

### Functional Requirements

**The list**

- **FR-601**: Tapping the "Solutions found" counter MUST open the list on a screen of its own, with a
  way back. The counter is what changes on the play screen, as there is no room for another control. It
  MUST keep its look and its "Found N of M" wording to a screen reader, and be offered as something to
  tap, at least 44 × 44 pixels.
- **FR-602**: The list MUST show each found solution once, in the order found, named only by its number
  ("Solution 1", "Solution 2"). Numbers follow the order found and start again at 1 after "Start again".
- **FR-603**: With nothing found, the list MUST show "No calls yet," followed by the theme's address
  ("No calls yet, pal."; Midnight blue's "No calls yet, chief."), and a screen reader MUST hear "No
  solutions found yet". "Solution 1", "Start again" and the pop-up's words are plain, in every theme.
- **FR-604**: Going back MUST return to the play screen exactly as it was. The phone's own back gesture
  or button MUST work like the on-screen way back, from a solution to the list and from the list to the
  puzzle. On the puzzle it leaves the game, as today.
- **FR-605**: Every entry MUST have an accessible name giving its number (AC-6). The list MUST NOT rely on colour alone, and every control MUST be at least 44 × 44
  pixels.

**Reopening**

- **FR-606**: Tapping an entry MUST open that solution in a read-only view, with its number, the whole
  puzzle as solved, every line marked as reaching its target, and a way back to the list. Nothing in the
  view can be changed, and it has no keypad and no button to put it through.
- **FR-607**: Reopening MUST NOT change the count, the list or the grid in progress.

**Starting again**

- **FR-608**: The list MUST offer "Start again", which opens a pop-up in the game's look, over the
  screen, asking "Clear all solutions?" with "Yes, clear" and "Keep them". "Yes, clear" clears the list,
  the counter, the grid and any message. Neither button may sit where "Start again" was, so a double-tap
  cannot confirm. While it is open, a screen reader's focus stays inside it. With nothing found, there is
  nothing to clear and "Start again" is not offered.

**Remembering**

- **FR-609**: Each new solution MUST be saved on the phone at the moment it is found, with no message.
- **FR-610**: On opening, the game MUST restore the found solutions and the counter. The grid MUST be
  empty and the bubble MUST show the greeting.
- **FR-611**: Every saved filling MUST be checked by the puzzle's rules when read, and one that does not
  solve the puzzle MUST be ignored (constitution II).
- **FR-612**: If saving or reading fails, or the data cannot be understood, the game MUST carry on with
  what it has and show no error.
- **FR-613**: Saved solutions MUST be held per puzzle, under an identity for that puzzle. The fixed
  puzzle has its own identity now, and a seeded puzzle's identity will come from its seed and settings.
- **FR-614**: The saved format MUST say which format it is, and MUST stay readable after every update
  (constitution, Data). Adding seeded puzzles MUST NOT change or move what is already saved.
- **FR-615**: Nothing MUST leave the phone. The game makes no new network requests.

**The counter**

- **FR-616**: The counter MUST read "Found N of M" when M is 100 or less, and "Found N" otherwise, on
  screen and to a screen reader.

**Flags**

- **FR-617**: While a story's flag is off, players MUST NOT be able to reach it, and MUST see no change.

### Key Entities

- **Puzzle identity**: says which puzzle a solution belongs to.
- **Found solution**: one distinct filling for one puzzle: its digits, its chosen operators and its
  place in the order found.
- **Solution log**: all the found solutions on one phone, grouped by puzzle.

## Acceptance Criteria as Examples *(org baseline)*

AC-1 to AC-28 above use concrete examples, with Solutions A and B as defined under Context.

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: opening the list, going back and reopening a solution each respond within 0.1 seconds
  on the reference device (spec-001 SC-003). Restoring solutions stays within the 3-second ready-to-play
  budget (SC-004). The game stays within its 30 KB budget for code and styles.
- **Availability**: none beyond platform defaults: the log is on the phone and needs no service.
- **Security**: no accounts or personal data. Saved data is treated as untrusted when read (FR-611,
  FR-612). The plan records a threat model (Baseline principle 6).
- **Accessibility**: WCAG 2.2 AA. The new screen and every control pass the accessibility scan, are
  usable by touch and screen reader, and honour reduced motion.
- **Capacity and scale**: at least 200 solutions per puzzle. Very many puzzles arrive with F7.

## Integration and Contract Impact *(mandatory — org baseline)*

| Contract (API, event, file, schema) | New / Changed / Removed | Breaking? | Consumers affected |
|---|---|---|---|
| `docs/contracts/play-screen.md` | Changed: the list, and the counter's new role | No, if the counter's name is kept | UI driver, screen readers |
| `docs/contracts/component-library.md` | Changed: the list's components and screen | No | Game, catalogue |
| `docs/contracts/engine-api.md` | Changed: a puzzle gains an identity (FR-613) | No | Game, drivers |
| Saved solution format | New | No | Later versions of the game |

There is no external integration.

## Data Impact *(mandatory if the feature stores, moves or exposes data)*

- **Data items**: found solutions (digits and chosen operators) per puzzle, on the phone. Created when
  found; read on opening; deleted by "Start again".
- **Classification**: game progress. Not personal data.
- **System of record**: the player's phone. There is no copy elsewhere.
- **Retention and deletion**: kept until the player starts again, clears the browser's site data, or
  the browser clears it. In the store apps (F13), also on uninstall.
- **Lawful basis / DPIA**: not required: no personal data. The data is strictly necessary for a feature
  the player uses, and tracks nothing, so no consent notice is needed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-601**: A solution found on a phone is still there after reloading and after closing the page,
  every time in testing, on an iPhone and an Android phone.
- **SC-602**: A player can open the list and reopen a solution in under 10 seconds, with no instructions,
  in at least 4 of 5 hallway playtests.
- **SC-603**: Opening the list, going back and reopening each respond within 0.1 seconds on the reference
  device.
- **SC-604**: Saved solutions from every released version are still read correctly by the next.
- **SC-605**: Every acceptance criterion in specs 001 to 004 still passes.
- **SC-606**: The owner signs off the list on a real phone before its flag is turned on.

## Assumptions

- **No design yet**: the design files that could be searched show no log screen, and the 1930s UI PDF
  could not be opened during drafting. The list is built from the existing components in the theme's
  look, and the owner reviews it on a phone. Its wording ("No calls yet, pal.", "Start again") can
  be changed at that review, before the scenarios are approved or with the owner's approval after.
- **What is remembered**: found solutions only. The grid in progress is not saved.
- **One log per phone**: no accounts, and no sync between devices.
- **Copies can be cleared**: a browser may clear a site's saved data, and Safari on iOS is understood to
  do so after about seven days of use without a visit, as the research for spec-005 found. The store
  apps (F13) are the longer-term home for saved progress.
- **Reference device and browsers**: as spec-001.

## Out of Scope *(mandatory — org baseline)*

- Scoring and bonuses (brief, Scoring).
- Saving the grid in progress.
- Puzzles other than the fixed one, and their lists (F6, F7).
- Sync, accounts, export or sharing.
- A rarity figure such as "4% of players found this one" (F12).
- Deleting one solution at a time.
