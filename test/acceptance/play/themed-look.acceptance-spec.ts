// Layer 1 — spec-004 User Story 1: playing the puzzle in the "Hello, Operator!" look.

import { test } from '../support/acceptance';
import { THEME_COLOURS } from '../library/examples';
import { solutionA, solutionB } from './examples';

const PHONES = { tag: '@ui' };
const CLASSIC_DOTS = { dotColour: '#D1C7B4', paper: '#F1E6CF', sizeInPixels: 3, everyPixels: 9 };
const SCREEN_WITHOUT_KEYPAD = ['Operator header', 'Solutions counter', 'Puzzle grid', 'Main button'] as const;
const HELPER_LINE = 'Tap a dashed bubble to swap its operator.';

test.describe('[spec-004 AC-1] the new screen when the game opens', PHONES, () => {
  test('from top to bottom: header, counter, puzzle and main button', async ({ game, phone }) => {
    await game.open();

    await phone.expectPartsTopToBottom(SCREEN_WITHOUT_KEYPAD);
  });

  test('the speech bubble says "Hello, Operator!" and the counter shows "Solutions found 0 of 2"', async ({ game }) => {
    await game.open();

    await game.expectBubble('Hello, Operator!', 'Fill the grid, pal.');
    await game.expectCounterShows('Solutions found 0 of 2');
  });

  test('the target pills read "+ 8", "× 6", and dashed "? 6" and "? 3"', async ({ game, phone }) => {
    await game.open();

    await game.expectPillShows('Row 1', '+ 8');
    await game.expectPillShows('Column 2', '× 6');
    await game.expectPillShows('Row 2', '? 6');
    await game.expectPillShows('Column 1', '? 3');
    await phone.expectPillDashed('Row 2');
    await phone.expectPillDashed('Column 1');
  });

  test('the given 6 is a solid ink cell, and the other three cells are empty', async ({ game, phone }) => {
    await game.open();

    await game.expectGivenCell('top-left', 6);
    await phone.expectCellLook('top-left', { fill: 'ink' });
    await game.expectEmptyCells(['top-right', 'bottom-left', 'bottom-right']);
  });

  test('each line shows its working, with the helper line and "Put it through!"', async ({ game }) => {
    await game.open();

    for (const line of ['Row 1', 'Row 2', 'Column 1', 'Column 2'] as const) {
      await game.expectWorkingSlotShows(line, '= ?');
    }
    await game.expectHelperLine(HELPER_LINE);
    await game.expectMainButton('Put it through!');
  });

  test("everything is drawn in Classic's four colours, on the dotted page", async ({ game, phone }) => {
    await game.open();

    await phone.expectOnlyThemeColours('Classic', THEME_COLOURS.Classic);
    await phone.expectPageDots(CLASSIC_DOTS);
  });
});

test.describe('[spec-004 AC-2] what a screen reader hears when the game opens', PHONES, () => {
  test('"Found 0 of 2", "Top-left cell, given 6", and a button that begins "Put it through!" and includes "Check"', async ({ game }) => {
    await game.open();

    await game.expectCounter('Found 0 of 2');
    await game.expectGivenCell('top-left', 6);
    await game.expectMainButton('Put it through!');
  });
});

test.describe('[spec-004 AC-3] a line that reaches its target', PHONES, () => {
  test("top-right 2: Row 1's pill gains a tick, the 2 is accent with an accent shadow, and the working is \"= 8 ✓\"", async ({ game, phone }) => {
    await game.open();

    await game.fillCell('top-right', 2);
    await game.tapCell('bottom-left');

    await game.expectPillShows('Row 1', '+ 8 ✓');
    await phone.expectCellLook('top-right', { digit: 'accent', shadow: 'accent' });
    await game.expectWorking('Row 1', '6 + 2 = 8');
    await game.expectMarkedAsReachingTarget(['Row 1']);
    await game.expectWorkingSlotShows('Row 1', '= 8 ✓');
  });
});

test.describe('[spec-004 AC-4] the first solution', PHONES, () => {
  test('Solution A: the counter shows "1 of 2", announced with the result in one announcement', async ({ game }) => {
    await game.open();

    await game.fillInAndCheck(solutionA);

    await game.expectCounterShows('Solutions found 1 of 2');
    await game.expectCounter('Found 1 of 2');
    await game.expectGameSays('new solution');
    await game.expectAnnouncementEndsWith('Found 1 of 2');
    await game.expectAnnouncementsStillAt(1);
  });
});

test.describe('[spec-004 AC-5] every solution found', PHONES, () => {
  test('Solution B after A: "All found!", "2 of 2" with a tick, every pill ticked, dashed ones too', async ({ game }) => {
    await game.open();
    await game.fillInAndCheck(solutionA);

    await game.fillInAndCheck(solutionB);

    await game.expectCounterShows('All found! 2 of 2 ✓');
    await game.expectPillShows('Row 1', '+ 8 ✓');
    await game.expectPillShows('Row 2', '+ 6 ✓');
    await game.expectPillShows('Column 1', '− 3 ✓');
    await game.expectPillShows('Column 2', '× 6 ✓');
    await game.expectCounter('Found 2 of 2');
    await game.expectGameSays('new solution, every solution found');
    await game.expectAnnouncementEndsWith('Found 2 of 2');
    await game.expectAnnouncementsStillAt(2);
  });
});

test.describe('[spec-004 AC-6] the screen fits a phone', PHONES, () => {
  for (const [width, height] of [[375, 667], [320, 568]] as const) {
    test(`on a ${width} × ${height} screen, everything is visible without scrolling`, async ({ game, phone }) => {
      await phone.useScreen(width, height);

      await game.open();

      await phone.expectPartsOnScreen(SCREEN_WITHOUT_KEYPAD);
      await phone.expectEverythingOnScreen();
    });
  }
});

test.describe('[spec-004 AC-7] losing the connection while playing', PHONES, () => {
  test("the text stays in the game's own typefaces, and no network request is made", async ({ game, phone }) => {
    await game.open();
    await phone.loseConnection();

    await game.fillInAndCheck(solutionA);

    await phone.expectShownIn('speech bubble title', 'Chewy');
    await phone.expectShownIn('helper line', 'Nunito');
    await phone.expectNoNetworkRequestsSinceOpening();
  });
});
