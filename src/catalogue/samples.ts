// The catalogue's samples: each component in every state the design guide lists (spec-003 FR-324).
// Fixed examples only; the catalogue does not play the puzzle (FR-327).

import { createGridCell } from '../ui/combined/grid-cell';
import { createKeypad } from '../ui/combined/keypad';
import { createLineWorking } from '../ui/combined/line-working';
import { createOperatorHeader } from '../ui/combined/operator-header';
import { createPuzzleGrid } from '../ui/combined/puzzle-grid';
import { createSolutionsCounter } from '../ui/combined/solutions-counter';
import { createSpeechBubble } from '../ui/combined/speech-bubble';
import { createTargetPill } from '../ui/combined/target-pill';
import { createBadge } from '../ui/simple/badge';
import { createButton } from '../ui/simple/button';
import { createIcon } from '../ui/simple/icon';
import { createMascot } from '../ui/simple/mascot';
import { createSurface } from '../ui/simple/surface';
import { createText } from '../ui/simple/text';
import { createTextInput } from '../ui/simple/text-input';
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
    { label: 'Unavailable', render: () => createButton({ label: 'Check', style: 'key', isUnavailable: true }).element },
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
  Badge: [{ label: 'Badge', render: () => createBadge({ text: '× 12' }).element }],
  Mascot: [{ label: 'Mascot', render: () => createMascot().element }],
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
  ],
  'Target pill': [
    { label: 'Add', render: () => createTargetPill({ target: 16, operator: '+', isOpen: false, name: 'Row 1 target 16, plus' }).element },
    { label: 'Subtract', render: () => createTargetPill({ target: 7, operator: '−', isOpen: false, name: 'Row 2 target 7, minus' }).element },
    { label: 'Multiply', render: () => createTargetPill({ target: 12, operator: '×', isOpen: false, name: 'Column 1 target 12, times' }).element },
    { label: 'Divide', render: () => createTargetPill({ target: 2, operator: '÷', isOpen: false, name: 'Column 2 target 2, divide' }).element },
    { label: 'Open', render: () => createTargetPill({ target: 12, operator: null, isOpen: true, name: 'Row 2 target 12, operator not chosen' }).element },
    {
      label: 'Line correct',
      render: () => createTargetPill({ target: 9, operator: '+', isOpen: false, name: 'Row 1 target 9, plus', reachesTarget: true }).element,
    },
  ],
  'Grid cell': [
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
  Keypad: [{ label: 'Keypad', render: () => createKeypad().element }],
};

/** Body text to show inside a surface sample. */
function sampleText(text: string): HTMLElement {
  return createText({ text, style: 'body' }).element;
}
