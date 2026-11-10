import { describe, expect, it } from 'vitest';
import { seedNumber } from './random';

describe('seedNumber', () => {
  it("is 32-bit FNV-1a of the seed text, matching the algorithm's published values", () => {
    expect([seedNumber(''), seedNumber('a'), seedNumber('foobar')]).toEqual([0x811c9dc5, 0xe40c292c, 0xbf9cf968]);
  });
});
