import { describe, expect, it } from 'vitest';
import { LIBRARY } from './library';

describe('LIBRARY', () => {
  it('lists every component by tier, in the design guide\'s order', () => {
    const names = Object.fromEntries(Object.entries(LIBRARY).map(([section, entries]) => [section, entries.map((entry) => entry.name)]));

    expect(names).toEqual({
      Foundations: [],
      'Simple components': ['Text', 'Button', 'Text input', 'Icon', 'Surface', 'Badge', 'Mascot'],
      'Combined components': ['Speech bubble', 'Operator header', 'Solutions counter', 'Target pill', 'Grid cell', 'Line working', 'Puzzle grid', 'Keypad'],
      Screens: ['Play screen'],
    });
  });

  it('says which part builds each component not built yet', () => {
    const notBuiltYet = Object.values(LIBRARY)
      .flat()
      .filter((entry) => entry.notBuiltYet)
      .map((entry) => `${entry.name}: ${entry.notBuiltYet}`);

    expect(notBuiltYet).toEqual([
      'Speech bubble: Built in part 2.',
      'Operator header: Built in part 2.',
      'Play screen: Built in part 3.',
    ]);
  });

  it('says what each built combined component is built from', () => {
    const builtFrom = Object.fromEntries(
      LIBRARY['Combined components'].filter((entry) => !entry.notBuiltYet).map((entry) => [entry.name, entry.builtFrom]),
    );

    expect(builtFrom).toEqual({
      'Solutions counter': ['Surface', 'Text', 'Badge', 'Icon'],
      'Target pill': ['Badge', 'Button', 'Icon'],
      'Grid cell': ['Button'],
      'Line working': ['Text', 'Icon'],
      'Puzzle grid': ['Surface', 'Target pill', 'Grid cell', 'Line working', 'Text'],
      Keypad: ['Button'],
    });
  });
});
