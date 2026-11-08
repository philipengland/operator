# Contract: Play Screen

**History**: written for F0 (spec-001). Changed by spec-002 on 2026-11-05 (each line shows its
working). Rewritten by spec-004 (this version, 2026-11-07): the screen is the component
library's play screen (spec-003); a line's target and operator become one pill; the keypad,
speech bubble and an announcement region are added; marks are symbols alone. Copied to
`docs/contracts/play-screen.md` when spec-004's second pull request merges.

What the player, a screen reader and the Playwright UI driver can rely on. The UI driver
locates elements only by these roles and accessible names (Playwright standard). The roles,
the structure and the names' positional part are the contract.

## Page

- One page, `index.html`, served over HTTPS at the public address.
- `<html lang="en">`, `<title>Operator</title>`.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- `<meta name="version" content="<commit SHA>">`, set at build time (spec-001 AC-17).
- `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'">`.
- Makes no network requests after load (spec-001 FR-016). The typefaces are the game's own files.
- The page is the theme's paper with Ben-Day dots (spec-003 FR-329). The theme is Classic.

## Elements

Top to bottom: header, counter, puzzle, keypad, main button (spec-003 FR-320). The keypad is
present only once the keypad is released (flag `keypad`, spec-004 FR-413, FR-414).

| Element | Role | Accessible name (pattern) | Behaviour |
| --- | --- | --- | --- |
| Header | none | – | The mascot (hidden from screen readers) beside a speech bubble: title "Hello, Operator!" and one line (Messages). |
| Counter | text | "Found N of 2" (visible: "Solutions found" and "N of 2", or "All found!" and "2 of 2" with a tick) | Not a live region; the count is announced with the result (Status). |
| Puzzle | `group` | "Puzzle" | Pills, cells, workings and the helper line. |
| Shown pill (target and operator) | text | "Row 1 target 8, plus" / "…, target reached" | Visible "+ 8", a tick when the line reaches its target. Not a button: tapping does nothing (spec-001 FR-005). |
| Open pill | `button` | "Row 2 target 6, operator not chosen" / "…, plus" / "minus" / "times" / "divide", then ", target reached" when it does | Dashed. Visible "? 6", then "+ 6"; a tick when the line reaches its target. Tap: next operator (spec-001 FR-006). |
| Row working | text, labelled | "Row 1 working, 6 + ?" / "…, 6 + 2 = 8, target reached" | Right of its row, as spec-002. Not a live region. |
| Column working | text, labelled | "Column 1 working, 6 − 9 = minus 3" / "…, 6 ÷ 4, not a whole number" | Below its column, as spec-002. Not a live region. |
| Given cell | `button`, `aria-disabled="true"` | "Top-left cell, given 6" | Tapping does nothing (spec-001 FR-004). Solid ink. |
| Changeable cell | `button`; `aria-pressed="true"` when selected | "Top-right cell, empty" / "…, 7" | Tap: selects it and steps its value (FR-404). |
| Helper line | text | "Tap a dashed bubble to swap its operator." | While any operator is open (FR-403). |
| Keypad | `group` | "Keypad" | Two rows of five. |
| Digit key | `button`; `aria-disabled="true"` until a cell is selected | "1" … "9" | Sets the selected cell (FR-405). |
| Oops | `button`; `aria-disabled="true"` until a cell is selected | "Oops, clear cell" | Empties the selected cell (FR-405). |
| Main button | `button` | "Put it through!, Check" | Submits (spec-001 FR-007). Found by the word "Check". |
| Status | `status` (polite live region), visually hidden | none | Holds one announcement after a check (Messages). New text is announced; emptied silently when the grid changes (spec-001 FR-014, AC-20). Empty when the game opens. |

Cells are named top-left, top-right, bottom-left and bottom-right, as in spec-001.

## Messages

What the bubble shows, and what the status announces after a check (spec-004 Messages table).
The announcement begins with spec-001's message word for word, so its meaning is unchanged.
Until the voice is released (flag `voice`), the bubble shows that message and the status
announces it, followed by the count when it changed:

| Result | Bubble | Status announces |
| --- | --- | --- |
| none | Fill the grid, pal. | nothing |
| new solution | You're connected! Keep 'em coming, pal! | New solution found! You're connected! Keep 'em coming, pal! Found 1 of 2 |
| every solution found | Every line connected, pal! | New solution found! You've found every solution. Every line connected, pal! Found 2 of 2 |
| already found | We've had that call, pal. | You've already found this solution. We've had that call, pal. |
| not solved | Wrong number, pal! | Not solved yet. Wrong number, pal! |
| incomplete | Line's busy, pal: fill every cell and operator first. | Fill every cell and choose every operator before checking. Line's busy, pal: fill every cell and operator first. |

While the status holds a result, the bubble's line is hidden from screen readers, so it is not
read twice.

## Line workings (spec-002, unchanged except marks)

Name format, visible slot and reading are as spec-002 set them. **Marks**: the ✓ and the ✗ are
shown by the symbol alone, in the display typeface's one weight, never by colour alone.

## What the UI driver reads

- **Cell**: the button named `/^<Cell> cell, /`. Its value comes from the name, and whether it
  is selected from `aria-pressed`.
- **Target, operator and whether it is open**: the pill named `/^<Line> target \d+, /`.
  - The target is the number.
  - The operator is the word after the comma ("operator not chosen" means not chosen).
  - The pill is open when it is a button.
- **Counter**: the text "Found N of 2". **Result**: the status's text.
- **Working**: as spec-002.
- **Keys**: buttons in the group "Keypad", and whether each is unavailable.

## Layout guarantees

- At 375 × 667 and 320 × 568, the header, counter, the whole puzzle (four pills, four cells, four
  workings, helper line), keypad and main button are visible without scrolling or zooming.
- Every button is at least 44 × 44 CSS px (spec-003). Content sits inside `env(safe-area-inset-*)`.
- No hover-only behaviour; `touch-action: manipulation`; no animation under
  `prefers-reduced-motion: reduce`.
