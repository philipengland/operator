// Layer 1 — spec-002: each row and column shows what it works out to, as the grid changes.

import { test } from '../support/acceptance';
import { solutionA } from './examples';

test.describe('[spec-002 AC-1] the working on opening', () => {
  test('each line shows its given digits and operators, with ? for everything not yet filled in', async ({ game }) => {
    await game.open();

    await game.expectWorkings({ 'Row 1': '6 + ?', 'Row 2': '? ? ?', 'Column 1': '6 ? ?', 'Column 2': '? × ?' });
    await game.expectNotMarked(['Row 1', 'Row 2', 'Column 1', 'Column 2']);
  });

  test('each row\'s working is on its right and each column\'s is underneath', { tag: '@ui' }, async ({ game, phone }) => {
    await game.open();

    await phone.expectRowWorkingsOnTheRight();
    await phone.expectColumnWorkingsBelow();
  });
});

test.describe('[spec-002 AC-2] the first digit', () => {
  test('top-right 2 makes Row 1 "6 + 2 = 8" and Column 2 "2 × ?"', async ({ game }) => {
    await game.open();

    await game.tapCell('top-right', 2);

    await game.expectWorking('Row 1', '6 + 2 = 8');
    await game.expectWorking('Column 2', '2 × ?');
  });
});

test.describe('[spec-002 AC-3] a column with both digits', () => {
  test('top-right 2 and bottom-right 3 make Column 2 "2 × 3 = 6"', async ({ game }) => {
    await game.open();

    await game.fillCell('top-right', 2);
    await game.fillCell('bottom-right', 3);

    await game.expectWorking('Column 2', '2 × 3 = 6');
  });
});

test.describe('[spec-002 AC-4] choosing an operator changes the working', () => {
  test('with bottom-left 2 and bottom-right 3, each tap on Row 2\'s operator changes its working', async ({ game }) => {
    await game.open();
    await game.fillCell('bottom-left', 2);
    await game.fillCell('bottom-right', 3);
    await game.expectWorking('Row 2', '2 ? 3');

    await game.expectTappingOperatorShowsWorking('Row 2', ['2 + 3 = 5', '2 − 3 = −1', '2 × 3 = 6']);
  });
});

test.describe('[spec-002 AC-5] dividing in a column', () => {
  test('bottom-left 2 and Column 1 ÷ make Column 1 "6 ÷ 2 = 3"', async ({ game }) => {
    await game.open();
    await game.fillCell('bottom-left', 2);

    await game.tapOperator('Column 1', 4);

    await game.expectWorking('Column 1', '6 ÷ 2 = 3');
  });
});

test.describe('[spec-002 AC-6] every line reaching its target', () => {
  test('with Solution A, every line shows its target and is marked, and nothing is counted until Check', async ({ game }) => {
    await game.open();

    await game.fillIn(solutionA);

    await game.expectWorkings({ 'Row 1': '6 + 2 = 8', 'Row 2': '2 × 3 = 6', 'Column 1': '6 ÷ 2 = 3', 'Column 2': '2 × 3 = 6' });
    await game.expectMarkedAsReachingTarget(['Row 1', 'Row 2', 'Column 1', 'Column 2']);
    await game.expectCounter('Found 0 of 2');

    await game.check();

    await game.expectGameSays('new solution');
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-002 AC-7] one change, straight away', () => {
  test('changing bottom-left to 3 after Solution A updates Row 2 and Column 1 before any Check', async ({ game }) => {
    await game.open();
    await game.fillIn(solutionA);

    await game.tapCell('bottom-left');

    await game.expectWorking('Row 2', '3 × 3 = 9');
    await game.expectWorking('Column 1', '6 ÷ 3 = 2');
    await game.expectNotMarked(['Row 2', 'Column 1']);
    await game.expectMarkedAsReachingTarget(['Row 1', 'Column 2']);
    await game.expectGameSaysNothing();
    await game.expectCounter('Found 0 of 2');
  });
});

test.describe('[spec-002 AC-11] wrong, then right', () => {
  test('top-right 3 gives Row 1 "6 + 3 = 9" unmarked, and nine more taps, round to 2, give "6 + 2 = 8" marked', async ({ game }) => {
    await game.open();
    await game.fillCell('top-right', 3);

    await game.expectWorking('Row 1', '6 + 3 = 9');
    await game.expectNotMarked(['Row 1']);

    await game.tapCell('top-right', 9);

    await game.expectWorking('Row 1', '6 + 2 = 8');
    await game.expectMarkedAsReachingTarget(['Row 1']);
  });
});

test.describe('[spec-002 AC-8] a result below zero', () => {
  test('bottom-left 9 and Column 1 − make Column 1 "6 − 9 = −3", unmarked because its target is 3', async ({ game }) => {
    await game.open();
    await game.fillCell('bottom-left', 9);

    await game.chooseOperator('Column 1', '−');

    await game.expectWorking('Column 1', '6 − 9 = −3');
    await game.expectNotMarked(['Column 1']);
  });
});

test.describe('[spec-002 AC-9] a division that is not whole', () => {
  test('bottom-left 4 and Column 1 ÷ make Column 1 "6 ÷ 4" with a cross and no result', async ({ game }) => {
    await game.open();
    await game.fillCell('bottom-left', 4);

    await game.chooseOperator('Column 1', '÷');

    await game.expectWorking('Column 1', '6 ÷ 4');
    await game.expectCrossedOut('Column 1');
  });
});

test.describe('[spec-002 AC-10] making the division whole', () => {
  test('from "6 ÷ 4" with a cross, two taps on bottom-left (6) make Column 1 "6 ÷ 6 = 1" with no cross', async ({ game }) => {
    await game.open();
    await game.fillCell('bottom-left', 4);
    await game.chooseOperator('Column 1', '÷');

    await game.tapCell('bottom-left', 2);

    await game.expectWorking('Column 1', '6 ÷ 6 = 1');
    await game.expectNotMarked(['Column 1']);
  });
});

test.describe('[spec-002 edge case] a cell cleared again', () => {
  test('tapping top-right from 2 round to empty returns Row 1 to "6 + ?"', async ({ game }) => {
    await game.open();
    await game.fillCell('top-right', 2);

    await game.tapCell('top-right', 8);

    await game.expectWorking('Row 1', '6 + ?');
    await game.expectNotMarked(['Row 1']);
  });
});

test.describe('[spec-002 accessibility] the working is not announced', () => {
  test('a tap that changes Row 1\'s working announces nothing to screen-reader users', async ({ game }) => {
    await game.open();
    const announcementsBefore = await game.announcementsSoFar();

    await game.tapCell('top-right', 2);

    await game.expectWorking('Row 1', '6 + 2 = 8');
    await game.expectAnnouncementsStillAt(announcementsBefore);
  });
});

test.describe('[spec-002 edge case] small screens', { tag: '@ui' }, () => {
  test('on a 320 × 568 screen, all four workings are visible without scrolling', async ({ game, phone }) => {
    await phone.useScreen(320, 568);

    await game.open();

    await phone.expectLineWorkingsOnScreen();
    await phone.expectEverythingOnScreen();
  });

  test('on a 375 × 667 screen, all four workings are visible without scrolling', async ({ game, phone }) => {
    await phone.useScreen(375, 667);

    await game.open();

    await phone.expectLineWorkingsOnScreen();
    await phone.expectEverythingOnScreen();
  });
});
