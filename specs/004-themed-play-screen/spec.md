# Feature Specification: Themed Play Screen

**Feature Branch**: `004-themed-play-screen`

**Created**: 2026-11-06 (updated 2026-11-07, after spec-003 was delivered)

**Status**: Draft

**Input**: User description: "A new release with user stories for a new UI. This should be
modular, component based, using the attached files as the design guide." Split on 2026-11-06
into two pieces of work: [spec-003](../003-themed-ui/spec.md) builds the component library,
and this spec applies it to the play screen.

## Context

This feature builds on [spec-001](../001-walking-skeleton/spec.md),
[spec-002](../002-live-calculations/spec.md) and
[spec-003, the themed component library](../003-themed-ui/spec.md). Everything in them still
holds unless this spec says otherwise. It plays the same fixed 2 × 2 puzzle, with the same
cells, lines, targets, solutions, checking and workings.

**User need (Overlay P1).** spec-003 builds the "Hello, Operator!" component library, in three
tiers up to a play screen laid out with sample content, but players still see the F0 screen.
This spec connects the library's play screen to the game and replaces the F0 screen with it,
makes the keypad from the mockups work (a chosen digit in one tap instead of up to nine), and
gives the mascot its voice for the results of Check.

**Depends on**: spec-003, delivered and signed off on a phone on 2026-11-07 (pull requests
#9 to #14). Every component, theme and the dotted page come from it. The design reference is in
`docs/design/` (the Classic and Midnight blue mockups, and the component library).

### Release order (constitution VII)

Every merge to `main` deploys, so each step below is fit for players and goes live on its own.

| Release | What players get | Flag |
| --- | --- | --- |
| 1. Library additions | No change | none needed: nothing reaches players |
| 2. User Story 1: the new look | The themed screen on the dotted page, with ticks and the mascot's greeting. Results in the bubble in the game's existing words. No keypad: digits are entered by tapping cells, as today. | none, recorded in the plan |
| 3. User Story 2: the keypad | Select a cell, then keys and Oops | `keypad` |
| 4. User Story 3: the voice | Results in the mascot's voice | `voice` |

A flagged story merges with its flag off, is previewed with it on, and is released by a one-line
pull request that turns the flag on. The flag is removed after its release is signed off.

### Changes to earlier specs

| Earlier item | Change |
| --- | --- |
| spec-001 FR-002 (each tap moves a cell to its next value) | **Still holds, and extended.** A tap also selects the cell, and the keypad sets the selected cell's digit directly (FR-404 to FR-407). Every locked "tap the cell" scenario keeps its meaning. |
| spec-001 FR-013 (counter reads "Found N of 2") | **Still holds for screen readers and the scenarios.** It is shown as "Solutions found" with "N of 2", and "All found!" once complete (spec-003 FR-314). |
| spec-001 FR-014 (the game says the result of a submission) | **Still holds.** The mascot's speech bubble shows an in-character line in the theme's voice ("Wrong number, pal!"); a screen reader hears spec-001's message word for word first ("Not solved yet. Wrong number, pal!") (FR-408 to FR-410, Messages table). |
| spec-001 FR-007 (players submit with "Check") | **Still holds.** The button's visible label is the theme's ("Put it through!"); a screen reader still hears "Check" (spec-003 FR-307). |
| spec-002 Assumption "Where it appears" (working at the far end of each line) | **Still holds**, restyled (owner decision 2026-11-05). |
| spec-002 FR-204 (a line reaching its target is marked) | **Still holds, with two extra signs**: a tick on the target pill, and the player's digits in that line in the accent colour (FR-402). |
| spec-002 Out of Scope "the visual redesign from the mockups" | **Delivered here** for the play screen. |
| Play-screen contract: "the ✓ mark and the ✗ cross are symbols plus a heavier weight" | **Changed**: marked by the symbol alone, in the display typeface's one weight (owner decision 2026-11-06, spec-003). Still never colour alone. |
| F0's plain page | **Replaced** by spec-003's page: the theme's paper with Ben-Day dots (spec-003 User Story 6). |

## Clarifications

### Session 2026-11-05

- Q: Keypad or tap-to-cycle? → A: Both. Read as: every tap on a cell selects it **and** steps
  it to its next value, as today; the keypad then sets the selected cell's digit, and Oops
  empties it.
- Q: What happens to spec-002's line workings? → A: Keep them, restyled, at the far end of each
  line, alongside the tick on the target pill.
- Q: Should players see the other five themes before F7? → A: No. The fixed puzzle has no
  seed, so the game shows only Classic until F7 (FR-411).

### Session 2026-11-06

- Q: One piece of work or two? → A: Two specs. spec-003 builds the library; this spec applies
  it.

### Session 2026-11-07

- Q: Should the bubble's wording be fixed now? → A: Use shorter, in-character lines, with
  spec-001's meaning kept for screen readers. Each result is heard as the game's present
  message, word for word (spec-001 FR-014), followed by the bubble's line: for example "Not
  solved yet. Wrong number, pal!". Final wording in the Messages table.
- Q: Before any cell is selected, should the keypad look and sound unavailable, or look normal
  and do nothing? → A: Unavailable. Until a cell is selected, the digit keys and Oops are shown
  and heard as unavailable (still focusable), and tapping them changes nothing; selecting a
  cell makes them available.
- Q: When a check finds a new solution, is the new count announced too? → A: Yes, in the same
  announcement: the heard result line, then the count when it changed (e.g. "New solution
  found! You're connected! Keep 'em coming, pal! Found 1 of 2"). The counter is not announced
  on its own, so nothing is heard twice (as spec-001's status area).
### Session 2026-11-08

- Q: How is this released? → A: Each user story merges and deploys on its own, and `main` is
  always releasable (constitution VII, added for this). The owner's decisions: one pull request
  per user story; the keypad and the voice go behind build-time flags; the new look is not
  flagged. Until the voice is released, the bubble shows the game's existing messages; until
  the keypad is released, there is no keypad on the screen.
- Q: With no connection, should the game reopen? → A: Yes, but not in this spec. The owner wants
  real offline play, which reverses spec-001's decision and locked AC-21 and needs a service
  worker, so it gets its own spec-005, straight after this one. Here, AC-7 covers a game
  already open that loses its connection.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play the puzzle in the new look (Priority: P1)

> **As a** puzzle fan playing on my phone,
> **I want** the game to look and feel like a finished, characterful game,
> **So that** I enjoy coming back to it, and can read the grid at a glance.

**Why this priority**: it is what players see of the whole redesign.

**Independent Test**: open the game and play both solutions by tapping cells. The screen matches
the design guide's Classic play screen, without the keypad, and every spec-001 and spec-002
criterion still passes.

**Acceptance Scenarios**:

1. **AC-1** — **Given** the game has just opened, **When** the player looks at the screen,
   **Then** from top to bottom they see the mascot with a speech bubble titled "Hello,
   Operator!"; the counter showing "Solutions found" and "0 of 2"; the grid panel with target
   pills "+ 8" (Row 1), "? 6" dashed (Row 2), "? 3" dashed (Column 1) and "× 6" (Column 2);
   the given 6 as a solid ink cell; three empty cells; each line's working; the helper line
   "Tap a dashed bubble to swap its operator."; and the button "Put it through!", all in the
   Classic theme, on the dotted page.
2. **AC-2** — **Given** the game has just opened, **When** a screen reader reads the screen,
   **Then** it hears "Found 0 of 2", "Top-left cell, given 6", and a button that begins "Put it
   through!" and includes "Check".
3. **AC-3** — **Given** the player has entered top-right 2 and tapped another cell, **When** they look at Row 1,
   **Then** Row 1's pill shows "+ 8" with a tick, the 2 is in the accent colour with an
   accent shadow, and Row 1's working shows "6 + 2 = 8 ✓".
4. **AC-4** — **Given** Solution A is entered (top-right 2, bottom-left 2, bottom-right 3, Row
   2 ×, Column 1 ÷), **When** the player taps "Put it through!", **Then** the counter shows "1
   of 2", and a screen reader hears the result and "Found 1 of 2" in one announcement.
5. **AC-5** — **Given** Solution A has been found, **When** the player enters and submits
   Solution B (bottom-left 3, Row 2 +, Column 1 −), **Then** the counter shows "All found!"
   with "2 of 2" and a tick, every target pill shows a tick (the dashed Row 2 "+ 6" and
   Column 1 "− 3" too), and a screen reader hears the result and "Found 2 of 2" in one
   announcement.
6. **AC-6** — **Given** the game is open on a 375 × 667 or a 320 × 568 screen, **When** the
   player looks at it, **Then** the bubble, counter, grid with all targets and workings, and
   button are all visible without scrolling or zooming.
7. **AC-7** — **Given** the game has opened and the connection is then lost, **When** the
   player goes on playing, **Then** the text stays in the game's own typefaces and no network
   request is made. (Reopening with no connection: spec-005, parked by the owner on 2026-11-08.)

---

### User Story 2 - Enter a digit with the keypad (Priority: P1)

> **As a** player who already knows which digit a cell needs,
> **I want to** select the cell and tap the digit,
> **So that** I don't have to tap through every number to reach it.

**Why this priority**: the keypad is the biggest change to how the game is played, and with
larger grids (F7) cycling to a 9 would take nine taps per cell.

**Independent Test**: select each changeable cell, use the keypad and Oops, and confirm that
tapping cells still steps their value as spec-001 describes.

**Acceptance Scenarios**:

1. **AC-8** — **Given** the game has just opened, **When** the player taps the top-right cell,
   **Then** it is selected, shows 1 as before (spec-001 FR-002), and a screen reader hears that
   it is selected.
2. **AC-9** — **Given** top-right is selected and shows 1, **When** the player taps key 7,
   **Then** top-right shows 7, stays selected, and Row 1's working shows "6 + 7 = 13".
3. **AC-10** — **Given** top-right shows 7 and is selected, **When** the player taps Oops,
   **Then** top-right is empty and Row 1's working shows "6 + ?".
4. **AC-11** — **Given** top-right is selected, **When** the player taps bottom-right, **Then**
   bottom-right is selected and shows 1, and top-right is no longer selected and keeps its
   digit.
5. **AC-12** — **Given** no cell has been selected yet, **When** the player looks at the
   keypad and taps key 5, **Then** the keys and Oops are shown and heard as unavailable, and
   nothing on the grid changes. Once the player selects a cell, the keys are available.
6. **AC-13** — **Given** bottom-left is selected, **When** the player taps the given 6,
   **Then** the 6 does not change and is not selected, and bottom-left stays selected.
7. **AC-14** — **Given** the player enters Solution A using the keypad for every digit,
   **When** they tap "Put it through!", **Then** it is accepted as a new solution and the
   counter shows "1 of 2".
8. **AC-20** — **Given** the keypad is released, **When** the player looks at a 375 × 667 or a
   320 × 568 screen, **Then** the keypad is between the grid and the main button, its keys read
   1 to 9 and Oops in two rows of five, and the whole screen is visible without scrolling or
   zooming.

---

### User Story 3 - The mascot talks to me (Priority: P2)

> **As a** player,
> **I want** the operator to greet me and tell me how my call went, in their own voice,
> **So that** the game feels friendly and every check gets a clear answer.

**Why this priority**: it carries the result messages spec-001 already requires; the voice is
flavour on top.

**Independent Test**: submit each kind of grid and read the bubble.

**Acceptance Scenarios**:

1. **AC-15** — **Given** the game has just opened, **When** the player reads the speech bubble,
   **Then** it says "Hello, Operator!" and "Fill the grid, pal.", and nothing is announced to a
   screen reader.
2. **AC-16** — **Given** Solution A is entered, **When** the player submits it, **Then** the
   bubble says "You're connected! Keep 'em coming, pal!", and a screen reader hears "New
   solution found! You're connected! Keep 'em coming, pal! Found 1 of 2" once.
3. **AC-17** — **Given** the inexact-division grid is entered (top-right 2, bottom-left 4,
   bottom-right 3, Row 2 +, Column 1 ÷), **When** the player submits it, **Then** the bubble
   says "Wrong number, pal!", and a screen reader hears "Not solved yet. Wrong number, pal!".
4. **AC-18** — **Given** the bubble says "Wrong number, pal!", **When** the player taps
   bottom-left, **Then** the bubble goes back to "Fill the grid, pal." and nothing is announced
   (as spec-001 AC-20).
5. **AC-19** — **Given** the Midnight blue theme, **When** its greeting and new-solution line
   are worked out, **Then** they are "Fill the grid, chief." and "You're connected! Next,
   please, chief!". This is proved by unit tests, as players see only Classic until F7.

---

### Edge Cases

- **Tapping the selected cell again**: steps its value, as today; the selection stays.
- **Operators and selection**: tapping an open operator changes the operator and leaves the
  selection as it was.
- **Check and selection**: submitting leaves the selection and every digit in place (spec-001
  FR-015).
- **A cell in one correct and one incorrect line**: it shows the correct-line style; only the
  correct line's pill has a tick.
- **Selected cell in a correct line**: the selected style wins; the pill's tick still shows the
  line is correct.
- **An open line reaching its target**: its dashed pill shows the tick beside the chosen
  operator, as a shown pill does.
- **All found, then more submissions**: the counter stays at "All found!" "2 of 2".
- **Fonts not yet loaded**: text is readable straight away, and nothing overflows when the
  typefaces arrive.

## Requirements *(mandatory)*

### Functional Requirements

**Screen**

- **FR-401**: The game MUST show spec-003's play screen (spec-003 FR-320), fed from the game's
  current state, in place of the F0 screen. This spec MUST NOT add components or styling of its
  own; any new visual part is added to the library first.
- **FR-402**: A line that reaches its target (spec-002 FR-204) MUST show a tick on its pill,
  whether the pill is shown or open (dashed), and the player's own digits in it MUST take the
  correct-line style. The library's open pill does not show a tick yet (found in spec-003 part
  2); it is added to the library first, with its catalogue sample, as FR-401 requires.
- **FR-403**: The helper line MUST show while the puzzle has an open operator.
- **FR-413**: Until the keypad is released (FR-414), the screen MUST NOT show the keypad or a
  selected cell. Until the voice is released, the bubble MUST show the game's existing message
  after a check (spec-001 FR-014) and the greeting otherwise, and a screen reader MUST hear
  that message, then the count when it changed (FR-409).
- **FR-414**: The keypad (User Story 2) and the voice (User Story 3) MUST each sit behind a
  feature flag fixed at build time until released (constitution VII). With a flag off, players
  MUST NOT be able to reach that feature.
- **FR-412**: The game's page MUST be spec-003's dotted page (spec-003 FR-329). A line's ✓ and
  ✗ MUST be shown by the symbol alone, never by colour or weight alone.

**Entering digits**

- **FR-404**: Tapping a changeable cell MUST select it and step it to its next value, as
  spec-001 FR-002. Only one cell is selected at a time. No cell is selected when the game
  opens.
- **FR-405**: A digit key MUST put that digit in the selected cell; Oops MUST empty it. Until a
  cell is selected, the digit keys and Oops MUST be shown and heard as unavailable (still
  focusable) and MUST change nothing when tapped; once a cell is selected, they are available.
- **FR-406**: A screen reader MUST hear which cell is selected.
- **FR-407**: Every keypad change MUST update the workings, ticks and marks exactly as a tap
  does (spec-002 FR-206), and MUST NOT accept or count anything.

**Voice**

- **FR-408**: The speech bubble MUST show the title "Hello, Operator!" and one line of
  feedback in the theme's voice, as the Messages table sets out for Classic. Other themes swap
  only the address and sign-off (spec-003 Themes table).
- **FR-409**: After a submission the bubble MUST show the result's line from the Messages
  table. A screen reader MUST hear one announcement: the result spec-001 FR-014 requires, in
  the game's present words, then that line, then the count ("Found N of 2") when it changed.
  The counter MUST NOT be announced on its own. When the grid then changes, the bubble MUST
  return to the greeting without anything being announced (spec-001 AC-20).
- **FR-410**: The greeting MUST NOT be announced when the game opens.

**Theme**

- **FR-411**: The play screen MUST use the puzzle's theme (spec-003 FR-323). The fixed puzzle
  has no seed, so the game shows only Classic, and there MUST be no other way to open it in
  another theme.

### Messages (Classic)

Decided 2026-11-07 (clarification). Once the voice is released, the bubble shows the line, and a
screen reader hears spec-001's message (the game's present wording) and then the line. Until
then, see FR-413.

| When | Bubble line | Heard by a screen reader |
| --- | --- | --- |
| Opened, or the grid changed since the last submission | Fill the grid, pal. | nothing is announced |
| New solution | You're connected! Keep 'em coming, pal! | New solution found! You're connected! Keep 'em coming, pal! |
| New solution, and every solution now found | Every line connected, pal! | New solution found! You've found every solution. Every line connected, pal! |
| Already found | We've had that call, pal. | You've already found this solution. We've had that call, pal. |
| Not solved | Wrong number, pal! | Not solved yet. Wrong number, pal! |
| Incomplete | Line's busy, pal: fill every cell and operator first. | Fill every cell and choose every operator before checking. Line's busy, pal: fill every cell and operator first. |

Other themes replace "pal" with their address and "Keep 'em coming" with their sign-off
(spec-003 Themes table), for example Midnight blue's "You're connected! Next, please, chief!".

### Key Entities

- **Selected cell**: at most one changeable cell, the target of the keypad. Lives only while
  the game is open.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-401**: A first-time player finds one solution within 3 minutes, with no instructions
  beyond the screen, in at least 4 of 5 hallway playtests (as spec-001 SC-001).
- **SC-402**: In those playtests, at least 4 of 5 players say the game looks finished and
  inviting, and none is confused about how to enter a digit.
- **SC-403**: The owner signs off the play screen against the design guide's Classic mockup,
  side by side, on a real phone: at the first visible release, and again when every story is
  released.
- **SC-404**: All acceptance criteria here, and every spec-001, spec-002 and spec-003
  criterion, pass on current Safari for iPhone and current Chrome for Android, at 375 × 667
  and 320 × 568.
- **SC-405**: Every tap and key shows its result within 0.1 seconds, and the game is ready to
  play within 3 seconds of opening (as spec-001 SC-003 and SC-004).
- **SC-406**: The automated accessibility scan reports zero issues on the play screen in every
  state the acceptance criteria reach.

## Assumptions

- **Selection and cycling together**: tapping a cell both selects and steps it (owner chose
  "keypad plus cycling"; this reading keeps the locked scenarios' meaning).
- **Wording**: settled on 2026-11-07 (Messages table). The mockups' line-by-line remarks
  ("Row one's through") are not adopted; they would announce after every tap, against spec-001
  AC-20.
- **Same puzzle**: F0's fixed 2 × 2 puzzle.

## Acceptance Criteria as Examples *(org baseline)*

All criteria use spec-001's fixed puzzle and examples. These are the new ones:

| Example | Cells and operators | What the player sees | Used in |
| --- | --- | --- | --- |
| Just opened | all empty, operators not chosen | "0 of 2", "Fill the grid, pal.", no cell selected | AC-1, AC-2, AC-15 |
| Row 1 correct | top-right 2 | "+ 8" with tick; 2 in accent; "6 + 2 = 8 ✓" | AC-3 |
| Keypad 7 | top-right selected, key 7 | top-right 7, "6 + 7 = 13" | AC-9 |
| Oops | top-right 7 selected, Oops | top-right empty, "6 + ?" | AC-10 |
| Solution A | 2, 2, 3, ×, ÷ | "1 of 2", "You're connected! Keep 'em coming, pal!" | AC-4, AC-14, AC-16 |
| Then Solution B | 2, 3, 3, +, − | "All found!" "2 of 2" with tick; every pill ticked, dashed ones too | AC-5 |
| Inexact division | 2, 4, 3, +, ÷ | "Wrong number, pal!", heard "Not solved yet. Wrong number, pal!" | AC-17 |
| Midnight blue wording | – | "Fill the grid, chief.", "You're connected! Next, please, chief!" | AC-19 |
| Keypad shown | key rows 1 to 5, 6 to 9 and Oops | between the grid and the main button; all on screen | AC-20 |

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: every tap and key within 0.1 seconds; ready to play within 3 seconds on the
  reference phone (SC-405). The bundled typefaces must not push ready-to-play past 3 seconds.
- **Availability**: unchanged. Typefaces, mascot and theme ship with the game (AC-7).
- **Security**: unchanged. No stored data or network calls; the content security policy still
  allows only the game's own files.
- **Accessibility**: WCAG 2.2 AA (constitution IV), using spec-003's accessible components;
  the selected cell is announced by name; results are announced once and cleared silently.
- **Capacity and scale**: unchanged. The game runs on the player's phone.

## Integration and Contract Impact *(mandatory — org baseline)*

None outside the game. The internal play-screen contract (`docs/contracts/play-screen.md`)
changes: target pills combine target and operator, cells gain a selected state, the keypad,
speech bubble and themed button are added, and marks are symbols alone (no heavier weight).
The component-library contract (`docs/contracts/component-library.md`) gains the open target
pill's tick. The plan updates the contract and the UI
driver. The locked Layer 1 scenarios and the Layer 2 DSL of spec-001 and spec-002 do not
change.

## Data Impact

None. The selected cell lives only while the game is open.

## Out of Scope *(mandatory — org baseline)*

- The Choose-a-puzzle screen, seeds, presets, Back button (F6, F7).
- Any way to see the play screen in a theme other than Classic before F7.
- Line-by-line remarks from the mascot after each tap.
- Animation of the mascot or the bubble.
- Grids larger than 2 × 2 (F7).
- Reopening the game with no connection (spec-005, parked by the owner on 2026-11-08: the store apps, F13, cover it).
