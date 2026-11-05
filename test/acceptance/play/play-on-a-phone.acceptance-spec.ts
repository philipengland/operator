// Layer 1 — User Story 3 (connection), the small-screen edge case, and the speed budgets.

import { test } from '../support/acceptance';
import { solutionA } from './examples';

test.describe('[spec-001 AC-18] playing after the connection is lost', { tag: '@ui' }, () => {
  test('with no connection, Solution A is still accepted and the counter reads "Found 1 of 2"', async ({ game, phone }) => {
    await game.open();
    await phone.loseConnection();

    await game.fillInAndCheck(solutionA);

    await game.expectGameSays('new solution');
    await game.expectCounter('Found 1 of 2');
  });

  test('playing to a solution makes no network requests after the game opens', async ({ game, phone }) => {
    await game.open();

    await game.fillInAndCheck(solutionA);

    await phone.expectNoNetworkRequestsSinceOpening();
  });
});

test.describe('[spec-001 AC-21] reloading with no connection', { tag: '@ui' }, () => {
  test('after opening the game once, reloading with no connection does not load it', async ({ game, phone }) => {
    await game.open();
    await phone.loseConnection();

    await phone.reload();

    await phone.expectGameNotShowing();
  });
});

test.describe('[spec-001 edge case] small screens', { tag: '@ui' }, () => {
  test('on a 320 × 568 screen, everything needed to play is visible without scrolling', async ({ game, phone }) => {
    await phone.useScreen(320, 568);

    await game.open();

    await phone.expectEverythingOnScreen();
  });

  test('on a 375 × 667 screen, everything needed to play is visible without scrolling', async ({ game, phone }) => {
    await phone.useScreen(375, 667);

    await game.open();

    await phone.expectEverythingOnScreen();
  });
});

test.describe('[spec-001 SC-003 SC-004] speed on the reference phone', { tag: ['@ui', '@budget'] }, () => {
  test('ready to play within 3 seconds, and every tap answered within 0.1 seconds', async ({ game, phone }) => {
    await phone.useReferencePhoneOn4G();

    await game.open();
    await game.fillInAndCheck(solutionA);

    await phone.expectReadyToPlayWithin(3);
    await phone.expectEveryTapAnsweredWithin(100);
  });
});
