// Layer 1 — spec-006 User Story 4: remembering what was found. AC-22 (another puzzle's log) is proved
// by a unit test, as the game has one puzzle until F7; see specs/006-solution-log/acceptance.md.

import { test } from '../support/acceptance';
import { notASolution, solutionA, solutionB } from './examples';

const PHONES = { tag: '@ui' };

test.describe('[spec-006 AC-14] after a reload', PHONES, () => {
  test('the counter and Solution A are still there, on an empty grid with the greeting', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await phone.reload();

    await game.expectCounter('Found 1 of 2');
    await game.expectEmptyCells(['top-right', 'bottom-left', 'bottom-right']);
    await game.expectBubble('Hello, Operator!', 'Fill the grid, pal.');
    await game.openSolutionList();
    await game.expectSolutionsListed(['Solution 1']);
    await game.openSolution('Solution 1');
    await game.expectSolutionShown('Solution 1', solutionA);
  });
});

test.describe('[spec-006 AC-15] closing and coming back', PHONES, () => {
  test('the counter reads 1 of 2', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await phone.closeAndReopen();

    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-006 AC-16] a repeat after a reload', PHONES, () => {
  test('Solution A is "We\'ve had that call, pal." and the counter stays at 1 of 2', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await phone.reload();

    await game.fillInAndCheck(solutionA);

    await game.expectBubble('Hello, Operator!', "We've had that call, pal.");
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-006 AC-17] everything found, after a reload', PHONES, () => {
  test('the counter shows "All found! 2 of 2"', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.fillInAndCheck(solutionB);

    await phone.reload();

    await game.expectCounterShows('All found! 2 of 2 ✓');
    await game.expectCounter('Found 2 of 2');
  });
});

test.describe('[spec-006 AC-18] starting again is remembered too', PHONES, () => {
  test('after clearing and reloading, the counter reads 0 of 2', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.tapStartAgain();
    await game.confirmStartAgain();

    await phone.reload();

    await game.expectCounter('Found 0 of 2');
  });
});

test.describe('[spec-006 AC-19] the phone will not let the game save', PHONES, () => {
  test('Solution A is counted and listed, and no error appears', async ({ game, phone }) => {
    await phone.refuseSaving();
    await game.open();

    await game.fillInAndCheck(solutionA);

    await game.expectCounter('Found 1 of 2');
    await phone.expectNoErrorsOnThePage();
    await game.openSolutionList();
    await game.expectSolutionsListed(['Solution 1']);
  });
});

test.describe('[spec-006 AC-20] saved data that cannot be read', PHONES, () => {
  test('the game opens at 0 of 2 and plays normally', async ({ game, phone }) => {
    await phone.leaveUnreadableSavedData();

    await game.open();

    await game.expectCounter('Found 0 of 2');
    await phone.expectNoErrorsOnThePage();
    await game.fillInAndCheck(solutionA);
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-006 AC-21] saved data that does not solve the puzzle', PHONES, () => {
  test('of Solution A and a filling with top-right 9, only Solution A is counted and listed', async ({ game, phone }) => {
    await phone.leaveSavedFillings([solutionA, notASolution]);

    await game.open();

    await game.expectCounter('Found 1 of 2');
    await game.openSolutionList();
    await game.expectSolutionsListed(['Solution 1']);
    await game.openSolution('Solution 1');
    await game.expectSolutionShown('Solution 1', solutionA);
  });
});
