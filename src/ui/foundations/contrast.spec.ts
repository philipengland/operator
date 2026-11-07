import { describe, expect, it } from 'vitest';
import { blend, contrastRatio } from './contrast';

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

describe('blend', () => {
  it("gives Classic's dots: its ink at 15% over its paper is #D1C7B4 (spec-003 AC-26)", () => {
    expect(blend('#1A1A1A', '#F1E6CF', 0.15)).toBe('#D1C7B4');
  });
});
