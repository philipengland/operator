# Quickstart: Themed Play Screen (spec-004)

**Feature**: [spec.md](spec.md) | **Date**: 2026-11-07

How to check the feature once it is built. Each release is checked on its own; a flagged story
is previewed with `npm run build:flags-on`, served by `npx vite preview --outDir dist-flags-on --host`. Commands run from the repository root on Node 22.
Stop any `npm run catalogue` server first: the game's tests need port 4173.

## 1. Automated checks

```bash
npm ci
npm run exceptions:check
npm run lint
npm run typecheck
npm test                          # session, screen props, labels (Classic and Midnight blue wording)
npm run build                     # must stay under the 30 KB budget
npm run test:acceptance           # every spec-001 to spec-004 scenario, engine driver and both phones
npm run test-results -- 004-themed-play-screen
```

Expected: every command passes; `test-results.md` ends `OVERALL status: PASS`, AC-1 to AC-19
covered; spec-001, spec-002 and spec-003 still `PASS` (SC-404).

## 2. Play it

```bash
npm run build && npm run preview  # http://localhost:4173
```

1. The screen matches the design reference in `docs/design/`: the layout of `1930s Midnight
   blue@2x.png`, in Classic's colours as `Component library@2x.png` shows them. Mascot and
   bubble "Hello, Operator!" / "Fill the grid, pal.", counter "Solutions found 0 of 2", pills,
   cells, workings, keypad and "Put it through!", on the dotted page.
2. The keypad is unavailable. Tap top-right: it is selected, shows 1, and the keys become
   available. Tap 7: "= 13". Tap Oops: empty again.
3. Enter Solution A with the keypad and put it through: "You're connected! Keep 'em coming,
   pal!", "1 of 2".
4. Enter Solution B: "Every line connected, pal!", "All found!" "2 of 2", every pill ticked,
   dashed ones too.
5. Enter the inexact division (2, 4, 3, +, ÷): "Wrong number, pal!". Tap a cell: back to
   "Fill the grid, pal.".

## 3. On a real phone (SC-403)

```bash
npm run build && npx vite preview --host   # prints a Network address, e.g. http://192.168.0.50:4173
```

On a phone on the same Wi-Fi:
- **Visual sign-off**: compare the screen with the Classic mockup, side by side.
- **With VoiceOver or TalkBack**:
  - nothing is announced on opening;
  - a selected cell is heard as selected;
  - the keys are heard as unavailable before a selection;
  - each check is announced once, with the count after a new solution;
  - the mascot is not read.
- **Losing the connection**: with the game open, turn off the network and keep playing. The text
  stays in the game's typefaces. (Reopening offline comes with spec-005.)

## 4. Playtests (SC-401, SC-402)

Five hallway playtests, as spec-001 SC-001. No instructions beyond the screen. Record the time to
the first solution, and whether each player found the game finished and inviting and knew how
to enter a digit.
