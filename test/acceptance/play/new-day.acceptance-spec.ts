// Layer 1 — spec-007 User Story 4: a new day.

import { test } from '../support/acceptance';
import { eleventhOfNovember, tenthOfNovember } from './daily-examples';
import { solutionA } from './examples';

const PHONES = { tag: '@ui' };

test.describe('[spec-007 AC-18] coming back the same day', PHONES, () => {
  test('after a reload, and after closing and coming back, Medium opens at "Found 1" with an empty grid', async ({ game, daily, phone }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await daily.open('Medium');
    await daily.enterTheFillingItWasMadeFromAndCheck();

    await phone.reload();

    await daily.expectPuzzle('Medium', 5, 4);
    await daily.expectFound(1);
    await daily.expectEmptyGrid();

    await phone.closeAndReopen();

    await daily.expectPuzzle('Medium', 5, 4);
    await daily.expectFound(1);
  });
});

test.describe('[spec-007 AC-19] coming back the next day', PHONES, () => {
  test('11 November\'s Medium opens at "Found 0"; 10 November\'s solution is gone; Practice keeps its own', async ({ game, daily, phone }) => {
    await daily.setPhoneDate(tenthOfNovember);
    await game.open();
    await game.fillInAndCheck(solutionA);
    await daily.open('Medium');
    await daily.rememberThisPuzzle();
    await daily.enterTheFillingItWasMadeFromAndCheck();

    await daily.setPhoneDate(eleventhOfNovember);
    await phone.closeAndReopen();

    await daily.expectPuzzle('Medium', 5, 4);
    await daily.expectDifferentPuzzleFromRemembered();
    await daily.expectFound(0);
    await daily.open('Practice');
    await game.expectCounter('Found 1 of 2');

    await daily.setPhoneDate(tenthOfNovember);
    await phone.closeAndReopen();
    await daily.open('Medium');
    await daily.expectSamePuzzleAsRemembered();
    await daily.expectFound(0);
  });
});

test.describe('[spec-007 AC-20] a phone that has never played', () => {
  test('opens the worked example at "Found 0 of 2"', async ({ game, daily }) => {
    await daily.setPhoneDate(tenthOfNovember);

    await game.open();

    await daily.expectWorkedExampleShowing();
    await game.expectCounter('Found 0 of 2');
  });
});

test.describe('[spec-007 AC-21] the record of the last puzzle played cannot be read', PHONES, () => {
  test("10 November's Easy puzzle opens, and no error appears", async ({ game, daily, phone }) => {
    await phone.leaveUnreadableRecordOfLastPuzzle();
    await daily.setPhoneDate(tenthOfNovember);

    await game.open();

    await daily.expectPuzzle('Easy', 3, 3);
    await phone.expectNoErrorsOnThePage();
  });
});
