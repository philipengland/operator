# Contract: Component Library

**History**: written for spec-003 on 2026-11-06 (`specs/003-themed-ui/contracts/component-library.md`).

What screens (spec-004 onwards), the catalogue and the UI driver can rely on. The roles,
accessible names and tier rules are the contract; class names and internal markup are not.

## Shape of every component

```ts
interface Component<Props> {
  readonly element: HTMLElement;
  update(props: Props): void;   // re-renders in place; writes text only when it changes
}
// Each module exports:
//   create<Name>(props): Component<Props>
//   <name>Model(props): Model              (pure, unit-tested)
//   builtFrom: readonly string[]           (empty for simple components)
```

- Components never import `src/engine/` or `src/app/`. Wording, accessible names and states
  are passed in.
- Colours come only from `--ink`, `--paper`, `--tile`, `--accent`, set by `applyTheme`.
- Interactive components are real `<button>` or `<input>` elements, at least 44 × 44 CSS px,
  with `touch-action: manipulation`. Unavailable buttons use `aria-disabled="true"` (still
  focusable) and ignore taps.
- Under `prefers-reduced-motion: reduce`, nothing transitions or animates.

## Foundations

| Export | Purpose |
| --- | --- |
| `THEMES`, `CLASSIC`, `MIDNIGHT_BLUE`, `Theme`, `ThemeColours` | the six themes in table order, each `{ label, colours: { ink, paper, tile, accent }, address, signOff, buttonLabel }` (data model) |
| `applyTheme(root, theme)` | sets the four colour properties on `root`, and nothing else |
| `themeForSeed(seed: string \| undefined)` | research R4: 32-bit FNV-1a over the upper-cased seed, remainder by 6; no seed gives Classic |
| `contrastRatio(foreground, background)` | WCAG 2.2 relative-luminance ratio, for the contrast test |
| `blend(foreground, background, share)` | the colour of `share` of `foreground` over `background`, as `#RRGGBB` (User Story 6: the dot colour is `blend(ink, paper, 0.15)`) |
| `page.css` | the page background: paper with Ben-Day dots, 3 px every 9 px, in the theme's ink at 15% over paper (`color-mix`), on the root element only; a page using it keeps `body` and its wrappers transparent (User Story 6) |
| `tokens.css` | typefaces (`--font-display`, `--font-body`, weights), outlines, shadows, radii, `--gap`, `--touch-target`; screen sizes `--size-cell`, `--size-key`, `--size-main`, `--size-dashed`, `--text-display`, `--text-body`, `--space-surface`, `--space-screen`, `--space-between`, `--space-grid`, which shrink on screens up to 700 and 600 px tall and up to 359 px wide, so the play screen fits 375 × 667 and 320 × 568 |

## Simple components

| Component | Role | Accessible name | Notes |
| --- | --- | --- | --- |
| Text | none (text) | its text | `display` = Chewy; `body` = Nunito |
| Button | `button`; `aria-pressed="true"` when selected | `label`, or `label, action` when `action` is given ("Oops, clear cell"; "Put it through!, Check"), or a whole `name` containing the label ("Top-right cell, 8") | styles: main, key, solid, dashed, cell, cell-correct. `createButton(props, onPress, after)`: decorative nodes after the label, as Badge has. Unavailable key and solid buttons are flat with a thin outline |
| Text input | `textbox` | its visible `label` (a real `<label for>`) | hint as `placeholder`; typed text in Chewy |
| Icon | `img` when `spokenAs` is given, otherwise hidden | `spokenAs` ("target reached") | tick, cross (drawn; the ✓ or ✗ kept as visually hidden text) |
| Surface | none | – | panel; bubble (accent shadow, 6 px tail corner); fill tile, accent or ink (ink casts an accent shadow) |
| Badge | none (text) | its text, or `spokenAs` (visible text then hidden) | ink pill; light pill (tile, ink outline) for a count on a coloured surface |
| Mascot | hidden (`aria-hidden="true"`) | – | 76 px, original character from the design guide |

## Combined components

| Component | Built from | Role and name | Visible |
| --- | --- | --- | --- |
| Speech bubble | Surface, Text | none; title and message read as text | title (display), message (body) |
| Operator header | Mascot, Speech bubble | none | mascot beside bubble |
| Solutions counter | Surface, Text, Badge, Icon | text "Found N of M" / "Found N", visible parts hidden | "Solutions found" or "All found!", count pill, tick when complete |
| Target pill | Badge, Button, Icon | shown: text with `name`; open: `button` named "visible text, `name`" ("? 6, Row 2 target 6, operator not chosen") | "+ 8"; dashed "? 6"; tick when `reachesTarget`, shown or open |
| Grid cell | Button | `button` named `name`; given → `aria-disabled`; selected → `aria-pressed="true"` | five states (data model) |
| Line working | Text, Icon | text `name` (spec-002 contract); visible slot hidden | "= ?", "= 8 ✓", "= −3", "✗" |
| Puzzle grid | Surface, Target pill, Grid cell, Line working, Text | `group` named "Puzzle" | pills top and left, cells, workings at far ends, helper line |
| Keypad | Button | `group` named "Keypad"; keys named "1"–"9" and "Oops, clear cell"; while `keysAvailable` is false, every key is `aria-disabled="true"` | two rows of five. `createKeypad(onKey, keysAvailable = true)`; `update(keysAvailable)` |

## Screens

| Screen | Built from | Layout |
| --- | --- | --- |
| Play screen | Operator header, Solutions counter, Puzzle grid, Keypad, Button (main) | top to bottom, inside safe areas; fits 375 × 667 and 320 × 568 without scrolling. Props `isKeypadShown`, `keysAvailable`, `announcement` (a visually hidden polite `status`, written only when it changes; while not empty, the bubble's line is hidden from screen readers). Actions `onKey`, `onCheck`, `onCell(row, column)`, `onPill(axis, index)` |

## Catalogue (development only)

- Page title "Operator component catalogue"; `main` landmark.
- Four `region`s named "Foundations", "Simple components", "Combined components", "Screens".
- Each component is a `region` named by the component ("Solutions counter") holding its
  samples, each labelled ("Complete"), and for combined components and screens a "Built from:"
  line.
- Theme switch: a `group` named "Theme" with six buttons named by theme label, the current one
  `aria-pressed="true"`. Starts on Classic and is not remembered. Switching sets the four
  colours and redraws only the samples whose words are the theme's (the play screen, Button
  "Main", Speech bubble "Row through", Operator header "Greeting"). Each of those keeps the size
  of its longest wording in any theme, using invisible copies (`visibility: hidden`), so nothing moves.
- Screen samples: a `group` named "Screen sample" with buttons "Just opened", "Row 1 correct",
  "All found", switched in place through the play screen's `update`. Their messages use the
  theme's address and the main button its label.
- `catalogue.html#play-screen` shows a `region` named "Play screen" alone at full screen height,
  with the theme switch, the screen-sample switch and a "Back to the catalogue" link below it;
  the catalogue's Play screen entry links to it ("Open the play screen alone").
- Never in `dist/`; built to `catalogue-dist/` by `npm run build:catalogue`.

## Additions for the solution log (spec-006)

| Component | Tier | Addition | Accessible behaviour |
| --- | --- | --- | --- |
| Surface | simple | Optional tap action: renders as a `<button>` | Named by its contents |
| Button | simple | A read-only form, with the same look | Plain text, its name read as text; not a button |
| Dialog | simple, **new** | A native modal `<dialog>` holding what is placed inside it; declares the backdrop | `dialog` named by its title; keeps focus |
| Solutions counter | combined | Optional `onTap`, passed to its Surface. "Built from" is unchanged | `button` when tappable, same name |
| Grid cell | combined | `isReadOnly`. A found solution's Puzzle grid is given read-only cells and shown pills, and hides an empty helper line | No buttons |
| Speech bubble | combined | `isTitleHeading`: the title is the screen's main heading. An empty message is not shown | `heading` |
| Confirm dialog | combined, **new** | Built from Dialog, Text, Button | Question, and the two buttons |
| Solution list | screen, **new** | Built from Operator header and Button. Heading and empty line in the bubble, Back, rows, Start again | See play-screen-changes.md |
| Solution view | screen, **new** | Built from Operator header, Button and Puzzle grid. Heading in the bubble, Back, read-only grid | See play-screen-changes.md |

**Catalogue**: lists each new part, with samples of every state.

**Locked scenarios affected**: spec-003 `[AC-1]` checks the exact components per tier in
`test/acceptance/library/examples.ts`, and `Screens` is exactly `['Play screen']`. These gain the new names, and
need the owner's approval at `/speckit-acceptance` (research R12). No other locked list changes: the counter's and
the grid's "built from" lists stay as they are.

Combined components and screens still only lay out (`tools/ui-tiers.spec.ts`).

## Additions for daily puzzles (spec-007)

| Component | Tier | Addition | Accessible behaviour |
| --- | --- | --- | --- |
| Puzzle grid | combined | `name`: what a screen reader calls it, "Puzzle" by default. `workings: 'beside' \| 'elsewhere'`. Elsewhere: no column or row for workings; each working is kept, visually hidden, in one holder. A column pill wider than its column puts its target under its operator | Every working heard by its name, as before |
| Workings strip | combined, **new** | Built from Surface, Line working and Text: the selected cell's row and column workings in full, or one line of text. Wraps to two lines | Hidden from screen readers |
| Status bar | combined, **new** | Built from Solutions counter and Button: the counter, then a Today button | `region` "Status bar"; the button reads "Today", named "Today's puzzles" |
| Play screen | screen | Built from Operator header, Solutions counter, Status bar, Puzzle grid, Workings strip, Keypad and Button. `onToday` adds the Status bar under the header; `isSnug` uses the snug density; `isCompact` shows the Status bar and the strip in place of the header and counter, with the compact density | Unchanged; the operator's line is still announced |
| Today list | screen, **new** | Built from Operator header and Button: heading in the bubble, Back, one row per choice, shown as heard ("Easy, found 1 of 4") | `region` named by its heading; rows are buttons |

**Foundations**: `.density-snug` gives a 3 × 3 grid on the full screen 50 px cells on phones 601 to 700 px high, so
Easy fits beside the Today button (owner, 2026-11-10). `.density-compact` is a token set for the compact screen: 44 px cells, keys and main button, with
smaller spacing and text (14 px at 320 px wide). Nothing a player taps goes below 44 × 44 px.

**Catalogue**: lists each new part with samples, and shows the compact screen alone with a 5 × 4 and a 7 × 5 grid at
`catalogue.html#play-screen-medium` and `#play-screen-hard`.

**Locked scenarios affected**: spec-003 `[AC-1]` gains Status bar and Workings strip (combined) and Today list
(screens), approved by the owner (`specs/007-seeded-generator/acceptance.md`).
