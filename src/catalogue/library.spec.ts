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
});
