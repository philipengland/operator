import { describe, expect, it } from 'vitest';
import { badgeModel } from './badge.model';

describe('badgeModel', () => {
  it('shows its text as a pill', () => {
    expect(badgeModel({ text: '× 12' })).toEqual({ text: '× 12', heardAs: '× 12', classes: ['badge'] });
  });

  it('can be light, for a count on a coloured surface', () => {
    expect(badgeModel({ text: '1 of 2', style: 'light' }).classes).toEqual(['badge', 'badge--light']);
  });

  it('can be heard as something other than its text', () => {
    expect(badgeModel({ text: '+ 16', spokenAs: 'Row 1 target 16, plus' }).heardAs).toBe('Row 1 target 16, plus');
  });
});
