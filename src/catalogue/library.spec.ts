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

  it('says what each built combined component is built from', () => {
    const builtFrom = Object.fromEntries(
      LIBRARY['Combined components'].map((entry) => [entry.name, entry.builtFrom]),
    );

    expect(builtFrom).toEqual({
      'Speech bubble': ['Surface', 'Text'],
      'Operator header': ['Mascot', 'Speech bubble'],
      'Solutions counter': ['Surface', 'Text', 'Badge', 'Icon'],
      'Target pill': ['Badge', 'Button', 'Icon'],
      'Grid cell': ['Button'],
      'Line working': ['Text', 'Icon'],
      'Puzzle grid': ['Surface', 'Target pill', 'Grid cell', 'Line working', 'Text'],
      Keypad: ['Button'],
    });
  });

  it('says what the play screen is built from', () => {
    expect(LIBRARY.Screens).toEqual([
      { name: 'Play screen', builtFrom: ['Operator header', 'Solutions counter', 'Puzzle grid', 'Keypad', 'Button'] },
    ]);
  });
});
