# Contract changes: Saved Data (spec-007)

**Date**: 2026-11-10. Additions to `docs/contracts/saved-solutions.md` and ADR 0004.

## New record: `operator.today`

```json
{ "format": 1, "date": "2026-11-10", "preset": "medium" }
```

| Field | Rule |
| --- | --- |
| `format` | 1. A record with a higher format is left alone and treated as no record, as ADR 0004 |
| `date` | The day the record was written, `YYYY-MM-DD` |
| `preset` | `easy`, `medium`, `hard` or `collector`; the preset last played |

Read as untrusted: anything that does not match is treated as unreadable (AC-21).

## Solution records for daily puzzles

Unchanged in form (spec-006): key `operator.solutions.daily-v1-2026-11-10-easy`. On the first opening of a
new day, the previous day's four keys are removed (their identities come from the record's `date`). The
worked example's record is never removed by a new day.

## Compatibility

Both forms are additions: builds without this feature ignore them, and the worked example's record is read
exactly as before.
