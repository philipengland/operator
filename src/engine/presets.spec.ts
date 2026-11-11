import { describe, expect, it } from 'vitest';
import { GENERATOR_VERSION, PRESETS } from './presets';

describe('PRESETS', () => {
  it('Easy is 3 × 3, + − × ÷ shown on every line, 4 or 5 cells given, targets 1 to 100, 1 to 10 solutions', () => {
    expect(PRESETS.easy).toMatchObject({
      rows: 3,
      columns: 3,
      operators: ['+', '−', '×', '÷'],
      openLines: { fewest: 0, most: 0 },
      givenCells: { fewest: 4, most: 5 },
      targets: { lowest: 1, highest: 100 },
      band: { fewest: 1, most: 10 },
    });
  });

  it('Medium is 5 × 4, + − × ÷, 4 or 5 of its 9 lines open, 10 cells given, targets 1 to 100, 2 to 20 solutions', () => {
    expect(PRESETS.medium).toMatchObject({
      rows: 5,
      columns: 4,
      operators: ['+', '−', '×', '÷'],
      openLines: { fewest: 4, most: 5 },
      givenCells: { fewest: 10, most: 10 },
      targets: { lowest: 1, highest: 100 },
      band: { fewest: 2, most: 20 },
    });
  });

  it('Collector is 4 × 3, + − × ÷, all 7 lines open, no cells given, targets −29 to 29, 21 to more than 100 solutions', () => {
    expect(PRESETS.collector).toMatchObject({
      rows: 4,
      columns: 3,
      operators: ['+', '−', '×', '÷'],
      openLines: { fewest: 7, most: 7 },
      givenCells: { fewest: 0, most: 0 },
      targets: { lowest: -29, highest: 29 },
      band: { fewest: 21, most: 101 },
    });
  });

  it('Hard is 7 × 5, + − × ÷, 1 or 2 of its 12 lines open, 21 or 22 cells given, targets −500 to 500, 1 to 3 solutions', () => {
    expect(PRESETS.hard).toMatchObject({
      rows: 7,
      columns: 5,
      operators: ['+', '−', '×', '÷'],
      openLines: { fewest: 1, most: 2 },
      givenCells: { fewest: 21, most: 22 },
      targets: { lowest: -500, highest: 500 },
      band: { fewest: 1, most: 3 },
    });
  });

  it('makes puzzles as version 1 of the generator', () => {
    expect(GENERATOR_VERSION).toBe('v1');
  });
});
