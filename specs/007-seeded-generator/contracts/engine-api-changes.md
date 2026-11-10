# Contract changes: Engine API (spec-007)

**Date**: 2026-11-10. Additions to `docs/contracts/engine-api.md`. Nothing existing changes. Types are in
[data-model.md](../data-model.md).

## New

| Export | Signature | Rules |
| --- | --- | --- |
| `dailyPuzzle` | `(date: CalendarDate, preset: PresetName) → DailyPuzzle` | Pure. Same arguments, same result, on every device and in every later `v1` build (R2, R13). Throws only for a malformed date or unknown preset |
| `countSolutions` | `(puzzle: Puzzle, workBudget: number) → Count` | Pure. Counts distinct solutions (digits and open operators, spec-001) up to 101, stopping after `workBudget` search steps (R4) |
| `PRESETS` | `Readonly<Record<PresetName, Preset>>` | The four presets, fixed once released |
| `GENERATOR_VERSION` | `'v1'` | Part of every seed and daily puzzle identity |
| Types | `CalendarDate`, `PresetName`, `Preset`, `DailyPuzzle`, `Count` | |

## Changed

| Item | Change |
| --- | --- |
| `Puzzle` | Gains optional `seed` and `preset`. A puzzle without them is the worked example, as before |

## Unchanged

`checkEntry`, `evaluateLine`, `lineWorking`, `emptyEntry`, `lineOperator`, `isGiven`, `lineSpec`, the
cycles and `workedExample` work on any grid size already, and keep their contracts.

## Guarantees for every daily puzzle

At least one solution (`builtFrom`); whole targets, none 0, within the preset's range, negative only in Hard
and Collector; operators from the preset; open lines and given cells within the preset; count within the
band. Proved for every date of 2027 by the sweep (R12) and pinned for golden dates (R13).
