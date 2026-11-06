import { describe, expect, it } from 'vitest';
import { badgeModel } from './badge.model';

describe('badgeModel', () => {
  it('shows its text as a pill', () => {
    expect(badgeModel({ text: '× 12' })).toEqual({ text: '× 12', classes: ['badge'] });
  });
});
