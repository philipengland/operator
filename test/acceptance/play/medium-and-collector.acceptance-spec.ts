// Layer 1 — spec-007 User Story 2: Medium and Collector. AC-11 (every date of 2027) is a unit test in the
// engine; see specs/007-seeded-generator/acceptance.md.

import { test } from '../support/acceptance';
import { tenthOfNovember } from './daily-examples';

const PHONES = { tag: '@ui' };

test.describe("[spec-007 AC-8] today's Medium puzzle", () => {
  test('5 × 4, only +, −, × and ÷, 4 or 5 lines open, 10 cells given, targets 1 to 100, 2 to 20 solutions', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();

    await daily.open('Medium');

    await daily.expectPuzzle('Medium', 5, 4);
    await daily.expectOperatorsOnlyFrom(['+', '−', '×', '÷']);
    await daily.expectOpenLines(4, 5);
    await daily.expectGivenCells(10, 10);
    await daily.expectTargetsFrom(1, 100);
    await daily.expectFound(0);
    await daily.expectSolutionTotalFrom(2, 20);
  });
});

test.describe("[spec-007 AC-9] today's Collector puzzle", () => {
  test('4 × 3, all 7 lines open, no cells given, targets −29 to 29 and not 0, 21 or more solutions', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();

    await daily.open('Collector');

    await daily.expectPuzzle('Collector', 4, 3);
    await daily.expectEveryOperatorOpen();
    await daily.expectGivenCells(0, 0);
    await daily.expectTargetsFrom(-29, 29);
    await daily.expectFound(0);
    await daily.expectSolutionTotalFrom(21);
  });
});

test.describe('[spec-007 AC-10] a Collector puzzle with more than 100 solutions', () => {
  test('after 3 found the counter reads "Found 3", and never "All found!"', async ({ game, daily }) => {
    await game.open();
    await daily.openFirstDayWithMoreThan100('Collector', tenthOfNovember);
    await daily.expectSolutionTotalOver100();

    await daily.findSolutions(3);

    await game.expectCounter('Found 3');
    await daily.expectNeverAllFound();
  });
});

for (const [width, height] of [
  [375, 667],
  [320, 568],
] as const) {
  for (const preset of ['Medium', 'Collector'] as const) {
    test.describe(`[spec-007 AC-12] ${preset} at ${width} × ${height}`, PHONES, () => {
      test('the whole puzzle, the keypad and the main button fit without scrolling, everything to tap at least 44 × 44', async ({
        game,
        daily,
        phone,
      }) => {
        await phone.useScreen(width, height);
        await daily.setPhoneDate(tenthOfNovember);
        await game.open();

        await daily.open(preset);

        await phone.expectDailyPuzzleFitsWithoutScrolling();
        await phone.expectEveryTapTargetAtLeast(44);
        await phone.expectNoAccessibilityProblems();
      });
    });
  }
}

test.describe("[spec-007 AC-13] switching between today's puzzles", () => {
  test('Easy keeps "Found 1" and its solution after a visit to Medium, with an empty grid', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.open('Easy');
    await daily.enterTheFillingItWasMadeFromAndCheck();

    await daily.open('Medium');
    await daily.expectFound(0);
    await daily.open('Easy');

    await daily.expectFound(1);
    await daily.expectEmptyGrid();
    await game.openSolutionList();
    await game.expectSolutionsListed(['Solution 1']);
  });
});
