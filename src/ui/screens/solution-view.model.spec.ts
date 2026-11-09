import { describe, expect, it } from 'vitest';
import { solutionViewBack, solutionViewHeader } from './solution-view.model';

describe('solutionViewBack', () => {
  it('is a way back, in the words it is given', () => {
    expect(solutionViewBack({ backLabel: 'Back' })).toEqual({ label: 'Back', style: 'key' });
  });

  it('is headed by the solution\'s number', () => {
    expect(solutionViewHeader({ heading: 'Solution 1' })).toEqual({ title: 'Solution 1', message: '', isTitleHeading: true });
  });
});
