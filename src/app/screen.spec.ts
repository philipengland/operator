import { describe, expect, it } from 'vitest';
import { CLASSIC } from '../ui/foundations/themes';
import { playScreenProps } from './screen';
import { startSession } from './session';

const NO_FLAGS = { keypad: false, voice: false };
const justOpened = () => playScreenProps(startSession(), CLASSIC, NO_FLAGS);

describe('playScreenProps', () => {
  it('says hello, counts from nothing, and labels the main button in the theme\'s words', () => {
    const props = justOpened();

    expect(props.header).toEqual({ title: 'Hello, Operator!', message: 'Fill the grid, pal.' });
    expect(props.counter).toEqual({ found: 0, total: 2 });
    expect(props.mainButtonLabel).toBe('Put it through!');
  });

  it('gives each line a pill: shown operators, and open ones not yet chosen', () => {
    const { columnPills, rowPills } = justOpened().grid;

    expect(rowPills).toEqual([
      { target: 8, operator: '+', isOpen: false, name: 'Row 1 target 8, plus', reachesTarget: false },
      { target: 6, operator: null, isOpen: true, name: 'Row 2 target 6, operator not chosen', reachesTarget: false },
    ]);
    expect(columnPills).toEqual([
      { target: 3, operator: null, isOpen: true, name: 'Column 1 target 3, operator not chosen', reachesTarget: false },
      { target: 6, operator: '×', isOpen: false, name: 'Column 2 target 6, times', reachesTarget: false },
    ]);
  });

});
