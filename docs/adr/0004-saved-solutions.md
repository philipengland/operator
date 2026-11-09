# 0004. Saving found solutions on the phone

- **Status:** Accepted (owner, 2026-11-09)
- **Date:** 2026-11-08
- **Revisits:** spec-001's assumption "No saving"

## Context

spec-006 (F5) keeps each found solution on the phone and lets a player reopen it. It is the game's first stored
data, and the constitution requires stored formats to stay readable after every update. The owner chose to build
it before the seeded generator (F7), so the format must allow for seeded puzzles without a migration.

## Decision

| Concern | Choice |
| --- | --- |
| Store | The browser's `localStorage`, behind a small two-method store supplied by `main.ts`. |
| Key | One per puzzle: `operator.solutions.<puzzle id>`. `Puzzle` gains an opaque `id`. |
| Format | `{ "format": 1, "solutions": [Entry, …] }`, in the order found. A shape change adds a new number. |
| Trust | Saved data is untrusted. Each entry is shape-checked, then re-checked by the engine, when read. |
| Writing | Each save adds one solution to what is stored at that moment. |
| A newer format | An older build treats it as empty and never overwrites it. |
| Screens | The new screens share one page with the play screen. Browser history drives the phone's back gesture. No router. |

## Consequences

**Easier**

- Seeded puzzles add new keys, and nothing already saved moves.
- Rollback is safe: saved data is left alone, and an older build cannot damage a newer record.
- The saving logic is pure, and tested in Node.

**Harder, or accepted risk**

- The format is permanent: it has to be read by every later version.
- `localStorage` is shared across the `philipengland.github.io` origin, so names must stay prefixed.
- A browser may clear saved data. Safari on iOS is understood to do so after about seven days of use without a
  visit. The store apps (F13) may need a different store, which the two-method store allows for.
- Adding parts to the catalogue changes spec-003's locked component lists, with the owner's approval.

## Alternatives considered

- **IndexedDB**: asynchronous and more code, for a few kilobytes.
- **One key for all puzzles**: every save rewrites everything, and one corrupt record loses every puzzle.
- **Waiting for F7**: recommended at first, as a format could be fixed before puzzles had identities. The owner chose
  F5 first, and the `id` field removes that risk.
