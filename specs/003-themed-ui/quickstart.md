# Quickstart: Themed Component Library

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-06

How to see and check the library once it is built. Commands run from the repository root on
Node 22.

## 1. Automated checks

```bash
npm ci
npm run lint                     # includes the tier import rules (research R2)
npm run typecheck
npm test                         # models, themes, seed rule, contrast, tier styling check
npm run build                    # the game: must be unchanged (step 4)
npm run build:catalogue          # the catalogue, to catalogue-dist/
npm run test:acceptance          # game scenarios plus the @catalogue scenarios on both phones
npm run test-results -- 003-themed-ui    # writes specs/003-themed-ui/test-results.md
```

Expected: every command passes; `test-results.md` ends `OVERALL status: PASS` with AC-1 to AC-25
covered (AC-20, AC-21, AC-23 to AC-25 by unit tests).

## 2. Browse the catalogue

```bash
npm run catalogue                # builds it, then serves http://localhost:4173/catalogue.html
```

Check against the design guide (*Component library.pdf*):

1. Four sections in order: Foundations, Simple components, Combined components, Screens.
2. Every component in the [contract](contracts/component-library.md) appears with every state
   listed in the [data model](data-model.md).
3. Each combined component and the play screen show a "Built from:" line.
4. Switch through all six themes: colours, button label and address change; nothing moves.
5. Switch the play screen through "Just opened", "Row 1 correct" and "All found".
6. (User Story 6) The page shows faint Ben-Day dots, 3 px every 9 px, darker than the paper, in
   every theme; no panel, bubble, pill, button or cell shows them. Compare Midnight blue with
   `docs/design/1930s Midnight blue@2x.png`.

## 3. On a real phone (SC-301)

```bash
npm run catalogue -- --host      # prints a network address, e.g. http://192.168.1.20:4173
```

Open `<address>/catalogue.html` on the phone, on the same network. Sign off each section in all
six themes against the design guide, and the play screen against the Classic mockup. Turn on
VoiceOver or TalkBack and move through the keypad and the counter samples: keys "1"–"9" and
"Oops, clear cell"; "Found 0 of 2", "Found 2 of 2", "Found 12"; the mascot is not read.

## 4. Players see no change (SC-305)

```bash
git stash -u; npm run build; du -b dist > before.txt; git stash pop
npm run build; du -b dist > after.txt; diff before.txt after.txt
```

Expected: no difference in sizes, and no `catalogue` file or text in `dist/`. The published game
plays exactly as after spec-002.
