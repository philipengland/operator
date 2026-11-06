import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it.each([
    ['#1A1A1A', '#FFFDF6', 17.1],
    ['#FFFDF6', '#1A1A1A', 17.1],
    ['#000000', '#FFFFFF', 21],
    ['#777777', '#777777', 1],
  ])('gives the WCAG contrast of %s on %s as %s', (foreground, background, expected) => {
    expect(contrastRatio(foreground, background)).toBeCloseTo(expected, 1);
  });
});
