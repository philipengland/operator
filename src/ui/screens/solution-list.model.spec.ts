import { describe, expect, it } from 'vitest';
import { solutionListModel, type SolutionListProps } from './solution-list.model';

const WITH_ONE: SolutionListProps = {
  heading: 'Solutions',
  backLabel: 'Back',
  rows: ['Solution 1'],
  canOpenRows: true,
  empty: { shown: 'No calls yet, pal.', heardAs: 'No solutions found yet' },
};

describe('solutionListModel', () => {
  it('offers each solution as a key to tap', () => {
    expect(solutionListModel(WITH_ONE).rows).toEqual([{ label: 'Solution 1', style: 'key' }]);
  });
});
