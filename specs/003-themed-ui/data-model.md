# Data Model: Themed Component Library

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-06

Nothing is stored. Everything below is in-memory data, passed into components or derived.

## Theme

The six themes are fixed data (spec Themes table, research R3).

| Field | Type | Rule |
| --- | --- | --- |
| `label` | string | the theme's name, shown in the catalogue switch: "Classic", "Midnight blue" … |
| `colours` | `{ ink, paper, tile, accent }` | `#RRGGBB`; every theme meets research R6's contrast pairs |
| `address` | string | "pal", "chief" … |
| `signOff` | string | "Keep 'em coming", "Next, please" … |
| `buttonLabel` | string | "Put it through!", "Connect me!" … |

- `THEMES` is an ordered, read-only list; the order is part of the seed rule (R4) and pinned by
  golden tests.
- `CLASSIC` is the default and the theme for a puzzle with no seed.

## Page dots (User Story 6)

Derived, not stored: no theme gains a value (FR-321, AC-20). Research R10.

| Field | Rule |
| --- | --- |
| dot colour | the theme's ink at 15% over its paper, each channel rounded: Classic #D1C7B4, Midnight blue #BCCAD7, Plum and mint #BBD0C8, Amber and teal #E1BD8B, Bubblegum #DDAEC0, Racing green #C7C9A3 |
| dot size | round, 3 px across |
| spacing | every 9 px, straight grid from the page's top-left |
| where | the page background only; every surface, bubble, pill, button and cell has its own solid fill |

`blend(foreground, background, share)` gives the dot colour in TypeScript for the unit tests:
`blend(ink, paper, 0.15)`.

## Seed → theme

`themeForSeed(seed: string | undefined): Theme`

| Input | Output |
| --- | --- |
| `undefined` (no seed, e.g. the fixed puzzle) | Classic |
| any string | `THEMES[fnv1a(seed.toUpperCase()) % 6]` |

Case-insensitive ("4f7a21" = "4F7A21"). Pure and deterministic.

## Component props and models

Every component takes **props** (content and state from whatever uses it, FR-305) and derives
a **model** (what it shows and says). Names below are the props; full shapes are in
[contracts/component-library.md](contracts/component-library.md).

| Component | Tier | Key props | States |
| --- | --- | --- | --- |
| Text | simple | `text`, `style: display \| body` | – |
| Button | simple | `label`, `style: main \| key \| solid \| dashed \| cell \| cell-correct`, `action?`, `name?`, `isUnavailable?`, `isSelected?` | available, unavailable, selected |
| Text input | simple | `label`, `hint`, `value` | – |
| Icon | simple | `icon: tick \| cross`, `spokenAs?` (glyph ✓ or ✗) | heard, decorative |
| Surface | simple | `variant: panel \| bubble`, `fill?: tile \| accent \| ink` | – |
| Badge | simple | `text`, `style?: ink \| light`, `spokenAs?` | – |
| Mascot | simple | – | – |
| Speech bubble | combined | `title`, `message` | – |
| Operator header | combined | `title`, `message` | – |
| Solutions counter | combined | `found`, `total?` | searching, complete, no total |
| Target pill | combined | `line`, `operator: + − × ÷ \| open`, `chosen?`, `target`, `reachesTarget`, `name` | shown, open, ticked |
| Grid cell | combined | `state`, `digit?`, `name` | given, empty, selected, your digit, in a correct line (+ selected and correct) |
| Line working | combined | `result`, `mark: none \| tick \| cross`, `name` | – |
| Puzzle grid | combined | `columns`, `columnPills`, `rowPills`, `cells`, `workings`, `helper` | – |
| Keypad | combined | `keys` (1–9 and Oops) | – |
| Play screen | screen | `header`, `counter`, `grid`, `keypad`, `mainButton` | sample: just opened, Row 1 correct, all found |

### Solutions counter model

| Props | Shows | Heard |
| --- | --- | --- |
| `found: 0, total: 2` | "Solutions found" · "0 of 2" (accent) | "Found 0 of 2" |
| `found: 2, total: 2` | "All found!" · "2 of 2" ✓ (ink) | "Found 2 of 2" |
| `found: 12` | "Solutions found" · "12" (accent) | "Found 12" |

Rule: complete when `total` is given and `found === total`.

### Grid cell model

| State | Fill | Digit colour | Shadow | Heard (from `name`) |
| --- | --- | --- | --- | --- |
| given | ink | paper | none | "…, given 2" (unavailable) |
| empty | tile | – | ink | "…, empty" |
| selected | accent | tile | ink | "…, selected" |
| your digit | tile | ink | ink | "…, 8" |
| in a correct line | tile | accent | accent | "…, 4" |

States differ by fill, outline or shadow, not colour alone (FR-316).

## Catalogue state

| Field | Type | Rule |
| --- | --- | --- |
| `theme` | `Theme` | starts Classic; changed by the switch; not remembered (FR-325) |
| `screenSample` | `'Just opened' \| 'Row 1 correct' \| 'All found'` | starts "Just opened" |

Each component module also exports `builtFrom: readonly string[]` (component names), shown by
the catalogue (AC-7).
