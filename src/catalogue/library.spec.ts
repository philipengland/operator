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
      'Solutions counter: Built in part 2.',
      'Target pill: Built in part 2.',
      'Grid cell: Built in part 2.',
      'Line working: Built in part 2.',
      'Puzzle grid: Built in part 2.',
      'Keypad: Built in part 2.',
      'Play screen: Built in part 3.',
    ]);
  });
});
