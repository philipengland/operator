// The play screen's samples (spec-003 AC-15, AC-17): spec-001's 2 × 2 puzzle just opened, with
// Row 1 correct (top-right 2), and with every solution found (Solution B: bottom-left 3, bottom-
// right 3, Row 2 +, Column 1 −). Names follow the play-screen contract's wording.

import type { PuzzleGridProps } from '../ui/combined/puzzle-grid';
import type { PlayScreenProps } from '../ui/screens/play-screen';

export type ScreenSampleName = 'Just opened' | 'Row 1 correct' | 'All found';

const HELPER = 'Tap a dashed bubble to swap its operator.';

/** spec-001's 2 × 2 puzzle as the game shows it just opened. */
export const FIXED_PUZZLE_JUST_OPENED = {
  columnPills: [
    { target: 3, operator: null, isOpen: true, name: 'Column 1 target 3, operator not chosen' },
    { target: 6, operator: '×', isOpen: false, name: 'Column 2 target 6, times' },
  ],
  rowPills: [
    { target: 8, operator: '+', isOpen: false, name: 'Row 1 target 8, plus' },
    { target: 6, operator: null, isOpen: true, name: 'Row 2 target 6, operator not chosen' },
  ],
  cells: [
    [
      { name: 'Top-left cell', digit: 6, isGiven: true },
      { name: 'Top-right cell', digit: null },
    ],
    [
      { name: 'Bottom-left cell', digit: null },
      { name: 'Bottom-right cell', digit: null },
    ],
  ],
  rowWorkings: [
    { result: '= ?', mark: 'none', name: 'Row 1 working, 6 + ?' },
    { result: '= ?', mark: 'none', name: 'Row 2 working, ? ? ?' },
  ],
  columnWorkings: [
    { result: '= ?', mark: 'none', name: 'Column 1 working, 6 ? ?' },
    { result: '= ?', mark: 'none', name: 'Column 2 working, ? × ?' },
  ],
  helper: HELPER,
} as const satisfies PuzzleGridProps;

/** Top-right 2: Row 1 reaches its target. */
const ROW_1_CORRECT = {
  ...FIXED_PUZZLE_JUST_OPENED,
  rowPills: [{ ...FIXED_PUZZLE_JUST_OPENED.rowPills[0], reachesTarget: true }, FIXED_PUZZLE_JUST_OPENED.rowPills[1]],
  cells: [
    [
      { name: 'Top-left cell', digit: 6, isGiven: true, isInCorrectLine: true },
      { name: 'Top-right cell', digit: 2, isInCorrectLine: true },
    ],
    FIXED_PUZZLE_JUST_OPENED.cells[1],
  ],
  rowWorkings: [
    { result: '= 8', mark: 'tick', name: 'Row 1 working, 6 + 2 = 8, target reached' },
    FIXED_PUZZLE_JUST_OPENED.rowWorkings[1],
  ],
  columnWorkings: [FIXED_PUZZLE_JUST_OPENED.columnWorkings[0], { result: '= ?', mark: 'none', name: 'Column 2 working, 2 × ?' }],
} as const satisfies PuzzleGridProps;

/** Solution B, the second of the puzzle's two solutions: every line reaches its target. */
const SOLUTION_B = {
  columnPills: [
    { target: 3, operator: '−', isOpen: true, name: 'Column 1 target 3, minus', reachesTarget: true },
    { target: 6, operator: '×', isOpen: false, name: 'Column 2 target 6, times', reachesTarget: true },
  ],
  rowPills: [
    { target: 8, operator: '+', isOpen: false, name: 'Row 1 target 8, plus', reachesTarget: true },
    { target: 6, operator: '+', isOpen: true, name: 'Row 2 target 6, plus', reachesTarget: true },
  ],
  cells: [
    [
      { name: 'Top-left cell', digit: 6, isGiven: true, isInCorrectLine: true },
      { name: 'Top-right cell', digit: 2, isInCorrectLine: true },
    ],
    [
      { name: 'Bottom-left cell', digit: 3, isInCorrectLine: true },
      { name: 'Bottom-right cell', digit: 3, isInCorrectLine: true },
    ],
  ],
  rowWorkings: [
    { result: '= 8', mark: 'tick', name: 'Row 1 working, 6 + 2 = 8, target reached' },
    { result: '= 6', mark: 'tick', name: 'Row 2 working, 3 + 3 = 6, target reached' },
  ],
  columnWorkings: [
    { result: '= 3', mark: 'tick', name: 'Column 1 working, 6 − 3 = 3, target reached' },
    { result: '= 6', mark: 'tick', name: 'Column 2 working, 2 × 3 = 6, target reached' },
  ],
  helper: HELPER,
} as const satisfies PuzzleGridProps;

const TITLE = 'Hello, Operator!';
const MAIN_BUTTON_LABEL = 'Put it through!';

export const SCREEN_SAMPLES: Readonly<Record<ScreenSampleName, PlayScreenProps>> = {
  'Just opened': {
    header: { title: TITLE, message: 'Fill the grid, pal.' },
    counter: { found: 0, total: 2 },
    grid: FIXED_PUZZLE_JUST_OPENED,
    mainButtonLabel: MAIN_BUTTON_LABEL,
  },
  'Row 1 correct': {
    header: { title: TITLE, message: "Row one's through, pal." },
    counter: { found: 0, total: 2 },
    grid: ROW_1_CORRECT,
    mainButtonLabel: MAIN_BUTTON_LABEL,
  },
  'All found': {
    header: { title: TITLE, message: "That's all of them, pal!" },
    counter: { found: 2, total: 2 },
    grid: SOLUTION_B,
    mainButtonLabel: MAIN_BUTTON_LABEL,
  },
};
