// Layer 1 — spec-003 User Story 6: Ben-Day dots on the page, as the design's mockups draw them:
// round dots 3 pixels across, every 9 pixels, in the theme's ink at 15% over its paper.
// AC-28's contrast half (ink on the dots, all six themes) is a rule on the theme data, proved by
// unit tests (src/ui/foundations/themes.spec.ts); see specs/003-themed-ui/acceptance.md.

import { test } from '../support/acceptance';
import { ALL_THEMES } from './examples';

const CATALOGUE = { tag: ['@ui', '@catalogue'] };

// spec-003 AC-26 and AC-27, Acceptance Criteria as Examples ("Dots").
const CLASSIC_DOTS = { dotColour: '#D1C7B4', paper: '#F1E6CF', sizeInPixels: 3, everyPixels: 9 };
const MIDNIGHT_BLUE_DOTS = { dotColour: '#BCCAD7', paper: '#D8E6F0', sizeInPixels: 3, everyPixels: 9 };

test.describe('[spec-003 AC-26] Ben-Day dots behind the play screen', CATALOGUE, () => {
  test('in Classic, the page shows #D1C7B4 dots 3 pixels across, every 9 pixels, on #F1E6CF paper', async ({ catalogue }) => {
    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.expectPageDots('top of the page', CLASSIC_DOTS);
  });

  test('the header, counter, grid, keypad and main button show no dots', async ({ catalogue }) => {
    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.expectNoDotsOn(['Operator header', 'Solutions counter', 'Puzzle grid', 'Keypad', 'Main button']);
  });

  test('on a long page, the dots reach the very bottom', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectPageDots('bottom of the page', CLASSIC_DOTS);
  });
});

test.describe('[spec-003 AC-27] the dots follow the theme', CATALOGUE, () => {
  test('choosing Midnight blue turns the dots #BCCAD7 on #D8E6F0 paper', async ({ catalogue }) => {
    await catalogue.openScreen('Play screen', 'Just opened');

    await catalogue.chooseTheme('Midnight blue');

    await catalogue.expectPageDots('top of the page', MIDNIGHT_BLUE_DOTS);
  });

  test('apart from the dots, every colour drawn is still one of Midnight blue\'s four', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.chooseTheme('Midnight blue');

    await catalogue.expectOnlyThemeColours('Midnight blue', { ink: '#1B2A4A', paper: '#D8E6F0', tile: '#F4F9FC', accent: '#C8441B' });
  });
});

test.describe('[spec-003 AC-28] the dotted page stays accessible', CATALOGUE, () => {
  test('the accessibility scan finds no problems on the dotted page in any of the six themes', async ({ catalogue }) => {
    await catalogue.open();

    for (const theme of ALL_THEMES) {
      await catalogue.chooseTheme(theme);
      await catalogue.expectPageDotsShown(theme);
      await catalogue.expectNoAccessibilityProblems(theme);
    }
  });
});
