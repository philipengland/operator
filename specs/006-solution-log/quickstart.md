# Quickstart: Solution Log (spec-006)

How to check the feature once it is built. Stop any preview or catalogue server first.

## 1. Automated checks

```bash
npm run exceptions:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:acceptance
npm run test-results -- 006-solution-log
```

Expected: every command passes; `test-results.md` ends `OVERALL status: PASS`, with AC-1 to AC-28 covered. Specs
001 to 004 still pass.

## 2. On a phone (SC-606)

For a story still behind its flag:

```bash
npm run build:flags-on
npx vite preview --outDir dist-flags-on --host
```

On a phone on the same Wi-Fi, open the `Network:` address.

1. Tap the counter: the list says "No calls yet, pal." Use the phone's back: the puzzle shows, unchanged.
2. Enter Solution A (top-right 2, bottom-left 2, bottom-right 3, Row 2 ×, Column 1 ÷) and put it through. Open the list:
   "Solution 1".
3. Tap "Solution 1": the whole solved puzzle, every line ticked. Tap a cell: nothing happens. There is no keypad.
4. Go back to the puzzle: your grid is as you left it.
5. Reload: "1 of 2", and "Solution 1" is still listed. The grid is empty.
6. Open the list and tap "Start again": a pop-up asks "Clear all solutions?". Tap "Keep them": nothing changes.
7. Tap "Start again" and then "Yes, clear": the list is empty, and the puzzle is back to "0 of 2". Reload: still "0 of 2".
8. With VoiceOver or TalkBack: the counter is heard as a button, "Found 1 of 2"; the empty list as "No solutions found
   yet"; the pop-up keeps focus.

## 3. Playtests (SC-602)

Five hallway playtests with no instructions: can each player open the list and reopen a solution in under 10 seconds?
Watch whether they think to tap the counter.
