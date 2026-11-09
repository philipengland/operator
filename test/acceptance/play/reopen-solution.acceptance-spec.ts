// Layer 1 — spec-006 User Story 2: reopening a solution, in a read-only view.

import { test } from '../support/acceptance';
import { solutionA, solutionB } from './examples';

const PHONES = { tag: '@ui' };

test.describe('[spec-006 AC-7] reopening a solution', PHONES, () => {
  test('"Solution 1" shows the given 6 and Solution A, with every line reaching its target', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();

    await game.openSolution('Solution 1');

    await game.expectSolutionShown('Solution 1', solutionA);
  });
});

test.describe('[spec-006 AC-8] the view cannot be changed', PHONES, () => {
  test('tapping bottom-right and the Row 2 pill changes nothing, and only "Back" can be tapped', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.openSolution('Solution 1');

    await game.tapInSolutionOn('bottom-right');
    await game.tapInSolutionOn('Row 2');

    await game.expectSolutionShown('Solution 1', solutionA);
    await game.expectOnlyBackCanBeTapped();
  });
});

test.describe('[spec-006 AC-9] reopening leaves the grid in progress alone', PHONES, () => {
  test('top-right 5 and "1 of 2" are unchanged after looking at Solution A', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.fillCell('top-right', 5);
    await game.openSolutionList();
    await game.openSolution('Solution 1');

    await game.goBack();
    await game.expectOnSolutionList();
    await game.goBack();

    await game.expectOnPuzzle();
    await game.expectCell('top-right', 5);
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-006 AC-10] the view with a screen reader', PHONES, () => {
  test('it hears the number, each cell and each line, nothing is offered to tap, and there are no problems', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();

    await game.openSolution('Solution 1');

    await game.expectSolutionHeardToInclude([
      'Solution 1',
      'Top-left cell, given 6',
      'Top-right cell, 2',
      'Bottom-left cell, 2',
      'Bottom-right cell, 3',
      'Row 1 working, 6 + 2 = 8, target reached',
      'Row 2 working, 2 × 3 = 6, target reached',
      'Column 1 working, 6 ÷ 2 = 3, target reached',
      'Column 2 working, 2 × 3 = 6, target reached',
    ]);
    await game.expectOnlyBackCanBeTapped();
    await phone.expectNoAccessibilityProblems();
  });
});

test.describe('[spec-006 AC-26] the phone\'s back gesture from a solution', PHONES, () => {
  test('the list shows', async ({ game, phone }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.openSolutionList();
    await game.openSolution('Solution 1');

    await phone.goBack();

    await game.expectOnSolutionList();
  });
});

test.describe('[spec-006 AC-27] numbers follow the order found', PHONES, () => {
  test('after Solutions A and B, "Solution 2" shows Solution B', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.fillInAndCheck(solutionB);
    await game.openSolutionList();

    await game.openSolution('Solution 2');

    await game.expectSolutionShown('Solution 2', solutionB);
  });
});
