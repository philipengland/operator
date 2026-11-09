# Data Model: Solution Log (spec-006)

## Engine

`Puzzle` gains `id: string`, which says which puzzle a solution belongs to. The fixed puzzle's is
`worked-example`. A seeded puzzle's will come from its seed and settings (F7).

## Session (`src/app/session.ts`)

| Field | Change | Meaning |
| --- | --- | --- |
| `found` | `Set` → `Map<SolutionKey, Entry>` | In the order found. `.size` and `.has` are unchanged |
| `place` | New | `{ kind: 'play' }`, `{ kind: 'list' }` or `{ kind: 'solution', number }` |
| `isConfirming` | New | Whether the pop-up is open |

| Action | Effect |
| --- | --- |
| `openList` | `place` = list |
| `openSolution(number)` | `place` = that solution |
| `goBack` | Solution → list → play; closes the pop-up first if it is open |
| `askToStartAgain` | `isConfirming` = true |
| `keepSolutions` | `isConfirming` = false |
| `startAgain` | Clears `found`, the entry, `selected` and `message`; `isConfirming` = false; stays on the list |
| `restoreFound(entries)` | Fills `found` when the game opens |

Opening a place changes nothing else, so the grid, selection and message survive (FR-604, FR-607).

## Saved record

See [contracts/saved-solutions.md](contracts/saved-solutions.md).

**Classification**: game progress, not personal. **System of record**: the phone.

## States of one puzzle's record

```text
no record ──(first solution found)───────▶ record with 1 solution
record ─────(another distinct solution)──▶ record with one more, at the end
record ─────(a repeat)───────────────────▶ unchanged
record ─────(Start again, confirmed)─────▶ no record
record ─────(browser or player clears)───▶ no record
unreadable ─(next solution found)────────▶ record with 1 solution
newer format ─(any change)───────────────▶ unchanged; this session is not saved
```

## Reading a record

| Found in the record | Result |
| --- | --- |
| Nothing, or not valid JSON, or wrong shape | Treated as empty |
| A newer `format` | Treated as empty, and never overwritten |
| An entry of the wrong size, or with an unknown digit or operator | That entry is dropped |
| An entry that does not solve the puzzle | That entry is dropped (AC-21) |
| The same solution twice | Kept once, at its first place |
