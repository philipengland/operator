// The catalogue's samples: each component in every state the design guide lists (spec-003 FR-324).
// Fixed examples only; the catalogue does not play the puzzle (FR-327).

import { createConfirmDialog } from '../ui/combined/confirm-dialog';
import { createGridCell } from '../ui/combined/grid-cell';
import { createKeypad } from '../ui/combined/keypad';
import { createLineWorking } from '../ui/combined/line-working';
import { createOperatorHeader } from '../ui/combined/operator-header';
import { createPuzzleGrid, type PuzzleGridProps } from '../ui/combined/puzzle-grid';
import { createSolutionsCounter } from '../ui/combined/solutions-counter';
import { createSpeechBubble } from '../ui/combined/speech-bubble';
import { createStatusBar } from '../ui/combined/status-bar';
import { createTargetPill, type TargetPillProps } from '../ui/combined/target-pill';
import { createWorkingsStrip } from '../ui/combined/workings-strip';
import { createBadge } from '../ui/simple/badge';
import { createButton } from '../ui/simple/button';
import { createDialog } from '../ui/simple/dialog';
import { createIcon } from '../ui/simple/icon';
import { createMascot } from '../ui/simple/mascot';
import { createSurface } from '../ui/simple/surface';
import { createText } from '../ui/simple/text';
import { createTextInput } from '../ui/simple/text-input';
import { createSolutionList, type SolutionListProps } from '../ui/screens/solution-list';
import { createSolutionView } from '../ui/screens/solution-view';
import { createTodayList } from '../ui/screens/today-list';
import type { Theme } from '../ui/foundations/themes';
import { FIXED_PUZZLE_JUST_OPENED, screenSamplesFor } from './screen-samples';

export interface Sample {
  readonly label: string;
  /** Draws the sample; a sample that speaks uses the theme's voice. */
  render(theme: Theme): HTMLElement;
  /** True when its words change with the theme, so the catalogue redraws it on a switch (spec-003 AC-19). */
  readonly speaksInTheme?: boolean;
}

export const SAMPLES: Readonly<Record<string, readonly Sample[]>> = {
  Text: [
    { label: 'Display', render: () => createText({ text: 'Hello, Operator!', style: 'display' }).element },
    { label: 'Body', render: () => createText({ text: 'Tap a dashed bubble to swap its operator.', style: 'body' }).element },
  ],
  Button: [
    { label: 'Main', speaksInTheme: true, render: ({ buttonLabel }) => createButton({ label: buttonLabel, style: 'main', action: 'Check' }).element },
    { label: 'Key', render: () => createButton({ label: '5', style: 'key' }).element },
    { label: 'Solid', render: () => createButton({ label: 'Oops', style: 'solid', action: 'clear cell' }).element },
    { label: 'Dashed', render: () => createButton({ label: '? 12', style: 'dashed' }).element },
    { label: 'Dashed, stacked', render: () => createButton({ label: '? 60', style: 'dashed', isStacked: true }).element },
    { label: 'Unavailable', render: () => createButton({ label: 'Check', style: 'key', isUnavailable: true }).element },
    { label: 'Read-only', render: () => createButton({ label: '2', style: 'cell', name: 'Top-right cell, 2', isReadOnly: true }).element },
  ],
  'Text input': [{ label: 'Seed', render: () => createTextInput({ label: 'Play from a seed', hint: 'e.g. 4F7A21' }).element }],
  Icon: [
    { label: 'Tick', render: () => createIcon({ icon: 'tick', spokenAs: 'target reached' }).element },
    { label: 'Cross', render: () => createIcon({ icon: 'cross', spokenAs: 'not a whole number' }).element },
    { label: 'Decorative tick', render: () => createIcon({ icon: 'tick' }).element },
  ],
  Surface: [
    { label: 'Panel', render: () => createSurface({ variant: 'panel' }, [sampleText('Panels hold the grid and the keypad.')]).element },
    { label: 'Bubble', render: () => createSurface({ variant: 'bubble' }, [sampleText('Hello, Operator!')]).element },
  ],
  Badge: [
    { label: 'Badge', render: () => createBadge({ text: '× 12' }).element },
    { label: 'Stacked', render: () => createBadge({ text: '× 60', isStacked: true }).element },
  ],
  Mascot: [{ label: 'Mascot', render: () => createMascot().element }],
  Dialog: [{ label: 'Dialog', render: () => shownInPlace(createDialog({ name: 'A dialog' }, [sampleText('Dialogs hold a question.')]).element) }],
  'Speech bubble': [
    {
      label: 'Row through',
      speaksInTheme: true,
      render: ({ address, signOff }) => createSpeechBubble({ title: 'Hello, Operator!', message: `Row one's through, ${address}. ${signOff}!` }).element,
    },
  ],
  'Operator header': [
    { label: 'Greeting', speaksInTheme: true, render: (theme) => createOperatorHeader(screenSamplesFor(theme)['Just opened'].header).element },
  ],
  'Solutions counter': [
    { label: 'None yet', render: () => createSolutionsCounter({ found: 0, total: 2 }).element },
    { label: 'In progress', render: () => createSolutionsCounter({ found: 1, total: 2 }).element },
    { label: 'Complete', render: () => createSolutionsCounter({ found: 2, total: 2 }).element },
    { label: 'No total', render: () => createSolutionsCounter({ found: 12 }).element },
    { label: 'Can be tapped', render: () => createSolutionsCounter({ found: 1, total: 2 }, () => undefined).element },
  ],
  'Target pill': [
    { label: 'Add', render: () => createTargetPill({ target: 16, operator: '+', isOpen: false, name: 'Row 1 target 16, plus' }).element },
    { label: 'Subtract', render: () => createTargetPill({ target: 7, operator: '−', isOpen: false, name: 'Row 2 target 7, minus' }).element },
    { label: 'Multiply', render: () => createTargetPill({ target: 12, operator: '×', isOpen: false, name: 'Column 1 target 12, times' }).element },
    { label: 'Divide', render: () => createTargetPill({ target: 2, operator: '÷', isOpen: false, name: 'Column 2 target 2, divide' }).element },
    { label: 'Open', render: () => createTargetPill({ target: 12, operator: null, isOpen: true, name: 'Row 2 target 12, operator not chosen' }).element },
    {
      label: 'Stacked, for a column of a 3-column grid',
      render: () => createTargetPill({ target: 60, operator: '×', isOpen: false, name: 'Column 2 target 60, times', isStacked: true }).element,
    },
    {
      label: 'Open, stacked',
      render: () => createTargetPill({ target: 60, operator: null, isOpen: true, name: 'Column 2 target 60, operator not chosen', isStacked: true }).element,
    },
    {
      label: 'Open, line correct',
      render: () => createTargetPill({ target: 6, operator: '+', isOpen: true, name: 'Row 2 target 6, plus', reachesTarget: true }).element,
    },
    {
      label: 'Line correct',
      render: () => createTargetPill({ target: 9, operator: '+', isOpen: false, name: 'Row 1 target 9, plus', reachesTarget: true }).element,
    },
  ],
  'Grid cell': [
    { label: 'Read-only', render: () => createGridCell({ name: 'Top-right cell', digit: 2, isReadOnly: true }).element },
    { label: 'Given', render: () => createGridCell({ name: 'Top-left cell', digit: 2, isGiven: true }).element },
    { label: 'Empty', render: () => createGridCell({ name: 'Top-right cell', digit: null }).element },
    { label: 'Selected', render: () => createGridCell({ name: 'Top-right cell', digit: null, isSelected: true }).element },
    { label: 'Your digit', render: () => createGridCell({ name: 'Top-right cell', digit: 8 }).element },
    { label: 'In a correct line', render: () => createGridCell({ name: 'Bottom-left cell', digit: 4, isInCorrectLine: true }).element },
    {
      label: 'Selected, in a correct line',
      render: () => createGridCell({ name: 'Bottom-left cell', digit: 4, isSelected: true, isInCorrectLine: true }).element,
    },
  ],
  'Line working': [
    { label: 'Incomplete', render: () => createLineWorking({ result: '= ?', mark: 'none', name: 'Row 1 working, 6 + ?' }).element },
    {
      label: 'Target reached',
      render: () => createLineWorking({ result: '= 8', mark: 'tick', name: 'Row 1 working, 6 + 2 = 8, target reached' }).element,
    },
    { label: 'Below zero', render: () => createLineWorking({ result: '= −3', mark: 'none', name: 'Row 2 working, 4 − 7 = minus 3' }).element },
    {
      label: 'Not whole',
      render: () => createLineWorking({ result: '', mark: 'cross', name: 'Column 1 working, 6 ÷ 4, not a whole number' }).element,
    },
  ],
  'Puzzle grid': [{ label: 'Fixed puzzle', render: () => createPuzzleGrid(FIXED_PUZZLE_JUST_OPENED).element }],
  Keypad: [
    { label: 'Keypad', render: () => createKeypad().element },
    { label: 'Unavailable', render: () => createKeypad(undefined, false).element },
  ],
  'Confirm dialog': [
    {
      label: 'Clear all solutions',
      render: () => shownInPlace(createConfirmDialog({ question: 'Clear all solutions?', confirm: 'Yes, clear', cancel: 'Keep them' }).element),
    },
  ],
  'Status bar': [
    { label: 'With a total', render: () => createStatusBar({ counter: { found: 1, total: 4 } }, { onCounter: () => undefined, onToday: () => undefined }).element },
    { label: 'Over 100', render: () => createStatusBar({ counter: { found: 3 } }, { onCounter: () => undefined, onToday: () => undefined }).element },
  ],
  'Workings strip': [
    {
      label: 'Row and column',
      render: () =>
        createWorkingsStrip({
          workings: [
            { result: '7 + 2 + 9 + 6 = 24', mark: 'tick', name: '' },
            { result: '9 × ? × ? × 6 × ?', mark: 'none', name: '' },
          ],
        }).element,
    },
    { label: 'No cell selected', render: () => createWorkingsStrip({ text: 'Tap a cell to see its row and column.' }).element },
    { label: "The operator's line", speaksInTheme: true, render: ({ address }) => createWorkingsStrip({ text: `Wrong number, ${address}!` }).element },
  ],
  'Solution list': [
    { label: 'Empty', speaksInTheme: true, render: (theme) => createSolutionList(solutionList(theme, [], false)).element },
    { label: 'Two solutions', speaksInTheme: true, render: (theme) => createSolutionList(solutionList(theme, ['Solution 1', 'Solution 2'], true)).element },
    { label: 'Rows as text', speaksInTheme: true, render: (theme) => createSolutionList({ ...solutionList(theme, ['Solution 1'], false), canOpenRows: false }).element },
  ],
  'Solution view': [
    {
      label: 'Solution 1',
      render: (theme) => createSolutionView({ heading: 'Solution 1', backLabel: 'Back', grid: readOnly(screenSamplesFor(theme)['All found'].grid) }).element,
    },
  ],
  'Today list': [
    {
      label: 'Today',
      render: () =>
        createTodayList({
          heading: 'Today',
          backLabel: 'Back',
          rows: ['Easy, found 1 of 4', 'Medium, found 0 of 12', 'Hard, found 0 of 2', 'Collector, found 3', 'Practice, found 1 of 2'],
        }).element,
    },
  ],
};

/** Body text to show inside a surface sample. */
function sampleText(text: string): HTMLElement {
  return createText({ text, style: 'body' }).element;
}

function solutionList({ address }: Theme, rows: readonly string[], canStartAgain: boolean): SolutionListProps {
  return {
    heading: 'Solutions',
    backLabel: 'Back',
    rows,
    canOpenRows: true,
    empty: { shown: `No calls yet, ${address}.`, heardAs: 'No solutions found yet' },
    ...(canStartAgain ? { startAgainLabel: 'Start again' } : {}),
  };
}

/** The whole puzzle, with nothing in it offered to tap. */
function readOnly(grid: PuzzleGridProps): PuzzleGridProps {
  const shownPill = (pill: TargetPillProps): TargetPillProps => ({ ...pill, isOpen: false });
  return {
    ...grid,
    columnPills: grid.columnPills.map(shownPill),
    rowPills: grid.rowPills.map(shownPill),
    cells: grid.cells.map((row) => row.map((cell) => ({ ...cell, isReadOnly: true }))),
    helper: '',
  };
}

/** A pop-up shown in the page's flow, so the catalogue can show it beside everything else. */
function shownInPlace(dialog: HTMLElement): HTMLElement {
  dialog.setAttribute('open', '');
  return dialog;
}
