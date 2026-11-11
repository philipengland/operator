# Data Model: Daily Puzzles, Seeded Generator and Presets

**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

## Engine

### CalendarDate

Text `YYYY-MM-DD`, for example `2026-11-10`. Formed by the app from the phone's local date (R6). The
engine checks the form and that the date exists; it never reads a clock.

### PresetName

One of `easy`, `medium`, `hard`, `collector`.

### Preset

| Field | Easy | Medium | Hard | Collector |
| --- | --- | --- | --- | --- |
| `rows` × `columns` | 3 × 3 | 5 × 4 | 7 × 5 | 4 × 3 |
| `operators` | + − × ÷ | + − × ÷ | + − × ÷ | + − × ÷ |
| `openLines` (fewest, most) | 0, 0 | 4, 5 | 1, 2 | 7, 7 (all) |
| `givenCells` (fewest, most) | 4, 5 | 10, 10 | 21, 22 | 0, 0 |
| `targets` (lowest, highest; never 0) | 1, 29 | 1, 100 | −500, 500 | −29, 29 |
| `band` (fewest, most solutions) | 1, 10 | 2, 20 | 1, 3 | 21, 101 |
| `workBudget` (search steps) | fixed at User Story 1 | fixed at User Story 2 | fixed at User Story 3 | fixed at User Story 2 |

A preset is fixed for good once its flag is on (R13). A band's 101 means "more than 100".

### Seed

Text `v1:<CalendarDate>:<PresetName>`, for example `v1:2026-11-10:easy`. `v1` is the generator's version
(R2). Hashed with FNV-1a to start the random numbers (R1).

### Puzzle (changed)

Gains two optional fields; everything else as spec-001 and spec-006.

| Field | Type | Rule |
| --- | --- | --- |
| `id` | text | `daily-v1-2026-11-10-easy` for a daily puzzle; `worked-example` unchanged |
| `seed` | text, optional | the seed it was made from; absent for the worked example (Classic theme) |
| `preset` | PresetName, optional | absent for the worked example |
| `solutionCount` | 1 to 101 | the capped count; 101 means more than 100 |

Validation: every target is within the preset's range and not 0; negative only for Hard and Collector;
each line's operator is one of the preset's, or `open`; the number of open lines and given cells is within
the preset's; the count is within the band.

### DailyPuzzle

`{ puzzle: Puzzle, builtFrom: Entry }`. `builtFrom` is the full filling the puzzle was made from, with each
open line's operator; it always solves the puzzle. Tests use it; the app never shows it (FR-711).

### Count

`{ count: number, isWithinBudget: boolean }`: the number of solutions, capped at 101, and whether the
search finished within the work budget. A candidate whose count is not within budget is dropped.

## App

### Today (session)

| Field | Type | Rule |
| --- | --- | --- |
| `date` | CalendarDate | read from the phone's clock on opening, on becoming visible, and on opening the Today screen |
| `puzzles` | made on demand, kept for the session | one per preset, for `date` (R5) |
| `current` | PresetName or `practice` | the puzzle on the play screen |

Switching puzzles keeps each puzzle's found solutions (spec-006) and opens it with an empty grid
(FR-708, FR-709).

### Place (changed)

Gains `{ kind: 'today' }`, beside spec-006's `play`, `list` and `solution`. The back gesture from Today
returns to the puzzle it was opened from.

### TodayRecord (saved, new)

Key `operator.today`; value `{ "format": 1, "date": "2026-11-10", "preset": "medium" }`.

| State | On opening |
| --- | --- |
| No record | The worked example (a phone that has never played, AC-20) |
| Unreadable, unknown format, unknown preset or bad date | Today's Easy puzzle (AC-21) |
| `date` is today | Today's puzzle for `preset` |
| `date` is an earlier day | Remove that date's four solution records, then today's puzzle for `preset` (AC-19) |

Written when the player opens one of today's puzzles. The worked example's solution record is never
removed by a new day.

## State transitions

```text
new phone ──open──▶ worked example ──Today──▶ Today screen ──tap preset──▶ today's puzzle
                         ▲                         │  ▲                         │
                         └────tap Practice─────────┘  └──────────Today──────────┘
next day: opening ──▶ previous day's four records removed ──▶ today's puzzle for the last preset
```
