# Contract: Saved Solutions

**Date**: 2026-11-08. The format every later version of the game must be able to read (FR-614).

**Where**: the browser's `localStorage`, one key per puzzle: `operator.solutions.<puzzle id>`.

```json
{
  "format": 1,
  "solutions": [
    {
      "cells": [[null, 2], [2, 3]],
      "rowOperators": [null, "×"],
      "columnOperators": ["÷", null]
    }
  ]
}
```

- `solutions` is in the order found. Each is the engine's `Entry`. A given cell is `null`, as is a line
  whose operator is shown rather than chosen.
- Operators are the game's own characters: `+`, `−` (U+2212), `×`, `÷`.
- The puzzle id is an opaque string. Seeded puzzles (F7) add new keys and change nothing already saved.

## Rules for every version

1. A record's `format` is never reinterpreted. A change to the shape adds a new number, and the game goes on
   reading every earlier one.
2. A version that finds a `format` newer than it knows treats the record as empty and never writes to it.
3. Every entry is checked when read: shape first, then by the puzzle's rules. A failure drops that entry and
   shows no error.
4. A save adds one solution to what is stored at that moment. It never rewrites from memory.

## Daily puzzles (spec-007, `newDay`)

A daily puzzle's solutions use the same record, under its own id: `operator.solutions.daily-v1-2026-11-10-easy`.
One more record says which day and preset were last played:

```json
{ "format": 1, "date": "2026-11-10", "preset": "medium" }
```

- Key `operator.today`. `preset` is `easy`, `medium`, `hard` or `collector`; `date` is `YYYY-MM-DD`.
- Read as untrusted, as above: anything that does not match is treated as unreadable, and today's Easy opens.
- On the first opening of a new day, the four solution records of the record's `date` are removed. The worked
  example's record is never removed by a new day.
