import { describe, expect, it } from 'vitest';
import { keypadKeys } from './keypad.model';

describe('keypadKeys', () => {
  it('are the digits 1 to 9 as keys, then a solid "Oops" that clears the cell', () => {
    const keys = keypadKeys();

    expect(keys.map((key) => key.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 'clear']);
    expect(keys[0]?.button).toEqual({ label: '1', style: 'key' });
    expect(keys[9]?.button).toEqual({ label: 'Oops', style: 'solid', action: 'clear cell' });
  });
});
