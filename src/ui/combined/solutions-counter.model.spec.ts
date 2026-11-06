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

  it('when every solution is found shows "All found!" on ink, complete, heard as "Found 2 of 2"', () => {
    expect(solutionsCounterModel({ found: 2, total: 2 })).toEqual({
      title: 'All found!',
      count: '2 of 2',
      isComplete: true,
      fill: 'ink',
      heardAs: 'Found 2 of 2',
    });
  });

  it('with no total known shows the count alone, heard as "Found 12", and is never complete', () => {
    expect(solutionsCounterModel({ found: 12 })).toEqual({
      title: 'Solutions found',
      count: '12',
      isComplete: false,
      fill: 'accent',
      heardAs: 'Found 12',
    });
  });
});
