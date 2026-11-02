import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample } from '../engine';
import { cellName, lineName } from './labels';

describe('cellName', () => {
  it.each([
    { row: 0, column: 0, name: 'Top-left cell, given 6' },
    { row: 0, column: 1, name: 'Top-right cell, empty' },
    { row: 1, column: 0, name: 'Bottom-left cell, empty' },
    { row: 1, column: 1, name: 'Bottom-right cell, empty' },
  ])('names the cell at row $row, column $column "$name" when the game opens', ({ row, column, name }) => {
    expect(cellName(workedExample, emptyEntry(workedExample), { row, column })).toBe(name);
  });
});

describe('lineName', () => {
  it.each([
    { axis: 'row', index: 0, name: 'Row 1' },
    { axis: 'row', index: 1, name: 'Row 2' },
    { axis: 'column', index: 0, name: 'Column 1' },
    { axis: 'column', index: 1, name: 'Column 2' },
  ] as const)('names $axis $index "$name"', ({ axis, index, name }) => {
    expect(lineName({ axis, index })).toBe(name);
  });
});
