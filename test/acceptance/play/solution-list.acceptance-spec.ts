// Layer 1 — spec-006 User Story 1: the list of solutions found.

import { test } from '../support/acceptance';
import { inexactDivision, solutionA, solutionB } from './examples';

const PHONES = { tag: '@ui' };

test.describe('[spec-006 AC-1] the list before anything is found', PHONES, () => {
  test('tapping the counter shows "No calls yet, pal.", heard as "No solutions found yet"', async ({ game }) => {
    await game.open();

    await game.openSolutionList();

    await game.expectSolutionListEmpty('No calls yet, pal.', 'No solutions found yet');
  });
});

test.describe('[spec-006 AC-2] a solution in the list', PHONES, () => {
  test('after Solution A, the list shows "Solution 1"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await game.openSolutionList();

    await game.expectSolutionsListed(['Solution 1']);
  });
});

test.describe('[spec-006 AC-3] solutions in the order found', PHONES, () => {
  test('after Solutions A and B, the list shows "Solution 1" and then "Solution 2"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.fillInAndCheck(solutionB);

    await game.openSolutionList();

    await game.expectSolutionsListed(['Solution 1', 'Solution 2']);
  });
});

test.describe('[spec-006 AC-4] a repeat is not listed twice', PHONES, () => {
  test('Solution A put through twice still shows one entry', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.check();

    await game.openSolutionList();

    await game.expectSolutionsListed(['Solution 1']);
  });
});

test.describe('[spec-006 AC-5] going back leaves the puzzle as it was', PHONES, () => {
  test('top-right 5, still selected, is unchanged after visiting the list', async ({ game }) => {
    await game.open();
    await game.fillCell('top-right', 5);
    await game.openSolutionList();

    await game.goBack();

    await game.expectOnPuzzle();
    await game.expectCell('top-right', 5);
    await game.expectSelected('top-right');
  });

  test('"Wrong number, pal!" is still in the bubble, and nothing more is announced', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(inexactDivision);
    await game.openSolutionList();

    await game.goBack();

    await game.expectBubble('Hello, Operator!', 'Wrong number, pal!');
    await game.expectAnnouncementsStillAt(1);
  });
});

test.describe('[spec-006 AC-6] the list with a screen reader', PHONES, () => {
  test('the entry is heard as "Solution 1", and the list has no accessibility problems', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await game.openSolutionList();

    await game.expectSolutionsHeardAs(['Solution 1']);
    await phone.expectNoAccessibilityProblems();
  });
});

test.describe('[spec-006 AC-25] the phone\'s back gesture from the list', PHONES, () => {
  test('top-right 5 is unchanged on the puzzle', async ({ game, phone }) => {
    await game.open();
    await game.fillCell('top-right', 5);
    await game.openSolutionList();

    await phone.goBack();

    await game.expectOnPuzzle();
    await game.expectCell('top-right', 5);
  });
});

test.describe('[spec-006 edge case] reloading with the list open', PHONES, () => {
  test('the game opens on the puzzle', async ({ game, phone }) => {
    await game.open();
    await game.openSolutionList();

    await phone.reload();

    await game.expectOnPuzzle();
  });
});
