// Layer 1 — spec-007 User Story 3: Hard. AC-15 (every date of 2027) is a unit test in the engine; see
// specs/007-seeded-generator/acceptance.md.

import { test } from '../support/acceptance';
import { tenthOfNovember } from './daily-examples';

const PHONES = { tag: '@ui' };

test.describe("[spec-007 AC-14] today's Hard puzzle", () => {
  test('listed with the others; 7 × 5, 1 or 2 lines open, 21 or 22 cells given, targets −500 to 500 and not 0, 1 to 3 solutions', async ({
    game,
    daily,
  }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.openTodayScreen();
    await daily.expectTodayLists(['Easy', 'Medium', 'Hard', 'Collector', 'Practice']);

    await daily.choose('Hard');

    await daily.expectPuzzle('Hard', 7, 5);
    await daily.expectOperatorsOnlyFrom(['+', '−', '×', '÷']);
    await daily.expectOpenLines(1, 2);
    await daily.expectGivenCells(21, 22);
    await daily.expectTargetsFrom(-500, 500);
    await daily.expectFound(0);
    await daily.expectSolutionTotalFrom(1, 3);
  });
});

test.describe('[spec-007 AC-16] Hard at 375 × 667', PHONES, () => {
  test('the whole puzzle, the keypad and the main button fit without scrolling, everything to tap at least 44 × 44', async ({
    game,
    daily,
    phone,
  }) => {
    await phone.useScreen(375, 667);
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();

    await daily.open('Hard');

    await phone.expectDailyPuzzleFitsWithoutScrolling();
    await phone.expectEveryTapTargetAtLeast(44);
    await phone.expectNoAccessibilityProblems();
  });
});

test.describe('[spec-007 AC-16] Hard at 320 × 568', PHONES, () => {
  test('everything is reached by scrolling up and down, never sideways, everything to tap at least 44 × 44', async ({
    game,
    daily,
    phone,
  }) => {
    await phone.useScreen(320, 568);
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();

    await daily.open('Hard');

    await phone.expectDailyPuzzleScrollsOnlyUpAndDown();
    await phone.expectEveryTapTargetAtLeast(44);
    await phone.expectNoAccessibilityProblems();
  });
});

test.describe('[spec-007 AC-17] Hard on the reference phone', { tag: ['@ui', '@budget'] }, () => {
  test('ready to play within 1 second of choosing it', async ({ game, daily, phone }) => {
    await phone.useReferencePhoneOn4G();
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.openTodayScreen();

    await daily.expectOpensWithin('Hard', 1);
  });
});
