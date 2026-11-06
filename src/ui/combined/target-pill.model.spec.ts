import { describe, expect, it } from 'vitest';
import { targetPillModel } from './target-pill.model';

describe('targetPillModel', () => {
  it('a shown operator is a badge showing "+ 16", heard by its line\'s name', () => {
    const model = targetPillModel({ target: 16, operator: '+', isOpen: false, name: 'Row 1 target 16, plus' });

    expect(model).toEqual({ kind: 'badge', text: '+ 16', heardAs: 'Row 1 target 16, plus', hasTick: false });
  });
});
