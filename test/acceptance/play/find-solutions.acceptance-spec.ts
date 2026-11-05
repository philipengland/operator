// Layer 1 — User Story 2: find both solutions.

import { test } from '../support/acceptance';
import { solutionA, solutionB } from './examples';

test.describe('[spec-001 AC-12] finding a second, different solution', () => {
  test('Solution B after Solution A is new, every solution is found, and the counter reads "Found 2 of 2"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.expectCounter('Found 1 of 2');

    await game.fillInAndCheck(solutionB);

    await game.expectGameSays('new solution, every solution found');
    await game.expectCounter('Found 2 of 2');
  });
});

test.describe('[spec-001 AC-13] checking the same solution twice', () => {
  test('Solution A again is already found and the counter stays at "Found 1 of 2"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.expectCounter('Found 1 of 2');

    await game.check();

    await game.expectGameSays('already found');
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-001 AC-14] checking a found solution after all are found', () => {
  test('Solution B again leaves the counter at "Found 2 of 2"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);
    await game.fillInAndCheck(solutionB);
    await game.expectCounter('Found 2 of 2');

    await game.check();

    await game.expectCounter('Found 2 of 2');
  });
});

test.describe('[spec-001 AC-15] the order solutions are found in does not matter', () => {
  test('Solution A after Solution B finds every solution and the counter reads "Found 2 of 2"', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionB);
    await game.expectCounter('Found 1 of 2');

    await game.fillInAndCheck(solutionA);

    await game.expectGameSays('new solution, every solution found');
    await game.expectCounter('Found 2 of 2');
  });
});

test.describe('[spec-001 AC-16] the grid stays filled after a solution is accepted', () => {
  test("after Solution A is accepted, the player's digits and operators are still in place", async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(solutionA);

    await game.expectGameSays('new solution');
    await game.expectEntryShown(solutionA);
  });
});
