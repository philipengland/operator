# Quickstart: Reopening the Game with No Connection (spec-005)

How to check the feature once it is built. Stop any preview or catalogue server first.

## 1. Automated checks

```bash
npm run exceptions:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:acceptance
npm run test-results -- 005-offline-reopening
```

Expected: every command passes; `test-results.md` ends `OVERALL status: PASS`, with AC-1 to AC-12
covered. Specs 001 to 004 still pass. Before Release 4, spec-001 AC-21 passes unchanged on the build
players get.

## 2. On real phones (SC-506)

Do this on an iPhone and an Android phone, before the flag is turned on. A service worker needs
HTTPS, so a phone cannot test it at the PC's Wi-Fi address (`http://192.168...`). The tasks say how
the flags-on build is published to an HTTPS address for this review.

1. With a connection, open the game. Play a little, then wait a few seconds.
2. Turn on flight mode.
3. Reload: the game appears, at "0 of 2".
4. Close the tab and open the address again: the game appears.
5. Enter Solution A (top-right 2, bottom-left 2, bottom-right 3, Row 2 ×, Column 1 ÷) and put it
   through: "You're connected! Keep 'em coming, pal!", "1 of 2".
6. The text is in the game's own typefaces.
7. With VoiceOver or TalkBack on: nothing extra is announced on opening.

## 3. After the flag is on

1. Merge any small change. Open the game with a connection: the new version shows. The page's
   `version` label gives the commit.
2. In flight mode, reopen: the same version shows.
