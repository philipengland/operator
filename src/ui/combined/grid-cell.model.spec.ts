import { describe, expect, it } from 'vitest';
import { gridCellModel } from './grid-cell.model';

describe('gridCellModel', () => {
  it('a given cell shows its digit, cannot be changed, and is heard as "given 2"', () => {
    expect(gridCellModel({ name: 'Top-left cell', digit: 2, isGiven: true })).toEqual({
      label: '2',
      name: 'Top-left cell, given 2',
      style: 'cell',
      isUnavailable: true,
      isSelected: false,
    });
  });
});
