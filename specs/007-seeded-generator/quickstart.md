# Quickstart: Daily Puzzles, Seeded Generator and Presets

How to show that spec-007 works, end to end. Contracts: [contracts/](contracts/); data:
[data-model.md](data-model.md).

## 1. Automated checks

```bash
npm run exceptions:check
npm run lint
npm run typecheck
npm test                      # includes the golden dates and the sweep of every date of 2027 (R12, R13)
npm run build
npm run test:acceptance       # engine driver, then both phones with their dates set by Playwright's clock
npm run test-results -- 007-seeded-generator
```

Expected: every command passes; `test-results.md` ends `OVERALL status: PASS`, with AC-1 to AC-22 covered.
Specs 001 to 006 still pass (SC-705). The build stays under 30 KB.

## 2. One date, three places (AC-2)

The engine, the iPhone and the Android phone make the same Easy puzzle for 10 November 2026:

```bash
npm run test:acceptance -- -g "spec-007 AC-2]"
```

## 3. On a real phone (SC-706)

```bash
npm run build:flags-on
npx vite preview --outDir dist-flags-on --host
```

Open the `Network:` address on a phone on the same Wi-Fi.

1. A fresh phone (or a private tab) opens the worked example. Tap "Today's puzzles": the Today screen lists
   Easy, Medium, Hard, Collector and Practice.
2. Open Easy: a 3 × 3 puzzle with every operator shown. Find a solution; the counter reads "Found 1 of M".
3. Open Medium and Hard: the compact bar, and the strip under the grid showing the tapped cell's row and
   column. Nothing scrolls on a 375 × 667 phone; every cell is comfortable to tap.
4. Open Collector: every operator open; the counter reads "Found N" with no total once more than 100.
5. Go back to Easy: still "Found 1 of M". Reload: the game opens on the last preset played.
6. Change the phone's date to tomorrow and reopen: four new puzzles at "Found 0", and Practice keeps its
   count.

## 4. Speed (AC-17, SC-701)

```bash
npm run test:acceptance:ui -- --project=android-speed
```

Expected: each of today's puzzles ready within 1 second at the reference device's throttling.

## 5. Playtests (SC-703, SC-704)

Five hallway playtests, no instructions: each player opens today's Easy and finds a solution within 3
minutes; afterwards they say how Collector and Hard felt. Record the results in `tdd-log.md`.
