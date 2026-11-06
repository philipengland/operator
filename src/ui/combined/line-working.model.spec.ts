import { describe, expect, it } from 'vitest';
import { lineWorkingModel } from './line-working.model';

describe('lineWorkingModel', () => {
  it('shows an unmarked result slot with no icon, heard by the whole working', () => {
    const model = lineWorkingModel({ result: '= ?', mark: 'none', name: 'Row 1 working, 6 + ?' });

    expect(model).toEqual({ result: '= ?', icon: null, heardAs: 'Row 1 working, 6 + ?' });
  });

  it('shows a tick after the result when the line reaches its target', () => {
    const model = lineWorkingModel({ result: '= 8', mark: 'tick', name: 'Row 1 working, 6 + 2 = 8, target reached' });

    expect(model.icon).toBe('tick');
  });
});
