# Contract: Component Library

**History**: written for spec-003 on 2026-11-06. Copied to `docs/contracts/component-library.md`
when implemented, and kept current there.

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
| Button | `button`; `aria-pressed="true"` when selected | `label`, or `label, action` when `action` is given ("Oops, clear cell"; "Put it through!, Check"), or a whole `name` containing the label ("Top-right cell, 8") | styles: main, key, solid, dashed, cell, cell-correct |
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
| Target pill | Badge, Button, Icon | shown: text with `name`; open: `button` named `name` | "+ 8"; dashed "? 6"; tick when `reachesTarget` |
| Grid cell | Button | `button` named `name`; given → `aria-disabled`; selected → `aria-pressed="true"` | five states (data model) |
| Line working | Text, Icon | text `name` (spec-002 contract); visible slot hidden | "= ?", "= 8 ✓", "= −3", "✗" |
| Puzzle grid | Surface, Target pill, Grid cell, Line working, Text | `group` named "Puzzle" | pills top and left, cells, workings at far ends, helper line |
| Keypad | Button | `group` named "Keypad"; keys named "1"–"9" and "Oops, clear cell" | two rows of five |

## Screens

| Screen | Built from | Layout |
| --- | --- | --- |
| Play screen | Operator header, Solutions counter, Puzzle grid, Keypad, Button (main) | top to bottom, inside safe areas; fits 375 × 667 and 320 × 568 without scrolling |

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
