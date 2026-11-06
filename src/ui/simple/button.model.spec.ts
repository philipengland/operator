import { describe, expect, it } from 'vitest';
import { buttonModel } from './button.model';

describe('buttonModel', () => {
  it('is heard by its label: "5"', () => {
    expect(buttonModel({ label: '5', style: 'key' }).name).toBe('5');
  });

  it('is heard by its label, then what it does: "Oops, clear cell"', () => {
    expect(buttonModel({ label: 'Oops', style: 'solid', action: 'clear cell' }).name).toBe('Oops, clear cell');
  });

  it('says when it is unavailable', () => {
    expect(buttonModel({ label: 'Check', style: 'key', isUnavailable: true }).isUnavailable).toBe(true);
  });

  it.each(['main', 'key', 'solid', 'dashed'] as const)('carries the %s style, so each style looks different', (style) => {
    expect(buttonModel({ label: 'x', style }).classes).toEqual(['button', `button--${style}`]);
  });
});
