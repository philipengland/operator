// Layer 1 — User Story 1: solve the puzzle on a phone.

import { test } from '../support/acceptance';
import { belowZero, bottomRightEmpty, column1NotChosen, inexactDivision, solutionA } from './examples';

test.describe('[spec-001 AC-1] the opening grid', () => {
  test('shows the given 6, three empty cells, the targets, the shown operators and "Found 0 of 2"', async ({ game }) => {
    await game.open();

    await game.expectGivenCell('top-left', 6);
    await game.expectEmptyCells(['top-right', 'bottom-left', 'bottom-right']);
    await game.expectTargets({ 'Row 1': 8, 'Row 2': 6, 'Column 1': 3, 'Column 2': 6 });
    await game.expectShownOperator('Row 1', '+');
    await game.expectShownOperator('Column 2', '×');
    await game.expectOpenOperator('Row 2', 'not chosen');
    await game.expectOpenOperator('Column 1', 'not chosen');
    await game.expectCounter('Found 0 of 2');
  });

  test('shows each row target on the left and each column target above', { tag: '@ui' }, async ({ game, phone }) => {
    await game.open();

    await phone.expectRowTargetsOnTheLeft();
    await phone.expectColumnTargetsAbove();
  });
});

test.describe('[spec-001 AC-2] tapping an empty cell', () => {
  test('one tap shows 1, and six more show 7', async ({ game }) => {
    await game.open();

    await game.tapCell('top-right');
    await game.expectCell('top-right', 1);

    await game.tapCell('top-right', 6);
    await game.expectCell('top-right', 7);
  });
});

test.describe('[spec-001 AC-3] clearing a cell', () => {
  test('tapping a cell that shows 9 empties it', async ({ game }) => {
    await game.open();
    await game.fillCell('bottom-left', 9);

    await game.tapCell('bottom-left');

    await game.expectCell('bottom-left', 'empty');
  });
});

test.describe('[spec-001 AC-4] the given cell', () => {
  test('tapping the given 6 leaves it showing 6', async ({ game }) => {
    await game.open();

    await game.tapCell('top-left');

    await game.expectGivenCell('top-left', 6);
  });

  test('the given 6 looks different from a cell the player can change, not by colour alone', { tag: '@ui' }, async ({ game, phone }) => {
    await game.open();

    await phone.expectGivenCellStandsOut('top-left', 'top-right');
  });
});

test.describe('[spec-001 AC-5] a cell only ever holds 1 to 9 or nothing', () => {
  test('ten taps show 1 to 9 in order and then empty, never 0', async ({ game }) => {
    await game.open();

    await game.expectTappingCellShows('bottom-right', [1, 2, 3, 4, 5, 6, 7, 8, 9, 'empty']);
  });
});

test.describe('[spec-001 AC-6] choosing an open operator', () => {
  test('five taps on Row 2 show +, −, ×, ÷ and then + again', async ({ game }) => {
    await game.open();

    await game.expectTappingOperatorShows('Row 2', ['+', '−', '×', '÷', '+']);
  });
});

test.describe('[spec-001 AC-7] shown operators cannot change', () => {
  test("tapping Row 1's + leaves it as +", async ({ game }) => {
    await game.open();

    await game.tapOperator('Row 1');

    await game.expectShownOperator('Row 1', '+');
  });

  test("tapping Column 2's × leaves it as ×", async ({ game }) => {
    await game.open();

    await game.tapOperator('Column 2');

    await game.expectShownOperator('Column 2', '×');
  });
});

test.describe('[spec-001 AC-8] checking a correct grid', () => {
  test('Solution A is accepted and the counter reads "Found 1 of 2"', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(solutionA);

    await game.expectGameSays('new solution');
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-001 AC-9] right row, wrong column', () => {
  test('bottom-left 9 meets Row 2 but Column 1 gives 6 − 9 = −3, not its target of 3, so the puzzle is not solved', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(belowZero);

    await game.expectGameSays('not solved yet');
    await game.expectCounter('Found 0 of 2');
  });
});

test.describe('[spec-001 AC-10] a line that does not divide exactly', () => {
  test('Column 1 gives 6 ÷ 4, so the puzzle is not solved', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(inexactDivision);

    await game.expectGameSays('not solved yet');
    await game.expectCounter('Found 0 of 2');
  });
});

test.describe('[spec-001 AC-11] checking before everything is filled', () => {
  test('with the bottom-right cell empty, the game asks for everything to be filled first', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(bottomRightEmpty);

    await game.expectGameSays('fill everything first');
    await game.expectCounter('Found 0 of 2');
  });

  test("with Column 1's operator not chosen, the game asks for everything to be filled first", async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(column1NotChosen);

    await game.expectGameSays('fill everything first');
    await game.expectCounter('Found 0 of 2');
  });
});

test.describe('[spec-001 AC-20] the message goes once the grid changes', () => {
  test('tapping bottom-left after "not solved yet" removes the message silently', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(belowZero);
    await game.expectGameSays('not solved yet');
    const announcementsBefore = await game.announcementsSoFar();

    await game.tapCell('bottom-left');

    await game.expectGameSaysNothing();
    await game.expectAnnouncementsStillAt(announcementsBefore);
    await game.expectCounter('Found 0 of 2');
  });

  test('tapping the given 6 after "not solved yet" leaves the message in place', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(belowZero);

    await game.tapCell('top-left');

    await game.expectGameSays('not solved yet');
  });
});
