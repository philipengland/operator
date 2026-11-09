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

  it('an empty cell shows nothing and is heard as "empty"', () => {
    expect(gridCellModel({ name: 'Top-right cell', digit: null })).toEqual({
      label: '',
      name: 'Top-right cell, empty',
      style: 'cell',
      isUnavailable: false,
      isSelected: false,
    });
  });

  it('a selected cell is heard as selected', () => {
    expect(gridCellModel({ name: 'Top-right cell', digit: null, isSelected: true }).isSelected).toBe(true);
  });

  it('a cell in a line that reaches its target has the correct-line look', () => {
    expect(gridCellModel({ name: 'Bottom-left cell', digit: 4, isInCorrectLine: true }).style).toBe('cell-correct');
  });

  it('a selected cell in a correct line shows the selected look: selected wins', () => {
    const model = gridCellModel({ name: 'Bottom-left cell', digit: 4, isSelected: true, isInCorrectLine: true });

    expect(model).toMatchObject({ style: 'cell', isSelected: true });
  });

  it('can be read-only, in a found solution', () => {
    expect(gridCellModel({ name: 'Top-right cell', digit: 2, isReadOnly: true }).isReadOnly).toBe(true);
  });
});
