import { describe, expect, it } from 'vitest';
import { MIDNIGHT_BLUE } from '../ui/foundations/themes';
import { screenSamplesFor } from './screen-samples';

describe('screenSamplesFor', () => {
  it('speaks in the theme\'s voice: its address in every message and its words on the main button', () => {
    const samples = screenSamplesFor(MIDNIGHT_BLUE);

    expect(Object.values(samples).map(({ header, mainButtonLabel }) => [header.message, mainButtonLabel])).toEqual([
      ['Fill the grid, chief.', 'Connect me!'],
      ['Fill the grid, chief.', 'Connect me!'],
      ['Every line connected, chief!', 'Connect me!'],
    ]);
  });
});
