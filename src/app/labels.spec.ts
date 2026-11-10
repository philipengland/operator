import { describe, expect, it } from 'vitest';
import { emptyEntry, workedExample, type LineWorking } from '../engine';
import { CLASSIC, MIDNIGHT_BLUE } from '../ui/foundations/themes';
import { announcement, bubbleLine, cellName, lineName, messageText, workingName, workingSlot, workingText } from './labels';
import { puzzleName } from './labels';

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

// Column 1 with bottom-left 4 and ÷ chosen: 6 ÷ 4 is not a whole number at step 1.
const COLUMN_1_NOT_WHOLE: LineWorking = {
  line: { axis: 'column', index: 0 },
  digits: [6, 4],
  operator: '÷',
  outcome: { kind: 'not-whole', step: 1 },
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

  it('says when the line reaches its target: "Row 1 working, 6 + 2 = 8, target reached"', () => {
    expect(workingName(ROW_1_WITH_TOP_RIGHT_2)).toBe('Row 1 working, 6 + 2 = 8, target reached');
  });

  it('says when a division is not whole: "Column 1 working, 6 ÷ 4, not a whole number"', () => {
    expect(workingName(COLUMN_1_NOT_WHOLE)).toBe('Column 1 working, 6 ÷ 4, not a whole number');
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

describe('bubbleLine', () => {
  it("greets the player in the theme's voice while there is no result", () => {
    expect(bubbleLine(null, MIDNIGHT_BLUE)).toBe('Fill the grid, chief.');
  });

  it.each([
    ['new-solution', "You're connected! Keep 'em coming, pal!"],
    ['all-found', 'Every line connected, pal!'],
    ['already-found', "We've had that call, pal."],
    ['not-solved', 'Wrong number, pal!'],
    ['incomplete', "Line's busy, pal: fill every cell and operator first."],
  ] as const)("%s gives the operator's line (spec-004 AC-16)", (kind, line) => {
    expect(bubbleLine(kind, CLASSIC)).toBe(line);
  });

  it("speaks in Midnight blue's words: its address and its sign-off (spec-004 AC-19)", () => {
    expect(bubbleLine(null, MIDNIGHT_BLUE)).toBe('Fill the grid, chief.');
    expect(bubbleLine('new-solution', MIDNIGHT_BLUE)).toBe("You're connected! Next, please, chief!");
  });
});

describe('announcement', () => {
  it('says nothing while there is no result', () => {
    expect(announcement(null, CLASSIC, 'Found 0 of 2')).toBe('');
  });

  it('says the result, then the count when a new solution changed it (spec-004 AC-4)', () => {
    expect(announcement('all-found', CLASSIC, 'Found 2 of 2')).toBe(
      "New solution found! You've found every solution. Every line connected, pal! Found 2 of 2",
    );
  });

  it('leaves the count out when it did not change', () => {
    expect(announcement('not-solved', CLASSIC, 'Found 0 of 2')).toBe('Not solved yet. Wrong number, pal!');
  });

  it("says the result, then the operator's line, then the count (spec-004 AC-16)", () => {
    expect(announcement('new-solution', CLASSIC, 'Found 1 of 2')).toBe(
      "New solution found! You're connected! Keep 'em coming, pal! Found 1 of 2",
    );
  });
});

describe('workingSlot', () => {
  it.each([
    ['nothing to work out yet', ROW_1_ON_OPENING, { result: '= ?', mark: 'none' }],
    ['a line reaching its target (spec-004 AC-3)', ROW_1_WITH_TOP_RIGHT_2, { result: '= 8', mark: 'tick' }],
    ['a result below zero', ROW_2_GOING_BELOW_ZERO, { result: '= −1', mark: 'none' }],
    ['a division that is not whole', COLUMN_1_NOT_WHOLE, { result: '', mark: 'cross' }],
  ] as const)('shows %s', (_case, working, slot) => {
    expect(workingSlot(working)).toEqual(slot);
  });
});

describe('puzzleName (spec-007 FR-717)', () => {
  it('a daily puzzle is heard by its preset and shape, and the worked example as "Puzzle"', () => {
    const easy = { ...workedExample, id: 'daily-v1-2026-11-10-easy', preset: 'easy', rows: 3, columns: 3 } as const;

    expect([puzzleName(easy), puzzleName(workedExample)]).toEqual(['Easy puzzle, 3 by 3', 'Puzzle']);
  });
});

describe('cellName on a daily puzzle (spec-007 contract)', () => {
  it('names each cell by its row and column, given or filled', () => {
    const easy = {
      ...workedExample,
      id: 'daily-v1-2026-11-10-easy',
      preset: 'easy',
      rows: 3,
      columns: 3,
      givens: [
        [3, null, 2],
        [7, null, 4],
        [null, null, null],
      ],
    } as const;
    const entry = { ...emptyEntry(easy), cells: [[null, null, null], [null, 4, null], [null, null, null]] };

    expect([cellName(easy, entry, { row: 0, column: 0 }), cellName(easy, entry, { row: 1, column: 1 }), cellName(easy, entry, { row: 2, column: 2 })]).toEqual([
      'Row 1 column 1 cell, given 3',
      'Row 2 column 2 cell, 4',
      'Row 3 column 3 cell, empty',
    ]);
  });
});
