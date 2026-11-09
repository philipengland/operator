// Layer 1 — spec-006 User Story 3: starting again.

import { test } from '../support/acceptance';
import { solutionA } from './examples';

const PHONES = { tag: '@ui' };
const QUESTION = 'Clear all solutions?';

test.describe('[spec-006 AC-11] changing your mind', PHONES, () => {
  test('"Keep them" leaves "Solution 1" in the list', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.tapStartAgain();

    await game.keepSolutions();

    await game.expectNoPopUp();
    await game.expectSolutionsListed(['Solution 1']);
  });
});

test.describe('[spec-006 AC-12] clearing everything', PHONES, () => {
  test('"Yes, clear" empties the list, the counter, the grid and the bubble', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.tapStartAgain();

    await game.confirmStartAgain();

    await game.expectSolutionListEmpty('No calls yet, pal.', 'No solutions found yet');
    await game.goBack();
    await game.expectEmptyCells(['top-right', 'bottom-left', 'bottom-right']);
    await game.expectCounter('Found 0 of 2');
    await game.expectBubble('Hello, Operator!', 'Fill the grid, pal.');
  });
});

test.describe('[spec-006 AC-13] finding it again', PHONES, () => {
  test('after starting again, Solution A is a new solution and the counter reads 1 of 2', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.tapStartAgain();
    await game.confirmStartAgain();
    await game.goBack();

    await game.fillInAndCheck(solutionA);

    await game.expectBubble('Hello, Operator!', "You're connected! Keep 'em coming, pal!");
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-006 AC-28] the pop-up with a screen reader', PHONES, () => {
  test('focus is inside, only its two buttons can be reached, and there are no problems', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();

    await game.tapStartAgain();

    await game.expectPopUp(QUESTION, ['Yes, clear', 'Keep them']);
    await phone.expectNoAccessibilityProblems();
  });

  test('"Keep them" returns focus to "Start again"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.tapStartAgain();

    await game.keepSolutions();

    await game.expectFocusOn('Start again');
  });
});

test.describe('[spec-006 edge case] nothing to clear', PHONES, () => {
  test('with nothing found, "Start again" is not offered', async ({ game }) => {
    await game.open();

    await game.openSolutionList();

    await game.expectStartAgainNotOffered();
  });
});

test.describe('[spec-006 edge case] the phone\'s back gesture while the pop-up is open', PHONES, () => {
  test('it closes the pop-up and clears nothing', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.tapStartAgain();

    await phone.goBack();

    await game.expectNoPopUp();
    await game.expectOnSolutionList();
    await game.expectSolutionsListed(['Solution 1']);
  });
});

test.describe('[spec-006 edge case] a double-tap on "Start again"', PHONES, () => {
  test('the second tap does not confirm: the pop-up is open and "Solution 1" is kept', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();

    await game.doubleTapStartAgain();

    await game.expectPopUp(QUESTION, ['Yes, clear', 'Keep them']);
    await game.keepSolutions();
    await game.expectSolutionsListed(['Solution 1']);
  });
});
