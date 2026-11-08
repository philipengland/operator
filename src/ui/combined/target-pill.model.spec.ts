import { describe, expect, it } from 'vitest';
import { targetPillModel } from './target-pill.model';

describe('targetPillModel', () => {
  it('a shown operator is a badge showing "+ 16", heard by its line\'s name', () => {
    const model = targetPillModel({ target: 16, operator: '+', isOpen: false, name: 'Row 1 target 16, plus' });

    expect(model).toEqual({ kind: 'badge', text: '+ 16', heardAs: 'Row 1 target 16, plus', hasTick: false });
  });

  it('an open operator not yet chosen is a button showing "? 12"', () => {
    const model = targetPillModel({ target: 12, operator: null, isOpen: true, name: 'Row 2 target 12, operator not chosen' });

    expect(model).toEqual({ kind: 'button', text: '? 12', heardAs: 'Row 2 target 12, operator not chosen', hasTick: false });
  });

  it('a line that reaches its target gains a tick, heard with "target reached"', () => {
    const model = targetPillModel({ target: 9, operator: '+', isOpen: false, name: 'Row 1 target 9, plus', reachesTarget: true });

    expect(model).toMatchObject({ hasTick: true, heardAs: 'Row 1 target 9, plus, target reached' });
  });

  it('an open operator whose line reaches its target shows the tick, heard as reached', () => {
    const model = targetPillModel({ target: 6, operator: '+', isOpen: true, name: 'Row 2 target 6, plus', reachesTarget: true });

    expect(model.hasTick).toBe(true);
    expect(model.heardAs).toBe('Row 2 target 6, plus, target reached');
  });
});
