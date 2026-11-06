# 0002. A tiered component library in plain TypeScript

- **Status:** Accepted
- **Date:** 2026-11-06
- **Revisits:** [ADR 0001](0001-web-stack-and-hosting.md), "No framework … to be revisited at F1"

## Context

spec-003 builds the "Hello, Operator!" design as a component library for every screen that
follows: the play screen now (spec-004), the Choose-a-puzzle screen with presets and seeds
(F6, F7), and later screens. The owner asked for three tiers: simple components (text,
buttons, inputs), combined components that make up parts of screens, and screens. There are
six colour themes, each four colours plus wording. The owner wants to see every component in
every state and theme, and decided on 2026-11-06 not to use a component-gallery tool such as
Storybook.

ADR 0001 chose plain DOM and TypeScript with no UI framework for F0, to be revisited at F1.
This is that revisit.

## Decision

| Concern | Choice |
| --- | --- |
| Framework | None. Components are plain TypeScript modules in `src/ui/`. |
| Component shape | A pure **model** (props → what it shows and says), unit-tested in Node with Vitest, and a **renderer** `create<Name>(props)` returning `{ element, update(props) }`, proven through the catalogue on both phones. No DOM library in unit tests. |
| Tiers | `src/ui/foundations/`, `simple/`, `combined/`, `screens/`. Import direction enforced by ESLint `no-restricted-imports`; nothing in `src/ui/` imports the engine or the app. A unit test (`tools/ui-tiers.spec.ts`, which reads the stylesheets from disk) fails if a combined component or screen declares colour, typeface, border, radius or shadow. |
| Themes | TypeScript data (`src/ui/foundations/themes.ts`) applied as four CSS custom properties (`--ink`, `--paper`, `--tile`, `--accent`). All other design values are fixed custom properties in `tokens.css`. A puzzle's theme comes from its seed (FNV-1a, remainder by six). |
| Fonts | Chewy (Apache License 2.0) and Nunito (SIL Open Font Licence) WOFF2 files, with their licence texts, committed in `src/ui/foundations/fonts/` and served from the same origin. Never fetched at run time (constitution I). |
| Catalogue | A second HTML entry, `catalogue.html`, built only by `npm run build:catalogue` into `catalogue-dist/`. The game's `npm run build` never includes it, so it is never published. Tested on its own Playwright projects. |

## Consequences

**Easier**

- No dependency to add, approve, update or ship. The game's bundle budget is unaffected by the
  library's existence; only what a screen uses is bundled.
- The tier rules fail the build rather than relying on review.
- One source for theme values, read by the contrast test, the catalogue and the game.
- The catalogue shows the real components, so it cannot drift from the game.

**Harder, or accepted risk**

- Renderers have no unit tests; they are proven only through catalogue scenarios on WebKit and
  Chromium. A DOM library (`happy-dom`) was considered and not adopted (plan, Open Items 3).
- Plain DOM composition is more code than a framework's templates. If F6/F7's screens make it
  costly, adopting a framework needs a new ADR; the model/renderer split keeps the pure parts
  reusable.
- Font files are third-party assets in the repository; their licence texts and a README of sources
  and hashes are committed with them (`src/ui/foundations/fonts/`).
- The catalogue's two Playwright projects lengthen the acceptance run.
