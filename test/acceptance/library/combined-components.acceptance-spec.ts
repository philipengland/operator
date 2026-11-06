// Layer 1 — spec-003 User Story 2: the parts of the play screen, built only from simple components.

import { test } from '../support/acceptance';

const CATALOGUE = { tag: ['@ui', '@catalogue'] };

test.describe('[spec-003 AC-7] each combined component says what it is built from', CATALOGUE, () => {
  test('every combined component names the components it is built from', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectBuiltFrom('Speech bubble', ['Surface', 'Text']);
    await catalogue.expectBuiltFrom('Operator header', ['Mascot', 'Speech bubble']);
    await catalogue.expectBuiltFrom('Solutions counter', ['Surface', 'Text', 'Badge', 'Icon']);
    await catalogue.expectBuiltFrom('Target pill', ['Badge', 'Button', 'Icon']);
    await catalogue.expectBuiltFrom('Grid cell', ['Button']);
    await catalogue.expectBuiltFrom('Line working', ['Text', 'Icon']);
    await catalogue.expectBuiltFrom('Puzzle grid', ['Surface', 'Target pill', 'Grid cell', 'Line working', 'Text']);
    await catalogue.expectBuiltFrom('Keypad', ['Button']);
  });
});

test.describe('[spec-003 AC-8] the solutions counter', CATALOGUE, () => {
  test('with none of 2 found it shows "Solutions found" and "0 of 2", heard as "Found 0 of 2"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Solutions counter', 'None yet', 'Solutions found 0 of 2');
    await catalogue.expectLook('Solutions counter', 'None yet', { fill: 'accent' });
    await catalogue.expectHeardAs('Solutions counter', 'None yet', 'Found 0 of 2');
  });

  test('with 1 of 2 found it shows "1 of 2", heard as "Found 1 of 2"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Solutions counter', 'In progress', 'Solutions found 1 of 2');
    await catalogue.expectHeardAs('Solutions counter', 'In progress', 'Found 1 of 2');
  });

  test('with 2 of 2 found it shows "All found!" and "2 of 2" with a tick on ink, heard as "Found 2 of 2"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Solutions counter', 'Complete', 'All found! 2 of 2 ✓');
    await catalogue.expectLook('Solutions counter', 'Complete', { fill: 'ink' });
    await catalogue.expectHeardAs('Solutions counter', 'Complete', 'Found 2 of 2');
  });

  test('with 12 found and no total it shows "12" alone, heard as "Found 12"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Solutions counter', 'No total', 'Solutions found 12');
    await catalogue.expectHeardAs('Solutions counter', 'No total', 'Found 12');
  });
});

test.describe('[spec-003 AC-9] the target pill', CATALOGUE, () => {
  test('shown operators are ink pills: "+ 16", "− 7", "× 12" and "÷ 2"', async ({ catalogue }) => {
    await catalogue.open();

    for (const [label, text] of [['Add', '+ 16'], ['Subtract', '− 7'], ['Multiply', '× 12'], ['Divide', '÷ 2']] as const) {
      await catalogue.expectShows('Target pill', label, text);
      await catalogue.expectLook('Target pill', label, { fill: 'ink' });
    }
  });

  test('a shown pill is heard with its operator and target: "plus" and "16"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectHeardToInclude('Target pill', 'Add', ['plus', '16']);
  });

  test('an open operator "? 12" is a dashed button, heard as not chosen with its target', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Target pill', 'Open', '? 12');
    await catalogue.expectButton('Target pill', 'Open');
    await catalogue.expectLook('Target pill', 'Open', { outline: 'dashed', outlineColour: 'accent' });
    await catalogue.expectHeardToInclude('Target pill', 'Open', ['not chosen', '12']);
  });

  test('a line that reaches its target shows "+ 9" with a tick, heard as "target reached"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Target pill', 'Line correct', '+ 9 ✓');
    await catalogue.expectHeardToInclude('Target pill', 'Line correct', ['plus', '9', 'target reached']);
  });
});

test.describe('[spec-003 AC-10] the grid cell in five states', CATALOGUE, () => {
  test('given 2 is solid ink and unavailable', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Grid cell', 'Given', '2');
    await catalogue.expectLook('Grid cell', 'Given', { fill: 'ink' });
    await catalogue.expectUnavailable('Grid cell', 'Given');
    await catalogue.expectHeardToInclude('Grid cell', 'Given', ['given', '2']);
  });

  test('a selected cell is filled with the accent and heard as selected', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectButton('Grid cell', 'Selected');
    await catalogue.expectLook('Grid cell', 'Selected', { fill: 'accent' });
    await catalogue.expectSelected('Grid cell', 'Selected');
  });

  test('the player\'s digit 8 sits on the tile colour with an ink shadow', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Grid cell', 'Your digit', '8');
    await catalogue.expectLook('Grid cell', 'Your digit', { fill: 'tile', shadow: 'ink' });
  });

  test('4 in a correct line has an accent shadow', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Grid cell', 'In a correct line', '4');
    await catalogue.expectLook('Grid cell', 'In a correct line', { fill: 'tile', shadow: 'accent' });
  });

  test('a selected cell in a correct line shows the selected style', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectLook('Grid cell', 'Selected, in a correct line', { fill: 'accent' });
    await catalogue.expectSelected('Grid cell', 'Selected, in a correct line');
  });

  test('all five states can be told apart without colour', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectToldApartInGreyscale('Grid cell', ['Given', 'Empty', 'Selected', 'Your digit', 'In a correct line']);
  });
});

test.describe('[spec-003 AC-11] the line working', CATALOGUE, () => {
  test('it shows "= ?", "= 8 ✓", "= −3" and "✗", as spec-002 describes', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectShows('Line working', 'Incomplete', '= ?');
    await catalogue.expectShows('Line working', 'Target reached', '= 8 ✓');
    await catalogue.expectShows('Line working', 'Below zero', '= −3');
    await catalogue.expectShows('Line working', 'Not whole', '✗');
  });

  test('a working is heard by its full calculation: "6 + 2 = 8, target reached"', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectHeardToInclude('Line working', 'Target reached', ['6 + 2 = 8', 'target reached']);
  });
});

test.describe('[spec-003 AC-12] the puzzle grid', CATALOGUE, () => {
  test('the fixed 2 × 2 puzzle has its pills along the top and left, workings at the far ends, and the helper line', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectPuzzleGridLayout('Fixed puzzle', 'Tap a dashed bubble to swap its operator.');
  });
});

test.describe('[spec-003 AC-13] the keypad', CATALOGUE, () => {
  test('keys 1 to 5, then 6 to 9 and "Oops, clear cell", each a button', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectKeypadRows('Keypad', [
      ['1', '2', '3', '4', '5'],
      ['6', '7', '8', '9', 'Oops, clear cell'],
    ]);
  });
});

test.describe('[spec-003 AC-14] the operator header', CATALOGUE, () => {
  test('the mascot sits beside a bubble titled "Hello, Operator!", and only the bubble\'s words are read', async ({ catalogue }) => {
    await catalogue.open();

    await catalogue.expectMascotBesideBubble('Greeting');
    await catalogue.expectShows('Operator header', 'Greeting', 'Hello, Operator! Fill the grid, pal.');
    await catalogue.expectHeardAs('Operator header', 'Greeting', 'Hello, Operator! Fill the grid, pal.');
  });
});
