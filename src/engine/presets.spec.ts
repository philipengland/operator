import { describe, expect, it } from 'vitest';
import { GENERATOR_VERSION, PRESETS } from './presets';

describe('PRESETS', () => {
  it('Easy is 3 × 3, + and − shown on every line, 4 or 5 cells given, targets 1 to 29, 1 to 10 solutions', () => {
    expect(PRESETS.easy).toMatchObject({
      rows: 3,
      columns: 3,
      operators: ['+', '−'],
      openLines: { fewest: 0, most: 0 },
      givenCells: { fewest: 4, most: 5 },
      targets: { lowest: 1, highest: 29 },
      band: { fewest: 1, most: 10 },
    });
  });

  it('makes puzzles as version 1 of the generator', () => {
    expect(GENERATOR_VERSION).toBe('v1');
  });
});
