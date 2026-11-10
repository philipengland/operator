import { describe, expect, it } from 'vitest';
import { randomFrom, seedNumber } from './random';

describe('seedNumber', () => {
  it("is 32-bit FNV-1a of the seed text, matching the algorithm's published values", () => {
    expect([seedNumber(''), seedNumber('a'), seedNumber('foobar')]).toEqual([0x811c9dc5, 0xe40c292c, 0xbf9cf968]);
  });
});

describe('randomFrom', () => {
  const draw = (seed: number) => {
    const random = randomFrom(seed);
    return Array.from({ length: 8 }, () => random.whole(1000));
  };

  it('draws the same numbers from the same seed, and different numbers from another', () => {
    expect(draw(42)).toEqual(draw(42));
    expect(draw(42)).not.toEqual(draw(43));
  });

  it('draws whole numbers from 0 to one less than asked, reaching both ends', () => {
    const random = randomFrom(seedNumber('v1:2026-11-10:easy'));
    const drawn = Array.from({ length: 500 }, () => random.whole(9));

    expect(drawn.every((value) => Number.isInteger(value) && value >= 0 && value < 9)).toBe(true);
    expect(new Set(drawn).size).toBe(9);
  });
});
