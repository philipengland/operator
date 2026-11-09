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

  it('shows rows as text while they cannot be opened', () => {
    expect(solutionListModel({ ...WITH_ONE, canOpenRows: false }).rows).toEqual([{ label: 'Solution 1', style: 'key', isReadOnly: true }]);
  });

  it('has a way back, in the words it is given', () => {
    expect(solutionListModel(WITH_ONE).back).toEqual({ label: 'Back', style: 'key' });
  });

  it('says what it says when it is empty, and only then', () => {
    expect(solutionListModel({ ...WITH_ONE, rows: [] }).empty).toEqual(WITH_ONE.empty);
    expect(solutionListModel(WITH_ONE).empty).toBeNull();
  });
});
