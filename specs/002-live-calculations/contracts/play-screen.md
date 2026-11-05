# Contract change: Play Screen (spec-002)

Changes to spec-001 [contracts/play-screen.md](../../001-walking-skeleton/contracts/play-screen.md).
Every role, name and layout guarantee there still holds. When this feature merges, the
current-state contract is updated to match (plan, Open Items 1).

## Added elements

| Element | Role | Accessible name (pattern) | Behaviour |
| --- | --- | --- | --- |
| Row working | text, labelled (inside "Puzzle") | "Row 1 working, 6 + ?" / "…, 6 + 2 = 8, target reached" / "…, 6 + 3 = 9" | To the **right** of its row. Visible text is the result slot only (research R2). |
| Column working | text, labelled (inside "Puzzle") | "Column 1 working, 6 − 9 = minus 3" / "…, 6 ÷ 4, not a whole number" | **Below** its column. |

**Name format**: `<Line> working, <working>[, target reached | , not a whole number]`.

- `<working>` is the digits and operator in reading order, with "?" for each empty cell or
  unchosen operator, then ` = <result>` when there is one. A negative result is spoken
  "minus 3"; the visible slot shows "−3".
- The visible slot (`= ?`, `= 8 ✓`, `= −3`, `✗`) is hidden from assistive technology, so the
  working is read once, from the name.
- The working is **not** a live region. Nothing new is announced after a tap; the status region
  behaves exactly as in spec-001 (AC-20).

## Changed layout

```text
              3   6
              ?   ×
   8  +   [ 6 ][   ]  = ?
   6  ?   [   ][   ]  = ?
             = ?  = ?
```

- The grid gains a column on the right (row workings) and a row at the bottom (column
  workings). Targets stay on the left and top.
- The ✓ mark and the ✗ cross are symbols plus a heavier weight, never colour alone.

## Layout guarantees (added)

- At 320 × 568 and 375 × 667, all four workings are visible without scrolling or zooming, as
  well as everything spec-001 requires.
- A long result ("= −3", "✗") stays inside its slot, wrapping rather than overflowing.

## What the UI driver reads

- A line's working: the element named `/^<Line> working, /`; the driver strips the prefix and
  reports the working and whether ", target reached" or ", not a whole number" follows.
- Positions for the small-screen check: the bounding box of each working element.
