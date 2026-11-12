---
id: EXC-007
title: Medium and Hard puzzle cells may be 36 × 36 CSS pixels, below the 44 × 44 touch target
status: active
deviates_from: "Constitution IV — Mobile-First, Touch-First and Accessible: touch targets MUST be at least 44 × 44 CSS pixels"
dimension: "Quality"
risk_owner: "Philip England, solo developer and product owner"
approved_by: "Philip England, owner of the standards for this personal project (self-approved, 2026-11-12)"
raised: 2026-11-12
review_by: 2027-02-12
expires: 2027-05-12
---

## Reason

Medium (5 × 4) and Hard (7 × 5) now show the operator's header, each line's result beside it, and
space between panels and cells (spec-007 FR-713, FR-718, FR-719; owner, 2026-11-12). With cells at
44 × 44, Hard is 52 px too tall for a 375 × 667 phone and too wide for a 320 × 568 one. Measured on
mock-ups, cells of 36 × 36 let Hard fit 375 × 667 with no scrolling and 320 × 568 with no sideways
scrolling. The owner chose smaller cells over a smaller header or scrolling on every phone.

## Mitigating controls

- Only the cells of Medium and Hard are affected. Pills, keys, the main button and every control on
  the other puzzles stay at least 44 × 44, and the acceptance scenarios check both sizes (spec-007
  AC-12, AC-16).
- 36 × 36 is above WCAG 2.2 AA's target-size minimum (2.5.8, 24 × 24 CSS pixels). Cells sit in a grid
  with space between them, so neighbouring targets do not overlap.
- Cells are as large as the screen allows: 36 × 36 is a floor, not a fixed size; on wider phones
  they grow up to the usual size.
- Screen-reader users reach every cell by name, whatever its size (play-screen contract).

## Exit plan

Revisit when the play screen is next redesigned for larger grids, or when the Capacitor apps are
built (phones there may allow a different layout). Review by 2027-02-12; close this exception, or
renew it with the owner's approval, before 2027-05-12.
