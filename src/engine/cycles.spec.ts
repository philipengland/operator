import { describe, expect, it } from 'vitest';
import { nextCellValue } from './cycles';

describe('nextCellValue', () => {
  it('steps an empty cell to 1', () => {
    expect(nextCellValue(null)).toBe(1);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8] as const)('steps %i to the next digit', (digit) => {
    expect(nextCellValue(digit)).toBe(digit + 1);
  });
});
