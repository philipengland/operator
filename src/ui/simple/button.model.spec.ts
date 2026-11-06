import { describe, expect, it } from 'vitest';
import { buttonModel } from './button.model';

describe('buttonModel', () => {
  it('is heard by its label: "5"', () => {
    expect(buttonModel({ label: '5', style: 'key' }).name).toBe('5');
  });
});
