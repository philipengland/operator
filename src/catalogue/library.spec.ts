import { describe, expect, it } from 'vitest';
import { LIBRARY } from './library';

describe('LIBRARY', () => {
  it('lists every component by tier, in the design guide\'s order', () => {
    const names = Object.fromEntries(Object.entries(LIBRARY).map(([section, entries]) => [section, entries.map((entry) => entry.name)]));

    expect(names).toEqual({
      Foundations: [],
      'Simple components': ['Text', 'Button', 'Text input', 'Icon', 'Surface', 'Badge', 'Mascot', 'Dialog'],
      'Combined components': ['Speech bubble', 'Operator header', 'Solutions counter', 'Target pill', 'Grid cell', 'Line working', 'Puzzle grid', 'Keypad', 'Confirm dialog', 'Status bar', 'Workings strip'],
      Screens: ['Play screen', 'Solution list', 'Solution view', 'Today list'],
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
      'Confirm dialog': ['Dialog', 'Text', 'Button'],
      'Status bar': ['Solutions counter', 'Button'],
      'Workings strip': ['Surface', 'Line working', 'Text'],
    });
  });

  it('says what the play screen is built from', () => {
    expect(LIBRARY.Screens).toEqual([
      {
        name: 'Play screen',
        builtFrom: ['Operator header', 'Solutions counter', 'Status bar', 'Puzzle grid', 'Workings strip', 'Keypad', 'Button'],
      },
      { name: 'Solution list', builtFrom: ['Operator header', 'Button'] },
      { name: 'Solution view', builtFrom: ['Operator header', 'Button', 'Puzzle grid'] },
      { name: 'Today list', builtFrom: ['Operator header', 'Button'] },
    ]);
  });
});
