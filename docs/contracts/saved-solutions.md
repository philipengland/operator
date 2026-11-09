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
