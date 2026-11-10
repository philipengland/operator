import { describe, expect, it } from 'vitest';
import { buttonModel } from './button.model';

describe('buttonModel', () => {
  it('is heard by its label: "5"', () => {
    expect(buttonModel({ label: '5', style: 'key' }).name).toBe('5');
  });

  it('is heard by its label, then what it does: "Oops, clear cell"', () => {
    expect(buttonModel({ label: 'Oops', style: 'solid', action: 'clear cell' }).name).toBe('Oops, clear cell');
  });

  it('can be given its whole name, which contains its label: "Top-right cell, 8"', () => {
    expect(buttonModel({ label: '8', style: 'key', name: 'Top-right cell, 8' }).name).toBe('Top-right cell, 8');
  });

  it('says when it is unavailable', () => {
    expect(buttonModel({ label: 'Check', style: 'key', isUnavailable: true }).isUnavailable).toBe(true);
  });

  it('says when it is selected', () => {
    expect(buttonModel({ label: '8', style: 'key', isSelected: true }).isSelected).toBe(true);
  });

  it.each(['main', 'key', 'solid', 'dashed'] as const)('carries the %s style, so each style looks different', (style) => {
    expect(buttonModel({ label: 'x', style }).classes).toEqual(['button', `button--${style}`]);
  });

  it('can be read-only: the same look, marked so it is not offered as something to tap', () => {
    expect(buttonModel({ label: '2', style: 'cell', isReadOnly: true }).classes).toEqual(['button', 'button--cell', 'button--read-only']);
  });

  it('marks a read-only given cell, which has no unavailable state to show it by', () => {
    expect(buttonModel({ label: '6', style: 'cell', isReadOnly: true, isUnavailable: true }).classes).toContain('button--read-only-given');
  });

  it('can be stacked, its two-word label on two lines in smaller text, for an open column pill (spec-007 FR-713)', () => {
    expect(buttonModel({ label: '? 60', style: 'dashed', isStacked: true }).classes).toEqual(['button', 'button--dashed', 'button--stacked']);
  });
});
