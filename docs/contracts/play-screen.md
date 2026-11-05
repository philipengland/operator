# Contract: Play Screen

**History**: written for F0 (spec-001). Changed by spec-002 on 2026-11-05: each line shows
its working, a row's on its right and a column's below it.

What the player, a screen reader and the Playwright UI driver can rely on. The UI driver
locates elements only by these roles and accessible names (Playwright standard). The exact
visible wording is settled with the acceptance scenarios and content review. The roles,
the structure and the names' positional part are the contract.

## Page

- One page, `index.html`, served over HTTPS at the public address.
- `<html lang="en">`, `<title>Operator</title>`.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- `<meta name="version" content="<commit SHA>">`, set at build time and read by the
  post-deploy smoke check (AC-17).
- `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'">`.
- Makes no network requests after load (FR-016).

## Elements

| Element | Role | Accessible name (pattern) | Behaviour |
| --- | --- | --- | --- |
| Grid | `group` | "Puzzle" | Contains everything below except the submit button and the status. |
| Row target | text, labelled | "Row 1 target 8", "Row 2 target 6" | Shown to the left of its row. |
| Column target | text, labelled | "Column 1 target 3", "Column 2 target 6" | Shown above its column. |
| Row working | text, labelled | "Row 1 working, 6 + ?" / "…, 6 + 2 = 8, target reached" / "…, 6 + 3 = 9" | To the **right** of its row. Visible text is the result slot only. Not a live region (spec-002). |
| Column working | text, labelled | "Column 1 working, 6 − 9 = minus 3" / "…, 6 ÷ 4, not a whole number" | **Below** its column. Not a live region (spec-002). |
| Shown operator | `button`, `aria-disabled="true"` | "Row 1 operator, plus" | Tapping does nothing (FR-005). |
| Open operator | `button` | "Row 2 operator, not chosen" / "…, plus" / "minus" / "times" / "divide" | Tap: next operator (FR-006). |
| Given cell | `button`, `aria-disabled="true"` | "Top-left cell, given 6" | Tapping does nothing. Visibly different, not by colour alone (FR-004). |
| Changeable cell | `button` | "Top-right cell, empty" / "…, 7" | Tap: next value (FR-002). |
| Submit | `button` | "Check" | Submits (FR-007). |
| Status | `status` (polite live region) | none | Holds the result message and the counter "Found N of 2". New text is announced. A cleared message is not (FR-014). |

Cells are named top-left, top-right, bottom-left and bottom-right, as in the spec.

## Line workings (spec-002)

**Name format**: `<Line> working, <working>[, target reached | , not a whole number]`.

- `<working>` is the digits and operator in reading order, with "?" for each empty cell or
  unchosen operator, then ` = <result>` when there is one. A negative result is spoken
  "minus 3"; the visible slot shows "−3" (U+2212).
- The visible slot (`= ?`, `= 8 ✓`, `= 9`, `= −3`, `✗`) is hidden from assistive technology,
  so the working is read once, from the name.
- The working is **not** a live region. Nothing new is announced after a tap; the status
  region behaves as spec-001 AC-20 requires.
- The ✓ mark and the ✗ cross are symbols plus a heavier weight, never colour alone.

```text
              3   6
              ?   ×
   8  +   [ 6 ][   ]  = ?
   6  ?   [   ][   ]  = ?
             = ?  = ?
```

Targets stay on the left and top; the grid gains a column on the right (row workings) and a
row at the bottom (column workings).

**What the UI driver reads**: a line's working is the element named `/^<Line> working, /`;
the driver strips the prefix and reports the working and whether ", target reached" or
", not a whole number" follows. For the small-screen check, it reads each working
element's bounding box.

## Layout guarantees

- At 320 CSS px wide and at 375 × 667, the grid, all four targets, all four workings, the
  operators, the status and the Check button are visible without scrolling or zooming
  (spec-002 checks 320 × 568).
- A long result ("= −3", "✗") stays inside its slot, wrapping rather than overflowing.
- Every button is at least 48 × 48 CSS px (above the 44 × 44 minimum).
- Content sits inside `env(safe-area-inset-*)`.
- No hover-only behaviour. Double-tap zoom is suppressed with `touch-action: manipulation`.
- Under `prefers-reduced-motion: reduce`, there are no transitions or animations.
