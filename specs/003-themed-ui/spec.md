# Feature Specification: Themed Component Library

**Feature Branch**: `003-themed-ui`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "A new release with user stories for a new UI. This should be
modular, component based, using the attached files as the design guide ('Hello, Operator!'
1930s rubber-hose component library and screen mockups). I'd like to implement all the
different colours, used for different puzzles." Split on 2026-11-06 into two pieces of work:
this spec builds the component library, and
[spec-004](../004-themed-play-screen/spec.md) applies it to the game. Owner direction on
2026-11-06: "The component library should be made up of simple components, of inputs,
buttons, text. And then combined components, more complex components that made parts of the
screens. And then screens themselves."

## Context

**User need and evidence (Overlay P1).** The F0 play screen was built to prove the rules and
the pipeline, not to be enjoyed. The owner has commissioned a visual identity, "Hello,
Operator!": a 1930s rubber-hose look with a telephone-operator mascot, a component library
and six colour themes (design guide: *Component library.pdf*, *Hello, Operator! 1930s UI.pdf*
and *ComponentLibrary.dc.html*, supplied 2026-11-05). spec-002 put "the visual redesign from
the mockups" out of scope as a separate feature.

**What this spec covers.** A component library in three tiers, built on shared foundations,
with six themes, the rule that gives each puzzle its theme, and a development-only catalogue
that shows everything in every state and theme.

| Tier | What it is | Built from | In this spec |
| --- | --- | --- | --- |
| Foundations | The four colour tokens, typefaces, outlines, shadows and radii | – | All |
| 1. Simple components | The smallest parts of a screen | Foundations only | Text, button, text input, icon, surface, badge, mascot |
| 2. Combined components | Parts of a screen | Simple and other combined components | Speech bubble, operator header, solutions counter, target pill, grid cell, line working, puzzle grid, keypad |
| 3. Screens | Whole screens | Combined components (and the main button) | Play screen |

**Nothing changes for players**: the published game looks and plays exactly as after
spec-002. Screens here are laid out with sample content and seen only in the catalogue.
spec-004 connects the play screen to the game and replaces the current one.

**Later screens.** The mockups' Choose-a-puzzle screen and its parts (preset card, operator
and size chips, seed field, seed tag, difficulty tag, Back button, large mascot) need
presets (F6) and the seeded generator (F7). They are built with those features from this
library's simple components, and join the catalogue then.

## Clarifications

### Session 2026-11-05

- Q: What does the release cover? → A: The play screen and today's fixed puzzle. The Choose
  screen, presets, seeds and Back wait for F6/F7.
- Q: How does a puzzle get its theme? → A: From the puzzle's seed, so the same puzzle always
  has the same theme on every device. The fixed puzzle has no seed, so it uses Classic.
- Q: Should players see the other five themes before F7? → A: No. The game shows only
  Classic until F7 (spec-004).
- Q: Does this build a component library? → A: Yes, with a development-only catalogue, not
  shipped to players, showing every component in every state and all six themes.

### Session 2026-11-06

- Q: One piece of work or two? → A: Two specs. This one builds the library; spec-004 applies
  it to the game. Each merges on its own.
- Owner direction: the library has three tiers: simple components (inputs, buttons, text),
  combined components that make parts of screens, and screens. Read as: this spec builds all
  three tiers, including the play screen laid out with sample content; spec-004 connects that
  screen to the game. The text input is built here as the owner listed inputs explicitly; the
  game first uses it in F7's seed field.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simple components (Priority: P1)

> **As the** owner and developer of the game,
> **I want** a small set of simple components (text, buttons, an input, icons, surfaces) that
> carry the whole look,
> **So that** every larger part of every screen is built from the same proven pieces and
> looks consistent without restyling.

**Why this priority**: everything else is built from these. Getting them right once means the
combined components and screens need no styling of their own.

**Independent Test**: open the catalogue's Simple components section and compare each with the
design guide; run the accessibility scan on it.

**Acceptance Scenarios**:

1. **AC-1** — **Given** a development build, **When** the owner opens the catalogue, **Then** it
   shows four sections in order: Foundations, Simple components, Combined components and
   Screens, with every component labelled by name.
2. **AC-2** — **Given** the Simple components section, **When** the owner looks at the button,
   **Then** it shows four styles, each a real button at least 44 × 44 pixels: main ("Put it
   through!", accent fill, large), key ("5", tile fill), solid ("Oops", ink fill) and dashed
   ("? 12", dashed accent outline); and an unavailable button that a screen reader hears as
   unavailable and that does nothing when tapped.
3. **AC-3** — **Given** the Simple components section, **When** the owner looks at the text
   input, **Then** it shows the visible label "Play from a seed" above a field with the hint
   "e.g. 4F7A21"; a screen reader hears the label when the field is reached; typed text shows
   in the display typeface.
4. **AC-4** — **Given** the Simple components section, **When** the owner looks at text,
   **Then** it shows display text ("Hello, Operator!") in Chewy and body text ("Tap a dashed
   bubble to swap its operator.") in Nunito, both without a network connection after the
   catalogue first loaded.
5. **AC-5** — **Given** the Simple components section, **When** the owner looks at the icons,
   **Then** it shows a tick and a cross, each visible in a greyscale screenshot; where an icon
   carries meaning a screen reader hears it ("target reached", "not a whole number"), and
   where it is decoration it is not read.
6. **AC-6** — **Given** the Simple components section, **When** the owner looks at surfaces,
   badges and the mascot, **Then** it shows a panel (tile fill, outline, ink shadow), a panel
   with an accent shadow and a tail corner, an ink badge ("× 12"), and the mascot at 76 pixels,
   which a screen reader does not read.

---

### User Story 2 - Combined components (Priority: P1)

> **As the** developer,
> **I want** the parts of the play screen (speech bubble, counter, target pills, cells,
> workings, grid and keypad) built only from simple components,
> **So that** a change to a simple component, or a theme, reaches every part at once, and new
> screens can reuse them.

**Why this priority**: these are the parts the play screen is made of, and the parts spec-004
connects to the game.

**Independent Test**: open the catalogue's Combined components section; compare each
component's states with the design guide, and check what each is built from.

**Acceptance Scenarios**:

1. **AC-7** — **Given** the Combined components section, **When** the owner looks at any
   combined component, **Then** it names the simple and combined components it is built from,
   and it adds no colours, typefaces, outlines or shadows of its own.
2. **AC-8** — **Given** the Combined components section, **When** the owner looks at the
   solutions counter, **Then** it shows "Solutions found" with "0 of 2", "Solutions found"
   with "1 of 2", "All found!" with "2 of 2" and a tick on an ink fill, and "Solutions found"
   with "12" and no total; a screen reader hears "Found 0 of 2", "Found 1 of 2", "Found 2 of
   2" and "Found 12".
3. **AC-9** — **Given** the Combined components section, **When** the owner looks at the
   target pill, **Then** it shows "+ 16", "− 7", "× 12", "÷ 2" in ink, "? 12" dashed and
   tappable, and "+ 9" with a tick; a screen reader hears the line's operator, its target, and
   "target reached" for the ticked one.
4. **AC-10** — **Given** the Combined components section, **When** the owner looks at the grid
   cell, **Then** it shows given 2 (solid ink, unavailable), empty, selected (accent fill),
   the player's digit 8, and 4 in a correct line (accent digit and shadow); each state is told
   apart in a greyscale screenshot, and a screen reader hears "selected" for the selected one.
5. **AC-11** — **Given** the Combined components section, **When** the owner looks at the line
   working, **Then** it shows "= ?", "= 8 ✓", "= −3" and "✗", as spec-002 describes.
6. **AC-12** — **Given** the Combined components section, **When** the owner looks at the
   puzzle grid, **Then** it shows the fixed 2 × 2 puzzle: column target pills along the top,
   row target pills down the left, cells between, each line's working at its far end, and the
   helper line "Tap a dashed bubble to swap its operator."
7. **AC-13** — **Given** the Combined components section, **When** a screen reader user moves
   through the keypad, **Then** they hear buttons "1" to "9" and "Oops, clear cell", laid out
   in two rows of five.
8. **AC-14** — **Given** the Combined components section, **When** the owner looks at the
   operator header, **Then** it shows the mascot beside a speech bubble titled "Hello,
   Operator!" with one line of sample feedback, and only the bubble's words are read by a
   screen reader.

---

### User Story 3 - The play screen (Priority: P1)

> **As the** owner,
> **I want** the whole play screen laid out from combined components, with sample content,
> **So that** I can sign it off against the mockup before it is connected to the game.

**Why this priority**: it is the target spec-004 delivers to players, and proves the
combined components fit together on a phone.

**Independent Test**: open the catalogue's Screens section at 375 × 667 and 320 × 568 and
compare with the Classic play-screen mockup.

**Acceptance Scenarios**:

1. **AC-15** — **Given** the Screens section, **When** the owner opens the play screen with
   the "just opened" sample, **Then** from top to bottom it shows the operator header, the
   solutions counter ("0 of 2"), the puzzle grid, the keypad and the main button ("Put it
   through!").
2. **AC-16** — **Given** the play screen at 375 × 667 or 320 × 568, **When** the owner looks at
   it, **Then** everything is visible without scrolling or zooming and sits inside the phone's
   safe areas.
3. **AC-17** — **Given** the Screens section, **When** the owner switches between the samples
   "just opened", "Row 1 correct" (top-right 2) and "all found" (Solution B), **Then** the play
   screen shows each, and the layout does not move between them.
4. **AC-18** — **Given** the game has been published, **When** anyone asks the public address
   for the catalogue, **Then** it is not there, the published files contain nothing of it,
   and every spec-001 and spec-002 criterion still passes.

---

### User Story 4 - Six themes from four colours each (Priority: P2)

> **As the** owner,
> **I want** each of the six themes to recolour every tier from just four values, with its own
> voice,
> **So that** puzzles can look different without any layout or wording work per theme.

**Why this priority**: the themes are the visible point of the design, but they only work
once the components exist.

**Independent Test**: switch the catalogue through all six themes, and run the unit and
contrast checks on the theme values.

**Acceptance Scenarios**:

1. **AC-19** — **Given** the catalogue shows Classic, **When** the owner chooses Midnight blue,
   **Then** every component and the play screen take Midnight blue's four colours, the main
   button reads "Connect me!", the sample speech bubble addresses the player as "chief", and
   nothing moves or changes size.
2. **AC-20** — **Given** the six themes, **When** each is applied, **Then** it sets exactly the
   four colours, form of address, sign-off and button label in the Themes table, and nothing
   else.
3. **AC-21** — **Given** each of the six themes, **When** its colours are checked, **Then** text
   and digits meet a contrast of 4.5:1 against what they sit on (3:1 for text 24 pixels or
   larger, outlines, ticks and dashed outlines).
4. **AC-22** — **Given** the catalogue, **When** the owner chooses each of the six themes in
   turn, **Then** the automated accessibility scan reports no issues for any of them.

---

### User Story 5 - Each puzzle's theme comes from its seed (Priority: P3)

> **As a** player working through many puzzles (from F7),
> **I want** each puzzle to come in one of the six themes, always the same for that puzzle,
> **So that** puzzles feel different and I recognise one I have played.

**Why this priority**: the rule is needed before F7, but no player meets it until seeded
puzzles exist, so it is proved by unit tests on the rule alone.

**Independent Test**: unit tests on the rule.

**Acceptance Scenarios**:

1. **AC-23** — **Given** the seed "4F7A21", **When** its theme is worked out twice, and once
   more for "4f7a21", **Then** all three give the same theme.
2. **AC-24** — **Given** 600 different seeds, **When** each one's theme is worked out, **Then**
   every one of the six themes is given to between 70 and 130 of them.
3. **AC-25** — **Given** a puzzle with no seed, such as the fixed puzzle, **When** its theme is
   worked out, **Then** it is Classic.

---

### Edge Cases

- **States that combine**: a selected cell in a correct line shows the selected style; the
  catalogue shows this combination too.
- **Long words**: the longest button label ("Ring it through!") and the longest address
  ("sweetheart") fit the play screen at 320 pixels wide without overflowing.
- **Large numbers**: the counter fits "100 of 100" and a three-digit count; a target pill fits
  a three-digit target with a minus sign ("? −120").
- **Text input**: typed text longer than the field scrolls inside it; the field never grows
  wider than its screen.
- **Fonts not yet loaded**: text is readable straight away in a fallback font, and nothing
  overflows when the typefaces arrive.
- **Reduced motion**: nothing moves or animates when the setting is on.
- **A theme that fails contrast**: AC-21 fails the build; the owner adjusts that theme's
  values. The six themes as designed were checked on 2026-11-05 and pass.

## Requirements *(mandatory)*

### Functional Requirements

**Tiers**

- **FR-301**: The library MUST be organised in the tiers in the Context table: foundations,
  simple components, combined components and screens.
- **FR-302**: Simple components MUST take every colour, typeface, outline, shadow and radius
  from the foundations, and colours only from the four tokens, so applying a theme changes
  them all at once.
- **FR-303**: Combined components MUST be built only from simple components and other combined
  components. They MAY arrange and space their parts, and MUST NOT add colours, typefaces,
  outlines or shadows of their own.
- **FR-304**: Screens MUST be built only by arranging combined components (and the main
  button, a simple component). They MUST NOT add visual styling of their own beyond layout.
- **FR-305**: Every component MUST take its content (digits, targets, wording, states) from
  whatever uses it, and MUST NOT work out any puzzle rule itself (constitution II).

**Simple components**

- **FR-306**: **Text** MUST come in two styles: display (Chewy: titles, digits, targets,
  buttons) and body (Nunito 700 and 800: helper text and labels).
- **FR-307**: **Button** MUST come in four styles (main, key, solid, dashed) and may be
  unavailable. Every button MUST be a real button, at least 44 × 44 pixels, work by touch
  alone, and be heard by its visible label, followed by what it does where the label alone
  does not say (for example "Oops, clear cell").
- **FR-308**: **Text input** MUST have a visible label that screen readers hear, sit on the
  paper colour, and show typed text in the display typeface.
- **FR-309**: **Icon** MUST provide a tick and a cross, each either heard (when it carries
  meaning) or hidden from screen readers (when it is decoration).
- **FR-310**: **Surface** MUST provide a panel (tile fill, outline, hard ink shadow) and a
  bubble variant (accent shadow, tail corner). **Badge** MUST provide an ink-filled pill for
  short text.
- **FR-311**: **Mascot** MUST show the operator character at 76 pixels and be hidden from
  screen readers.
- **FR-312**: The display and text typefaces MUST ship with the game and never be fetched from
  elsewhere (constitution I).

**Combined components**

- **FR-313**: **Speech bubble** MUST show a title line and one line of feedback.
  **Operator header** MUST place the mascot beside a speech bubble.
- **FR-314**: **Solutions counter** MUST show "Solutions found" with "N of M" while searching
  (accent fill), "All found!" with "M of M" and a tick when complete (ink fill), and
  "Solutions found" with "N" alone when there is no total (brief F5). A screen reader MUST
  hear "Found N of M" or "Found N".
- **FR-315**: **Target pill** MUST show a line's target and operator together: a badge for a
  shown operator, a dashed button with "?" or the chosen operator for an open one, and a tick
  when the line reaches its target. A screen reader MUST hear the line, operator, target and,
  when ticked, "target reached".
- **FR-316**: **Grid cell** MUST have five states: given (solid ink, unavailable), empty,
  selected, the player's digit, and in a correct line. States MUST differ by more than colour,
  and a screen reader MUST hear "given" and "selected" where they apply.
- **FR-317**: **Line working** MUST show a line's result slot as spec-002 describes ("= ?",
  "= 8 ✓", "= −3", "✗").
- **FR-318**: **Puzzle grid** MUST place column target pills along the top, row target pills
  down the left, cells between, each line's working at its far end, and the helper line "Tap
  a dashed bubble to swap its operator." The design guide's "dashed **red** bubble" is changed
  because only two themes have a red accent, and WCAG 1.3.3 forbids instructions that rely on
  colour.
- **FR-319**: **Keypad** MUST show key buttons 1 to 9 and a solid Oops button, in two rows of
  five.

**Screens**

- **FR-320**: **Play screen** MUST arrange, from top to bottom: operator header, solutions
  counter, puzzle grid, keypad and main button. At 375 × 667 and 320 × 568 everything MUST be
  visible without scrolling or zooming, inside the phone's safe areas.

**Themes**

- **FR-321**: There MUST be six themes, as in the Themes table, each defined only by four
  colours, a form of address, a sign-off and a button label. Applying a theme MUST NOT change
  layout, sizes or any other wording.
- **FR-322**: Every theme MUST meet the contrast targets in AC-21.
- **FR-323**: A puzzle's theme MUST be worked out from its seed: the same seed always gives the
  same theme on every device, seeds are case-insensitive, and over many seeds each theme is
  given about equally often (AC-24). A puzzle with no seed MUST use Classic.

**Catalogue**

- **FR-324**: A development build MUST include a catalogue page with a section per tier, showing
  every component and screen, labelled by name, in every state the design guide lists, with
  sample content.
- **FR-325**: The catalogue MUST let its viewer switch between the six themes. The choice
  affects only the catalogue and is not remembered.
- **FR-326**: The catalogue MUST show the library's own components, not copies, so a change to a
  component shows wherever it is used.
- **FR-327**: The catalogue is for viewing only. It MUST NOT play the puzzle; interactive states
  are shown as fixed samples.
- **FR-328**: The catalogue MUST NOT be published: not reachable at the public address and not
  in the published files. The published game MUST be unchanged by this spec.

### Themes

| Theme | Ink | Paper | Tile | Accent | Address | Sign-off | Button label |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Classic | #1A1A1A | #F1E6CF | #FFFDF6 | #BF1E1E | pal | Keep 'em coming | Put it through! |
| Midnight blue | #1B2A4A | #D8E6F0 | #F4F9FC | #C8441B | chief | Next, please | Connect me! |
| Plum and mint | #2B1B3D | #D5F0E0 | #F5FBF7 | #C42A63 | darling | Do continue | Ring it through! |
| Amber and teal | #3A1C12 | #FFD9A0 | #FFF6E4 | #0E7C7B | friend | Carry on | Dial it in! |
| Bubblegum | #1A1A1A | #FFC8DD | #FFF0F6 | #2E5BFF | sweetheart | More, more | Make the call! |
| Racing green | #0F3D2E | #E8E2B8 | #FAF7E2 | #B5382B | old sport | Press on | Plug it in! |

### Key Entities

- **Theme**: a named set of four colours (ink, paper, tile, accent), a form of address, a
  sign-off and a button label. Six exist; none is stored per player.
- **Puzzle theme**: the theme a puzzle is shown in, worked out from its seed and never stored.
- **Component**: a reusable part of a screen, in one tier, with named states. It takes its
  look from the theme and its content from whatever uses it.
- **Screen**: an arrangement of combined components filling a phone screen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-301**: The owner signs off every catalogue section and the play screen in all six
  themes against the design guide, on a real phone.
- **SC-302**: All acceptance criteria pass, and every spec-001 and spec-002 criterion still
  passes, on current Safari for iPhone and current Chrome for Android.
- **SC-303**: The automated accessibility scan reports zero issues on the catalogue in each of
  the six themes.
- **SC-304**: No combined component or screen defines a colour, typeface, outline or shadow of
  its own (FR-303, FR-304), confirmed by an automated check or code review.
- **SC-305**: The published game is unaffected by the library: its size and ready-to-play time
  are unchanged.

## Assumptions

- **Catalogue on a phone**: the owner opens the catalogue from a development build, for
  example on a phone on the same network as the development machine. It needs no hosting.
- **Catalogue tooling**: the catalogue is a plain page of the library's own components. A
  separate component-gallery tool would be a new dependency and needs the owner's approval
  and an ADR, so it is not assumed.
- **Text input before its screen**: built now because the owner listed inputs as a simple
  component; the game first uses it in F7's seed field.
- **Light themes only**: the six themes are the design. There is no separate dark mode.
- **Mascot**: an original character drawn for this game (design guide), at the small size. The
  large size belongs to the Choose screen.
- **Sample content**: the catalogue uses the design guide's examples and the fixed puzzle's
  values. The play-screen wording is settled in spec-004.
- **Fonts**: Chewy is under the Apache License 2.0 and Nunito under the SIL Open Font Licence;
  both allow bundling with the game, with their licence texts (corrected 2026-11-06: Chewy is Apache 2.0, not OFL). Only the characters the
  game uses need to ship.

## Acceptance Criteria as Examples *(org baseline)*

| Example | Values | Expected | Used in |
| --- | --- | --- | --- |
| Buttons | "Put it through!", "5", "Oops", "? 12" | four styles, real buttons, ≥ 44 × 44 | AC-2 |
| Text input | label "Play from a seed", hint "e.g. 4F7A21" | label heard | AC-3 |
| Counter states | 0 of 2, 1 of 2, 2 of 2, 12 | "Found 0 of 2" … "Found 2 of 2" with tick, "Found 12" | AC-8 |
| Target pills | + 16, − 7, × 12, ÷ 2, ? 12, + 9 ✓ | shown, open dashed, ticked | AC-9 |
| Cell states | given 2, empty, selected, 8, 4 correct | five states, told apart in greyscale | AC-10 |
| Play screen samples | just opened; top-right 2; Solution B after A | "0 of 2"; Row 1 ticked; "All found!" | AC-15, AC-17 |
| Midnight blue | theme switch | four colours, "Connect me!", "chief" | AC-19 |
| Seed | "4F7A21", "4f7a21" | same theme each time | AC-23 |
| Spread | 600 seeds | each theme 70–130 times | AC-24 |
| No seed | the fixed puzzle | Classic | AC-25 |

## Non-Functional Requirements *(mandatory — org baseline)*

- **Performance**: no change for players (SC-305). Components must show a change within 0.1
  seconds when spec-004 uses them (as spec-001 SC-003).
- **Availability**: unchanged. Nothing new is published.
- **Security**: unchanged. The catalogue is not published; no stored data or network calls are
  added. The text input is not connected to anything in this spec.
- **Accessibility**: WCAG 2.2 AA (constitution IV). States differ by more than colour; every
  theme meets the contrast targets; instructions do not name a colour; visible labels are part
  of what screen readers hear; touch targets are at least 44 × 44 pixels; reduced motion is
  honoured.
- **Capacity and scale**: not applicable; nothing runs for players.

## Integration and Contract Impact *(mandatory — org baseline)*

None outside the game. The play-screen contract (`docs/contracts/play-screen.md`) does not
change here; spec-004 changes it. The plan defines each component's inputs, states and
accessible names as an internal contract that spec-004 and later screens rely on.

## Data Impact

None. Nothing is stored: a puzzle's theme is worked out from its seed each time.

## Out of Scope *(mandatory — org baseline)*

- Connecting the play screen to the game, the keypad's behaviour, and the mascot's messages
  (spec-004).
- The Choose screen and its parts: preset card, operator and size chips, seed field, seed tag,
  difficulty tag, Back button, large mascot (F6/F7).
- A theme picker for players, or remembering a chosen theme.
- Publishing the catalogue anywhere.
- Dark mode, and animation of any component.
- Grids larger than 2 × 2 (F7).
