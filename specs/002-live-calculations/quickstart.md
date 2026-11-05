# Quickstart: Validate Live Line Calculations (spec-002)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Prerequisites, commands and sections 1–3 and 5 are as in spec-001's
[quickstart.md](../001-walking-skeleton/quickstart.md). This guide adds what spec-002 changes.

## 1. Rules and session

```sh
npm run lint && npm run typecheck && npm test
```

**Expected**: all green. The engine's unit tests include:

- `evaluateLine([6, 9], '−')` gives −3 (no longer a failure); `[6, 4], '÷'` still fails.
- On a test puzzle whose Row 1 target is −3, 6 − 9 reaches the target and 6 − 8 does not
  (AC-12).
- `lineWorking` for every row of the [engine-api](contracts/engine-api.md) table.

## 2. Acceptance

```sh
npm run build
npm run test:acceptance                                   # engine driver, then both phones
npm run test:acceptance:engine -- -g "spec-002 AC-8]"     # one criterion
```

**Expected**: every spec-001 scenario still passes; every spec-002 scenario (AC-1 to AC-11)
passes through both drivers; the small-screen scenario includes the four workings at
320 × 568; axe is clean.

## 3. Play it yourself

```sh
npm run dev
```

At 375 × 667 (and again at 320 × 568):

1. On opening, each row ends "= ?" on the right and each column "= ?" underneath.
2. Tap top-right three times (3): Row 1 shows "= 9", unmarked. Tap it nine more times, round
   to 2: Row 1 shows "= 8 ✓".
3. Tap bottom-left nine times (9) and Column 1's operator twice (−): Column 1 shows "= −3".
4. Tap bottom-left round to 4 and Column 1's operator twice more (÷): Column 1 shows "✗".
   Tap bottom-left twice (6): Column 1 shows "= 1".
5. Enter Solution A (2, 2, 3, ×, ÷): all four results are marked ✓. Nothing is counted until
   **Check**, which then says "New solution found!" and "Found 1 of 2".

## 4. Manual checks

| Check | Device | Pass when |
| --- | --- | --- |
| Screen reader reads the working | iPhone with VoiceOver; Android with TalkBack | Moving through Row 1 reads target, operator, cells, then "Row 1 working, 6 plus 2 equals 8, target reached" (or close). Nothing is announced on a tap except as in spec-001. "?" and "minus 3" read sensibly. |
| Marks stand out without colour | Any phone, and a greyscale screenshot | A slot that reaches its target shows ✓ **and** is bold; an unmarked slot is not bold. Seen in greyscale too. No automated test covers the weight (owner's decision, 2026-11-05). |
| Deduction (SC-202) | 5 hallway playtests | At least 4 of 5 find the first solution with no more than 2 rejected Checks, within 3 minutes. |
