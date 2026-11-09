import { describe, expect, it } from 'vitest';
import { workedExample } from './worked-example';

describe('workedExample', () => {
  it('is the 2 × 2 puzzle from the project brief, with two solutions', () => {
    expect(workedExample).toEqual({
      id: 'worked-example',
      rows: 2,
      columns: 2,
      givens: [
        [6, null],
        [null, null],
      ],
      rowLines: [
        { target: 8, operator: '+' },
        { target: 6, operator: 'open' },
      ],
      columnLines: [
        { target: 3, operator: 'open' },
        { target: 6, operator: '×' },
      ],
      solutionCount: 2,
    });
  });
});
