// Layer 1 — spec-003 User Story 1: the simple components every part of a screen is built from.

import { test } from '../support/acceptance';
import { COMBINED_COMPONENTS, SIMPLE_COMPONENTS } from './examples';

const CATALOGUE = { tag: ['@ui', '@catalogue'] };

test.describe('[spec-003 AC-1] the catalogue is organised by tier', CATALOGUE, () => {
  test('it shows Foundations, Simple components, Combined components and Screens, in that order', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectSectionsInOrder(['Foundations', 'Simple components', 'Combined components', 'Screens']);
  });

  test('every component is listed by name in its tier', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectComponentsIn('Simple components', SIMPLE_COMPONENTS);
    await catalogue.expectComponentsIn('Combined components', COMBINED_COMPONENTS);
    await catalogue.expectComponentsIn('Screens', ['Play screen']);
  });
});

test.describe('[spec-003 AC-2] buttons in four styles', CATALOGUE, () => {
  test('the main button "Put it through!" is an accent button heard as "Put it through!, Check"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Button', 'Main', 'Put it through!');
    await catalogue.expectButton('Button', 'Main');
    await catalogue.expectLook('Button', 'Main', { fill: 'accent', outline: 'solid' });
    await catalogue.expectHeardAs('Button', 'Main', 'Put it through!, Check');
  });

  test('the key button "5" sits on the tile colour and is heard as "5"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Button', 'Key', '5');
    await catalogue.expectButton('Button', 'Key');
    await catalogue.expectLook('Button', 'Key', { fill: 'tile', outline: 'solid' });
    await catalogue.expectHeardAs('Button', 'Key', '5');
  });

  test('the solid button "Oops" is filled with ink and heard as "Oops, clear cell"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Button', 'Solid', 'Oops');
    await catalogue.expectButton('Button', 'Solid');
    await catalogue.expectLook('Button', 'Solid', { fill: 'ink' });
    await catalogue.expectHeardAs('Button', 'Solid', 'Oops, clear cell');
  });

  test('the dashed button "? 12" has a dashed accent outline', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Button', 'Dashed', '? 12');
    await catalogue.expectButton('Button', 'Dashed');
    await catalogue.expectLook('Button', 'Dashed', { outline: 'dashed', outlineColour: 'accent' });
  });

  test('an unavailable button is still a button, heard as unavailable', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectButton('Button', 'Unavailable');
    await catalogue.expectUnavailable('Button', 'Unavailable');
  });
});

test.describe('[spec-003 AC-3] the text input has a label screen readers hear', CATALOGUE, () => {
  test('"Play from a seed" labels a field hinting "e.g. 4F7A21", and typed text shows in the display typeface', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectTextbox('Text input', 'Seed');
    await catalogue.expectHeardAs('Text input', 'Seed', 'Play from a seed');
    await catalogue.expectShows('Text input', 'Seed', 'e.g. 4F7A21');

    await catalogue.typeInto('Text input', 'Seed', '4F7A21');

    await catalogue.expectTypeface('Text input', 'Seed', 'Chewy');
  });
});

test.describe('[spec-003 AC-4] text in the game\'s own typefaces', CATALOGUE, () => {
  test('display text "Hello, Operator!" is in Chewy and body text is in Nunito', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Text', 'Display', 'Hello, Operator!');
    await catalogue.expectTypeface('Text', 'Display', 'Chewy');
    await catalogue.expectShows('Text', 'Body', 'Tap a dashed bubble to swap its operator.');
    await catalogue.expectTypeface('Text', 'Body', 'Nunito');
  });

  test('the typefaces come with the game: nothing is fetched from another site', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectNoRequestsToOtherSites();
  });
});

test.describe('[spec-003 AC-5] a tick and a cross, heard only when they mean something', CATALOGUE, () => {
  test('a tick that means "target reached" is heard as that, and is visible without colour', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectHeardAs('Icon', 'Tick', 'target reached');
    await catalogue.expectVisibleInGreyscale('Icon', 'Tick');
  });

  test('a cross that means "not a whole number" is heard as that, and is visible without colour', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectHeardAs('Icon', 'Cross', 'not a whole number');
    await catalogue.expectVisibleInGreyscale('Icon', 'Cross');
  });

  test('a tick used as decoration is not read', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectNotHeard('Icon', 'Decorative tick');
  });
});

test.describe('[spec-003 AC-6] surfaces, badges and the mascot', CATALOGUE, () => {
  test('a panel sits on the tile colour with a solid outline and an ink shadow', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectLook('Surface', 'Panel', { fill: 'tile', outline: 'solid', shadow: 'ink', hasTailCorner: false });
  });

  test('a speech-bubble surface has an accent shadow and a tail corner', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectLook('Surface', 'Bubble', { fill: 'tile', shadow: 'accent', hasTailCorner: true });
  });

  test('a badge shows "× 12" on ink', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Badge', 'Badge', '× 12');
    await catalogue.expectLook('Badge', 'Badge', { fill: 'ink' });
  });

  test('the mascot is 76 pixels and is not read by screen readers', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectLook('Mascot', 'Mascot', { sizeInPixels: 76 });
    await catalogue.expectNotHeard('Mascot', 'Mascot');
  });
});
