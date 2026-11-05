import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample, type LineWorking } from '../engine';
import { cellName, lineName, messageText, operatorName, resultText, workingName, workingText } from './labels';

describe('cellName', () => {
  it.each([
    { row: 0, column: 0, name: 'Top-left cell, given 6' },
    { row: 0, column: 1, name: 'Top-right cell, empty' },
    { row: 1, column: 0, name: 'Bottom-left cell, empty' },
    { row: 1, column: 1, name: 'Bottom-right cell, empty' },
  ])('names the cell at row $row, column $column "$name" when the game opens', ({ row, column, name }) => {
    expect(cellName(workedExample, emptyEntry(workedExample), { row, column })).toBe(name);
  });

  it('names a cell by the digit the player entered', () => {
    const entry = { ...emptyEntry(workedExample), cells: [[null, 7], [null, null]] as const };

    expect(cellName(workedExample, entry, { row: 0, column: 1 })).toBe('Top-right cell, 7');
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

describe('operatorName', () => {
  it.each([
    { axis: 'row', index: 0, name: 'Row 1 operator, plus' },
    { axis: 'row', index: 1, name: 'Row 2 operator, not chosen' },
    { axis: 'column', index: 0, name: 'Column 1 operator, not chosen' },
    { axis: 'column', index: 1, name: 'Column 2 operator, times' },
  ] as const)('names $axis $index "$name" when the game opens', ({ axis, index, name }) => {
    expect(operatorName(workedExample, emptyEntry(workedExample), { axis, index })).toBe(name);
  });

  it.each([
    ['+', 'plus'],
    ['−', 'minus'],
    ['×', 'times'],
    ['÷', 'divide'],
  ] as const)('names an open operator by the choice %s as "%s"', (choice, word) => {
    const entry = { ...emptyEntry(workedExample), rowOperators: [null, choice] };

    expect(operatorName(workedExample, entry, { axis: 'row', index: 1 })).toBe(`Row 2 operator, ${word}`);
  });
});

// Row 1 when the game opens: the given 6, an empty cell, and its shown +.
const ROW_1_ON_OPENING: LineWorking = {
  line: { axis: 'row', index: 0 },
  digits: [6, null],
  operator: '+',
  outcome: { kind: 'incomplete' },
};

// Row 1 once top-right is 2: 6 + 2 = 8, its target.
const ROW_1_WITH_TOP_RIGHT_2: LineWorking = {
  ...ROW_1_ON_OPENING,
  digits: [6, 2],
  outcome: { kind: 'result', value: 8, reachesTarget: true },
};

// Row 2 with bottom-left 2, bottom-right 3 and − chosen: 2 − 3 = −1, missing its target of 6.
const ROW_2_GOING_BELOW_ZERO: LineWorking = {
  line: { axis: 'row', index: 1 },
  digits: [2, 3],
  operator: '−',
  outcome: { kind: 'result', value: -1, reachesTarget: false },
};

describe('workingText', () => {
  it.each([
    { digits: [6, null], operator: '+', text: '6 + ?' },
    { digits: [null, null], operator: null, text: '? ? ?' },
    { digits: [6, null], operator: null, text: '6 ? ?' },
    { digits: [null, null], operator: '×', text: '? × ?' },
  ] as const)('writes $text for an unfinished line, with ? for each gap', ({ digits, operator, text }) => {
    const working: LineWorking = { line: { axis: 'row', index: 0 }, digits, operator, outcome: { kind: 'incomplete' } };

    expect(workingText(working)).toBe(text);
  });

  it('adds the result once the line is complete: "6 + 2 = 8"', () => {
    expect(workingText(ROW_1_WITH_TOP_RIGHT_2)).toBe('6 + 2 = 8');
  });

  it('writes a result below zero with the minus sign U+2212, not a hyphen: "2 − 3 = −1"', () => {
    expect(workingText(ROW_2_GOING_BELOW_ZERO)).toBe('2 − 3 = −1');
  });
});

describe('workingName', () => {
  it('names a working by its line, then the working: "Row 1 working, 6 + ?"', () => {
    expect(workingName(ROW_1_ON_OPENING)).toBe('Row 1 working, 6 + ?');
  });

  it('speaks a result below zero as "minus": "Row 2 working, 2 − 3 = minus 1"', () => {
    expect(workingName(ROW_2_GOING_BELOW_ZERO)).toBe('Row 2 working, 2 − 3 = minus 1');
  });
});

describe('resultText', () => {
  it('shows "= ?" in the result slot while a line is unfinished', () => {
    expect(resultText(ROW_1_ON_OPENING)).toBe('= ?');
  });

  it('shows the result of a line that misses its target: "= 9"', () => {
    const missing: LineWorking = { ...ROW_1_ON_OPENING, digits: [6, 3], outcome: { kind: 'result', value: 9, reachesTarget: false } };

    expect(resultText(missing)).toBe('= 9');
  });

  it('marks a line that reaches its target with a tick: "= 8 ✓"', () => {
    expect(resultText(ROW_1_WITH_TOP_RIGHT_2)).toBe('= 8 ✓');
  });
});

describe('messageText', () => {
  it('says "New solution found!" for a new solution', () => {
    expect(messageText('new-solution')).toBe('New solution found!');
  });

  it('says every solution has been found when the last new one is found', () => {
    expect(messageText('all-found')).toBe("New solution found! You've found every solution.");
  });

  it('says a solution checked again has already been found', () => {
    expect(messageText('already-found')).toBe("You've already found this solution.");
  });

  it('says "Not solved yet." when a line misses', () => {
    expect(messageText('not-solved')).toBe('Not solved yet.');
  });

  it('asks for every cell and operator to be filled when the grid has a gap', () => {
    expect(messageText('incomplete')).toBe('Fill every cell and choose every operator before checking.');
  });
});
