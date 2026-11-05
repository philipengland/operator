# Contract change: Engine API (spec-002)

Changes to the engine's public API in spec-001
[docs/contracts/engine-api.md](../../../docs/contracts/engine-api.md). Everything not
listed here is unchanged. When this feature merges, the current-state contract is updated to
match (plan, Open Items 1).

## Changed

### `evaluateLine(digits, operator, rules): LineResult`

- A step that goes below zero is **no longer a failure**. Results may be negative (FR-208).
- The only failure is a division that is not whole:
  `{ ok: false, reason: 'inexact-division', step }`. The `'below-zero'` reason is removed.

| Digits | Operator | Before (spec-001) | Now (spec-002) |
| --- | --- | --- | --- |
| 6, 9 | − | `{ ok: false, reason: 'below-zero', step: 1 }` | `{ ok: true, value: -3 }` |
| 6, 4 | ÷ | `{ ok: false, reason: 'inexact-division', step: 1 }` | unchanged |
| 6, 2 | ÷ | `{ ok: true, value: 3 }` | unchanged |

### `checkEntry(puzzle, entry, rules): CheckResult`

Signature unchanged. A line meets its target when its result equals the target, including
negative results and negative targets.

| Puzzle | Entry | Result |
| --- | --- | --- |
| Worked example | Below zero: 2, 9, 3, Row 2 −, Column 1 − | `not-solved` (Column 1: 6 − 9 = −3, target 3) — same outcome, new reason |
| Worked example | Solutions A and B | `solved`, as before |

Negative targets (AC-12) are proved through `lineWorking` below, on a test puzzle whose Row 1
has target −3 and operator −, so the line is tested on its own.

## Added

### `lineWorking(puzzle, entry, line, rules): LineWorking`

What one line currently works out to (data-model "LineWorking"). Pure; derived from its
arguments only.

```ts
type LineOutcome =
  | { kind: 'incomplete' }
  | { kind: 'result'; value: number; reachesTarget: boolean }
  | { kind: 'not-whole'; step: number };

interface LineWorking {
  line: LinePosition;
  digits: (Digit | null)[];   // reading order
  operator: Operator | null;
  outcome: LineOutcome;
}
```

| Worked-example entry | Line | Outcome |
| --- | --- | --- |
| Just opened | Row 1 | `incomplete`, digits [6, null], operator + |
| Top-right 2 | Row 1 | `result`, value 8, reachesTarget true |
| Top-right 3 | Row 1 | `result`, value 9, reachesTarget false |
| Bottom-left 9, Column 1 − | Column 1 | `result`, value −3, reachesTarget false |
| Bottom-left 4, Column 1 ÷ | Column 1 | `not-whole`, step 1 |
| Solution A | every line | `result`, reachesTarget true |
| Test puzzle, Row 1 target −3, operator −: 6 then 9 | Row 1 | `result`, value −3, reachesTarget true (AC-12) |
| Same test puzzle: 6 then 8 | Row 1 | `result`, value −2, reachesTarget false (AC-12) |

**Guarantee**: for a complete entry, `checkEntry` returns `solved` exactly when every
`lineWorking` outcome is a `result` with `reachesTarget` true.
