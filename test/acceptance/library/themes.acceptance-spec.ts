// Layer 1 — spec-003 User Story 4: six themes, each made of four colours and its own voice.
// AC-20, AC-21 and AC-23 to AC-25 are rules on the theme data, proved by unit tests
// (src/ui/foundations/themes.spec.ts); see specs/003-themed-ui/acceptance.md.

import { test } from '../support/acceptance';
import { ALL_THEMES, THEME_COLOURS } from './examples';

const CATALOGUE = { tag: ['@ui', '@catalogue'] };

test.describe('[spec-003 AC-19] switching to Midnight blue', CATALOGUE, () => {
  test('every component takes Midnight blue\'s four colours', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.chooseTheme('Midnight blue');

    await catalogue.expectOnlyThemeColours('Midnight blue', THEME_COLOURS['Midnight blue']);
  });

  test('the main button reads "Connect me!" and the bubble calls the player "chief"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.chooseTheme('Midnight blue');

    await catalogue.expectShows('Button', 'Main', 'Connect me!');
    await catalogue.expectShows('Operator header', 'Greeting', 'Hello, Operator! Fill the grid, chief.');
  });

  test('nothing moves or changes size', async ({ catalogue }) => {
    await catalogue.open();
    await catalogue.rememberLayout();

    await catalogue.chooseTheme('Midnight blue');

    await catalogue.expectNothingMoved();
  });

  test('switching back to Classic restores Classic\'s colours', async ({ catalogue }) => {
    await catalogue.open();
    await catalogue.chooseTheme('Midnight blue');

    await catalogue.chooseTheme('Classic');

    await catalogue.expectOnlyThemeColours('Classic', THEME_COLOURS.Classic);
    await catalogue.expectShows('Button', 'Main', 'Put it through!');
  });
});

test.describe('[spec-003 AC-22] accessible in every theme', CATALOGUE, () => {
  test('the accessibility scan finds no problems in any of the six themes', async ({ catalogue }) => {
    await catalogue.open();

    for (const theme of ALL_THEMES) {
      await catalogue.chooseTheme(theme);
      await catalogue.expectNoAccessibilityProblems(theme);
    }
  });
});
