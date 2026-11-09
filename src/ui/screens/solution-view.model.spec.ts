import { describe, expect, it } from 'vitest';
import { solutionViewBack } from './solution-view.model';

describe('solutionViewBack', () => {
  it('is a way back, in the words it is given', () => {
    expect(solutionViewBack({ backLabel: 'Back' })).toEqual({ label: 'Back', style: 'key' });
  });
});
