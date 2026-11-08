// Layer 1 — spec-004 User Story 2: entering a digit with the keypad.

import { test } from '../support/acceptance';
import { solutionA } from './examples';

test.describe('[spec-004 AC-8] tapping a cell selects it', () => {
  test('top-right is selected and shows 1, as tapping always did', async ({ game }) => {
    await game.open();

    await game.tapCell('top-right');

    await game.expectSelected('top-right');
    await game.expectCell('top-right', 1);
  });
});

test.describe('[spec-004 AC-9] a key sets the selected cell', () => {
  test("key 7 makes top-right 7, keeps it selected, and Row 1's working \"6 + 7 = 13\"", async ({ game }) => {
    await game.open();
    await game.tapCell('top-right');

    await game.tapKey(7);

    await game.expectCell('top-right', 7);
    await game.expectSelected('top-right');
    await game.expectWorking('Row 1', '6 + 7 = 13');
  });
});

test.describe('[spec-004 AC-10] Oops empties the selected cell', () => {
  test("top-right 7 and Oops: top-right is empty and Row 1's working is \"6 + ?\"", async ({ game }) => {
    await game.open();
    await game.tapCell('top-right');
    await game.tapKey(7);

    await game.tapOops();

    await game.expectCell('top-right', 'empty');
    await game.expectWorking('Row 1', '6 + ?');
  });
});

test.describe('[spec-004 AC-11] one cell is selected at a time', () => {
  test('tapping bottom-right selects it and shows 1; top-right keeps its digit and is no longer selected', async ({ game }) => {
    await game.open();
    await game.tapCell('top-right');
    await game.tapKey(7);

    await game.tapCell('bottom-right');

    await game.expectSelected('bottom-right');
    await game.expectCell('bottom-right', 1);
    await game.expectCell('top-right', 7);
  });
});

test.describe('[spec-004 AC-12] the keypad before a cell is selected', () => {
  test('the keys and Oops are unavailable, and key 5 changes nothing', async ({ game }) => {
    await game.open();

    await game.expectKeysUnavailable();
    await game.tapKey(5);

    await game.expectEmptyCells(['top-right', 'bottom-left', 'bottom-right']);
    await game.expectGivenCell('top-left', 6);
  });

  test('selecting a cell makes the keys available', async ({ game }) => {
    await game.open();

    await game.tapCell('top-right');

    await game.expectKeysAvailable();
  });
});

test.describe('[spec-004 AC-13] the given 6 cannot be selected', () => {
  test('tapping the 6 leaves it unchanged and bottom-left selected', async ({ game }) => {
    await game.open();
    await game.tapCell('bottom-left');

    await game.tapCell('top-left');

    await game.expectGivenCell('top-left', 6);
    await game.expectSelected('bottom-left');
  });
});

test.describe('[spec-004 AC-14] a whole solution by keypad', () => {
  test('Solution A with the keypad for every digit is a new solution, and the counter reads "Found 1 of 2"', async ({ game }) => {
    await game.open();

    await game.fillInWithKeypad(solutionA);
    await game.check();

    await game.expectGameSays('new solution');
    await game.expectCounter('Found 1 of 2');
  });
});

test.describe('[spec-004 AC-20] the keypad on the screen', { tag: '@ui' }, () => {
  const WHOLE_SCREEN = ['Operator header', 'Solutions counter', 'Puzzle grid', 'Keypad', 'Main button'] as const;

  test('the keypad is between the grid and the main button, with keys 1 to 9 and Oops in two rows of five', async ({ game, phone }) => {
    await game.open();

    await phone.expectPartsTopToBottom(WHOLE_SCREEN);
    await game.expectKeypadRows([
      ['1', '2', '3', '4', '5'],
      ['6', '7', '8', '9', 'Oops, clear cell'],
    ]);
  });

  for (const [width, height] of [[375, 667], [320, 568]] as const) {
    test(`on a ${width} × ${height} screen, the whole screen with its keypad is visible without scrolling`, async ({ game, phone }) => {
      await phone.useScreen(width, height);

      await game.open();

      await phone.expectPartsOnScreen(WHOLE_SCREEN);
    });
  }
});

test.describe('[spec-004 edge cases] selection and the keypad', () => {
  test('tapping the selected cell again steps its value and keeps it selected', async ({ game }) => {
    await game.open();
    await game.tapCell('top-right');

    await game.tapCell('top-right');

    await game.expectCell('top-right', 2);
    await game.expectSelected('top-right');
  });

  test('tapping an open operator changes the operator and leaves the selection as it was', async ({ game }) => {
    await game.open();
    await game.tapCell('top-right');

    await game.tapOperator('Row 2');

    await game.expectOpenOperator('Row 2', '+');
    await game.expectSelected('top-right');
  });

  test('checking leaves the selection and every digit in place', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(solutionA);

    await game.expectEntryShown(solutionA);
    await game.expectSelected('bottom-right');
  });

  test('a key that makes a line reach its target marks it, and counts nothing', async ({ game }) => {
    await game.open();
    await game.tapCell('top-right');

    await game.tapKey(2);

    await game.expectMarkedAsReachingTarget(['Row 1']);
    await game.expectCounter('Found 0 of 2');
    await game.expectGameSaysNothing();
  });
});
