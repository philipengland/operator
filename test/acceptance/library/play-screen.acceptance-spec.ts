// Layer 1 — spec-003 User Story 3: the play screen, laid out from combined components with
// sample content, and kept out of what players receive.

import { test } from '../support/acceptance';
import { ALL_THEMES } from './examples';

const CATALOGUE = { tag: ['@ui', '@catalogue'] };

test.describe('[spec-003 AC-15] the play screen, top to bottom', CATALOGUE, () => {
  test('just opened: header, counter "0 of 2", grid, keypad and "Put it through!"', async ({ catalogue }) => {
    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.expectPlayScreenTopToBottom(['Operator header', 'Solutions counter', 'Puzzle grid', 'Keypad', 'Main button']);
    await catalogue.expectShows('Play screen', 'Solutions counter', 'Solutions found 0 of 2');
    await catalogue.expectShows('Play screen', 'Main button', 'Put it through!');
  });
});

test.describe('[spec-003 AC-16] the play screen fits a phone', CATALOGUE, () => {
  test('on a 375 × 667 screen everything is visible without scrolling', async ({ catalogue }) => {
    await catalogue.useScreen(375, 667);

    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.expectScreenFitsWithoutScrolling();
  });

  test('on a 320 × 568 screen everything is visible without scrolling', async ({ catalogue }) => {
    await catalogue.useScreen(320, 568);

    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.expectScreenFitsWithoutScrolling();
  });
});

test.describe('[spec-003 AC-17] switching the play screen\'s samples', CATALOGUE, () => {
  test('"Row 1 correct" ticks Row 1, and "All found" completes the counter', async ({ catalogue }) => {
    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.chooseScreenSample('Row 1 correct');
    await catalogue.expectShows('Play screen', 'Row 1 target', '+ 8 ✓');

    await catalogue.chooseScreenSample('All found');
    await catalogue.expectShows('Play screen', 'Solutions counter', 'All found! 2 of 2 ✓');
  });

  test('nothing moves between "Just opened", "Row 1 correct" and "All found"', async ({ catalogue }) => {
    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.expectScreenLayoutSameFor(['Just opened', 'Row 1 correct', 'All found']);
  });
});

test.describe('[spec-003 AC-18] the catalogue never reaches players', () => {
  test('the published game contains nothing of the catalogue', async ({ catalogue }) => {
    await catalogue.expectNotPublished();
  });
});

test.describe('[spec-003 edge case] long words in every theme', CATALOGUE, () => {
  test('on a 320 × 568 screen, the play screen fits in all six themes, including "Ring it through!"', async ({ catalogue }) => {
    await catalogue.useScreen(320, 568);
    await catalogue.openScreen('Play screen', 'All found');

    for (const theme of ALL_THEMES) {
      await catalogue.chooseTheme(theme);
      await catalogue.expectScreenFitsWithoutScrolling();
    }
  });
});
