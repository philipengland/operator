import { describe, expect, it } from 'vitest';
import { buttonModel } from './button.model';

describe('buttonModel', () => {
  it('is heard by its label: "5"', () => {
    expect(buttonModel({ label: '5', style: 'key' }).name).toBe('5');
  });

  it('is heard by its label, then what it does: "Oops, clear cell"', () => {
    expect(buttonModel({ label: 'Oops', style: 'solid', action: 'clear cell' }).name).toBe('Oops, clear cell');
  });
});
