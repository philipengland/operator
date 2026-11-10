# 0005. Daily puzzles from a seed

- **Status:** Proposed
- **Date:** 2026-11-10
- **Revisits:** the brief's F11 (daily puzzle, Phase 3), brought into the MVP by the owner

## Context

spec-007 (F6, F7) makes puzzles on the phone. The owner decided they are daily: each calendar date has one
puzzle per preset, the same for every player on that date. There is no server, so every phone must make the
same puzzle from the date alone, now and in every later version (constitution III). A prototype
(spec-007 research R3) showed the brief's given cells could not reach Medium and Hard's bands, so the presets
changed, and that counting solutions can be slow, so it must be bounded without a clock.

## Decision

- **Seed**: the text `v1:<date>:<preset>`, for example `v1:2026-11-10:easy`, where the date is the phone's local
  calendar date and `v1` is the generator's version. Hashed with 32-bit FNV-1a.
- **Random numbers**: `mulberry32`, written in the engine, with whole numbers drawn as
  `Math.floor(next() × n)`. No package.
- **Making a puzzle**: the brief's method (fill, choose operators and targets, open lines, given cells),
  drawing candidates from one stream until one's solution count falls inside the preset's band.
- **Counting**: a search with exact bounds per operator, capped at 101, stopped after a fixed number of search
  steps per preset (the work budget), never after a time. A candidate that reaches its budget is dropped.
- **Identity**: `daily-v1-<date>-<preset>`, so saved solutions (ADR 0004) never mix versions.
- **Fixed for good**: once a preset is released, its puzzles for every date are fixed. Golden tests pin a set
  of dates. Changing them needs a new version (`v2`), never an edit under `v1`.

## Consequences

- Every player on the same date gets the same puzzles with no server, and sharing by seed (F11) needs only the
  seed text later.
- The generator, the presets and the work budgets become, in effect, permanent once released: improving them
  means a new version, and players on a given date all move to it together with the new build.
- A phone with the wrong date gets that date's puzzles. Accepted.
- Puzzles are made in memory each session; nothing made is stored, so there is no new format to keep readable
  beyond the small `operator.today` record.
