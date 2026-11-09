# Contract changes: Component Library (spec-006)

**Date**: 2026-11-08. Additions to `docs/contracts/component-library.md`, made in the first pull request.

| Component | Tier | Addition | Accessible behaviour |
| --- | --- | --- | --- |
| Surface | simple | Optional tap action: renders as a `<button>` | Named by its contents |
| Button | simple | A read-only form, with the same look | Plain text, its name read as text; not a button |
| Dialog | simple, **new** | A native modal `<dialog>` holding what is placed inside it; declares the backdrop | `dialog` named by its title; keeps focus |
| Solutions counter | combined | Optional `onTap`, passed to its Surface. "Built from" is unchanged | `button` when tappable, same name |
| Grid cell, Puzzle grid | combined | `isReadOnly` | No buttons |
| Confirm dialog | combined, **new** | Built from Dialog, Text, Button | Question, and the two buttons |
| Solution list | screen, **new** | Heading, Back, rows or an empty line, Start again | See play-screen-changes.md |
| Solution view | screen, **new** | Heading, Back, read-only Puzzle grid | See play-screen-changes.md |

**Catalogue**: lists each new part, with samples of every state.

**Locked scenarios affected**: spec-003 `[AC-1]` checks the exact components per tier in
`test/acceptance/library/examples.ts`, and `Screens` is exactly `['Play screen']`. These gain the new names, and
need the owner's approval at `/speckit-acceptance` (research R12). No other locked list changes: the counter's and
the grid's "built from" lists stay as they are.

Combined components and screens still only lay out (`tools/ui-tiers.spec.ts`).
