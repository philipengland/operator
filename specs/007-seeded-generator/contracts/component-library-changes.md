# Contract changes: Component Library (spec-007)

**Date**: 2026-11-10. Additions to `docs/contracts/component-library.md`. spec-003's locked catalogue lists
gain these only with the owner's approval at `/speckit-acceptance`.

| Component | Tier | Built from | Role and name | Notes |
| --- | --- | --- | --- | --- |
| Today list | screen | Operator header, Button (rows), Text | `region` "Today"; rows are buttons | Same pattern as the Solution list (spec-006) |
| Workings strip | combined | Surface, Line working | hidden from screen readers | Two workings, or one line of text |
| Status bar | combined | Solutions counter, Button | `region` "Status bar" | One 44-pixel row: counter and Today |
| Puzzle grid | combined | unchanged | unchanged | New prop: show workings beside lines, or leave them for the strip (visually hidden) |
| Play screen | screen | gains Status bar and Workings strip | unchanged | New prop: compact, for grids bigger than 3 × 3 |

The tier rules stand: no new styling in combined or screen CSS, and nothing below 44 × 44 pixels.
