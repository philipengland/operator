// Layer 1 — spec-007 User Story 1: today's Easy puzzle. AC-3 and AC-5 (every date of 2027) are unit tests
// in the engine; see specs/007-seeded-generator/acceptance.md.

import { test } from '../support/acceptance';
import { eleventhOfNovember, tenthOfNovember } from './daily-examples';
import { solutionA } from './examples';

const PHONES = { tag: '@ui' };

test.describe("[spec-007 AC-1] today's Easy puzzle", () => {
  test('3 × 3, every operator shown, only + and −, 4 or 5 cells given, targets 1 to 29, 1 to 10 solutions', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.expectWorkedExampleShowing();

    await daily.open('Easy');

    await daily.expectPuzzle('Easy', 3, 3);
    await daily.expectEveryOperatorShown();
    await daily.expectOperatorsOnlyFrom(['+', '−']);
    await daily.expectGivenCells(4, 5);
    await daily.expectTargetsFrom(1, 29);
    await daily.expectFound(0);
    await daily.expectSolutionTotalFrom(1, 10);
    await daily.expectEmptyGrid();
  });
});

test.describe("[spec-007 AC-1] today's Easy puzzle with a screen reader", PHONES, () => {
  test('the Today screen and the puzzle have no accessibility problems', async ({ game, daily, phone }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();

    await daily.openTodayScreen();
    await phone.expectNoAccessibilityProblems();
    await daily.choose('Easy');
    await phone.expectNoAccessibilityProblems();
  });
});

test.describe('[spec-007 AC-2] the same puzzle everywhere', () => {
  test('Easy for 10 November 2026, made twice, is the same, and the same as the engine alone makes', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.open('Easy');
    await daily.rememberThisPuzzle();

    await game.open();
    await daily.open('Easy');

    await daily.expectSamePuzzleAsRemembered();
    await daily.expectSameAsTheEngineAloneMakes(tenthOfNovember, 'Easy');
  });
});

test.describe('[spec-007 AC-4] the filling it was made from', () => {
  test('is accepted as a new solution, and the counter reads "Found 1 of M"', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.open('Easy');

    await daily.enterTheFillingItWasMadeFromAndCheck();

    await daily.expectFound(1);
  });
});

test.describe("[spec-007 AC-6] the puzzle's theme", PHONES, () => {
  test('Easy for 10 November 2026 is shown in the theme worked out from its seed', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();

    await daily.open('Easy');

    await daily.expectThemeOfItsSeed();
  });
});

test.describe('[spec-007 AC-7] a new puzzle each day', () => {
  test('Easy for 11 November 2026 differs from Easy for 10 November', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.open('Easy');
    await daily.rememberThisPuzzle();

    await daily.setPhoneDate(eleventhOfNovember);
    await game.open();
    await daily.open('Easy');

    await daily.expectDifferentPuzzleFromRemembered();
  });
});

test.describe('[spec-007 AC-22] the worked example as Practice', () => {
  test('after Easy, "Practice" opens the worked example at "Found 1 of 2", with Solution A in its list', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await game.fillInAndCheck(solutionA);
    await daily.open('Easy');

    await daily.openTodayScreen();
    await daily.expectTodayRowFound('Practice', 1);
    await daily.choose('Practice');

    await daily.expectWorkedExampleShowing();
    await game.expectCounter('Found 1 of 2');
    await game.openSolutionList();
    await game.expectSolutionsListed(['Solution 1']);
    await game.openSolution('Solution 1');
    await game.expectSolutionShown('Solution 1', solutionA);
  });
});
