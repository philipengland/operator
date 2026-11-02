import { describe, expect, it } from 'vitest';
import { nextCellValue } from './cycles';

describe('nextCellValue', () => {
  it('steps an empty cell to 1', () => {
    expect(nextCellValue(null)).toBe(1);
  });
});
