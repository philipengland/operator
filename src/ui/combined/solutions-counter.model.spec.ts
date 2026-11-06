import { describe, expect, it } from 'vitest';
import { solutionsCounterModel } from './solutions-counter.model';

describe('solutionsCounterModel', () => {
  it('while searching shows "Solutions found" and "1 of 2" on the accent, heard as "Found 1 of 2"', () => {
    expect(solutionsCounterModel({ found: 1, total: 2 })).toEqual({
      title: 'Solutions found',
      count: '1 of 2',
      isComplete: false,
      fill: 'accent',
      heardAs: 'Found 1 of 2',
    });
  });
});
